import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { DemoPage } from "./pages/DemoPage";
import { EmbedDemoPage } from "./pages/EmbedDemoPage";
import { GalleryPage } from "./pages/GalleryPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export function App() {
  const { pathname } = useLocation();

  if (/^\/demos\/[^/]+\/embed\/?$/.test(pathname)) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/demos/:slug/embed" element={<EmbedDemoPage />} />
        </Routes>
      </>
    );
  }

  return (
    <AppShell>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/demos/:slug" element={<DemoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
