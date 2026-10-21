import './AppTitle.css';

interface AppTitleProps {
  title?: string;
}

export function AppTitle({ title = 'Math Practice' }: AppTitleProps) {
  return (
    <div className="app-title">
      <span className="app-title__badge">Ages 7–12</span>
      <h1 className="app-title__heading">{title}</h1>
      <div className="app-title__symbols" aria-hidden="true">
        <span>+</span>
        <span>−</span>
        <span>×</span>
        <span>÷</span>
      </div>
    </div>
  );
}
