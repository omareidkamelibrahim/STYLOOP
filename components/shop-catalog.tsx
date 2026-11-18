"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowRight, ArrowUpRight, Search, X } from "lucide-react"
import type { Product } from "@/lib/shopify"

const filters = ["All pieces", "T-shirts", "Hoodies", "Accessories"]

function money(amount: string, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount))
}

export function ShopCatalog({ products, initialSort = "featured", isConceptCollection = false }: { products: Product[]; initialSort?: string; isConceptCollection?: boolean }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All pieces")
  const [sort, setSort] = useState(initialSort)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (selectedProduct && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal()
    if (!selectedProduct && dialogRef.current?.open) dialogRef.current.close()
  }, [selectedProduct])

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const categoryMatch = category === "All pieces" || product.tags.includes(category) || product.productType.toLowerCase().includes(category.replace(/s$/, "").toLowerCase())
      const queryMatch = !needle || `${product.title} ${product.description} ${product.tags.join(" ")} ${product.productType}`.toLowerCase().includes(needle)
      return categoryMatch && queryMatch
    })
    if (sort === "price-low") filtered.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount))
    if (sort === "price-high") filtered.sort((a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount))
    if (sort === "newest") filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    return filtered
  }, [products, query, category, sort])

  function productHref(product: Product) {
    return isConceptCollection ? `#${product.handle}` : `/products/${product.handle}`
  }

  function openProductPreview(event: React.MouseEvent<HTMLAnchorElement>, product: Product) {
    if (!isConceptCollection) return
    event.preventDefault()
    setSelectedProduct(product)
  }

  return <main className={`catalog-page${isConceptCollection ? " catalog-page-concept" : ""}`}>
    <section className="catalog-hero" aria-labelledby="catalog-title">
      <div className="catalog-hero-copy">
        <div className="catalog-concept-kicker">{isConceptCollection ? "THE CONCEPT COLLECTION · MOCKUP PREVIEW" : "THE STYLOOP EDIT · MADE FOR YOUR EVERYDAY"}</div>
        <h1 id="catalog-title">Wear your<br /><em>point of view.</em></h1>
        <p>{isConceptCollection ? "A first look at the pieces we could make together. These are concept mockups with sample prices — not live Shopify products." : "Considered everyday pieces, ready for the life you’ll put into them."}</p>
        <a className="catalog-hero-link" href="#collection-grid">{isConceptCollection ? "Explore the mockups" : "Explore the collection"}<ArrowDown aria-hidden="true" /></a>
      </div>
      <div className="catalog-hero-visual" aria-hidden="true"><img src="/images/mock-tee.png" alt="" /><img src="/images/mock-hoodie.png" alt="" /><div className="catalog-orbit"><span>STYLOOP</span><strong>WEAR<br />YOUR<br /><em>STORY.</em></strong><small>OBJECTS FOR EVERYDAY</small></div></div>
      <div className="catalog-hero-index"><span>01 — 08</span><span>THE EVERYDAY EDIT</span></div>
    </section>

    <section className="catalog-collection" id="collection-grid" aria-label="Shop collection">
      <div className="catalog-section-heading"><div><span className="eyebrow">FIND YOUR NEXT FAVORITE</span><h2>Good things, <em>on repeat.</em></h2></div><p>{isConceptCollection ? "Eight styled-up product concepts to get your imagination going." : "Thoughtfully picked pieces to wear on repeat."}</p></div>
      <div className="catalog-controls" aria-label="Filter and sort products">
        <div className="catalog-filters" role="group" aria-label="Product category">{filters.map((filter) => <button type="button" key={filter} className={category === filter ? "filter-button active" : "filter-button"} aria-pressed={category === filter} onClick={() => setCategory(filter)}>{filter}</button>)}</div>
        <label className="catalog-search"><Search aria-hidden="true" /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the edit" /></label>
        <label className="catalog-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
      </div>
      <div className="catalog-count-row"><p className="catalog-count" aria-live="polite">Showing <strong>{visibleProducts.length}</strong> {visibleProducts.length === 1 ? "piece" : "pieces"}</p>{isConceptCollection && <span className="catalog-data-note">MOCKUP DATA · FOR VISUAL PREVIEW</span>}</div>
      {visibleProducts.length ? <div className="product-grid catalog-grid">{visibleProducts.map((product, index) => <article className="product-card" key={product.id}>
        <a className="product-image-wrap" href={productHref(product)} onClick={(event) => openProductPreview(event, product)} aria-label={isConceptCollection ? `Preview concept: ${product.title}` : `View ${product.title}`}>
          {product.featuredImage ? <img className="product-image" src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} loading={index > 2 ? "lazy" : "eager"} /> : <div className="product-image product-image-empty"><span>STYLOOP</span></div>}
          <span className="product-badge">{isConceptCollection ? "CONCEPT / 0" + (index + 1) : index === 0 ? "THE EDIT" : "STYLOOP ORIGINAL"}</span>
          <span className="quick-add">{isConceptCollection ? "View concept" : "Explore piece"}<ArrowUpRight aria-hidden="true" /></span>
        </a>
        <div className="product-details"><div><h2><a href={productHref(product)} onClick={(event) => openProductPreview(event, product)}>{product.title}</a></h2><p>{product.productType || "Made for everyday"}</p></div><span className="product-price">{money(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</span></div>
      </article>)}</div> : <div className="empty-catalog"><div className="empty-mark">S.</div><h2>No pieces found</h2><p>Try a different search or category to find your next favorite.</p><button className="text-link" type="button" onClick={() => { setQuery(""); setCategory("All pieces") }}>Clear filters <ArrowRight aria-hidden="true" /></button></div>}
      <div className="catalog-bottom-note"><span>GOOD CLOTHES. GOOD IDEAS. GOOD DAYS.</span><a href="/custom-printing">Have an idea of your own? Make it happen <ArrowRight aria-hidden="true" /></a></div>
    </section>

    <dialog ref={dialogRef} className="concept-dialog" aria-labelledby="concept-dialog-title" onClose={() => setSelectedProduct(null)}>
      {selectedProduct && <div className="concept-dialog-content"><button className="concept-dialog-close" type="button" aria-label="Close concept preview" onClick={() => setSelectedProduct(null)}><X aria-hidden="true" /></button><div className="concept-dialog-image"><img src={selectedProduct.featuredImage?.url ?? "/images/mock-tee.png"} alt={selectedProduct.featuredImage?.altText || selectedProduct.title} /></div><div className="concept-dialog-copy"><span className="eyebrow">CONCEPT MOCKUP / NOT A LIVE PRODUCT</span><h2 id="concept-dialog-title">{selectedProduct.title}</h2><p className="concept-dialog-price">Sample price {money(selectedProduct.priceRange.minVariantPrice.amount, selectedProduct.priceRange.minVariantPrice.currencyCode)}</p><p>{selectedProduct.description}</p><a className="button button-dark" href="/custom-printing">Make something like this <ArrowRight aria-hidden="true" /></a></div></div>}
    </dialog>
  </main>
}
