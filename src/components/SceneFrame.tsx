import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import { Component, Suspense, useMemo, type ErrorInfo } from "react";

import styles from "./SceneFrame.module.css";

interface SceneFrameProps {
  compact?: boolean;
  title: string;
  description: string;
  children: ReactNode;
  fallback: ReactNode;
}

interface SceneErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface SceneErrorBoundaryState {
  failed: boolean;
}

class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Three.js scene failed to render", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneFrame({
  compact = false,
  title,
  description,
  children,
  fallback,
}: SceneFrameProps) {
  const webGLAvailable = useMemo(() => canUseWebGL(), []);

  return (
    <figure className={styles.frame} data-compact={compact} aria-label={title}>
      {!compact && (
        <>
          <div className={styles.heading}>
            <div>
              <p className={styles.kicker}>Live process model</p>
              <h2>{title}</h2>
            </div>
            <span className={styles.liveBadge}>Simulation</span>
          </div>
          <p className={styles.description}>{description}</p>
        </>
      )}
      <div className={styles.viewport} data-testid="scene-viewport">
        {webGLAvailable ? (
          <SceneErrorBoundary fallback={fallback}>
            <Suspense
              fallback={
                <div className={styles.loading}>Preparing the scene…</div>
              }
            >
              <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [0, 2.2, 8.5], fov: 44 }}
                gl={{ antialias: true, alpha: true }}
              >
                {children}
              </Canvas>
            </Suspense>
          </SceneErrorBoundary>
        ) : (
          fallback
        )}
      </div>
      <figcaption>{description}</figcaption>
    </figure>
  );
}
