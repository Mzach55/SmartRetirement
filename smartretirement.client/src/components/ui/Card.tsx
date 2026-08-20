import type { HTMLAttributes } from 'react'
import { classNames } from '../../lib/classNames.ts'
import styles from '../../styles/ui.module.css'

type CardPadding = 'none' | 'compact' | 'comfortable'
type CardTone = 'default' | 'soft'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly padding?: CardPadding
  readonly tone?: CardTone
}

export function Card({
  className,
  padding = 'comfortable',
  tone = 'default',
  ...props
}: CardProps) {
  return (
    <div
      className={classNames(
        styles.card,
        styles[`padding-${padding}`],
        styles[`tone-${tone}`],
        className,
      )}
      {...props}
    />
  )
}
