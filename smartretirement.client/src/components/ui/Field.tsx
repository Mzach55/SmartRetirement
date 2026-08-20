import type { PropsWithChildren } from 'react'
import styles from './ui.module.css'

type FieldProps = PropsWithChildren<{
  readonly error?: string
  readonly hint?: string
  readonly htmlFor: string
  readonly label: string
  readonly optional?: boolean
}>

export function Field({
  children,
  error,
  hint,
  htmlFor,
  label,
  optional = false,
}: FieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabelRow}>
        <label htmlFor={htmlFor}>{label}</label>
        {optional ? <span>Optional</span> : null}
      </div>
      {children}
      {error ? (
        <p className={styles.fieldError} id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className={styles.fieldHint} id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
