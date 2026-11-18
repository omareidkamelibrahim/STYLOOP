"use client"

import { useState } from "react"
import { ArrowRight, Menu, Search, ShoppingBag, X } from "lucide-react"

const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STYLOOP-MAIN%20LOGO-P0XcxaqQZWzsMxbb3Fi8KdE90BO01c.jpg"

export function PublicSiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return <>
    <div className="announcement">A little more you, in every piece. <a href="/custom-printing">Make it yours <ArrowRight aria-hidden="true" /></a></div>
    <header className="site-header">
      <button className="icon-button mobile-menu-trigger" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="public-primary-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      <a className="brand" href="/" aria-label="STYLOOP home"><img src={logoUrl} alt="STYLOOP — Wear your style" /></a>
      <nav id="public-primary-navigation" className={mobileOpen ? "primary-nav is-open" : "primary-nav"} aria-label="Main navigation">
        <a href="/shop" onClick={() => setMobileOpen(false)}>Shop</a><a href="/shop?sort=newest" onClick={() => setMobileOpen(false)}>New arrivals</a><a href="/#categories" onClick={() => setMobileOpen(false)}>Collections</a><a href="/custom-printing" onClick={() => setMobileOpen(false)}>Custom printing</a><a href="/about" onClick={() => setMobileOpen(false)}>Our story</a><a href="/contact" onClick={() => setMobileOpen(false)}>Contact</a>
      </nav>
      <div className="header-actions">
        <a className="icon-button search-trigger" href="/shop" aria-label="Search products"><Search /></a>
        <a className="icon-button bag-trigger" href="/shop" aria-label="Shopping bag"><ShoppingBag /><span>Bag</span></a>
      </div>
    </header>
  </>
}

export function PublicSiteFooter() {
  return <footer className="site-footer public-site-footer"><div className="footer-top"><a className="footer-brand" href="/"><img src={logoUrl} alt="STYLOOP — Wear your style" /><span>WEAR YOUR STYLE</span></a><div className="footer-message"><span className="eyebrow">A LITTLE MORE YOU, EVERY DAY</span><p>Get dressed like <em>yourself.</em></p><a href="/shop">Find your next favorite <ArrowRight aria-hidden="true" /></a></div><div className="footer-contact"><span className="eyebrow">HERE TO HELP</span><p>Questions or a good idea?</p><a href="mailto:hello@styloop.com">hello@styloop.com <ArrowRight aria-hidden="true" /></a></div></div><div className="footer-links"><div><span className="eyebrow">EXPLORE</span><a href="/shop">Shop all</a><a href="/custom-printing">Custom printing</a><a href="/about">About STYLOOP</a></div><div><span className="eyebrow">CUSTOMER CARE</span><a href="/faq">FAQs</a><a href="/shipping">Shipping</a><a href="/returns">Returns</a></div><div><span className="eyebrow">INFORMATION</span><a href="/privacy">Privacy policy</a><a href="/terms">Terms of service</a><a href="/contact">Contact</a></div></div><div className="footer-bottom"><span>© 2026 STYLOOP. Wear your style.</span><a href="#top">Back to top ↑</a></div></footer>
}

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return <div className="storefront"><PublicSiteHeader />{children}<PublicSiteFooter /></div>
}
