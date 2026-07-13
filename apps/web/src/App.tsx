import { productCards } from "@formforge/core";

export function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <a className="brand" href="/" aria-label="FormForge home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FormForge</span>
        </a>
        <nav aria-label="Primary navigation">
          <a aria-current="page" href="#forms">Forms</a>
          <a href="#responses">Responses</a>
          <a href="#analytics">Analytics</a>
        </nav>
        <button className="avatar" type="button" aria-label="Open account menu">AE</button>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Workspace / Acme Research</p>
            <h1 id="page-title">Build forms people enjoy answering.</h1>
            <p className="hero-copy">Create a typed, accessible experience. Publish with confidence and learn from every response.</p>
          </div>
          <button className="primary-action" type="button">Create a form <span aria-hidden="true">→</span></button>
        </section>

        <section id="forms" className="section" aria-labelledby="workspace-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your workspace</p>
              <h2 id="workspace-heading">Everything in one deliberate flow</h2>
            </div>
            <span className="status"><span aria-hidden="true" /> All systems ready</span>
          </div>

          <div className="card-grid">
            {productCards.map((card, index) => (
              <article className="product-card" key={card.area} id={card.area}>
                <div className="card-number" aria-hidden="true">0{index + 1}</div>
                <div>
                  <p className="card-status">{card.status}</p>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <a href={`#${card.area}`} aria-label={`Open ${card.title}`}>Explore <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="boundary-grid" aria-label="Workspace status">
          <article>
            <p className="eyebrow">Next lesson</p>
            <h2>Typed schema renderer</h2>
            <p>Model field variants so the compiler keeps every renderer honest.</p>
          </article>
          <article className="dark-card">
            <p className="eyebrow">Learning signal</p>
            <strong>Strict by default</strong>
            <p>Compiler, tests, and build share one repeatable gate.</p>
          </article>
        </section>
      </main>

      <footer>
        <span>FormForge</span>
        <span>Made to teach product engineering.</span>
      </footer>
    </div>
  );
}
