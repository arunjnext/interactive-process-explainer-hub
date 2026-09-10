import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="eyebrow">404 · Outside the map</p>
      <h1>This route has no observable process.</h1>
      <p>The page may have moved, or it may not exist yet.</p>
      <Link className="button button--primary" to="/">
        Return to the observatory
      </Link>
    </section>
  );
}
