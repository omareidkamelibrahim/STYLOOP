import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { db } from "@/lib/db"
import { quoteRequests } from "@/lib/db/schema"

export const runtime = "nodejs"

const maxFiles = 3
const maxFileBytes = 8 * 1024 * 1024
const allowedTypes = new Set(["image/png", "image/jpeg", "application/pdf"])
function textValue(form: FormData, key: string, maxLength: number) {
  const value = form.get(key)
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function positiveInteger(value: string, maximum: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : null
}

function parseSizes(value: string) {
  const result: Record<string, number> = {}
  if (!value) return result
  for (const entry of value.split(/[;,]/).map((item) => item.trim()).filter(Boolean)) {
    const match = entry.match(/^([a-z0-9][a-z0-9 /-]{0,19})\s*:\s*(\d{1,4})$/i)
    if (!match) return null
    const quantity = Number(match[2])
    if (quantity < 1 || quantity > 10000) return null
    result[match[1].trim().toUpperCase()] = quantity
  }
  return Object.keys(result).length <= 20 ? result : null
}

async function hasExpectedSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  if (file.type === "image/png") return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)
  if (file.type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  if (file.type === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-"
  return false
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  const host = request.headers.get("host")
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 })
    } catch {
      return NextResponse.json({ error: "This request could not be verified." }, { status: 403 })
    }
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 })
  }

  if (textValue(form, "website", 200)) return NextResponse.json({ reference: "STY-RECEIVED-0000" }, { status: 200 })

  const customerName = textValue(form, "customerName", 120)
  const email = textValue(form, "email", 254).toLowerCase()
  const phone = textValue(form, "phone", 40)
  const companyName = textValue(form, "companyName", 160)
  const garmentType = textValue(form, "garmentType", 80)
  const garmentColor = textValue(form, "garmentColor", 80)
  const quantity = positiveInteger(textValue(form, "quantity", 8), 10000)
  const designCount = positiveInteger(textValue(form, "designCount", 4) || "1", 100)
  const printingMethod = textValue(form, "printingMethod", 80)
  const instructions = textValue(form, "instructions", 3000)
  const deliveryLocation = textValue(form, "deliveryLocation", 240)
  const deliveryDate = textValue(form, "requiredDeliveryDate", 10)
  const sizes = parseSizes(textValue(form, "sizes", 300))
  const locations = form.getAll("printingLocations").filter((value): value is string => typeof value === "string").slice(0, 4)
  const files = form.getAll("artwork").filter((value): value is File => value instanceof File && value.size > 0)

  if (!customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !garmentType || !quantity || !designCount || !deliveryLocation || !sizes) {
    return NextResponse.json({ error: "Please complete the required fields and check the size breakdown format." }, { status: 400 })
  }
  if (files.length > maxFiles || files.some((file) => file.size > maxFileBytes || !allowedTypes.has(file.type))) {
    return NextResponse.json({ error: "Attach up to three PNG, JPG, or PDF files, each no larger than 8 MB." }, { status: 400 })
  }
  if (deliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
    return NextResponse.json({ error: "Enter a valid delivery date." }, { status: 400 })
  }

  const reference = `STY-${new Date().getUTCFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`
  try {
    const artworkPaths: string[] = []
    for (const file of files) {
      if (!(await hasExpectedSignature(file))) return NextResponse.json({ error: "One of the files does not match its selected file type." }, { status: 400 })
      const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "pdf"
      const blob = await put(`quote-artwork/${reference}/${randomUUID()}.${extension}`, file, {
        access: "private",
        addRandomSuffix: false,
        contentType: file.type,
      })
      artworkPaths.push(blob.pathname)
    }

    await db.insert(quoteRequests).values({
      reference,
      customerName,
      email,
      phone: phone || null,
      companyName: companyName || null,
      garmentType,
      garmentColor: garmentColor || null,
      sizes,
      quantity,
      designCount,
      printingLocations: locations,
      printingMethod: printingMethod || null,
      artworkUrls: artworkPaths,
      instructions: instructions || null,
      requiredDeliveryDate: deliveryDate || null,
      deliveryLocation,
    })

    return NextResponse.json({ reference }, { status: 201, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Quotation request submission failed:", error)
    return NextResponse.json({ error: "We could not save your request just now. Please try again shortly." }, { status: 503 })
  }
}
