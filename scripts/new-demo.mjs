#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function readArgument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function fail(message) {
  console.error(`demo:new: ${message}`);
  process.exit(1);
}

const slug = readArgument("slug");
const title = readArgument("title");

if (!slug || !title) {
  fail("usage: pnpm demo:new --slug <kebab-case-slug> --title <title>");
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  fail("slug must contain lowercase letters, numbers, and single hyphens");
}

const componentName = slug
  .split("-")
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join("");
const root = process.cwd();
const demoDirectory = path.join(root, "src", "demos", slug);
const componentPath = path.join(demoDirectory, `${componentName}.tsx`);
const registryPath = path.join(root, "src", "demos", "registry.ts");
const registry = await readFile(registryPath, "utf8");
const marker = "  // demo:new definitions";

if (!registry.includes(marker)) {
  fail(`registry marker is missing from ${registryPath}`);
}

if (
  registry.includes(`slug: '${slug}'`) ||
  registry.includes(`slug: "${slug}"`)
) {
  fail(`a demo with slug "${slug}" is already registered`);
}

try {
  await mkdir(demoDirectory);
} catch (error) {
  if (error && error.code === "EEXIST") {
    fail(`refusing to overwrite existing directory ${demoDirectory}`);
  }
  throw error;
}

const component = `import { useState } from 'react'

import { LessonSection } from '../../components/LessonSection'
import styles from './${componentName}.module.css'

export default function ${componentName}() {
  const [step, setStep] = useState(0)

  return (
    <div className={styles.stack}>
      <LessonSection id="eli5" section="eli5" eyebrow="01 · ELI5 mental model" title=${JSON.stringify(title)} description="Replace this text with one causally accurate analogy.">
        <p>Map the analogy to the real process without inventing behavior.</p>
      </LessonSection>
      <LessonSection id="technical" section="technical" eyebrow="02 · Technical source map" title="Connect the model to code" description="Name the real entry point, transformations, boundaries, and final consumer.">
        <p>Inspect source before replacing this scaffold text.</p>
      </LessonSection>
      <LessonSection id="dry-run" section="dry-run" eyebrow="03 · Interactive dry run" title="Run representative data" description="Expose each meaningful state transition.">
        <p>This teaching control is a simulation; replace it with representative, source-backed state.</p>
        <div className={styles.controls}>
          <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))}>Previous</button>
          <button type="button" onClick={() => setStep((value) => value + 1)}>Next</button>
          <button type="button" onClick={() => setStep(0)}>Reset</button>
        </div>
        <p aria-live="polite">Active teaching step: {step}</p>
      </LessonSection>
      <LessonSection id="edge-case" section="edge-case" eyebrow="04 · Boundary and safety" title="Show the failure boundary" description="Explain the trigger, incorrect outcome, invariant, and safe recovery.">
        <p>Include one normal case and one boundary or failure case.</p>
      </LessonSection>
    </div>
  )
}
`;

const css = `.stack {
  display: grid;
  min-width: 0;
  padding-bottom: 5rem;
  gap: 1rem;
}

.controls {
  display: flex;
  min-width: 0;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
`;

const test = `import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ${componentName} from './${componentName}'

describe('${componentName}', () => {
  it('renders the required teaching layers', () => {
    const { container } = render(<${componentName} />)
    expect(screen.getByRole('heading', { name: ${JSON.stringify(title)} })).toBeInTheDocument()
    expect(container.querySelector('[data-section="eli5"]')).toBeInTheDocument()
    expect(container.querySelector('[data-section="technical"]')).toBeInTheDocument()
    expect(container.querySelector('[data-section="dry-run"]')).toBeInTheDocument()
    expect(container.querySelector('[data-section="edge-case"]')).toBeInTheDocument()
  })
})
`;

const definition = `  {
    slug: '${slug}',
    title: ${JSON.stringify(title)},
    summary: 'Replace with a concise, outcome-first explanation.',
    tags: ['replace-me'],
    renderer: 'dom',
    updatedAt: '${new Date().toISOString().slice(0, 10)}',
    sources: [],
    load: () => import('./${slug}/${componentName}'),
  },
`;

await Promise.all([
  writeFile(componentPath, component),
  writeFile(path.join(demoDirectory, `${componentName}.module.css`), css),
  writeFile(path.join(demoDirectory, `${componentName}.test.tsx`), test),
]);
await writeFile(
  registryPath,
  registry.replace(marker, `${definition}${marker}`),
);

console.log(`Created ${slug}`);
console.log(`- ${path.relative(root, componentPath)}`);
console.log("- update summary, tags, renderer, sources, and lesson content");
console.log(`- validate with: pnpm validate:demo -- ${slug}`);
