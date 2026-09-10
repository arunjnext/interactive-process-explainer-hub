# Process Observatory

A public gallery of truthful, interactive explanations for difficult technical processes. Every demo starts with an accessible mental model, reconnects it to exact implementation details, and finishes with an inspectable dry run.

## Technology

- React, TypeScript, and Vite
- Three.js through React Three Fiber and Drei
- CSS modules and shared observatory design tokens
- Vitest, Testing Library, and Playwright
- Vercel production and GitHub preview deployments

Three.js is used only when spatial relationships or animated state transitions materially improve the explanation. Prose, source maps, controls, tables, and fallbacks remain semantic DOM.

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

Creating a demo saves it locally. Committing, pushing, opening a pull request, and deploying are separate actions and require explicit authorization. Once authorized, pushes to `main` deploy to production and pull requests receive Vercel previews.

## License

[MIT](LICENSE)
