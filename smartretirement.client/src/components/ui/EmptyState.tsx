import type { ReactNode } from 'react'
import styles from './ui.module.css'

interface EmptyStateProps {
  readonly action?: ReactNode
  readonly description: string
  readonly eyebrow?: string
  readonly title: string
}

export function EmptyState({
  action,
  description,
  eyebrow = 'Ready for data',
  title,
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyMark} aria-hidden="true">
        RW
      </span>
      <p className={styles.emptyEyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  )
}
