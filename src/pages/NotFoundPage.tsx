import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";

export function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="eyebrow">404 · Outside the map</p>
      <h1>This route has no observable process.</h1>
      <p>The page may have moved, or it may not exist yet.</p>
      <Button render={<Link to="/" />}>Return to the observatory</Button>
    </section>
  );
}
