import { NextResponse } from "next/server"
import { getProducts } from "@/lib/shopify"

export async function GET() {
  try {
    const products = await getProducts(24)
    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ error: "The collection could not be loaded right now." }, { status: 502 })
  }
}
