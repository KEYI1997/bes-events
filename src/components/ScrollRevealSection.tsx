type ScrollRevealSectionProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Places a section one viewport above its normal flow position so the browser's
 * own continuous scroll naturally pushes it up from the bottom of the screen.
 * There is no scroll snap or wheel interception.
 */
export default function ScrollRevealSection({ children, className = '' }: ScrollRevealSectionProps) {
  return (
    <div className="scroll-reveal-shell">
      <section className={`scroll-reveal-panel ${className}`}>{children}</section>
    </div>
  );
}
