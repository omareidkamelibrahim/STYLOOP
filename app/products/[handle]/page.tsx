import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product-detail"
import { PublicPageLayout } from "@/components/public-site-shell"
import { getProductByHandle } from "@/lib/shopify"

export const revalidate = 60

type PageProps = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  return product ? { title: `${product.title} | STYLOOP`, description: product.description.slice(0, 155) } : { title: "Piece not found | STYLOOP" }
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()
  return <PublicPageLayout><ProductDetail product={product} /></PublicPageLayout>
}
