import { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { serplensScenePalettes } from "../../lib/serplens-scene-palette";
import {
  exampleChecks,
  exampleVerdict,
  type Scenario,
} from "./foundation-model";
import styles from "./PageSeoFoundation.module.css";

type Point = [number, number, number];
const names = ["Page", "Memory", "Interpret", "Assess"];
const phases = ["Main process", "Main · RAM", "Shared core", "Shared core"];
const sourceNames = ["HTTP", "HTML", "DOM", "robots.txt", "Access"];

function Label({
  position,
  children,
}: {
  position: Point;
  children: React.ReactNode;
}) {
  return (
    <Html center position={position} pointerEvents="none" zIndexRange={[10, 0]}>
      <div className={styles.nodeLabel}>{children}</div>
    </Html>
  );
}

function Packet({
  origin,
  target,
  label,
  reduced,
  color,
  visible,
}: {
  origin: Point;
  target: Point;
  label?: string;
  reduced: boolean;
  color: string;
  visible: boolean;
}) {
  const ref = useRef<Group>(null);
  const [initialPosition] = useState(origin);
  const destination = useMemo(() => new Vector3(...target), [target]);
  useFrame((_, delta) => {
    if (ref.current)
      ref.current.position.lerp(
        destination,
        reduced ? 1 : 1 - Math.exp(-delta * 5),
      );
  });
  if (!visible) return null;
  return (
    <group ref={ref} position={initialPosition}>
      <mesh rotation={[0.15, 0.25, 0]}>
        <boxGeometry args={[0.32, 0.4, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {label && (
        <Html
          center
          position={[0, 0.42, 0]}
          pointerEvents="none"
          zIndexRange={[9, 0]}
        >
          <span className={styles.packetLabel}>{label}</span>
        </Html>
      )}
    </group>
  );
}

export function FoundationScene({
  step,
  scenario,
}: {
  step: number;
  scenario: Scenario;
}) {
  const reduced = useReducedMotion();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  const palette = serplensScenePalettes[dark ? "dark" : "light"];
  const width = useThree((state) => state.viewport.width);
  const size = useThree((state) => state.size);
  const narrow = size.width < 620;
  const positions: Point[] = narrow
    ? [
        [-1.75, 1.35, 0],
        [1.75, 1.35, 0],
        [-1.75, -1.3, 0],
        [1.75, -1.3, 0],
      ]
    : [
        [-4.2, 0, 0],
        [-1.4, 0, 0],
        [1.4, 0, 0],
        [4.2, 0, 0],
      ];
  const externalOrigin: Point = [positions[1][0], positions[1][1] + 1.65, 0.7];
  const active = step === 0 ? 0 : step < 3 ? 1 : step < 5 ? 2 : 3;
  const checks = exampleChecks(scenario);
  const result = exampleVerdict(scenario);
  const scale = Math.min(1.6, width / (narrow ? 5.8 : 11.5));
  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[-3, 6, 5]} intensity={2.5} />
      <group scale={scale} position={[0, narrow ? 0.25 : 0, 0]}>
        {positions.slice(0, 3).map((point, index) => {
          const next = positions[index + 1];
          const dx = next[0] - point[0],
            dy = next[1] - point[1];
          const angle = Math.atan2(dy, dx);
          return (
            <group key={index}>
              <mesh
                position={[
                  (point[0] + next[0]) / 2,
                  (point[1] + next[1]) / 2,
                  -0.25,
                ]}
                rotation={[0, 0, angle]}
              >
                <boxGeometry args={[Math.hypot(dx, dy), 0.018, 0.018]} />
                <meshBasicMaterial color={palette.agentBorder} />
              </mesh>
              <mesh
                position={[point[0] + dx * 0.64, point[1] + dy * 0.64, -0.25]}
                rotation={[0, 0, angle - Math.PI / 2]}
              >
                <coneGeometry args={[0.08, 0.18, 4]} />
                <meshBasicMaterial color={palette.agentBorder} />
              </mesh>
            </group>
          );
        })}
        {positions.map((position, index) => (
          <group key={index} position={position}>
            <mesh rotation={[-0.2, 0.15, 0]}>
              <boxGeometry args={[1.65, 1.25, 0.22]} />
              <meshStandardMaterial
                color={
                  active === index ? palette.agentBorder : palette.agentSurface
                }
                roughness={0.4}
              />
            </mesh>
            {index === 0 && (
              <>
                <mesh position={[0, 0.1, 0.2]}>
                  <boxGeometry args={[1.2, 0.8, 0.05]} />
                  <meshStandardMaterial color={palette.agentSecondary} />
                </mesh>
                {[0, 1, 2].map((row) => (
                  <mesh key={row} position={[-0.1, 0.32 - row * 0.23, 0.25]}>
                    <boxGeometry args={[0.8, 0.035, 0.03]} />
                    <meshBasicMaterial color={palette.agentAccent} />
                  </mesh>
                ))}
              </>
            )}
            {index === 1 &&
              [0, 1, 2].map((layer) => (
                <mesh
                  key={layer}
                  position={[0, -0.2 + layer * 0.2, 0.25 + layer * 0.12]}
                  rotation={[0.1, 0, -0.08]}
                >
                  <boxGeometry args={[1.05, 0.15, 0.7]} />
                  <meshStandardMaterial
                    color={
                      layer === 2 ? palette.agentSecondary : palette.agentBorder
                    }
                    roughness={0.3}
                  />
                </mesh>
              ))}
            {index === 2 &&
              [0, 1, 2].map((item) => (
                <mesh
                  key={item}
                  position={[-0.42 + item * 0.42, 0, 0.25]}
                  rotation={[0, 0, step >= 4 ? 0.12 : 0]}
                >
                  <boxGeometry
                    args={[
                      0.24,
                      step >= 4 ? [0.7, 0.42, 0.26][item] : 0.55,
                      0.2,
                    ]}
                  />
                  <meshStandardMaterial
                    color={
                      step >= 4 ? palette.agentPrimary : palette.agentBorder
                    }
                  />
                </mesh>
              ))}
            {index === 3 &&
              checks.map((check, item) => (
                <mesh
                  key={check.id}
                  position={[
                    -0.45 + (item % 3) * 0.45,
                    0.36 - Math.floor(item / 3) * 0.36,
                    0.22,
                  ]}
                >
                  <boxGeometry
                    args={[
                      0.28,
                      0.24,
                      step >= 5 && check.status === "blocked" ? 0.4 : 0.1,
                    ]}
                  />
                  <meshStandardMaterial
                    color={
                      step >= 5 && check.status !== "pass"
                        ? palette.agentPrimary
                        : palette.agentSecondary
                    }
                  />
                </mesh>
              ))}
            <Label position={[0, -1, 0]}>
              <strong>{names[index]}</strong>
              <small>{phases[index]}</small>
            </Label>
            {active === index && [0, 5, 6].includes(step) && (
              <Label position={[0, narrow && index >= 2 ? 0.85 : 1.15, 0]}>
                {step === 0 ? (
                  "Listeners ready"
                ) : step === 5 ? (
                  narrow ? (
                    "9 checks"
                  ) : (
                    `${checks.filter((c) => c.status === "pass").length} pass · ${checks.filter((c) => c.status !== "pass").length} need attention`
                  )
                ) : (
                  <span
                    className={styles.verdict}
                    data-verdict={result.verdict}
                  >
                    {result.verdict === "no"
                      ? "No"
                      : result.verdict === "yes"
                        ? "Yes"
                        : "Unknown"}
                  </span>
                )}
              </Label>
            )}
          </group>
        ))}
        {step === 2 && !narrow && (
          <Label position={externalOrigin}>
            robots.txt + Access<small>Separate requests</small>
          </Label>
        )}
        {sourceNames.map((name, index) => {
          const station =
            step < 1 ? 0 : step < 3 ? 1 : step < 5 ? 2 : step === 6 ? 1 : 3;
          const base = positions[station];
          const observed = step >= 2 || index < 2;
          const missing =
            (scenario === "missing" && index === 0) ||
            (scenario === "mixed" && index === 4);
          const label =
            index === 0
              ? step <= 2
                ? scenario === "missing"
                  ? "HTTP ?"
                  : scenario === "clear"
                    ? "HTTP 200"
                    : "noindex"
                : step === 3
                  ? "PageSeoEvidence"
                  : step === 4
                    ? "Signals"
                    : step === 5
                      ? undefined
                      : "Assessment"
              : undefined;
          const offset =
            step <= 2
              ? narrow
                ? ((index % 3) - 1) * 0.36
                : (index - 2) * 0.4
              : (index - 2) * 0.13;
          return (
            <Packet
              key={name}
              origin={
                index >= 3
                  ? externalOrigin
                  : [positions[0][0], positions[0][1], 1]
              }
              target={[
                base[0] + offset,
                base[1] +
                  0.55 -
                  (narrow && step <= 2 ? Math.floor(index / 3) * 0.4 : 0),
                0.55 + (index % 2) * 0.1,
              ]}
              label={label}
              reduced={reduced}
              color={missing ? palette.agentBorder : palette.agentPrimary}
              visible={step > 0 && observed}
            />
          );
        })}
      </group>
    </>
  );
}
