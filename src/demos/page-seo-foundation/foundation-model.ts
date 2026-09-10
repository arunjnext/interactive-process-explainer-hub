/** Source-backed teaching simulation. Does not import or run the production engine. */
export type Scenario = "header" | "clear" | "missing" | "mixed";
export type CheckStatus = "pass" | "blocked" | "unknown";
export type SourceKey =
  "http" | "servedHtml" | "renderedDom" | "robotsTxt" | "firewall";
export const scenarios: { id: Scenario; label: string }[] = [
  { id: "header", label: "Header says noindex" },
  { id: "clear", label: "All required checks clear" },
  { id: "missing", label: "HTTP evidence unavailable" },
  { id: "mixed", label: "Noindex + unavailable access" },
];
export const sourceInfo = [
  {
    key: "http",
    name: "HTTP headers",
    from: "Electron webRequest",
    fn: "observeSeoOriginResponse",
    store: "Original response in document-capture RAM",
    detail:
      "Copied before application CSP rewriting. Repeated values stay as arrays. These are not headers from a second request.",
  },
  {
    key: "servedHtml",
    name: "Served HTML",
    from: "Chromium debugger (CDP)",
    fn: "Network.getResponseBody",
    store: "Raw body in document-capture RAM",
    detail:
      "The loaded main document’s body, correlated by request / loader / document identity. The debugger broker shares attachment; it is not a breakpoint or a refetch.",
  },
  {
    key: "renderedDom",
    name: "Rendered DOM",
    from: "The loaded page",
    fn: "captureRenderedDom",
    store: "outerHTML is transient; extracted declarations enter evidence",
    detail:
      "Reads document.documentElement.outerHTML during analysis. Identity is checked around the read so a different navigation cannot silently replace the page.",
  },
  {
    key: "robotsTxt",
    name: "robots.txt",
    from: "Separate robots.txt request",
    fn: "observeRobotsTxt",
    store: "Origin-scoped RAM cache, then an observation",
    detail:
      "Keeps status, URL, body, time and failure context. Observed 404 is different from a failed or unattempted fetch. The assessor requires fresh evidence.",
  },
  {
    key: "firewall",
    name: "Crawler access",
    from: "User-agent access probes",
    fn: "observeCrawlerAccess",
    store: "URL/context-scoped RAM cache, then probe observations",
    detail:
      "Reuses runFirewallChecksCached. Disabled, failed, stale or wrong-target checks do not count as success. A probe is not proof of what verified Googlebot receives.",
  },
] satisfies {
  key: SourceKey;
  name: string;
  from: string;
  fn: string;
  store: string;
  detail: string;
}[];

export const steps = [
  {
    phase: "Collect",
    title: "Prepare the tab",
    action: "Attach the capture listeners. No SEO decision yet.",
    fn: "attachSeoDocumentCapture",
    file: "apps/desktop-app/electron/main/seo/page-seo/collectors/document-capture.ts",
    before: "A new tab has no captured document.",
    after: "Capture handlers are ready for navigation and network events.",
    next: "When the main document responds, the handlers can correlate its evidence.",
  },
  {
    phase: "Collect",
    title: "Keep what the server sent",
    action: "Two collection paths, one document identity.",
    fn: "observeSeoOriginResponse + Network.getResponseBody",
    file: "apps/desktop-app/electron/main/seo/page-seo/collectors/document-capture.ts",
    before: "The main document response is arriving.",
    after: "Original headers and served HTML are held in the capture store.",
    next: "The normal analysis workflow will collect the remaining sources.",
  },
  {
    phase: "Collect",
    title: "Collect the remaining evidence",
    action: "Read the DOM, robots.txt and access results in parallel.",
    fn: "collectPageSeoEvidence",
    file: "apps/desktop-app/electron/main/seo/page-seo/collect-page-seo-evidence.ts",
    before: "getSeoDocumentSnapshot provides the captured response and body.",
    after: "Promise.all collects renderedDom, robotsTxt and firewall.",
    next: "Turn the five sources into one serializable evidence packet.",
  },
  {
    phase: "Collect",
    title: "Hand one evidence packet to core",
    action: "Keep facts separate from meaning.",
    fn: "runPageSeoAnalysis → assessPageSeo",
    file: "apps/desktop-app/electron/main/seo/page-seo/page-seo-analysis-runner.ts",
    before: "Collector output: PageSeoEvidence.",
    after: "Core validates the schema, URL and capture/document identity.",
    next: "Only correlated evidence is interpreted. Wrong-document sources become unavailable.",
  },
  {
    phase: "Interpret",
    title: "Understand the declarations",
    action:
      "Read all sources together without losing where each fact came from.",
    fn: "interpretSeoEvidence",
    file: "packages/core/src/seo/interpret-seo-evidence.ts",
    before: "Observed declarations and explicit unavailable sources.",
    after: "InterpretedSeoSignals: robots, canonical and hreflang.",
    next: "Pass evidence AND interpreted signals to assessIndexability.",
  },
  {
    phase: "Assess",
    title: "Run the indexability checks",
    action: "These are foundation checks—not the legacy alert rules.",
    fn: "assessIndexability",
    file: "packages/core/src/seo/assess-indexability.ts",
    before: "Evidence + signals + crawler: googlebot.",
    after:
      "Nine checks return pass, blocked or unknown with evidence references.",
    next: "Any blocker gives No. Otherwise, an unknown check gives Unknown. Otherwise, Yes.",
  },
  {
    phase: "Assess",
    title: "Return and store the verdict",
    action: "Save the result only if this is still the current capture.",
    fn: "assessPageSeo → storePageSeoAssessment",
    file: "apps/desktop-app/electron/main/seo/page-seo/page-seo-assessment-store.ts",
    before: "PageSeoAssessment = evidence + signals + indexability.",
    after:
      "Latest assessment stored in the per-tab analyses Map in main-process RAM.",
    next: "Foundation complete. UI and legacy alert rules are outside this walkthrough.",
  },
] as const;

export function exampleEvidence(scenario: Scenario) {
  const context = {
    captureId: "capture-1",
    documentId: "document-1",
    observedAt: "2026-09-10T10:00:00.000Z",
  };
  const url = "https://example.com/articles/page";
  const observed = <T>(value: T) => ({
    state: "observed" as const,
    ...context,
    value,
  });
  const markup = () =>
    observed({ url, baseUrl: url, robots: [], canonicals: [], hreflang: [] });
  return {
    schemaVersion: 1,
    captureId: context.captureId,
    documentId: context.documentId,
    url,
    kind: "browser",
    capturedAt: context.observedAt,
    servedHtml: markup(),
    renderedDom: markup(),
    http:
      scenario === "missing"
        ? {
            state: "unavailable" as const,
            code: "failed",
            reason: "Original HTTP response could not be collected.",
            attempt: {
              captureId: context.captureId,
              documentId: context.documentId,
              attemptedAt: context.observedAt,
              request: { url, method: "GET" },
            },
          }
        : observed({
            url,
            statusCode: 200,
            headers:
              scenario === "clear" ? {} : { "x-robots-tag": ["noindex"] },
            redirects: [],
          }),
    robotsTxt: observed({
      url: "https://example.com/robots.txt",
      finalUrl: "https://example.com/robots.txt",
      statusCode: 200,
      body: "User-agent: *\nAllow: /",
    }),
    firewall:
      scenario === "mixed"
        ? {
            state: "unavailable" as const,
            code: "entitlement-disabled",
            reason:
              "Crawler access checks are unavailable for this analysis capability.",
          }
        : observed({
            results: [
              {
                crawler: "googlebot",
                url,
                finalUrl: url,
                testedAt: context.observedAt,
                userAgent: "Googlebot",
                blocked: false,
                statusCode: 200,
                scope: "page",
              },
            ],
          }),
  };
}

export function exampleChecks(scenario: Scenario) {
  const noindex = scenario === "header" || scenario === "mixed";
  const unavailable = scenario === "missing";
  return [
    {
      id: "http-status",
      label: "HTTP status",
      status: unavailable ? "unknown" : "pass",
      reason: unavailable
        ? "HTTP response was not observed."
        : "Observed HTTP 200.",
      source: "http-origin",
    },
    {
      id: "redirects",
      label: "Redirects",
      status: unavailable ? "unknown" : "pass",
      reason: unavailable
        ? "Redirect chain was not observed."
        : "Final response, not an unresolved redirect.",
      source: "http-origin",
    },
    {
      id: "served-html",
      label: "Served HTML",
      status: "pass",
      reason: "Served markup observed for this document.",
      source: "served-html",
    },
    {
      id: "rendered-dom",
      label: "Rendered DOM",
      status: "pass",
      reason: "Rendered markup observed for this document.",
      source: "rendered-dom",
    },
    {
      id: "origin-headers",
      label: "Origin headers",
      status: unavailable ? "unknown" : "pass",
      reason: unavailable
        ? "Original headers are unavailable, not observed-empty."
        : "Original response headers observed.",
      source: "http-origin",
    },
    {
      id: "robots-directives",
      label: "Robots directives",
      status: noindex ? "blocked" : unavailable ? "unknown" : "pass",
      reason: noindex
        ? "An applicable noindex or none directive restricts googlebot."
        : unavailable
          ? "Some directive sources are unavailable."
          : "No applicable noindex directive was observed for googlebot.",
      source: noindex
        ? "http-origin → x-robots-tag[0]"
        : "served-html + rendered-dom",
    },
    {
      id: "canonical",
      label: "Canonical",
      status: "pass",
      reason:
        "No canonical was declared; absence alone does not block indexing.",
      source: "served-html + rendered-dom",
    },
    {
      id: "robots-txt",
      label: "robots.txt",
      status: "pass",
      reason: "Fresh robots.txt permits googlebot to crawl this page.",
      source: "robots-txt",
    },
    {
      id: "firewall-access",
      label: "Crawler access",
      status: scenario === "mixed" ? "unknown" : "pass",
      reason:
        scenario === "mixed"
          ? "Crawler access checks are unavailable for this analysis capability."
          : "A fresh, matching page access probe succeeded for googlebot.",
      source: "firewall",
    },
  ] satisfies {
    id: string;
    label: string;
    status: CheckStatus;
    reason: string;
    source: string;
  }[];
}
export function exampleVerdict(scenario: Scenario) {
  const checks = exampleChecks(scenario);
  const blocker = checks.find((check) => check.status === "blocked");
  const unknown = checks.find((check) => check.status === "unknown");
  return {
    verdict: blocker ? "no" : unknown ? "unknown" : "yes",
    crawler: "googlebot",
    primaryReason:
      blocker?.reason ??
      unknown?.reason ??
      "This page is technically eligible for indexing by googlebot under the observed checks.",
    checks,
  };
}
