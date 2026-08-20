import styles from './ui.module.css'

interface ProgressBarProps {
  readonly label: string
  readonly value: number
  readonly max: number
}

export function ProgressBar({ label, max, value }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1
  const safeValue = Math.min(Math.max(value, 0), safeMax)
  const percentage = (safeValue / safeMax) * 100

  return (
    <div className={styles.progressGroup}>
      <div className={styles.progressHeader}>
        <span>{label}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
      >
        <span
          className={styles.progressValue}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
