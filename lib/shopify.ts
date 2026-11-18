const SHOPIFY_API_VERSION = "2026-10"

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
  selectedOptions: { name: string; value: string }[]
  sku: string | null
}

export type Product = {
  id: string
  handle: string
  title: string
  description: string
  featuredImage: { url: string; altText: string | null } | null
  images: { url: string; altText: string | null }[]
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  variants: ProductVariant[]
  productType: string
  tags: string[]
  createdAt: string
}

type ShopifyProduct = Omit<Product, "variants" | "images"> & {
  images: { nodes: Product["images"] }
  variants: { nodes: Product["variants"] }
}

const PRODUCT_FIELDS = `
  id handle title description productType tags createdAt
  featuredImage { url altText }
  images(first: 8) { nodes { url altText } }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 100) {
    nodes {
      id title availableForSale sku
      price { amount currencyCode }
      selectedOptions { name value }
    }
  }
`

function normalizeProduct(product: ShopifyProduct): Product {
  return { ...product, images: product.images.nodes, variants: product.variants.nodes }
}
type ShopifyResponse<T> = { data?: T; errors?: { message: string }[] }

export async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "")
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!domain || !token) return null

  const response = await fetch(`https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  })

  if (!response.ok) throw new Error(`Shopify Storefront API returned ${response.status}`)
  const result = (await response.json()) as ShopifyResponse<T>
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(", "))
  return result.data ?? null
}

export async function getProducts(first = 24) {
  const result = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    `query Products($first: Int!) {
      products(first: $first, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FIELDS} } }
    }`,
    { first },
  )
  return result?.products.nodes.map(normalizeProduct) ?? []
}

export async function getProductByHandle(handle: string) {
  const result = await shopifyFetch<{ product: ShopifyProduct | null }>(
    `query ProductByHandle($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FIELDS} }
    }`,
    { handle },
  )
  return result?.product ? normalizeProduct(result.product) : null
}

export type StorePolicy = { title: string; url: string; body: string }
export type StorePolicies = {
  privacyPolicy: StorePolicy | null
  termsOfService: StorePolicy | null
  shippingPolicy: StorePolicy | null
  refundPolicy: StorePolicy | null
}

export async function getStorePolicies(): Promise<StorePolicies | null> {
  const result = await shopifyFetch<{ shop: StorePolicies }>(
    `query StorePolicies {
      shop {
        privacyPolicy { title url body }
        termsOfService { title url body }
        shippingPolicy { title url body }
        refundPolicy { title url body }
      }
    }`,
  )
  return result?.shop ?? null
}
