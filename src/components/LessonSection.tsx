import type { ReactNode } from "react";

import styles from "./LessonSection.module.css";

interface LessonSectionProps {
  id: string;
  section: "eli5" | "technical" | "dry-run" | "edge-case" | "sources";
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function LessonSection({
  id,
  section,
  eyebrow,
  title,
  description,
  children,
}: LessonSectionProps) {
  return (
    <section id={id} data-section={section} className={styles.section}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2>{title}</h2>
        <p className={styles.description}>{description}</p>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
