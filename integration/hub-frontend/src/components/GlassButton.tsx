import React, { useCallback, useRef } from "react";

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

const GlassButton: React.FC<GlassButtonProps> = ({ label, children, className = "", onClick, ...rest }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      if (onClick) {
        onClick(e);
      }
      const target = buttonRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "glass-ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = "10px";
      ripple.style.height = "10px";
      target.appendChild(ripple);
      window.setTimeout(() => {
        ripple.remove();
      }, 600);
    },
    [onClick]
  );

  const handleMouseMove = useCallback<React.MouseEventHandler<HTMLButtonElement>>((e) => {
    const target = buttonRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    target.style.transform = `translateY(-2px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const handleMouseLeave = useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    const target = buttonRef.current;
    if (!target) return;
    target.style.transform = "";
  }, []);

  return (
    <button
      ref={buttonRef}
      className={`glass-button ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <div className="glow" />
      <div className="edge-light" />
      <span className="button-text">{children ?? label}</span>
    </button>
  );
};

export default GlassButton;


