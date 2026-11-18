import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { PublicPageLayout } from "@/components/public-site-shell"
import { QuoteRequestForm } from "@/components/quote-request-form"
import { getStorePolicies, type StorePolicy } from "@/lib/shopify"

const pages = {
  about: { title: "A little more you.", eyebrow: "OUR STORY", intro: "STYLOOP is here for the pieces that feel like you — considered everyday clothing with room for your own point of view.", paragraphs: ["We believe getting dressed should feel personal, not prescribed. The right piece becomes part of your story: lived in, returned to, and made your own.", "Our edit is built around expressive essentials and the idea that style belongs to everyone. Start with a favorite, make it yours, and wear it your way."], cta: "Explore the collection", href: "/shop" },
  contact: { title: "We’re all ears.", eyebrow: "CONTACT STYLOOP", intro: "A question about a piece, a custom idea, or just want to say hello? We’d love to hear from you.", paragraphs: ["For product questions, collaborations, or custom print enquiries, email us and include any details that will help us point you in the right direction."], cta: "Email hello@styloop.com", href: "mailto:hello@styloop.com" },
  "custom-printing": { title: "Good ideas look better together.", eyebrow: "CUSTOM PRINTING & BULK ORDERS", intro: "Custom apparel for teams, events, businesses, and the ideas you can’t find off the rack.", paragraphs: ["Tell us what you’re making, what garments you have in mind, your estimated quantities, and when you need them. Our team can help you explore suitable print placements and next steps.", "Share garment details, quantities, delivery location, timing, and artwork so we can prepare a useful quotation."], cta: "Request a custom quotation", href: "#quote-form" },
} as const

const policyKeys = { shipping: "shippingPolicy", returns: "refundPolicy", privacy: "privacyPolicy", terms: "termsOfService" } as const
const policyHeadings = { shipping: "Shipping information", returns: "Returns & refunds", privacy: "Privacy policy", terms: "Terms of service" } as const
const faqItems = [
  ["How do I find the right size?", "Product options and available sizes are shown on each product page. If you are unsure, contact us with the product name and we’ll do our best to help."],
  ["How can I track an order?", "Shopify sends order and delivery updates to the email address used at checkout. Check your confirmation email for the latest details."],
  ["Can I request custom printing?", "Yes. We welcome team, event, business, and bulk apparel enquiries. Share your garment, quantity, artwork, and timing details through our custom printing page."],
  ["Where can I find shipping and return details?", "The current store policies are linked in the footer and at checkout. Availability and terms can vary by destination and order."],
  ["How do I get in touch?", "Email hello@styloop.com and include your order number if you are asking about an existing purchase."],
]

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const title = slug in pages ? pages[slug as keyof typeof pages].title : policyHeadings[slug as keyof typeof policyHeadings]
  return title ? { title: `${title} | STYLOOP`, description: slug === "custom-printing" ? "Request a custom apparel quotation from STYLOOP for teams, events, uniforms, and bulk orders." : `Learn more about ${title.toLowerCase()} at STYLOOP.` } : { title: "STYLOOP" }
}

function PolicyContent({ policy }: { policy: StorePolicy | null }) {
  if (!policy) return <div className="policy-unavailable"><p>The current store policy is shown during checkout. For help with a specific order, contact our team.</p><a className="text-link" href="mailto:hello@styloop.com">Contact STYLOOP <ArrowRight aria-hidden="true" /></a></div>
  const text = policy.body.replace(/<\/?(p|div|br|li|h[1-6])\b[^>]*>/gi, "\n").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim()
  return <div className="policy-content"><p className="policy-source">Current policy from the STYLOOP store.</p><div>{text.split(/\n+/).map((paragraph, index) => paragraph.trim() ? <p key={index}>{paragraph.trim()}</p> : null)}</div><a href={policy.url} target="_blank" rel="noreferrer">View official policy <ArrowRight aria-hidden="true" /></a></div>
}

export default async function InformationalPage({ params }: PageProps) {
  const { slug } = await params
  if (slug === "faq") return <PublicPageLayout><main className="information-page"><header className="information-heading"><span className="eyebrow">HERE TO HELP</span><h1>Frequently <em>asked.</em></h1><p>Quick answers to the things customers ask us most.</p></header><div className="faq-list">{faqItems.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div><a className="information-cta" href="/contact">Still have a question? Get in touch <ArrowRight aria-hidden="true" /></a></main></PublicPageLayout>

  if (slug in pages) {
    const page = pages[slug as keyof typeof pages]
    return <PublicPageLayout><main className="information-page editorial-page"><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p className="information-intro">{page.intro}</p><div className="information-copy">{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><a className="button button-dark" href={page.href}>{page.cta} <ArrowRight aria-hidden="true" /></a>{slug === "custom-printing" && <><div className="custom-service-grid"><article><span>01</span><h2>Team &amp; uniforms</h2><p>Matching apparel for your people, place, or next big moment.</p></article><article><span>02</span><h2>Events &amp; merch</h2><p>Wearable keepsakes for gatherings, launches, and celebrations.</p></article><article><span>03</span><h2>Bring your artwork</h2><p>Share your design or references so we can understand the idea.</p></article></div><QuoteRequestForm /></>}</main></PublicPageLayout>
  }

  if (slug in policyKeys) {
    const policies = await getStorePolicies().catch(() => null)
    const key = policyKeys[slug as keyof typeof policyKeys]
    const policy = policies?.[key] ?? null
    return <PublicPageLayout><main className="information-page policy-page"><span className="eyebrow">STYLOOP CUSTOMER CARE</span><h1>{policy?.title ?? policyHeadings[slug as keyof typeof policyHeadings]}</h1><PolicyContent policy={policy} /></main></PublicPageLayout>
  }

  notFound()
}
