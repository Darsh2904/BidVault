import { Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=DM+Sans:wght@400;500;700&display=swap');

  .au-wrap {
    min-height: 100vh;
    background: radial-gradient(circle at 12% 15%, rgba(108, 99, 255, 0.16), transparent 34%),
                radial-gradient(circle at 88% 82%, rgba(245, 158, 11, 0.1), transparent 36%),
                #0a0a0f;
    color: #f4f4ff;
    padding: 1.25rem;
    font-family: 'DM Sans', sans-serif;
  }

  .au-shell {
    max-width: 1120px;
    margin: 0 auto;
    display: grid;
    gap: 1rem;
  }

  .au-card {
    border: 1px solid #2d2d46;
    border-radius: 16px;
    background: linear-gradient(160deg, rgba(20, 20, 32, 0.94), rgba(11, 11, 22, 0.96));
    padding: 1.2rem 1.3rem;
  }

  .au-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .au-brand {
    font-family: 'Syne', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    background: linear-gradient(130deg, #9d98ff, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .au-home {
    text-decoration: none;
    border: 1px solid #3e3e60;
    border-radius: 10px;
    color: #d4d4ef;
    font-size: 0.82rem;
    padding: 0.52rem 0.85rem;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .au-home:hover {
    color: #ffffff;
    border-color: #7f7aff;
  }

  .au-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 3.1vw, 2.15rem);
    margin-bottom: 0.55rem;
  }

  .au-sub {
    color: #b8b8d8;
    font-size: 0.92rem;
    line-height: 1.7;
    max-width: 900px;
  }

  .au-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .au-stat {
    border: 1px solid #30304d;
    border-radius: 12px;
    padding: 0.85rem;
    background: rgba(14, 14, 28, 0.78);
  }

  .au-stat .val {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    margin-bottom: 0.2rem;
    color: #ebe9ff;
  }

  .au-stat .lbl {
    font-size: 0.78rem;
    color: #b7b7d6;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .au-block h3 {
    font-size: 1rem;
    color: #ebe9ff;
    margin-bottom: 0.45rem;
  }

  .au-block p,
  .au-block li {
    color: #bdbddb;
    font-size: 0.87rem;
    line-height: 1.65;
  }

  .au-block ul {
    margin: 0.35rem 0 0.1rem 1.1rem;
    padding: 0;
    display: grid;
    gap: 0.25rem;
  }

  @media (max-width: 860px) {
    .au-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 560px) {
    .au-wrap { padding: 0.85rem; }
    .au-card { padding: 1rem; }
    .au-top { flex-direction: column; align-items: flex-start; }
  }
`;

export default function AboutUs() {
  return (
    <div className="au-wrap">
      <style>{styles}</style>

      <div className="au-shell">
        <section className="au-card au-top">
          <div className="au-brand">BidVault</div>
          <Link className="au-home" to="/">Back to Home</Link>
        </section>

        <section className="au-card">
          <h1 className="au-title">About Us</h1>
          <p className="au-sub">
            BidVault is a secure online auction platform built to help buyers and sellers connect with
            confidence. We focus on transparent bidding, verified listings, and trusted transactions.
          </p>
        </section>

        <section className="au-grid">
          <article className="au-stat">
            <div className="val">2.4M+</div>
            <div className="lbl">Active Users</div>
          </article>
          <article className="au-stat">
            <div className="val">150+</div>
            <div className="lbl">Countries Served</div>
          </article>
          <article className="au-stat">
            <div className="val">98.7%</div>
            <div className="lbl">User Satisfaction</div>
          </article>
        </section>

        <section className="au-card au-block">
          <h3>What we provide</h3>
          <ul>
            <li>Real-time bidding experience with clear auction visibility.</li>
            <li>Admin-reviewed listings for better marketplace quality.</li>
            <li>Escrow-oriented payment flow to improve transaction trust.</li>
            <li>Help Center support with ticket tracking and status updates.</li>
          </ul>
        </section>

        <section className="au-card au-block">
          <h3>Our mission</h3>
          <p>
            Our mission is to make online auctions reliable, transparent, and easy to use for everyone.
            We continue improving BidVault with better safety controls, smoother user experience, and
            performance-focused features.
          </p>
        </section>
      </div>
    </div>
  );
}
