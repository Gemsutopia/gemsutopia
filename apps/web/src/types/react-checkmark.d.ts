declare module 'react-checkmark' {
  import React from 'react';

  interface CheckmarkProps {
    size?: number | string;
    color?: string;
  }

  export const Checkmark: React.FC<CheckmarkProps>;
}
