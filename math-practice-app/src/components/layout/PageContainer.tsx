import type { ReactNode } from 'react';
import { MathDecorations } from './MathDecorations';
import './PageContainer.css';

export interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <>
      <MathDecorations />
      <div className="page-container">{children}</div>
    </>
  );
}
