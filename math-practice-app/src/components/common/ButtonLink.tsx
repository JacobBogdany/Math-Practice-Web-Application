import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { ButtonVariant } from './Button';
import './Button.css';

export interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  block?: boolean;
  className?: string;
}

export function ButtonLink({
  variant = 'sky',
  icon,
  block = false,
  className = '',
  children,
  ...props
}: ButtonLinkProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link className={classes} {...props}>
      {icon ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </Link>
  );
}
