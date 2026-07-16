import type { CSSProperties } from 'react';

declare namespace JSX {
  interface IntrinsicElements {
    'wa-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      name?: string;
      family?: string;
      style?: CSSProperties;
    }, HTMLElement>;
  }
}
