export const metadata = {
  title: "Terms & Conditions · R3IGN HQ",
  description:
    "The R3IGN Terms & Conditions governing accounts, league participation, competition conduct, and platform use.",
};

export default function TermsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <a href="/">Home</a> / Terms &amp; Conditions
          </span>
          <h1 style={{ marginTop: "1rem" }}>Terms &amp; Conditions</h1>
          <p>
            These terms govern participation in R3IGN HQ competitions, account
            use, and access to league services made available through this
            website.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap" style={{ maxWidth: "760px" }}>
          <p style={{ color: "var(--paper-dim)" }}>
            Effective date: September 2026. These terms apply to all users of
            R3IGN HQ services.
          </p>
          <div className="value-list mt-lg">
            <div className="value-row">
              <div className="idx">01</div>
              <div>
                <h3>Acceptance and Authority</h3>
                <p>
                  By creating an account, registering an organization,
                  entering a competition, or otherwise using R3IGN services,
                  you confirm that you have authority to accept these Terms
                  &amp; Conditions. These terms incorporate any league, event,
                  roster, and competition rules published by R3IGN HQ.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">02</div>
              <div>
                <h3>Accounts and Eligibility</h3>
                <p>
                  You are responsible for the accuracy and security of your
                  account information and credentials. You must not create an
                  account for another person without authorization or
                  misrepresent your identity, age, organization, roster, or
                  competitive eligibility. R3IGN may request information
                  reasonably necessary to confirm eligibility.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">03</div>
              <div>
                <h3>Competition Administration</h3>
                <p>
                  R3IGN may establish and enforce rules for teams, players,
                  divisions, match administration, scoring, scheduling,
                  verification, and disciplinary review. Competitors must act
                  in good faith, preserve evidence when requested, and follow
                  binding instructions issued by authorized officials, admins,
                  or league staff.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">04</div>
              <div>
                <h3>Prohibited Conduct</h3>
                <p>
                  Users must not harass, threaten, or discriminate against
                  other participants; manipulate rankings or match outcomes;
                  submit false verification information; use another
                  person&rsquo;s account; exploit platform vulnerabilities; or
                  circumvent access controls, sanctions, or competition rules.
                  R3IGN may suspend, disqualify, or remove access where
                  conduct threatens platform safety or competitive integrity.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">05</div>
              <div>
                <h3>Content and Intellectual Property</h3>
                <p>
                  Content uploaded by users, including profile data, team
                  names, screenshots, and player marketplace listings, remains
                  subject to applicable ownership rights. By submitting
                  information to R3IGN, you confirm you have the necessary
                  rights to provide it and consent to its display on the
                  platform as required for league operations.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">06</div>
              <div>
                <h3>Privacy and Data</h3>
                <p>
                  R3IGN processes account, verification, and competition data
                  to operate the platform and support league administration.
                  Use of the site is subject to the{" "}
                  <a href="/privacy" style={{ color: "var(--amber)" }}>
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">07</div>
              <div>
                <h3>Disputes and Decisions</h3>
                <p>
                  R3IGN HQ administrators may review match disputes,
                  verification concerns, and rule violations. Decisions made
                  by league staff are based on available evidence and
                  published competition rules and may affect standings,
                  access, and eligibility.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">08</div>
              <div>
                <h3>Service Availability and Liability</h3>
                <p>
                  R3IGN services are provided on an &ldquo;as is&rdquo; and
                  &ldquo;as available&rdquo; basis. We aim to maintain
                  reliable access but do not guarantee uninterrupted service,
                  error-free operation, or permanent availability of content,
                  standings, or competition features. To the maximum extent
                  permitted by law, R3IGN is not liable for indirect,
                  incidental, special, or consequential loss arising from use
                  of the website or competition platform.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">09</div>
              <div>
                <h3>Changes to Terms</h3>
                <p>
                  We may revise these terms from time to time to reflect
                  product, legal, or operational changes. Continued use of
                  R3IGN HQ after updates constitutes acceptance of the revised
                  terms.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">10</div>
              <div>
                <h3>Contact and Notices</h3>
                <p>
                  Questions or formal notices concerning these terms can be
                  sent to{" "}
                  <a
                    href="mailto:r3ignhq@gmail.com"
                    style={{ color: "var(--amber)" }}
                  >
                    r3ignhq@gmail.com
                  </a>
                  . R3IGN may provide operational notices through the website,
                  account email, or other contact details associated with your
                  account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}