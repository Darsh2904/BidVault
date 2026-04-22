import { Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=DM+Sans:wght@400;500;700&display=swap');

  .ts-wrap {
    min-height: 100vh;
    background: radial-gradient(circle at 10% 12%, rgba(108, 99, 255, 0.16), transparent 32%),
                radial-gradient(circle at 84% 88%, rgba(245, 158, 11, 0.1), transparent 34%),
                #0a0a0f;
    color: #f4f4ff;
    padding: 1.25rem;
    font-family: 'DM Sans', sans-serif;
  }

  .ts-shell {
    max-width: 1220px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 1rem;
  }

  .ts-side,
  .ts-main {
    border: 1px solid #2d2d46;
    border-radius: 16px;
    background: linear-gradient(160deg, rgba(20, 20, 32, 0.94), rgba(11, 11, 22, 0.96));
  }

  .ts-side {
    position: sticky;
    top: 1rem;
    height: fit-content;
    padding: 1.1rem 0.9rem;
  }

  .ts-logo {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    background: linear-gradient(130deg, #9d98ff, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.9rem;
  }

  .ts-nav {
    display: grid;
    gap: 0.35rem;
  }

  .ts-nav a {
    text-decoration: none;
    color: #b6b6d6;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.52rem 0.6rem;
    font-size: 0.84rem;
    transition: all 0.2s ease;
  }

  .ts-nav a:hover {
    color: #ffffff;
    border-color: #44446a;
    background: rgba(108, 99, 255, 0.12);
  }

  .ts-nav a.active {
    color: #ffffff;
    border-color: #5e5bcb;
    background: rgba(108, 99, 255, 0.2);
    font-weight: 600;
  }

  .ts-main {
    padding: 1.35rem 1.45rem;
  }

  .ts-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .ts-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.35rem, 2.2vw, 1.85rem);
    margin-bottom: 0.35rem;
  }

  .ts-sub {
    font-size: 0.86rem;
    color: #aaaaca;
  }

  .ts-home {
    text-decoration: none;
    border: 1px solid #3e3e60;
    border-radius: 10px;
    color: #d4d4ef;
    font-size: 0.82rem;
    padding: 0.52rem 0.85rem;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .ts-home:hover {
    color: #ffffff;
    border-color: #7f7aff;
  }

  .ts-card {
    border: 1px solid #30304d;
    border-radius: 12px;
    padding: 0.9rem 0.95rem;
    margin-bottom: 0.75rem;
    background: rgba(14, 14, 28, 0.78);
  }

  .ts-card h3 {
    font-size: 0.97rem;
    margin-bottom: 0.42rem;
    color: #ebe9ff;
  }

  .ts-card p,
  .ts-card li {
    color: #bdbddb;
    font-size: 0.86rem;
    line-height: 1.62;
  }

  .ts-card ul {
    margin: 0.35rem 0 0.1rem 1.1rem;
    padding: 0;
    display: grid;
    gap: 0.28rem;
  }

  @media (max-width: 980px) {
    .ts-shell { grid-template-columns: 1fr; }
    .ts-side {
      position: static;
      padding: 0.75rem;
    }
    .ts-nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
  }

  @media (max-width: 560px) {
    .ts-wrap { padding: 0.85rem; }
    .ts-main { padding: 0.95rem; }
    .ts-head { flex-direction: column; }
    .ts-nav { grid-template-columns: 1fr; }
  }
`;

const policyNavLinks = [
  { key: "trust", label: "Trust & Safety", to: "/trust-safety" },
  { key: "privacy", label: "Privacy Statement", to: "/privacy-statement" },
  { key: "terms", label: "Terms & Conditions", to: "/terms-conditions" },
];

const policyContent = {
  trust: {
    title: "Trust & Safety",
    subtitle: "Last updated: April 2026",
    sections: [
      {
        heading: "1. Our commitment",
        paragraphs: [
          "BidVault is committed to providing a secure and transparent auction environment for buyers, sellers, and administrators. We continuously monitor platform activity to maintain trust.",
        ],
      },
      {
        heading: "2. Account and identity safety",
        bullets: [
          "Users are expected to provide accurate profile and contact details.",
          "Unauthorized access, impersonation, and fake identities are strictly prohibited.",
          "Suspicious activity may result in temporary or permanent account restriction.",
        ],
      },
      {
        heading: "3. Auction integrity",
        bullets: [
          "Only legitimate listings are allowed after moderation and approval checks.",
          "Manipulative bidding, spam bids, and fraudulent listings are not permitted.",
          "Listings violating policy can be removed without prior notice.",
        ],
      },
      {
        heading: "4. Payment and transaction protection",
        paragraphs: [
          "Escrow-oriented payment handling and verification checks are used to reduce transaction risk. In disputed cases, admin review is performed before fund release.",
        ],
      },
      {
        heading: "5. Reporting and support",
        paragraphs: [
          "Users can report suspicious listings, transaction issues, or policy violations through the Help Center. Support tickets are tracked and handled by the admin team with status updates.",
        ],
      },
      {
        heading: "6. Policy updates",
        paragraphs: [
          "This Trust & Safety policy may be updated to reflect platform improvements, legal requirements, and security enhancements. Continued use of BidVault implies acceptance of updated terms.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Statement",
    subtitle: "Last updated: April 2026",
    sections: [
      {
        heading: "1. Information we collect",
        bullets: [
          "Account details such as name, email, phone, and profile identifiers.",
          "Transaction information related to listings, bids, and escrow activities.",
          "Support data submitted via Help Center forms and ticket updates.",
        ],
      },
      {
        heading: "2. How we use information",
        bullets: [
          "To provide account access, bidding functionality, and transaction services.",
          "To improve platform reliability, fraud detection, and user support quality.",
          "To communicate service updates, security notices, and policy changes.",
        ],
      },
      {
        heading: "3. Data sharing",
        paragraphs: [
          "BidVault does not sell personal data. Information is shared only when necessary for payment processing, legal compliance, dispute handling, or approved operational services.",
        ],
      },
      {
        heading: "4. Data security",
        paragraphs: [
          "We apply technical and organizational safeguards to protect user data against unauthorized access, modification, and misuse.",
        ],
      },
      {
        id: "cookies",
        heading: "5. Cookies and session storage",
        paragraphs: [
          "Cookies and local/session storage may be used for authentication state, preferences, and basic usage analytics to improve user experience.",
        ],
      },
      {
        heading: "6. User rights",
        paragraphs: [
          "Users can request correction of account information and raise privacy concerns through the Help Center or official support channels.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "Last updated: April 2026",
    sections: [
      {
        heading: "1. Acceptance of terms",
        paragraphs: [
          "By using BidVault, users agree to follow these terms, applicable laws, and platform policies.",
        ],
      },
      {
        heading: "2. User responsibilities",
        bullets: [
          "Provide accurate account information and maintain account security.",
          "Do not use the platform for fraudulent, abusive, or illegal activity.",
          "Respect bidding rules, listing guidelines, and communication standards.",
        ],
      },
      {
        heading: "3. Auction and bidding rules",
        paragraphs: [
          "All bids are considered intentional actions. Bid cancellation, listing moderation, and outcome decisions are handled according to platform policies and admin review when required.",
        ],
      },
      {
        heading: "4. Payments and disputes",
        paragraphs: [
          "Escrow and payment verification processes are applied to increase trust. Disputed transactions may be reviewed by administrators before final settlement.",
        ],
      },
      {
        heading: "5. Service availability",
        paragraphs: [
          "We aim for reliable uptime but do not guarantee uninterrupted service. Features may change as the platform evolves.",
        ],
      },
      {
        heading: "6. Account suspension",
        paragraphs: [
          "BidVault reserves the right to suspend or remove accounts that violate terms, compromise safety, or misuse platform systems.",
        ],
      },
    ],
  },
};

function PolicyCenter({ pageKey }) {
  const content = policyContent[pageKey] || policyContent.trust;

  return (
    <div className="ts-wrap">
      <style>{styles}</style>

      <div className="ts-shell">
        <aside className="ts-side">
          <div className="ts-logo">BidVault Safety Center</div>
          <nav className="ts-nav">
            <Link to="/">Home</Link>
            <Link to="/help-center">Help Center</Link>
            {policyNavLinks.map((item) => (
              <Link key={item.key} className={pageKey === item.key ? "active" : ""} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="ts-main">
          <div className="ts-head">
            <div>
              <h1 className="ts-title">{content.title}</h1>
              <p className="ts-sub">{content.subtitle}</p>
            </div>
            <Link className="ts-home" to="/">Back to Home</Link>
          </div>

          {content.sections.map((section) => (
            <section id={section.id} className="ts-card" key={section.heading}>
              <h3>{section.heading}</h3>
              {section.paragraphs?.map((text) => (
                <p key={text}>{text}</p>
              ))}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

export default function TrustSafety() {
  return <PolicyCenter pageKey="trust" />;
}

export function PrivacyStatement() {
  return <PolicyCenter pageKey="privacy" />;
}

export function TermsConditions() {
  return <PolicyCenter pageKey="terms" />;
}
