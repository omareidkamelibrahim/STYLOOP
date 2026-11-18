import { StyloopStorefront } from "@/components/styloop-storefront"
import { getProducts, type Product } from "@/lib/shopify"

export const revalidate = 60

export default async function HomePage() {
  let products: Product[] = []
  try { products = await getProducts(8) } catch { /* Keep the storefront available when Shopify is temporarily unreachable. */ }
  return <StyloopStorefront initialProducts={products} />
}
