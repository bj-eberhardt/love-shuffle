import React from 'react';

export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const arr = Array.from({ length: pieces });
  return (
    <div className="confetti" aria-hidden>
      {arr.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const dur = 1.8 + Math.random() * 1.6;
        const size = 8 + Math.random() * 12;
        const rot = Math.floor(Math.random() * 360);
        const colorClass = `confetti__piece--${i % 6}`;
        const style: React.CSSProperties = {
          left: `${left}%`,
          width: `${size}px`,
          height: `${Math.round(size * 1.4)}px`,
          transform: `translateY(-20vh) rotate(${rot}deg)`,
          animationDelay: `${delay}s`,
          animationDuration: `${dur}s`,
        };

        return <span key={i} className={`confetti__piece ${colorClass}`} style={style} />;
      })}
    </div>
  );
}
