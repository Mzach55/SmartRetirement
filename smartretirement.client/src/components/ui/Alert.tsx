import type { PropsWithChildren } from 'react'
import { classNames } from '../../lib/classNames.ts'
import styles from './ui.module.css'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

type AlertProps = PropsWithChildren<{
  readonly title: string
  readonly tone?: AlertTone
}>

export function Alert({ children, title, tone = 'info' }: AlertProps) {
  return (
    <div
      className={classNames(styles.alert, styles[`alert-${tone}`])}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <span className={styles.alertMarker} aria-hidden="true" />
      <div>
        <p className={styles.alertTitle}>{title}</p>
        <div className={styles.alertBody}>{children}</div>
      </div>
    </div>
  )
}
