import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'sky' | 'sun' | 'coral' | 'grape';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = 'sky',
  icon,
  block = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...props}>
      {icon ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
