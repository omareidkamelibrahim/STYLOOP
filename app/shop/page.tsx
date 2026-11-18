import type { Metadata } from "next"
import { ShopCatalog } from "@/components/shop-catalog"
import { PublicPageLayout } from "@/components/public-site-shell"
import { getProducts, type Product } from "@/lib/shopify"

export const revalidate = 60
export const metadata: Metadata = { title: "Shop the collection | STYLOOP", description: "Explore considered everyday pieces from STYLOOP." }

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams
  let products: Product[] = []
  try { products = await getProducts(100) } catch { /* Keep the collection route available during a temporary catalog outage. */ }
  return <PublicPageLayout><ShopCatalog products={products} initialSort={sort === "newest" ? "newest" : "featured"} /></PublicPageLayout>
}
