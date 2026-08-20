import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import styles from '../styles/AppErrorBoundary.module.css'

interface AppErrorBoundaryProps {
  readonly children: ReactNode
}

interface AppErrorBoundaryState {
  readonly hasError: boolean
}

/** Last-resort recovery for unexpected rendering errors, not API failures. */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RetireWise encountered an unexpected rendering error.', {
      error,
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className={styles.fallback} id="main-content">
          <div className={styles.card}>
            <span className={styles.mark} aria-hidden="true">
              R
            </span>
            <p className={styles.eyebrow}>Unexpected error</p>
            <h1>RetireWise needs a fresh start.</h1>
            <p>
              The portal encountered a problem it could not safely recover from.
              Reload the demo from participant selection.
            </p>
            <a className={styles.action} href="/">
              Restart the demo
            </a>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
