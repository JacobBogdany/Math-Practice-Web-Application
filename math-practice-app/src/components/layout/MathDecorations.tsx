import './MathDecorations.css';

export function MathDecorations() {
  return (
    <div className="math-decorations" aria-hidden="true">
      <div className="math-decorations__shape math-decorations__shape--1" />
      <div className="math-decorations__shape math-decorations__shape--2" />
      <div className="math-decorations__shape math-decorations__shape--3" />
      <div className="math-decorations__shape math-decorations__shape--4" />
      <span className="math-decorations__symbol math-decorations__symbol--plus">
        +
      </span>
      <span className="math-decorations__symbol math-decorations__symbol--times">
        ×
      </span>
      <span className="math-decorations__symbol math-decorations__symbol--divide">
        ÷
      </span>
    </div>
  );
}
