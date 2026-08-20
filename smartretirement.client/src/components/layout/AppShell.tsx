import type { PropsWithChildren } from 'react'
import { Link, NavLink } from 'react-router'
import { classNames } from '../../lib/classNames.ts'
import {
  formatParticipantInitials,
  formatParticipantName,
} from '../../lib/formatters.ts'
import type { Participant } from '../../types/api.ts'
import { StatusBadge } from '../ui/index.ts'
import styles from './AppShell.module.css'

type AppShellProps = PropsWithChildren<{
  readonly participant: Participant
}>

const navigationItems = [
  { label: 'Dashboard', marker: '01', to: '.', end: true },
  { label: 'Plans', marker: '02', to: 'plans', end: false },
  { label: 'Profile', marker: '03', to: 'profile', end: false },
] as const

export function AppShell({ children, participant }: AppShellProps) {
  const participantName = formatParticipantName(participant)

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <aside className={styles.sidebar}>
        <Link className={styles.brand} to="/" aria-label="RetireWise home">
          <span className={styles.brandMark} aria-hidden="true">
            R
          </span>
          <span>
            <strong>RetireWise</strong>
            <small>Participant portal</small>
          </span>
        </Link>

        <div className={styles.environment}>
          <StatusBadge tone="info">Demo environment</StatusBadge>
          <p>Explore seeded participant data without a sign-in.</p>
        </div>

        <nav className={styles.navigation} aria-label="Participant navigation">
          <p className={styles.navigationLabel}>Workspace</p>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    classNames(styles.navLink, isActive && styles.navLinkActive)
                  }
                  end={item.end}
                  to={item.to}
                >
                  <span className={styles.navMarker} aria-hidden="true">
                    {item.marker}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarParticipant}>
            <span className={styles.sidebarAvatar} aria-hidden="true">
              {formatParticipantInitials(participant)}
            </span>
            <div>
              <p>Viewing participant</p>
              <strong>{participantName}</strong>
            </div>
          </div>
          <Link to="/">Switch participant</Link>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p>Welcome back</p>
            <strong>{participantName}</strong>
          </div>
          <Link className={styles.switchLink} to="/">
            Change participant
          </Link>
        </header>

        {children}
      </div>
    </div>
  )
}
