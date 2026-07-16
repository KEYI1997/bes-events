import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wa-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        name?: string;
        family?: string;
      }, HTMLElement>;
    }
  }
}
