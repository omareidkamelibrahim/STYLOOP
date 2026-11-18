import type { Metadata } from "next"
import { ShopCatalog } from "@/components/shop-catalog"
import { PublicPageLayout } from "@/components/public-site-shell"
import { getProducts, type Product } from "@/lib/shopify"
import { getConceptProducts } from "@/lib/mockup-products"

export const revalidate = 60
export const metadata: Metadata = { title: "Shop the STYLOOP edit", description: "Explore expressive everyday pieces and concept mockups from STYLOOP." }

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams
  let products: Product[] = []
  try { products = await getProducts(100) } catch { /* Keep the collection route available during a temporary catalog outage. */ }
  const isConceptCollection = products.length === 0
  if (isConceptCollection) products = getConceptProducts()
  return <PublicPageLayout><ShopCatalog products={products} initialSort={sort === "newest" ? "newest" : "featured"} isConceptCollection={isConceptCollection} /></PublicPageLayout>
}
