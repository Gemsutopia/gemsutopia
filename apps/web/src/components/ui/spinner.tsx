'use client';

import { LineSpinner } from 'ldrs/react';
import 'ldrs/react/LineSpinner.css';

interface SpinnerProps {
  size?: string;
  stroke?: string;
  speed?: string;
  color?: string;
}

function Spinner({
  size = '40',
  stroke = '3',
  speed = '1',
  color = 'white',
}: SpinnerProps) {
  return (
    <LineSpinner
      size={size}
      stroke={stroke}
      speed={speed}
      color={color}
    />
  );
}

export { Spinner };
