import type { HTMLAttributes } from 'react'
import { classNames } from '../../lib/classNames.ts'
import styles from './ui.module.css'

type StatusTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'info'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: StatusTone
}

export function StatusBadge({
  className,
  tone = 'neutral',
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={classNames(styles.badge, styles[`badge-${tone}`], className)}
      {...props}
    />
  )
}
