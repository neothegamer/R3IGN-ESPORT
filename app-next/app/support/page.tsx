export const metadata = {
  title: "Support · R3IGN HQ",
  description:
    "Get help with R3IGN HQ team registration, league rules, and match disputes.",
};

export default function SupportPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <a href="/">Home</a> / Support
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            We&rsquo;re Here To Help
          </span>
          <h1>Support</h1>
          <p>
            Need assistance with registration, league rules, account access,
            verification, or competition operations? Use the support route
            that best matches your request.
          </p>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-card">
              <span className="eyebrow">General Support</span>
              <p>
                League rules, event schedules, account access, verification,
                and general platform support.
              </p>
              <a className="link" href="mailto:r3ignhq@gmail.com">
                r3ignhq@gmail.com
              </a>
            </div>
            <div className="contact-card">
              <span className="eyebrow">Team Registration</span>
              <p>
                Roster eligibility, division requests, registration status,
                and organization administration.
              </p>
              <a className="link" href="mailto:r3ignhq@gmail.com">
                r3ignhq@gmail.com
              </a>
            </div>
            <div className="contact-card">
              <span className="eyebrow">Partnerships</span>
              <p>
                Sponsorships, media opportunities, broadcasts, and official
                organization partnerships.
              </p>
              <a className="link" href="mailto:r3ignhq@gmail.com">
                r3ignhq@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ maxWidth: "640px" }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">Send a Message</span>
              <h2>Contact form</h2>
            </div>
            <p className="lede">
              Prefer a form? Submit your request here and it goes straight
              into the R3IGN HQ support queue.
            </p>
          </div>

          <div className="form-panel">
            <div className="auth-notice" id="contact-config-notice">
              Backend isn&rsquo;t connected yet. Add your Supabase project URL
              and anon key to enable the form.
            </div>
            <div className="form-success" id="contact-success" role="status">
              Message received. A member of the R3IGN HQ team will follow up
              by email.
            </div>
            <div className="auth-error" id="contact-error"></div>

            <form id="contact-form" noValidate>
              {/* Honeypot — leave empty */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  height: 0,
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <label htmlFor="contact-website">Website</label>
                <input
                  type="text"
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <label htmlFor="contact-name">
                  Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  autoComplete="name"
                />
                <div className="field-error">Enter your name.</div>
              </div>

              <div className="field">
                <label htmlFor="contact-email">
                  Email <span className="req">*</span>
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  autoComplete="email"
                />
                <div className="field-error">
                  Enter a valid email address.
                </div>
              </div>

              <div className="field">
                <label htmlFor="contact-subject">
                  Subject <span className="req">*</span>
                </label>
                <select id="contact-subject" name="subject" required>
                  <option value="">Select a topic</option>
                  <option value="General Support">General Support</option>
                  <option value="Team Registration">Team Registration</option>
                  <option value="Match Dispute">Match Dispute</option>
                  <option value="Account / Verification">
                    Account / Verification
                  </option>
                  <option value="Partnerships">Partnerships</option>
                  <option value="Other">Other</option>
                </select>
                <div className="field-error">Choose a subject.</div>
              </div>

              <div className="field">
                <label htmlFor="contact-message">
                  Message <span className="req">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Describe your request clearly so we can help faster."
                ></textarea>
                <div className="field-error">Enter your message.</div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                id="contact-submit"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">FAQ</span>
              <h2>Frequently asked questions</h2>
            </div>
          </div>
          <div className="accordion">
            <div className="accordion-item">
              <button
                className="accordion-trigger"
                aria-expanded="false"
                aria-controls="faq-panel-0"
                id="faq-trigger-0"
              >
                How do I register my team?<span className="icon">+</span>
              </button>
              <div
                className="accordion-panel"
                id="faq-panel-0"
                role="region"
                aria-labelledby="faq-trigger-0"
              >
                <p>
                  Go to the <a href="/register">Register Organization</a> page
                  and complete the submission form with your roster, captain
                  details, requested league, and any supporting information
                  required for the season. R3IGN HQ staff reviews submissions
                  before confirming placement.
                </p>
              </div>
            </div>
            <div className="accordion-item">
              <button
                className="accordion-trigger"
                aria-expanded="false"
                aria-controls="faq-panel-1"
                id="faq-trigger-1"
              >
                What are the eligibility requirements?
                <span className="icon">+</span>
              </button>
              <div
                className="accordion-panel"
                id="faq-panel-1"
                role="region"
                aria-labelledby="faq-trigger-1"
              >
                <p>
                  Each team must meet the roster and eligibility rules for the
                  applicable league, maintain a designated captain, and agree
                  to the rules of competition during the registration window.
                  R3IGN may request additional proof of identity, roster
                  validity, or competitive compliance when needed.
                </p>
              </div>
            </div>
            <div className="accordion-item">
              <button
                className="accordion-trigger"
                aria-expanded="false"
                aria-controls="faq-panel-2"
                id="faq-trigger-2"
              >
                How are league standings calculated?
                <span className="icon">+</span>
              </button>
              <div
                className="accordion-panel"
                id="faq-panel-2"
                role="region"
                aria-labelledby="faq-trigger-2"
              >
                <p>
                  Standings are tracked using competition results as reported
                  by league administrators and officials. Teams are ranked
                  based on match outcomes, current season performance, and any
                  rules outlined for that league&apos;s specific format.
                </p>
              </div>
            </div>
            <div className="accordion-item">
              <button
                className="accordion-trigger"
                aria-expanded="false"
                aria-controls="faq-panel-3"
                id="faq-trigger-3"
              >
                How do I report a match dispute?
                <span className="icon">+</span>
              </button>
              <div
                className="accordion-panel"
                id="faq-panel-3"
                role="region"
                aria-labelledby="faq-trigger-3"
              >
                <p>
                  Send an email to{" "}
                  <a href="mailto:r3ignhq@gmail.com">r3ignhq@gmail.com</a>{" "}
                  with your team name, league, match details, and a clear
                  statement of the issue. Include screenshots, recordings,
                  timestamps, or other evidence that enables league staff to
                  conduct a fair review.
                </p>
              </div>
            </div>
            <div className="accordion-item">
              <button
                className="accordion-trigger"
                aria-expanded="false"
                aria-controls="faq-panel-4"
                id="faq-trigger-4"
              >
                Why is my player account still pending?
                <span className="icon">+</span>
              </button>
              <div
                className="accordion-panel"
                id="faq-panel-4"
                role="region"
                aria-labelledby="faq-trigger-4"
              >
                <p>
                  Linked game accounts are reviewed by league admins before
                  they are approved. Pending status usually means the account
                  is waiting for manual verification, a screenshot upload, or
                  a follow-up check against the in-game identifier supplied by
                  the player.
                </p>
              </div>
            </div>
            <div className="accordion-item">
              <button
                className="accordion-trigger"
                aria-expanded="false"
                aria-controls="faq-panel-5"
                id="faq-trigger-5"
              >
                When do RFCL and RBSL open?<span className="icon">+</span>
              </button>
              <div
                className="accordion-panel"
                id="faq-panel-5"
                role="region"
                aria-labelledby="faq-trigger-5"
              >
                <p>
                  Each league opens on its own schedule as the season calendar
                  is finalized. Registering now helps ensure your organization
                  is ready when the next window opens and lets R3IGN HQ staff
                  contact you with placement and eligibility details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}