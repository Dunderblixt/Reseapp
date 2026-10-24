import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <Link className="brand" href="/" aria-label="Nordresa home">
            <span className="brand-mark" aria-hidden="true">
              N
            </span>
            <span>Nordresa</span>
          </Link>
          <Link className="nav-link" href="#explore">
            Explore
          </Link>
        </nav>
      </header>
      <main className="page-content" id="explore">
        <p className="eyebrow">Welcome to</p>
        <h1>Nordresa</h1>
        <p>Your next journey starts here.</p>
      </main>
    </>
  );
}
