import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router'
import type { LinkProps } from 'react-router'
import { classNames } from '../../lib/classNames.ts'
import styles from './ui.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'quiet'
type ButtonSize = 'small' | 'medium'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
}

interface ActionLinkProps extends LinkProps {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
}

export function Button({
  className,
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        className,
      )}
      type={type}
      {...props}
    />
  )
}

export function ActionLink({
  className,
  size = 'medium',
  variant = 'primary',
  ...props
}: ActionLinkProps) {
  return (
    <Link
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        typeof className === 'string' ? className : undefined,
      )}
      {...props}
    />
  )
}
