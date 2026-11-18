import { NextRequest, NextResponse } from "next/server"

const MAX_LINE_QUANTITY = 10
const MAX_CART_LINES = 20
const variantIdPattern = /^gid:\/\/shopify\/ProductVariant\/\d+$/

export async function POST(request: NextRequest) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "")
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!domain || !token) return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 }) }
  const lines = (body as { lines?: unknown })?.lines
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > MAX_CART_LINES) {
    return NextResponse.json({ error: "Choose at least one item to continue." }, { status: 400 })
  }

  const quantities = new Map<string, number>()
  for (const line of lines) {
    const candidate = line as { merchandiseId?: unknown; quantity?: unknown }
    if (typeof candidate.merchandiseId !== "string" || !variantIdPattern.test(candidate.merchandiseId) || !Number.isInteger(candidate.quantity) || (candidate.quantity as number) < 1) {
      return NextResponse.json({ error: "One of the selected items is invalid." }, { status: 400 })
    }
    const nextQuantity = (quantities.get(candidate.merchandiseId) ?? 0) + (candidate.quantity as number)
    if (nextQuantity > MAX_LINE_QUANTITY) return NextResponse.json({ error: `You can order up to ${MAX_LINE_QUANTITY} of each piece.` }, { status: 400 })
    quantities.set(candidate.merchandiseId, nextQuantity)
  }

  try {
    const response = await fetch(`https://${domain}/api/2026-10/graphql.json`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({
        query: `mutation CreateCart($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { checkoutUrl } userErrors { message } } }`,
        variables: { lines: [...quantities].map(([merchandiseId, quantity]) => ({ merchandiseId, quantity })) },
      }),
    })
    if (!response.ok) throw new Error(`Shopify returned ${response.status}`)
    const result = await response.json() as {
      data?: { cartCreate?: { cart?: { checkoutUrl?: string }; userErrors?: { message: string }[] } }
      errors?: { message: string }[]
    }
    const cart = result.data?.cartCreate
    const checkoutUrl = cart?.cart?.checkoutUrl
    if (result.errors?.length || cart?.userErrors?.length || !checkoutUrl) {
      return NextResponse.json({ error: "We could not start checkout. Please review your selection and try again." }, { status: 422 })
    }
    const parsedUrl = new URL(checkoutUrl)
    if (parsedUrl.protocol !== "https:") throw new Error("Shopify returned an invalid checkout URL")
    return NextResponse.json({ checkoutUrl: parsedUrl.toString() }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Shopify checkout initialization failed:", error)
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again." }, { status: 502 })
  }
}
