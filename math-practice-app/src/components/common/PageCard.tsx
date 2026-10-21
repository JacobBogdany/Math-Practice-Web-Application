import type { ReactNode } from 'react';
import './PageCard.css';

export interface PageCardProps {
  title: string;
  message: ReactNode;
  actions?: ReactNode;
}

export function PageCard({ title, message, actions }: PageCardProps) {
  return (
    <section className="page-card" aria-labelledby="page-card-title">
      <h1 id="page-card-title" className="page-card__title">
        {title}
      </h1>
      <div className="page-card__message">{message}</div>
      {actions ? <div className="page-card__actions">{actions}</div> : null}
    </section>
  );
}
