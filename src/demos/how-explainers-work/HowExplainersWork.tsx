import { Line, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Mesh } from "three";

import { LessonSection } from "../../components/LessonSection";
import { SceneFrame } from "../../components/SceneFrame";
import { Button } from "../../components/ui/button";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { serplensScenePalettes } from "../../lib/serplens-scene-palette";
import styles from "./HowExplainersWork.module.css";

interface Stage {
  short: string;
  title: string;
  input: string;
  change: string;
  output: string;
  kept: string;
}

const stages: readonly Stage[] = [
  {
    short: "Request",
    title: "Capture the real question",
    input: "A difficult process and the learner’s goal",
    change: "Define the outcome, audience, and boundaries",
    output: "A precise teaching target",
    kept: "User intent and unanswered questions",
  },
  {
    short: "Truth",
    title: "Inspect the implementation",
    input: "Source, tests, schemas, logs, or supplied material",
    change: "Trace entry points, transformations, limits, and consumers",
    output: "A verified causal chain",
    kept: "Facts separated from inference",
  },
  {
    short: "Model",
    title: "Choose one faithful analogy",
    input: "The verified causal chain",
    change: "Map each real constraint to one consistent physical object",
    output: "An ELI5 mental model",
    kept: "Causality, limits, and failure behavior",
  },
  {
    short: "Map",
    title: "Reconnect the analogy to code",
    input: "Friendly objects plus exact implementation facts",
    change: "Name real functions, files, boundaries, and state",
    output: "A technical source map",
    kept: "The distinction between conceptual and implemented behavior",
  },
  {
    short: "Run",
    title: "Execute a representative case",
    input: "Small realistic values and one boundary case",
    change: "Expose every meaningful state transition",
    output: "An inspectable dry run",
    kept: "What changes and what deliberately stays unchanged",
  },
  {
    short: "Verify",
    title: "Test truth and interaction",
    input: "The lesson, controls, responsive layouts, and fallbacks",
    change: "Compare claims with sources and exercise every path",
    output: "A validated demo",
    kept: "Accessibility, reset behavior, and source fidelity",
  },
  {
    short: "Store",
    title: "Save locally before publishing",
    input: "A validated demo module",
    change: "Register it in the local hub; publish only with authority",
    output: "A durable local explainer",
    kept: "Commit, push, and deploy remain separate decisions",
  },
];

const positions: readonly [number, number, number][] = [
  [-4.5, 0.15, 0],
  [-3, 1.05, -0.35],
  [-1.5, -0.45, 0.2],
  [0, 0.75, -0.15],
  [1.5, -0.35, 0.25],
  [3, 0.95, -0.25],
  [4.5, 0.05, 0],
];

function SignalPath({
  activeStep,
  replayNonce,
  reducedMotion,
  palette,
}: {
  activeStep: number;
  replayNonce: number;
  reducedMotion: boolean;
  palette: (typeof serplensScenePalettes)[keyof typeof serplensScenePalettes];
}) {
  const packet = useRef<Mesh>(null);
  const target = positions[activeStep];

  useEffect(() => {
    if (!packet.current) return;
    const origin = positions[Math.max(0, activeStep - 1)];
    packet.current.position.set(...(reducedMotion ? target : origin));
  }, [activeStep, replayNonce, reducedMotion, target]);

  useFrame((_state, delta) => {
    if (!packet.current || reducedMotion) return;
    const speed = 1 - Math.exp(-delta * 3.2);
    packet.current.position.x +=
      (target[0] - packet.current.position.x) * speed;
    packet.current.position.y +=
      (target[1] - packet.current.position.y) * speed;
    packet.current.position.z +=
      (target[2] - packet.current.position.z) * speed;
    packet.current.rotation.x += delta * 1.2;
    packet.current.rotation.y += delta * 1.6;
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <pointLight
        position={[0, 4, 4]}
        intensity={35}
        color={palette.agentPrimary}
      />
      <pointLight
        position={[3, -2, 2]}
        intensity={22}
        color={palette.agentSecondary}
      />
      <Line points={positions} color={palette.border} lineWidth={1.2} />
      {positions.map((position, index) => {
        const completed = index < activeStep;
        const active = index === activeStep;
        return (
          <mesh
            key={stages[index].short}
            position={position}
            scale={active ? 1.25 : 1}
          >
            <icosahedronGeometry args={[0.26, 1]} />
            <meshStandardMaterial
              color={
                active
                  ? palette.agentPrimary
                  : completed
                    ? palette.agentBorder
                    : palette.agentSurface
              }
              emissive={active ? palette.agentPrimary : palette.background}
              emissiveIntensity={active ? 1.1 : 0}
              roughness={0.35}
            />
          </mesh>
        );
      })}
      <mesh ref={packet}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color={palette.agentAccent}
          emissive={palette.agentAccent}
          emissiveIntensity={1.4}
        />
      </mesh>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

function SceneFallback({ activeStep }: { activeStep: number }) {
  return (
    <div className={styles.sceneFallback} role="status">
      <span>3D unavailable — semantic process view active</span>
      <ol>
        {stages.map((stage, index) => (
          <li
            key={stage.short}
            data-active={index === activeStep}
            data-complete={index < activeStep}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {stage.short}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HowExplainersWork() {
  const [activeStep, setActiveStep] = useState(0);
  const [replayNonce, setReplayNonce] = useState(0);
  const [caseMode, setCaseMode] = useState<"normal" | "boundary">("normal");
  const [complexity, setComplexity] = useState(4);
  const reducedMotion = useReducedMotion();
  const [sceneTheme, setSceneTheme] = useState<"dark" | "light">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const activeStage = stages[activeStep];

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setSceneTheme(root.classList.contains("dark") ? "dark" : "light");
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const trace = useMemo(() => {
    const sourceCount =
      caseMode === "normal" ? complexity + 2 : complexity * 18;
    const inspectedCount =
      caseMode === "normal" ? sourceCount : Math.min(sourceCount, 64);
    return [
      `CASE       ${caseMode.toUpperCase()}`,
      `STEP       ${activeStep + 1} / ${stages.length} · ${activeStage.short}`,
      `INPUT      ${activeStage.input}`,
      `CHANGE     ${activeStage.change}`,
      `OUTPUT     ${activeStage.output}`,
      `PRESERVED  ${activeStage.kept}`,
      `SOURCES    ${inspectedCount} inspected${sourceCount > inspectedCount ? ` · ${sourceCount - inspectedCount} deferred by the teaching cap` : ""}`,
    ].join("\n");
  }, [activeStage, activeStep, caseMode, complexity]);

  const goToStep = (nextStep: number) => {
    setActiveStep(Math.max(0, Math.min(stages.length - 1, nextStep)));
  };

  return (
    <div className={styles.lessonStack}>
      <SceneFrame
        title="From question to verified explainer"
        description="The moving signal is a simulation of the teaching workflow. Select a step below to inspect its exact state transition."
        fallback={<SceneFallback activeStep={activeStep} />}
      >
        <SignalPath
          activeStep={activeStep}
          replayNonce={replayNonce}
          reducedMotion={reducedMotion}
          palette={serplensScenePalettes[sceneTheme]}
        />
      </SceneFrame>

      <LessonSection
        id="eli5"
        section="eli5"
        eyebrow="01 · ELI5 mental model"
        title="Think of it as an observatory"
        description="A telescope does not invent a star to make the picture prettier. It gathers a real signal, calibrates the lens, and records what the evidence supports."
      >
        <div className={styles.analogyGrid}>
          <article>
            <span aria-hidden="true">⌁</span>
            <h3>Signal</h3>
            <p>
              The learner’s real question arrives with a destination: what they
              need to understand or decide.
            </p>
          </article>
          <article>
            <span aria-hidden="true">◎</span>
            <h3>Lens</h3>
            <p>
              Source inspection calibrates the explanation. The analogy can
              simplify the view, but it cannot bend causality.
            </p>
          </article>
          <article>
            <span aria-hidden="true">◫</span>
            <h3>Observation log</h3>
            <p>
              The dry run records every meaningful change so another person can
              inspect how the conclusion was reached.
            </p>
          </article>
        </div>
        <div
          className={styles.mappingTable}
          role="table"
          aria-label="Observatory analogy mapping"
        >
          <div role="row">
            <strong role="columnheader">Observatory object</strong>
            <strong role="columnheader">Real explainer work</strong>
          </div>
          <div role="row">
            <span role="cell">Incoming signal</span>
            <span role="cell">User request and intended outcome</span>
          </div>
          <div role="row">
            <span role="cell">Calibration data</span>
            <span role="cell">Source, tests, logs, and schemas</span>
          </div>
          <div role="row">
            <span role="cell">Lens</span>
            <span role="cell">One causally accurate analogy</span>
          </div>
          <div role="row">
            <span role="cell">Star chart</span>
            <span role="cell">Functions, files, state, and boundaries</span>
          </div>
          <div role="row">
            <span role="cell">Controlled observation</span>
            <span role="cell">Normal and boundary-case dry runs</span>
          </div>
        </div>
      </LessonSection>

      <LessonSection
        id="technical"
        section="technical"
        eyebrow="02 · Technical source map"
        title="The analogy reconnects to real code"
        description="This demo is a simulation of the skill workflow. The hub executes the registry, route, shared scene frame, and React interaction shown here."
      >
        <ol className={styles.pipeline}>
          {stages.map((stage, index) => (
            <li key={stage.short} data-active={index === activeStep}>
              <Button
                variant="ghost"
                type="button"
                onClick={() => goToStep(index)}
                aria-pressed={index === activeStep}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{stage.title}</strong>
                <small>{stage.output}</small>
              </Button>
            </li>
          ))}
        </ol>
        <div className={styles.codeMap}>
          <article>
            <span>ROUTE</span>
            <code>src/pages/DemoPage.tsx</code>
            <p>Resolves the slug and lazy-loads the registered demo.</p>
          </article>
          <article>
            <span>REGISTRY</span>
            <code>src/demos/registry.ts</code>
            <p>
              Owns public metadata, renderer choice, sources, and module
              loading.
            </p>
          </article>
          <article>
            <span>SCENE BOUNDARY</span>
            <code>src/components/SceneFrame.tsx</code>
            <p>
              Bounds pixel ratio and preserves a semantic fallback when WebGL
              fails.
            </p>
          </article>
        </div>
      </LessonSection>

      <LessonSection
        id="dry-run"
        section="dry-run"
        eyebrow="03 · Interactive dry run"
        title="Inspect one state transition at a time"
        description="Use the normal case first, then switch to the boundary case to see how the workflow remains bounded without hiding uncertainty."
      >
        <div className={styles.runner}>
          <div className={styles.controls}>
            <fieldset>
              <legend>Case</legend>
              <div className={styles.segmented}>
                <Button
                  variant="ghost"
                  type="button"
                  aria-pressed={caseMode === "normal"}
                  onClick={() => setCaseMode("normal")}
                >
                  Normal
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  aria-pressed={caseMode === "boundary"}
                  onClick={() => setCaseMode("boundary")}
                >
                  Boundary
                </Button>
              </div>
            </fieldset>
            <label className={styles.rangeLabel}>
              <span>
                Process complexity <output>{complexity}</output>
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={complexity}
                onChange={(event) => setComplexity(Number(event.target.value))}
              />
            </label>
            <div className={styles.buttonRow}>
              <Button
                variant="outline"
                type="button"
                onClick={() => goToStep(activeStep - 1)}
                disabled={activeStep === 0}
              >
                Previous
              </Button>
              <Button
                className={styles.primaryButton}
                type="button"
                onClick={() => goToStep(activeStep + 1)}
                disabled={activeStep === stages.length - 1}
              >
                Next step
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setReplayNonce((value) => value + 1)}
              >
                Replay
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setActiveStep(0);
                  setCaseMode("normal");
                  setComplexity(4);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div className={styles.tracePanel}>
            <div className={styles.traceHeader}>
              <div>
                <span>Active stage</span>
                <strong>{activeStage.title}</strong>
              </div>
              <span>
                {String(activeStep + 1).padStart(2, "0")} /{" "}
                {String(stages.length).padStart(2, "0")}
              </span>
            </div>
            <pre aria-live="polite">{trace}</pre>
          </div>
        </div>
      </LessonSection>

      <LessonSection
        id="edge-case"
        section="edge-case"
        eyebrow="04 · Boundary and safety"
        title="Saving is not publishing"
        description="The local hub is the durable observation log. Git commits, GitHub pushes, pull requests, and Vercel deployments remain distinct external actions."
      >
        <div className={styles.safetyGrid}>
          <article>
            <span className={styles.safetyNumber}>A</span>
            <h3>Large source set</h3>
            <p>
              Bound the material inspected in one view, expose what was
              deferred, and never imply that an uninspected source was verified.
            </p>
          </article>
          <article>
            <span className={styles.safetyNumber}>B</span>
            <h3>No WebGL</h3>
            <p>
              Replace the canvas with the same ordered semantic process. The
              teaching content and controls remain available.
            </p>
          </article>
          <article>
            <span className={styles.safetyNumber}>C</span>
            <h3>No publish authority</h3>
            <p>
              Save and validate locally, then stop. A public deployment only
              happens after the user explicitly requests it.
            </p>
          </article>
        </div>
      </LessonSection>

      <LessonSection
        id="sources"
        section="sources"
        eyebrow="05 · Sources"
        title="Inspect the implementation"
        description="These public references support the implemented portions of this explainer. The teaching workflow itself is labeled as a simulation."
      >
        <ul className={styles.sources}>
          <li>
            <a href="https://github.com/arunjnext/interactive-process-explainer-hub">
              Hub source repository <span>↗</span>
            </a>
          </li>
          <li>
            <a href="https://docs.pmnd.rs/react-three-fiber/getting-started/introduction">
              React Three Fiber documentation <span>↗</span>
            </a>
          </li>
          <li>
            <a href="https://vercel.com/docs/deployments/git">
              Vercel Git deployment documentation <span>↗</span>
            </a>
          </li>
        </ul>
      </LessonSection>
    </div>
  );
}
