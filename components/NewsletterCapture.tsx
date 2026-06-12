export function NewsletterCapture() {
  const provider = (process.env.NEWSLETTER_PROVIDER || "none").toLowerCase();
  const formEnabled = (process.env.NEWSLETTER_FORM_ENABLED || "false").toLowerCase() === "true";
  if (provider === "none" || !formEnabled) return null;

  return (
    <section className="container newsletter-card" aria-label="Newsletter signup">
      <div>
        <div className="section-kicker">Launch Notes</div>
        <h2>Get the next 7labs tool drops</h2>
        <p>One short update when new tool workflows, comparison pages, or document features ship.</p>
      </div>
      <form action="/api/events" method="post" className="newsletter-form">
        <input type="hidden" name="event" value="newsletter_signup" />
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required placeholder="you@example.com" />
        </label>
        <button className="primary-button" type="submit">Join list</button>
      </form>
    </section>
  );
}
