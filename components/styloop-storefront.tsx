"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Heart, Menu, Minus, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react"
import type { Product } from "@/lib/shopify"

const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STYLOOP-MAIN%20LOGO-P0XcxaqQZWzsMxbb3Fi8KdE90BO01c.jpg"
const categories = [
  { name: "The everyday tee", label: "01 / ESSENTIALS", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85" },
  { name: "Soft structure", label: "02 / LAYERS", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85" },
  { name: "Off-duty uniform", label: "03 / STREETWEAR", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85" },
]

function money(amount: string, currency: string) {
  try { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount)) }
  catch { return `${amount} ${currency}` }
}

type CartItem = { variantId: string; title: string; variantTitle: string; image: string | null; amount: string; currency: string; quantity: number }

export function StyloopStorefront({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [category, setCategory] = useState("All pieces")
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [notice, setNotice] = useState("")
  const [loadError, setLoadError] = useState(false)

  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "All pieces" || product.productType.toLowerCase().includes(category.toLowerCase().replace("s", "")) || product.tags.some((tag) => tag.toLowerCase().includes(category.toLowerCase()))
    const matchesSearch = `${product.title} ${product.productType} ${product.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  }), [products, category, search])

  async function refreshProducts() {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Catalog unavailable")
      const data = await response.json() as { products?: Product[] }
      setProducts(data.products ?? [])
      setLoadError(false)
    } catch { setLoadError(true) }
  }

  function addToCart(product: Product) {
    const variant = product.variants.find((item) => item.availableForSale)
    if (!variant) { setNotice("This piece is currently sold out."); return }
    setCart((current) => {
      const existing = current.find((item) => item.variantId === variant.id)
      if (existing) return current.map((item) => item.variantId === variant.id ? { ...item, quantity: Math.min(item.quantity + 1, 10) } : item)
      return [...current, { variantId: variant.id, title: product.title, variantTitle: variant.title, image: product.featuredImage?.url ?? null, amount: product.priceRange.minVariantPrice.amount, currency: product.priceRange.minVariantPrice.currencyCode, quantity: 1 }]
    })
    setNotice(`${product.title} added to your bag.`)
    setCartOpen(true)
  }

  async function checkoutCart() {
    setCheckoutLoading(true)
    setNotice("")
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines: cart.map((item) => ({ merchandiseId: item.variantId, quantity: item.quantity })) }) })
      const result = await response.json() as { checkoutUrl?: string; error?: string }
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error ?? "Unable to start checkout.")
      window.location.assign(result.checkoutUrl)
    } catch (error) { setNotice(error instanceof Error ? error.message : "Please try again.") }
    finally { setCheckoutLoading(false) }
  }

  function updateCartQuantity(variantId: string, quantity: number) {
    setCart((current) => quantity < 1 ? current.filter((item) => item.variantId !== variantId) : current.map((item) => item.variantId === variantId ? { ...item, quantity: Math.min(quantity, 10) } : item))
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <main className="storefront">
      <div className="announcement">A little more you, in every piece. <a href="#studio">Make it yours <ArrowRight aria-hidden="true" /></a></div>
      <header className="site-header">
        <button className="icon-button mobile-menu-trigger" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="primary-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
        <a className="brand" href="#top" aria-label="STYLOOP home"><img src={logoUrl} alt="STYLOOP — Wear your style" /></a>
        <nav id="primary-navigation" className={mobileOpen ? "primary-nav is-open" : "primary-nav"} aria-label="Main navigation">
          <a href="/shop" onClick={() => setMobileOpen(false)}>Shop</a><a href="/shop?sort=newest" onClick={() => setMobileOpen(false)}>New arrivals</a><a href="#categories" onClick={() => setMobileOpen(false)}>Collections</a><a href="/custom-printing" onClick={() => setMobileOpen(false)}>Custom printing</a><a href="/about" onClick={() => setMobileOpen(false)}>Our story</a><a href="/contact" onClick={() => setMobileOpen(false)}>Contact</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-trigger" aria-label={searchOpen ? "Close product search" : "Search products"} aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search /></button>
          <button className="icon-button bag-trigger" aria-label={`Shopping bag, ${cart.reduce((total, item) => total + item.quantity, 0)} items`} onClick={() => setCartOpen(true)}><ShoppingBag /><span>Bag ({cart.reduce((total, item) => total + item.quantity, 0)})</span></button>
        </div>
      </header>
      {searchOpen && <div className="search-panel"><Search aria-hidden="true" /><input autoFocus aria-label="Search the collection" placeholder="Search the collection..." value={search} onChange={(event) => { setSearch(event.target.value); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }) }} /><button className="icon-button" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearch("") }}><X /></button></div>}
      {cartOpen && <div className="cart-layer"><button className="cart-backdrop" aria-label="Close shopping bag" onClick={() => setCartOpen(false)} /><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div className="cart-header"><div><span className="eyebrow">YOUR PICKS</span><h2 id="cart-title">Your bag <span>({cart.reduce((total, item) => total + item.quantity, 0)})</span></h2></div><button className="icon-button" aria-label="Close shopping bag" onClick={() => setCartOpen(false)}><X /></button></div>{cart.length === 0 ? <div className="cart-empty"><ShoppingBag /><p>Your bag is waiting for something good.</p><button className="button button-dark" onClick={() => { setCartOpen(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }) }}>Explore the collection <ArrowRight aria-hidden="true" /></button></div> : <><div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.variantId}>{item.image ? <img src={item.image} alt={item.title} /> : <div className="cart-item-placeholder">S.</div>}<div className="cart-item-info"><h3>{item.title}</h3><p>{item.variantTitle}</p><strong>{money(item.amount, item.currency)}</strong><div className="quantity-control"><button aria-label={`Remove one ${item.title}`} onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}><Minus /></button><span>{item.quantity}</span><button aria-label={`Add one ${item.title}`} onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}><Plus /></button><button className="remove-item" aria-label={`Remove ${item.title} from bag`} onClick={() => updateCartQuantity(item.variantId, 0)}><Trash2 /></button></div></div></article>)}</div><div className="cart-footer"><p>Shipping and taxes calculated at checkout.</p><button className="button button-dark cart-checkout" disabled={checkoutLoading} onClick={checkoutCart}>{checkoutLoading ? "Opening secure checkout…" : "Continue to secure checkout"}<ArrowRight aria-hidden="true" /></button><span className="secure-note">Secure checkout powered by Shopify</span></div></>}{notice && <p className="cart-notice" role="status">{notice}</p>}</aside></div>}

      <section className="hero" id="top">
        <div className="hero-photo" role="img" aria-label="STYLOOP editorial campaign: a modern essential, styled your way" />
        <div className="hero-copy"><span className="eyebrow">A NEW KIND OF EVERYDAY</span><h1>Wear your<br /><em>own story.</em></h1><p>Thoughtful pieces, made to move with you. Find your fit, then make it yours.</p><div className="hero-links"><a className="button button-dark" href="#collection">Discover the collection <ArrowRight aria-hidden="true" /></a><a className="text-link" href="#studio">Design your own <ArrowUpRight aria-hidden="true" /></a></div></div>
        <div className="hero-index"><span>THE STYLOOP EDIT</span><span>01 — 03</span></div>
        <a className="hero-scroll" href="#categories"><span>SCROLL TO EXPLORE</span><ArrowDown aria-hidden="true" /></a>
      </section>

      <section className="intro-strip"><p>Made for <em>every version</em> of you.</p><span>DESIGNED WITH INTENTION&nbsp; · &nbsp;WORN YOUR WAY&nbsp; · &nbsp;MADE TO LAST</span></section>

      <section className="category-section section-wrap" id="categories">
        <div className="section-heading"><div><span className="eyebrow">FIND YOUR FEEL</span><h2>Everyday, <em>reimagined.</em></h2></div><a className="text-link" href="#collection">Explore all pieces <ArrowRight aria-hidden="true" /></a></div>
        <div className="category-grid">{categories.map((item, index) => <a className={`category-card category-card-${index + 1}`} href="#collection" onClick={() => setCategory("All pieces")} key={item.name}><img src={item.image} alt="" /><span className="category-label">{item.label}</span><div className="category-title"><h3>{item.name}</h3><span aria-hidden="true"><ArrowUpRight /></span></div></a>)}</div>
      </section>

      <section className="product-section section-wrap" id="collection">
        <div className="section-heading product-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Pieces to <em>live in.</em></h2></div><div className="filters" role="group" aria-label="Filter products by category">{["All pieces", "T-shirts", "Hoodies", "Shirts"].map((item) => <button className={category === item ? "filter-button active" : "filter-button"} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        {notice && <p className="notice" role="status">{notice}</p>}
        {loadError && <div className="catalog-error" role="status"><span>We couldn&apos;t reach the collection just now.</span><button onClick={refreshProducts}>Try again</button></div>}
        {!loadError && filtered.length > 0 && <div className="product-grid">{filtered.slice(0, 8).map((product, index) => <article className="product-card" key={product.id}><div className="product-image-wrap">{product.featuredImage ? <img className="product-image" src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} loading={index > 3 ? "lazy" : "eager"} /> : <div className="product-image product-image-empty"><span>STYLOOP</span></div>}<span className="product-badge">{index === 0 ? "THE EDIT" : "STYLOOP ORIGINAL"}</span><button className={favorites.includes(product.id) ? "favorite-button is-favorite" : "favorite-button"} aria-label={favorites.includes(product.id) ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Heart fill={favorites.includes(product.id) ? "currentColor" : "none"} /></button><button className="quick-add" disabled={!product.variants.some((variant) => variant.availableForSale)} onClick={() => addToCart(product)}>{product.variants.some((variant) => variant.availableForSale) ? "Add to bag" : "Sold out"}<ArrowRight aria-hidden="true" /></button></div><div className="product-details"><div><h3><a href={`/products/${product.handle}`}>{product.title}</a></h3><p>{product.productType || "Made for everyday"}</p></div><span className="product-price">{money(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</span></div></article>)}</div>}
        {!loadError && filtered.length === 0 && <div className="empty-catalog"><div className="empty-mark">S.</div><h3>{products.length ? "Nothing here just yet." : "Your next favorite is on its way."}</h3><p>{products.length ? "Try another filter or search term." : "Our collection is being prepared. Check back soon."}</p>{products.length > 0 && <button className="text-link" onClick={() => { setCategory("All pieces"); setSearch("") }}>Clear filters <ArrowRight aria-hidden="true" /></button>}</div>}
        <a className="button button-outline all-products" href="#categories">Explore the edit <ArrowRight aria-hidden="true" /></a>
      </section>

      <section className="studio-section" id="studio"><div className="studio-image" role="img" aria-label="Soft cotton fabric, ready for your own creative touch" /><div className="studio-copy"><span className="eyebrow">A CANVAS, JUST FOR YOU</span><h2>Your idea.<br /><em>Your piece.</em></h2><p>Start with a fit you love. Add a little color, a line, a feeling. The best things are the ones that feel like you.</p><a className="button button-light" href="mailto:hello@styloop.com?subject=Custom%20design%20enquiry">Tell us what you have in mind <ArrowRight aria-hidden="true" /></a><span className="studio-note"><Check aria-hidden="true" /> Made to order, made by you</span></div></section>

      <section className="service-band"><span className="eyebrow">FOR YOUR PEOPLE, YOUR PLACE, YOUR NEXT THING</span><div className="service-row"><h2>Good ideas<br />look better <em>together.</em></h2><p>Custom prints and considered apparel for teams, moments and businesses. Tell us what you&apos;re dreaming up — we&apos;ll help bring it to life.</p><a className="round-link" href="mailto:hello@styloop.com?subject=Custom%20order%20enquiry" aria-label="Request a custom order"><ArrowUpRight /></a></div></section>

      <section className="brand-note"><span className="eyebrow">A NOTE FROM STYLOOP</span><p>Style isn&apos;t what you wear.<br />It&apos;s <em>how you make it yours.</em></p><a className="text-link" href="mailto:hello@styloop.com">Get to know us <ArrowRight aria-hidden="true" /></a></section>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="footer-brand" href="#top"><img src={logoUrl} alt="STYLOOP — Wear your style" /><span>WEAR YOUR STYLE</span></a>
          <div className="footer-message"><span className="eyebrow">A LITTLE MORE YOU, EVERY DAY</span><p>Get dressed like <em>yourself.</em></p><a href="#collection">Find your next favorite <ArrowRight aria-hidden="true" /></a></div>
          <div className="newsletter"><span className="eyebrow">A GOOD THING IN YOUR INBOX</span><p>New pieces, thoughtful notes, and a little inspiration.</p><form action="mailto:hello@styloop.com" method="get"><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" name="body" placeholder="Your email address" required /><input type="hidden" name="subject" value="Join the STYLOOP mailing list" /><button type="submit" aria-label="Email STYLOOP to join the mailing list"><ArrowRight /></button></form><span className="newsletter-note">By joining, you agree to hear from STYLOOP. No spam, ever.</span></div>
        </div>
        <div className="footer-links">
          <div><span className="eyebrow">EXPLORE</span><a href="#collection">Shop all</a><a href="#categories">The collections</a><a href="#collection">New arrivals</a></div>
          <div><span className="eyebrow">MAKE IT YOURS</span><a href="#studio">Custom design</a><a href="mailto:hello@styloop.com?subject=Custom%20order%20enquiry">Team &amp; bulk orders</a><a href="mailto:hello@styloop.com">Get in touch</a></div>
          <div className="footer-contact"><span className="eyebrow">HERE TO HELP</span><p>Questions or a good idea?</p><a href="mailto:hello@styloop.com">hello@styloop.com <ArrowUpRight aria-hidden="true" /></a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 STYLOOP. Wear your style.</span><nav aria-label="Footer navigation"><a href="#collection">Shop</a><a href="#studio">Custom design</a><a href="mailto:hello@styloop.com">Contact</a></nav><a className="back-to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
      </footer>
    </main>
  )
}
