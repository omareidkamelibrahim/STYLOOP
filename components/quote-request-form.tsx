"use client"

import { useRef, useState } from "react"
import { ArrowRight, Check, Upload, X } from "lucide-react"

const fileLimit = 3
const fileSizeLimit = 8 * 1024 * 1024
const acceptedTypes = ["image/png", "image/jpeg", "application/pdf"]

export function QuoteRequestForm() {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [reference, setReference] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addFiles(selected: FileList | null) {
    if (!selected) return
    const next = [...files, ...Array.from(selected)]
    if (next.length > fileLimit) { setError(`You can attach up to ${fileLimit} files.`); return }
    const invalid = next.find((file) => !acceptedTypes.includes(file.type) || file.size > fileSizeLimit)
    if (invalid) { setError("Attach PNG, JPG, or PDF artwork. Each file must be 8 MB or smaller."); return }
    setFiles(next)
    const transfer = new DataTransfer()
    next.forEach((file) => transfer.items.add(file))
    if (fileInputRef.current) fileInputRef.current.files = transfer.files
    setError("")
  }

  function removeFile(index: number) {
    const next = files.filter((_, fileIndex) => fileIndex !== index)
    setFiles(next)
    const transfer = new DataTransfer()
    next.forEach((file) => transfer.items.add(file))
    if (fileInputRef.current) fileInputRef.current.files = transfer.files
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const formElement = event.currentTarget
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/quotes", { method: "POST", body: new FormData(formElement) })
      const result = await response.json() as { reference?: string; error?: string }
      if (!response.ok || !result.reference) throw new Error(result.error ?? "We couldn't send your request. Please try again.")
      setReference(result.reference)
      setFiles([])
      formElement.reset()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't send your request. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (reference) return <section className="quote-success" aria-live="polite"><span className="quote-success-icon"><Check aria-hidden="true" /></span><span className="eyebrow">REQUEST RECEIVED</span><h2>Thank you for the idea.</h2><p>Your reference is <strong>{reference}</strong>. We&apos;ll review the details and follow up by email.</p><button className="button button-outline" type="button" onClick={() => setReference("")}>Send another request <ArrowRight aria-hidden="true" /></button></section>

  return <form id="quote-form" className="quote-form" onSubmit={submitForm}>
    <div className="quote-form-heading"><span className="eyebrow">LET&apos;S MAKE IT REAL</span><h2>Tell us what you&apos;re <em>imagining.</em></h2><p>Share the details below and our team will get back to you with next steps.</p></div>
    <div className="quote-trap" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
    <div className="quote-fields">
      <label><span>Your name *</span><input name="customerName" autoComplete="name" maxLength={120} required /></label>
      <label><span>Email address *</span><input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label><span>Phone number</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
      <label><span>Company (optional)</span><input name="companyName" autoComplete="organization" maxLength={160} /></label>
      <label><span>Garment type *</span><select name="garmentType" required defaultValue=""><option value="" disabled>Select a garment</option><option>T-shirt</option><option>Oversized T-shirt</option><option>Hoodie</option><option>Sweatshirt</option><option>Polo shirt</option><option>Uniform</option><option>Other</option></select></label>
      <label><span>Garment color</span><input name="garmentColor" maxLength={80} placeholder="e.g. natural, black, navy" /></label>
      <label><span>Total quantity *</span><input name="quantity" type="number" min="1" max="10000" step="1" required /></label>
      <label><span>Number of designs</span><input name="designCount" type="number" min="1" max="100" step="1" defaultValue="1" required /></label>
      <label><span>Printing method</span><select name="printingMethod" defaultValue=""><option value="">Not sure yet</option><option>Screen printing</option><option>Direct-to-garment</option><option>Embroidery</option><option>Heat transfer</option><option>Other</option></select></label>
      <fieldset className="quote-locations"><legend>Printing locations</legend><label><input type="checkbox" name="printingLocations" value="front" /> Front</label><label><input type="checkbox" name="printingLocations" value="back" /> Back</label><label><input type="checkbox" name="printingLocations" value="sleeve" /> Sleeve</label><label><input type="checkbox" name="printingLocations" value="other" /> Other</label></fieldset>
      <label><span>Size breakdown</span><input name="sizes" maxLength={300} placeholder="e.g. S: 4, M: 8, L: 6" /><small>Optional — add sizes and quantities if known.</small></label>
      <label><span>Preferred delivery date</span><input name="requiredDeliveryDate" type="date" /></label>
      <label className="quote-field-wide"><span>Delivery location *</span><input name="deliveryLocation" maxLength={240} autoComplete="shipping street-address" required /></label>
      <label className="quote-field-wide"><span>Tell us about your project</span><textarea name="instructions" rows={5} maxLength={3000} placeholder="Artwork, colors, timing, or anything else that will help us understand your idea." /></label>
      <div className="quote-field-wide"><span className="quote-upload-label">Artwork and references</span><label className="quote-upload"><Upload aria-hidden="true" /><span>Choose files</span><input ref={fileInputRef} name="artwork" type="file" accept="image/png,image/jpeg,application/pdf" multiple onChange={(event) => addFiles(event.currentTarget.files)} /><small>PNG, JPG, PDF · up to 3 files · 8 MB each</small></label>
        {files.length > 0 && <ul className="quote-file-list">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}><X aria-hidden="true" /></button></li>)}</ul>}
      </div>
    </div>
    {error && <p className="quote-error" role="alert">{error}</p>}
    <p className="quote-privacy-note">Your artwork is stored privately and used only to prepare this quotation. Please upload files you have permission to share.</p>
    <button className="button button-dark quote-submit" type="submit" disabled={busy}>{busy ? "Sending your request…" : "Request a quotation"}<ArrowRight aria-hidden="true" /></button>
  </form>
}
