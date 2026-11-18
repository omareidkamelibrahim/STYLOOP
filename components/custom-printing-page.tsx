import { ArrowDown, ArrowRight, Check, Sparkles } from "lucide-react"
import { QuoteRequestForm } from "@/components/quote-request-form"

const examples = [
  { image: "/images/mock-tee.png", alt: "Cream t-shirt with a vivid custom graphic", label: "01 / YOUR IDEA", title: "Start with a feeling" },
  { image: "/images/mock-hoodie.png", alt: "Black hoodie with tonal custom embroidery", label: "02 / YOUR PIECE", title: "Choose the canvas" },
  { image: "/images/mock-tote.png", alt: "Printed natural canvas tote bag", label: "03 / YOUR PEOPLE", title: "Make it yours" },
]

const steps = [
  { number: "01", title: "Tell us the big picture", description: "Share your occasion, who the pieces are for, and how you picture them being worn." },
  { number: "02", title: "Add the useful details", description: "Garment, quantity, sizes, artwork, colors, and delivery location help us shape a considered quote." },
  { number: "03", title: "We’ll take it from there", description: "Our team will review your brief and follow up by email about the next steps for your project." },
]

export function CustomPrintingPage() {
  return <main className="custom-page">
    <section className="custom-hero" aria-labelledby="custom-title">
      <div className="custom-hero-copy">
        <div className="custom-hero-kicker"><Sparkles aria-hidden="true" /> A PRINT STUDIO FOR YOUR PEOPLE</div>
        <h1 id="custom-title">Good ideas<br />look better <em>worn.</em></h1>
        <p>From a first sketch to a full team set, make pieces that feel like they belong to the people wearing them.</p>
        <div className="custom-hero-actions"><a className="button button-dark" href="#quote-form">Start a project <ArrowRight aria-hidden="true" /></a><a className="custom-scroll-link" href="#how-it-works">See how it works <ArrowDown aria-hidden="true" /></a></div>
        <div className="custom-hero-meta"><span>TEAMS</span><span>EVENTS</span><span>GOOD IDEAS</span></div>
      </div>
      <div className="custom-hero-image">
        <img src="/images/custom-print-studio.png" alt="A creative team screen-printing a custom t-shirt design in a sunlit studio" />
        <div className="custom-image-stamp"><span>STYLOOP</span><strong>MAKE<br />SOMETHING<br /><em>YOURS.</em></strong><small>STUDIO / 001</small></div>
        <span className="custom-image-caption">A LITTLE MORE YOU, IN EVERY PIECE.</span>
      </div>
      <span className="custom-hero-index" aria-hidden="true">CUSTOM / 001</span>
    </section>

    <section className="custom-examples" aria-labelledby="custom-examples-title">
      <div className="custom-section-heading"><div><span className="eyebrow">A FEW WAYS TO MAKE IT YOURS</span><h2 id="custom-examples-title">A blank piece<br />is a <em>beginning.</em></h2></div><p>Uniforms with personality. Merch that gets worn again. The idea you’ve been carrying around for a while.</p></div>
      <div className="custom-example-grid">{examples.map((example) => <article className="custom-example-card" key={example.label}><div className="custom-example-image"><img src={example.image} alt={example.alt} loading="lazy" /><span>{example.label}</span></div><h3>{example.title}</h3></article>)}</div>
    </section>

    <section className="custom-process" id="how-it-works" aria-labelledby="custom-process-title">
      <div className="custom-process-intro"><span className="eyebrow">THOUGHTFUL FROM THE FIRST NOTE</span><h2 id="custom-process-title">Your project,<br /><em>in three steps.</em></h2><p>Send us what you know. It’s okay if you’re still figuring out the rest.</p><a className="button button-light" href="#quote-form">Tell us about it <ArrowRight aria-hidden="true" /></a></div>
      <div className="custom-steps">{steps.map((step) => <article className="custom-step" key={step.number}><span className="custom-step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div><Check aria-hidden="true" /></article>)}</div>
    </section>

    <section className="custom-note" aria-label="A note from the studio"><span className="eyebrow">NO PERFECT BRIEF REQUIRED</span><p>Bring the rough sketch.<br />Bring the <em>half-formed idea.</em></p><a href="#quote-form">We’ll figure it out together <ArrowRight aria-hidden="true" /></a></section>
    <QuoteRequestForm />
  </main>
}
