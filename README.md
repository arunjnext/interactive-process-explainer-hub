# Process Observatory

A public gallery of truthful, interactive explanations for difficult technical processes. Every demo starts with an accessible mental model, reconnects it to exact implementation details, and finishes with an inspectable dry run.

[Open the live Process Observatory](https://interactive-process-explainer-hub.vercel.app)

## Technology

- React, TypeScript, and Vite
- Three.js through React Three Fiber and Drei
- shadcn `base-nova` primitives on Base UI, Tailwind CSS v4, and Lucide icons
- The complete SerpLens light/dark token system with Geist and Geist Mono
- Vitest, Testing Library, and Playwright
- Vercel production and GitHub Actions preview deployments

Three.js is used only when spatial relationships or animated state transitions materially improve the explanation. Prose, source maps, controls, tables, and fallbacks remain semantic DOM.

The SerpLens token copy lives in `src/styles/serplens-theme.css`. Shared controls are installed through shadcn into `src/components/ui`; layout and explainer-specific compositions remain in CSS modules and resolve colors, radii, shadows, typography, and motion through those shared tokens.

Add another shadcn primitive with:

```bash
pnpm dlx shadcn@latest add <component>
```

## Local development

```bash
pnpm install
pnpm dev
```

Run the complete local verification suite:

```bash
pnpm verify
pnpm exec playwright install chromium
pnpm test:e2e
```

## Add a demo

```bash
pnpm demo:new --slug event-reconciliation --title "How event reconciliation works"
```

The command creates a typed React module, CSS module, test scaffold, and registry entry. Replace the scaffold copy with source-backed teaching content, select the appropriate renderer, add public source URLs, and validate it:

```bash
pnpm validate:demo -- event-reconciliation
pnpm test
pnpm build
```

Required sections are:

1. ELI5 mental model
2. Technical source map
3. Normal and boundary-case dry run
4. Edge case and safety behavior

Simulations must be labeled as simulations. Local filesystem paths must never appear in published source metadata.

## Publishing boundary

Creating a demo saves it locally. Committing, pushing, opening a pull request, and deploying are separate actions and require explicit authorization. Once authorized, pushes to `main` deploy to production and pull requests from branches in this repository receive Vercel previews. Fork pull requests do not receive deployment credentials.

The deployment workflow uses encrypted repository secrets for the Vercel token, organization ID, and project ID. If the Vercel account later gains a native GitHub login connection, the workflow can be replaced by Vercel's native Git integration.

## License

[MIT](LICENSE)
