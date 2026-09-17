export const metadata = {
  title: "Privacy Policy · R3IGN HQ",
  description:
    "The R3IGN Privacy Policy explaining how account, competition, verification, and support information is handled.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <a href="/">Home</a> / Privacy Policy
          </span>
          <h1 style={{ marginTop: "1rem" }}>Privacy Policy</h1>
          <p>
            This Privacy Policy explains how R3IGN collects, uses, stores, and
            protects personal information when you use the website or
            participate in league services.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap" style={{ maxWidth: "760px" }}>
          <p style={{ color: "var(--paper-dim)" }}>
            Effective date: September 2026. This policy applies to information
            processed through R3IGN services.
          </p>
          <div className="value-list mt-lg">
            <div className="value-row">
              <div className="idx">01</div>
              <div>
                <h3>Information We Collect</h3>
                <p>
                  We collect account information you provide, including email
                  address, display name, league ID, profile details, and
                  authentication provider information. We may also process
                  competition records such as organization registrations,
                  roster details, player verification information, game
                  account identifiers, uploaded screenshots, messages, support
                  requests, and relevant platform activity.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">02</div>
              <div>
                <h3>Purposes of Processing</h3>
                <p>
                  We use information to authenticate users, operate the
                  platform, administer leagues and events, process
                  registrations, verify players, maintain standings,
                  investigate disputes, provide support, prevent abuse,
                  communicate operational notices, and protect the integrity
                  and security of R3IGN HQ services.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">03</div>
              <div>
                <h3>Cookies and Analytics</h3>
                <p>
                  We use essential cookies to keep sessions and site
                  functionality working. Optional analytics cookies may be
                  used to understand traffic patterns and improve the user
                  experience. You may adjust your browser settings to decline
                  cookies, though some platform features may be limited as a
                  result.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">04</div>
              <div>
                <h3>Security</h3>
                <p>
                  We protect personal information using reasonable
                  administrative, technical, and organizational safeguards.
                  However, no system is completely immune to risk, and we
                  cannot guarantee absolute security against unauthorized
                  access, loss, or misuse.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">05</div>
              <div>
                <h3>Disclosure of Information</h3>
                <p>
                  We do not sell personal data. Information may be disclosed
                  to authorized league admins, service providers that support
                  authentication, hosting, storage, communications, or
                  analytics, and authorities where required by law. We may
                  also disclose information when reasonably necessary to
                  investigate abuse, enforce competition rules, protect users,
                  or preserve platform security.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">06</div>
              <div>
                <h3>Your Privacy Rights</h3>
                <p>
                  You may update account details, manage profile information,
                  and request support regarding verification or account
                  access. Depending on your jurisdiction, you may have rights
                  to request access, correction, deletion, restriction, or
                  portability of personal data, subject to applicable legal
                  and operational exceptions. Contact us to exercise a right
                  or ask a privacy question.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">07</div>
              <div>
                <h3>Retention</h3>
                <p>
                  We retain information for as long as needed to provide
                  services, satisfy legal obligations, resolve disputes, and
                  maintain operational records related to competition
                  administration.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">08</div>
              <div>
                <h3>Third-Party Services</h3>
                <p>
                  R3IGN uses Supabase for authentication and storage and may
                  use additional providers for hosting, analytics,
                  communications, or embedded content. Third-party services
                  may process information under their own terms and privacy
                  notices. We encourage you to review the policies of services
                  you use to access R3IGN.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">09</div>
              <div>
                <h3>Children and Minors</h3>
                <p>
                  R3IGN is intended for users who are old enough to
                  participate in competitive gaming communities and comply
                  with the laws and rules applicable in their jurisdiction.
                  Minors should only use the platform with the consent and
                  supervision of a parent or guardian where required.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">10</div>
              <div>
                <h3>Privacy Contact</h3>
                <p>
                  Privacy questions, rights requests, and concerns about
                  personal information can be sent to{" "}
                  <a
                    href="mailto:r3ignhq@gmail.com"
                    style={{ color: "var(--amber)" }}
                  >
                    r3ignhq@gmail.com
                  </a>
                  . Please include enough detail for us to identify the
                  relevant account or request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}