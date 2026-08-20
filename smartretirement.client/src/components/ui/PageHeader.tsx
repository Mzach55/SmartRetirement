import type { ReactNode } from 'react'
import styles from '../../styles/ui.module.css'

interface PageHeaderProps {
  readonly action?: ReactNode
  readonly description?: string
  readonly eyebrow: string
  readonly title: string
}

export function PageHeader({
  action,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <p className={styles.pageEyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p className={styles.pageDescription}>{description}</p> : null}
      </div>
      {action ? <div className={styles.pageAction}>{action}</div> : null}
    </header>
  )
}
