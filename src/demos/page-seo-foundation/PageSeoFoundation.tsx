import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { SceneFrame } from "../../components/SceneFrame";
import { FoundationScene } from "./foundation-scene";
import {
  exampleChecks,
  exampleEvidence,
  exampleVerdict,
  scenarios,
  steps,
  type Scenario,
} from "./foundation-model";
import styles from "./PageSeoFoundation.module.css";

const captions = [
  "A new tab gets listeners, ready to capture its document.",
  "Original headers and server HTML enter the same document’s memory store.",
  "DOM comes from the page; robots.txt and access checks arrive through separate requests.",
  "One evidence packet goes to core. Raw HTML stays in capture memory.",
  "Declarations become meaning—with their sources still attached.",
  "Nine foundation checks inspect the evidence. No new requests here.",
  "The verdict returns to this tab’s memory—only if its document is still current.",
];

export default function PageSeoFoundation() {
  const [run, setRun] = useState<{ scenario: Scenario; step: number }>({
    scenario: "header",
    step: 0,
  });
  const [late, setLate] = useState(false);
  const step = steps[run.step];
  const result = exampleVerdict(run.scenario);
  const headline =
    run.step === 6
      ? `Verdict: ${result.verdict === "no" ? "No" : result.verdict === "yes" ? "Yes" : "Unknown"}`
      : step.title;
  const caption =
    run.step === 1 && run.scenario === "missing"
      ? "Server HTML is captured, but original HTTP evidence is unavailable."
      : run.step === 4
        ? run.scenario === "missing"
          ? "Headers are unknown—not proof that no directive exists."
          : run.scenario === "clear"
            ? "The observed declarations contain no blocking instruction."
            : "Header “noindex” means Googlebot must not index. Its source stays attached."
        : captions[run.step];
  return (
    <div className={styles.explainer}>
      <section id="eli5" data-section="eli5" className={styles.intro}>
        Like a case file: collect facts → understand → decide.
      </section>
      <section
        id="dry-run"
        data-section="dry-run"
        aria-label="Interactive foundation walkthrough"
        className={styles.player}
      >
        <div className={styles.toolbar}>
          <span className={styles.quiet}>3D simulation</span>
          <Select
            value={run.scenario}
            onValueChange={(value) =>
              setRun({ scenario: value as Scenario, step: 0 })
            }
          >
            <SelectTrigger aria-label="Test case">
              <SelectValue>
                {scenarios.find((item) => item.id === run.scenario)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SceneFrame
          compact
          title="Evidence moves through the foundation"
          description={`${step.phase}: ${caption}`}
          fallback={
            <div className={styles.fallback}>
              <div>Page → Memory → Interpret → Assess</div>
              <strong>{headline}</strong>
              <p>{caption}</p>
              <small>3D unavailable. The walkthrough still works.</small>
            </div>
          }
        >
          <FoundationScene step={run.step} scenario={run.scenario} />
        </SceneFrame>
        {run.step === 2 && (
          <div
            className={styles.sourceLegend}
            aria-label="Five evidence sources"
          >
            {["HTTP", "HTML", "DOM", "robots.txt", "Access"].map(
              (name, index) => (
                <span key={name}>
                  {name}
                  {(index === 0 && run.scenario === "missing") ||
                  (index === 4 && run.scenario === "mixed")
                    ? " ?"
                    : " ✓"}
                </span>
              ),
            )}
          </div>
        )}
        <div className={styles.caption} role="status" aria-live="polite">
          <span className={styles.quiet}>
            {run.step + 1} / 7 · {step.phase}
          </span>
          <h2>{headline}</h2>
          <p>{run.step === 6 ? result.primaryReason : caption}</p>
          {run.step === 6 && run.scenario === "mixed" && (
            <small>Crawler access remains unknown.</small>
          )}
        </div>
        <div className={styles.controls}>
          <Button
            variant="outline"
            disabled={run.step === 0}
            onClick={() =>
              setRun((value) => ({ ...value, step: value.step - 1 }))
            }
          >
            Back
          </Button>
          <div
            className={styles.progress}
            aria-label={`Step ${run.step + 1} of 7`}
          >
            {steps.map((item, index) => (
              <span key={item.title} data-active={index <= run.step} />
            ))}
          </div>
          <Button
            disabled={run.step === 6}
            onClick={() =>
              setRun((value) => ({ ...value, step: value.step + 1 }))
            }
          >
            Next step
          </Button>
          <Button
            variant="ghost"
            onClick={() => setRun((value) => ({ ...value, step: 0 }))}
          >
            Replay
          </Button>
        </div>
      </section>
      <details
        id="technical"
        data-section="technical"
        className={styles.details}
      >
        <summary>Under the hood</summary>
        <p className={styles.quiet}>
          Source-backed simulation, not the live engine. Inspected local tree:
          5c793bfcc + local changes, 10 Sep 2026.
        </p>
        <h3>{step.fn}</h3>
        <p className={styles.path}>{step.file}</p>
        <p>
          {step.before} → {step.after}
        </p>
        <p>{step.next}</p>
        <details>
          <summary>Evidence packet</summary>
          <pre>{JSON.stringify(exampleEvidence(run.scenario), null, 2)}</pre>
        </details>
        <details>
          <summary>The nine checks</summary>
          <div className={styles.checks}>
            {exampleChecks(run.scenario).map((check) => (
              <div key={check.id}>
                <strong>
                  {check.label} · {check.status}
                </strong>
                <p>{check.reason}</p>
              </div>
            ))}
          </div>
        </details>
        <p>
          Collector: Electron main. Contracts: audit-contracts. Interpret +
          assess: core. Capture and result stores are RAM, not disk. Foundation
          checks do not execute the legacy alert engine or change scores.
        </p>
      </details>
      <details
        id="edge-case"
        data-section="edge-case"
        className={styles.details}
      >
        <summary>Try a late page result</summary>
        <p>
          Tab navigated to document-2. The old result belongs to document-1.
        </p>
        <p aria-live="polite">
          {late
            ? "Rejected. Document-2 keeps waiting for its own assessment."
            : "The previous verdict was cleared. No verdict for document-2 yet."}
        </p>
        <Button variant="outline" disabled={late} onClick={() => setLate(true)}>
          Send old result
        </Button>{" "}
        <Button variant="ghost" onClick={() => setLate(false)}>
          Reset boundary
        </Button>
      </details>
    </div>
  );
}
