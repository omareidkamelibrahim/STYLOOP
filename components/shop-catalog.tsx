"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Search } from "lucide-react"
import type { Product } from "@/lib/shopify"

const filters = ["All pieces", "T-shirts", "Hoodies", "Shirts", "Accessories"]

function money(amount: string, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount))
}

export function ShopCatalog({ products, initialSort = "featured" }: { products: Product[]; initialSort?: string }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All pieces")
  const [sort, setSort] = useState(initialSort)
  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const categoryNeedle = category.toLowerCase().replace(/ies$/, "y").replace(/s$/, "")
      const categoryMatch = category === "All pieces" || `${product.productType} ${product.tags.join(" ")}`.toLowerCase().includes(categoryNeedle)
      const queryMatch = !needle || `${product.title} ${product.description} ${product.tags.join(" ")}`.toLowerCase().includes(needle)
      return categoryMatch && queryMatch
    })
    if (sort === "price-low") filtered.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount))
    if (sort === "price-high") filtered.sort((a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount))
    if (sort === "newest") filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    return filtered
  }, [products, query, category, sort])

  return <main className="catalog-page">
    <div className="catalog-intro"><span className="eyebrow">THE STYLOOP EDIT</span><h1>Pieces to <em>live in.</em></h1><p>Thoughtful everyday essentials, ready to make your own.</p></div>
    <section className="catalog-controls" aria-label="Filter and sort products"><div className="catalog-filters" role="group" aria-label="Product category">{filters.map((filter) => <button type="button" key={filter} className={category === filter ? "filter-button active" : "filter-button"} aria-pressed={category === filter} onClick={() => setCategory(filter)}>{filter}</button>)}</div><label className="catalog-search"><Search aria-hidden="true" /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces" /></label><label className="catalog-sort"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></section>
    <p className="catalog-count" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}</p>
    {visibleProducts.length ? <div className="product-grid catalog-grid">{visibleProducts.map((product, index) => <article className="product-card" key={product.id}><a className="product-image-wrap" href={`/products/${product.handle}`} aria-label={`View ${product.title}`}>{product.featuredImage ? <img className="product-image" src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} loading={index > 3 ? "lazy" : "eager"} /> : <div className="product-image product-image-empty"><span>STYLOOP</span></div>}<span className="product-badge">{index === 0 ? "THE EDIT" : "STYLOOP ORIGINAL"}</span><span className="quick-add">Explore piece <ArrowRight aria-hidden="true" /></span></a><div className="product-details"><div><h2><a href={`/products/${product.handle}`}>{product.title}</a></h2><p>{product.productType || "Made for everyday"}</p></div><span className="product-price">{money(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</span></div></article>)}</div> : <div className="empty-catalog"><div className="empty-mark">S.</div><h2>{products.length ? "No pieces found" : "The collection is getting ready."}</h2><p>{products.length ? "Try a different search or category." : "New STYLOOP pieces will appear here as soon as they are available."}</p>{products.length > 0 && <button className="text-link" type="button" onClick={() => { setQuery(""); setCategory("All pieces") }}>Clear filters <ArrowRight aria-hidden="true" /></button>}</div>}
  </main>
}
