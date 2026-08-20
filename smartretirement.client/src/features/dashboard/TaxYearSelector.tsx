import styles from './Dashboard.module.css'

interface TaxYearSelectorProps {
  readonly disabled?: boolean
  readonly onChange: (taxYear: number) => void
  readonly selectedYear: number
  readonly years: readonly number[]
}

export function TaxYearSelector({
  disabled = false,
  onChange,
  selectedYear,
  years,
}: TaxYearSelectorProps) {
  return (
    <label className={styles.yearSelector}>
      <span>Contribution year</span>
      <select
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        value={selectedYear}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  )
}
