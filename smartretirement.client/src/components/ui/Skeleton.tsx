import type { CSSProperties } from 'react'
import { classNames } from '../../lib/classNames.ts'
import styles from '../../styles/ui.module.css'

interface SkeletonProps {
  readonly className?: string
  readonly height?: string
  readonly width?: string
}

export function Skeleton({
  className,
  height = '1rem',
  width = '100%',
}: SkeletonProps) {
  const style: CSSProperties = { height, width }

  return (
    <span
      className={classNames(styles.skeleton, className)}
      style={style}
      aria-hidden="true"
    />
  )
}
