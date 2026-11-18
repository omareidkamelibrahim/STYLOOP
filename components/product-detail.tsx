"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, Share2 } from "lucide-react"
import type { Product } from "@/lib/shopify"

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(Number(amount))
}

export function ProductDetail({ product }: { product: Product }) {
  const [imageIndex, setImageIndex] = useState(0)
  const [variantId, setVariantId] = useState(product.variants.find((variant) => variant.availableForSale)?.id ?? "")
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const selectedVariant = product.variants.find((variant) => variant.id === variantId)
  const images = product.images.length ? product.images : product.featuredImage ? [product.featuredImage] : []

  async function buyNow() {
    if (!selectedVariant?.availableForSale) {
      setMessage("Please select an available option.")
      return
    }
    setPending(true)
    setMessage("")
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: [{ merchandiseId: selectedVariant.id, quantity }] }),
      })
      const result = await response.json() as { checkoutUrl?: string; error?: string }
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error ?? "Checkout is unavailable right now.")
      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.")
      setPending(false)
    }
  }

  async function shareProduct() {
    try {
      if (navigator.share) await navigator.share({ title: product.title, url: window.location.href })
      else {
        await navigator.clipboard.writeText(window.location.href)
        setMessage("Product link copied.")
      }
    } catch {
      setMessage("You can copy this page address to share the product.")
    }
  }

  return (
    <main className="product-page">
      <div className="product-breadcrumb"><a href="/shop"><ArrowLeft aria-hidden="true" /> Back to shop</a><span> / </span><span>{product.productType || "Collection"}</span></div>
      <div className="product-detail-grid">
        <section className="product-gallery" aria-label={`${product.title} images`}>
          <div className="product-main-image">
            {images[imageIndex] ? <img src={images[imageIndex].url} alt={images[imageIndex].altText || product.title} /> : <div className="product-image-empty">STYLOOP</div>}
            {images.length > 1 && <div className="gallery-controls"><button type="button" aria-label="Previous image" onClick={() => setImageIndex((imageIndex + images.length - 1) % images.length)}><ArrowLeft /></button><span>{String(imageIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span><button type="button" aria-label="Next image" onClick={() => setImageIndex((imageIndex + 1) % images.length)}><ArrowRight /></button></div>}
          </div>
          {images.length > 1 && <div className="product-thumbnails">{images.map((image, index) => <button type="button" key={image.url} aria-label={`View image ${index + 1}`} aria-pressed={imageIndex === index} onClick={() => setImageIndex(index)}><img src={image.url} alt="" /></button>)}</div>}
        </section>
        <section className="product-information">
          <span className="eyebrow">{product.productType || "STYLOOP ORIGINAL"}</span>
          <h1>{product.title}</h1>
          <p className="detail-price">{formatPrice(selectedVariant?.price.amount ?? product.priceRange.minVariantPrice.amount, selectedVariant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode)}</p>
          <p className="detail-description">{product.description || "A considered everyday piece, made to move with you."}</p>
          <label className="detail-label" htmlFor="product-variant">Choose your option</label>
          <select id="product-variant" value={variantId} onChange={(event) => setVariantId(event.target.value)}>
            <option value="" disabled>Select a size or option</option>
            {product.variants.map((variant) => <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>{variant.title}{variant.availableForSale ? "" : " — Sold out"}</option>)}
          </select>
          <div className="detail-availability">{selectedVariant?.availableForSale ? <><Check aria-hidden="true" /> Ready to ship</> : <span>Choose an available option</span>}</div>
          <div className="detail-quantity"><label className="detail-label" htmlFor="product-quantity">Quantity</label><div><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><input id="product-quantity" type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(10, Number(event.target.value) || 1)))} /><button type="button" aria-label="Increase quantity" onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button></div></div>
          <button className="button button-dark detail-buy" type="button" disabled={pending || !selectedVariant?.availableForSale} onClick={buyNow}>{pending ? "Opening secure checkout…" : "Buy now"}<ArrowRight aria-hidden="true" /></button>
          <button className="detail-share" type="button" onClick={shareProduct}><Share2 aria-hidden="true" /> Share this piece</button>
          {message && <p className="detail-message" role="status">{message}</p>}
          <div className="detail-promises"><p><Check aria-hidden="true" /> Secure checkout powered by Shopify</p><p><Check aria-hidden="true" /> Shipping and taxes calculated at checkout</p><p><Check aria-hidden="true" /> Thoughtful essentials, made to last</p></div>
          <a className="detail-custom-link" href="/custom-printing">Want to make it yours? Explore custom printing <ArrowRight aria-hidden="true" /></a>
        </section>
      </div>
    </main>
  )
}
