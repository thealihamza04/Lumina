'use client';

interface NoiseFilterProps {
  noiseAmount: number;
  enabled: boolean;
}

export function NoiseFilter({ noiseAmount, enabled }: NoiseFilterProps) {
  if (!enabled) return null;

  // Convert noiseAmount (0-100) to opacity (0-1)
  const opacity = noiseAmount / 100;
  // Higher frequency = finer grain
  const frequency = 0.5 + (noiseAmount / 200); // 0.5-0.75

  return (
    <svg width="0" height="0">
      <defs>
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves="8"
            result="noise"
            seed="2"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
          />
          <feBlend
            in="SourceGraphic"
            in2="noise"
            mode="overlay"
          />
        </filter>
      </defs>
    </svg>
  );
}
