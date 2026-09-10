#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const requestedSlug = process.argv
  .slice(2)
  .find((argument) => !argument.startsWith("-"));
const root = process.cwd();
const registryPath = path.join(root, "src", "demos", "registry.ts");
const registry = await readFile(registryPath, "utf8");
const registeredSlugs = [
  ...registry.matchAll(/slug: ["']([a-z0-9-]+)["']/g),
].map((match) => match[1]);
const slugs = requestedSlug ? [requestedSlug] : registeredSlugs;
const failures = [];

if (new Set(registeredSlugs).size !== registeredSlugs.length) {
  failures.push("registry contains duplicate slugs");
}

for (const slug of slugs) {
  if (!registeredSlugs.includes(slug)) {
    failures.push(`${slug}: not found in the registry`);
    continue;
  }

  const componentName = slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  const componentPath = path.join(
    root,
    "src",
    "demos",
    slug,
    `${componentName}.tsx`,
  );

  try {
    await access(componentPath);
  } catch {
    failures.push(`${slug}: missing ${path.relative(root, componentPath)}`);
    continue;
  }

  const source = await readFile(componentPath, "utf8");
  for (const section of ["eli5", "technical", "dry-run", "edge-case"]) {
    if (
      !source.includes(`section="${section}"`) &&
      !source.includes(`data-section="${section}"`)
    ) {
      failures.push(`${slug}: missing ${section} teaching section`);
    }
  }
  if ((source.match(/<button/g) ?? []).length < 2) {
    failures.push(`${slug}: needs at least two interactive controls`);
  }
  if (!source.includes("aria-live")) {
    failures.push(`${slug}: missing an aria-live status region`);
  }
  if (!/simulation/i.test(source)) {
    failures.push(`${slug}: simulations must be labeled explicitly`);
  }
}

if (/url: ['"](?:file:|\/home\/|[A-Za-z]:\\)/.test(registry)) {
  failures.push("registry contains a local filesystem source URL");
}

if (failures.length > 0) {
  console.error("Demo validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Validated ${slugs.length} demo${slugs.length === 1 ? "" : "s"}: ${slugs.join(", ")}`,
);
