import { useState } from "react";
import {
  ArrowRight,
  Database,
  FileText,
  Globe2,
  History,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { LessonSection } from "../../components/LessonSection";
import { Button, ButtonLink } from "../../components/ui/button";
import styles from "./PageChangeHistory.module.css";

type VisitId = "first" | "same" | "changed" | "stale";
type Step = { name: string; caption: string; code: string };
type Scenario = {
  label: string;
  before: string;
  after: string;
  stored: string;
  panel: string;
  result: string;
  steps: Step[];
};

const scenarios: Record<VisitId, Scenario> = {
  first: {
    label: "1 · First visit",
    before: "No prior state",
    after: "SEO Guide",
    stored: "Baseline snapshot",
    panel: "First capture",
    result: "Baseline saved",
    steps: [
      {
        name: "Page settles",
        caption: "The browser analyzes /guide after its content settles.",
        code: "SeoAnalyzer → scheduleHistoryCapture",
      },
      {
        name: "Capture is checked",
        caption:
          "The current tab, access, and viewport pass the capture checks.",
        code: "runCapture / entry.isCurrent",
      },
      {
        name: "Analysis becomes history state",
        caption: "The analysis becomes 26 compact tracked fields.",
        code: "projectPageAnalysisToHistory",
      },
      {
        name: "No earlier version",
        caption:
          "There is nothing older to compare with, so this is a baseline.",
        code: "ChangeIntelligenceStore.record",
      },
      {
        name: "Baseline is saved",
        caption:
          "A baseline and observation are saved; there is no change event yet.",
        code: "page_state_versions + page_observations",
      },
    ],
  },
  same: {
    label: "2 · Same page",
    before: "SEO Guide",
    after: "SEO Guide",
    stored: "No new version",
    panel: "No new row",
    result: "Unchanged visit skipped",
    steps: [
      {
        name: "Page settles again",
        caption: "The browser analyzes /guide again.",
        code: "SeoAnalyzer → scheduleHistoryCapture",
      },
      {
        name: "Capture is checked",
        caption: "It belongs to the same page and comparison profile.",
        code: "runCapture",
      },
      {
        name: "Same compact state",
        caption: "The new compact state matches the saved one.",
        code: "projectPageAnalysisToHistory",
      },
      {
        name: "Fast comparison",
        caption: "No semantic difference is found.",
        code: "preparePageCapture → compareHistoryEvidence",
      },
      {
        name: "Unchanged visit is skipped",
        caption: "No duplicate page observation or change event is written.",
        code: "ChangeIntelligenceStore.record",
      },
    ],
  },
  changed: {
    label: "3 · Title changed",
    before: "SEO Guide",
    after: "SEO Guide 2026",
    stored: "Delta + title event",
    panel: "Title changed",
    result: "Title event saved",
    steps: [
      {
        name: "Updated page settles",
        caption: "The rendered title is now “SEO Guide 2026”.",
        code: "SeoAnalyzer → scheduleHistoryCapture",
      },
      {
        name: "Capture is checked",
        caption: "The capture is still current and eligible.",
        code: "runCapture",
      },
      {
        name: "Updated state is projected",
        caption:
          "The title and derived fingerprint differ from the previous state.",
        code: "projectPageAnalysisToHistory",
      },
      {
        name: "Two comparisons",
        caption:
          "State diff makes storage operations; semantic comparison identifies a title change.",
        code: "diffStates + compareHistoryEvidence",
      },
      {
        name: "Delta and event are saved",
        caption:
          "A new state version and one visible title-change event are saved.",
        code: "page_state_operations + change_events",
      },
    ],
  },
  stale: {
    label: "Boundary · stale tab",
    before: "Old /guide tab",
    after: "Now /pricing",
    stored: "Nothing",
    panel: "No entry",
    result: "Stale capture rejected",
    steps: [
      {
        name: "Old analysis finishes",
        caption: "The tab moves on before its /guide history task runs.",
        code: "SeoAnalyzer → scheduleHistoryCapture",
      },
      {
        name: "Generation check fails",
        caption: "The old capture is rejected before projection or writing.",
        code: "runCapture / entry.isCurrent",
      },
    ],
  },
};

const visitIds: VisitId[] = ["first", "same", "changed", "stale"];

function FlowNode({
  icon: Icon,
  label,
  value,
  active,
  complete,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className={styles.node} data-active={active} data-complete={complete}>
      <div className={styles.nodeHead}>
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export default function PageChangeHistory({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [visit, setVisit] = useState<VisitId>("first");
  const [step, setStep] = useState(0);
  const scenario = scenarios[visit];
  const current = scenario.steps[step];
  const final = step === scenario.steps.length - 1;
  const projected = visit !== "stale" && step >= 2;
  const checked = visit !== "stale" && step >= 3;

  return (
    <div className={styles.stack} data-embedded={embedded}>
      <LessonSection
        id="dry-run"
        section="dry-run"
        eyebrow="03 · Try it"
        title="Watch a visit become history"
        description="A representative simulation—not the production crawler running live."
      >
        <div className={styles.toolbar}>
          <div
            className={styles.visits}
            role="group"
            aria-label="Visit scenario"
          >
            {visitIds.map((id) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={visit === id ? "default" : "outline"}
                aria-pressed={visit === id}
                onClick={() => {
                  setVisit(id);
                  setStep(0);
                }}
              >
                {scenarios[id].label}
              </Button>
            ))}
          </div>
          {!embedded && (
            <ButtonLink
              variant="outline"
              size="sm"
              href="/demos/page-change-history/embed"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open walkthrough in full view"
            >
              <Maximize2 aria-hidden="true" /> Full view
            </ButtonLink>
          )}
        </div>
        <div className={styles.stageTrack} aria-label="Process stages">
          {scenario.steps.map((stage, index) => (
            <button
              key={stage.name}
              type="button"
              className={styles.stageButton}
              aria-label={stage.name}
              aria-current={index === step ? "step" : undefined}
              data-active={index === step}
              data-complete={index < step}
              onClick={() => setStep(index)}
            >
              <span>{index + 1}</span>
              <span>{stage.name}</span>
            </button>
          ))}
        </div>
        <div
          className={styles.diagram}
          role="group"
          aria-label="Page analysis to Change History"
        >
          <FlowNode
            icon={Globe2}
            label="Browser page"
            value={visit === "stale" && step > 0 ? "/pricing" : "/guide"}
            active={step === 0}
            complete={step > 0}
          />
          <ArrowRight
            className={styles.arrow}
            data-on={step >= 1}
            aria-hidden="true"
          />
          <FlowNode
            icon={FileText}
            label="Compact state"
            value={
              projected
                ? "26 fields"
                : visit === "stale" && final
                  ? "Not projected"
                  : "Waiting"
            }
            active={step === 2}
            complete={projected && step > 2}
          />
          <ArrowRight
            className={styles.arrow}
            data-on={checked}
            aria-hidden="true"
          />
          <FlowNode
            icon={Database}
            label="Saved history"
            value={final ? scenario.stored : checked ? "Comparing" : "Waiting"}
            active={checked && !final}
            complete={final && visit !== "stale"}
          />
          <ArrowRight
            className={styles.arrow}
            data-on={final && visit !== "stale"}
            aria-hidden="true"
          />
          <FlowNode
            icon={History}
            label="Change panel"
            value={final ? scenario.panel : "Waiting"}
            active={final}
            complete={false}
          />
        </div>
        <div className={styles.comparison} aria-label="Before and after title">
          <div>
            <span>Before</span>
            <strong>{scenario.before}</strong>
          </div>
          <ArrowRight aria-hidden="true" />
          <div>
            <span>Now</span>
            <strong>{scenario.after}</strong>
          </div>
        </div>
        <div className={styles.current} aria-live="polite">
          <span>
            Step {step + 1} of {scenario.steps.length}
          </span>
          <h3>{current.name}</h3>
          <p>{current.caption}</p>
          {final && <strong>{scenario.result}</strong>}
        </div>
        <div className={styles.controls}>
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            Previous step
          </Button>
          <Button
            type="button"
            disabled={final}
            onClick={() => setStep((value) => value + 1)}
          >
            Next step
          </Button>
          <Button type="button" variant="ghost" onClick={() => setStep(0)}>
            <RotateCcw aria-hidden="true" /> Replay
          </Button>
        </div>
        <details className={styles.sourceDetails}>
          <summary>What code runs at this step?</summary>
          <code>{current.code}</code>
        </details>
      </LessonSection>
      {!embedded && (
        <>
          <LessonSection
            id="eli5"
            section="eli5"
            eyebrow="01 · Simple idea"
            title="A scrapbook for the page"
            description="First visit: save a snapshot. Same page: add nothing. Changed title: save what changed."
          >
            <div className={styles.miniFlow}>
              <span>Visit</span>
              <ArrowRight aria-hidden="true" />
              <span>Compact snapshot</span>
              <ArrowRight aria-hidden="true" />
              <span>Change History</span>
            </div>
          </LessonSection>
          <LessonSection
            id="technical"
            section="technical"
            eyebrow="02 · Code path"
            title="Four stops in the app"
            description="Browser analysis → capture queue → 26-field projection → history store."
          >
            <details className={styles.sourceDetails}>
              <summary>Show exact functions and storage behavior</summary>
              <ol>
                <li>
                  <code>seo-analyzer.ts</code> calls{" "}
                  <code>scheduleHistoryCapture</code> after DOM analysis.
                </li>
                <li>
                  <code>history-capture.ts</code> rejects stale or ineligible
                  work, then calls <code>projectPageAnalysisToHistory</code>.
                </li>
                <li>
                  The projector creates 26 top-level fields. Main-text evidence
                  can add a 27th state key in the store.
                </li>
                <li>
                  <code>ChangeIntelligenceStore.record</code> saves a baseline,
                  skips an unchanged revisit, or writes a delta and change
                  events.
                </li>
                <li>
                  State operations and user-visible events are distinct; an
                  optional main-text artifact is stored separately from its
                  state hash.
                </li>
              </ol>
            </details>
          </LessonSection>
        </>
      )}
      {!embedded && (
        <LessonSection
          id="edge-case"
          section="edge-case"
          eyebrow="04 · Safety"
          title="No change, no duplicate row"
          description="An unchanged revisit is skipped. An old tab generation is rejected before a stale capture can be stored."
        >
          <p className={styles.footnote}>
            The title example saves two state operations—the title and its
            derived fingerprint—but only one visible title-change event. This is
            a teaching example using representative data.
          </p>
        </LessonSection>
      )}
    </div>
  );
}
