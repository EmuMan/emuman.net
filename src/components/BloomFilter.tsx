export default function BloomFilter() {
  return (
    <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
      {/* The SVG filter - hidden, just defines the effect */}
      <defs>
        <filter
          id="bloom"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          {/* Layer 1: tight glow */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b1" />
          <feBlend in="SourceGraphic" in2="b1" mode="screen" result="c1" />

          {/* Layer 2: medium glow */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b2" />
          <feBlend in="c1" in2="b2" mode="screen" result="c2" />

          {/* Layer 3: wide glow */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="b3" />
          <feBlend in="c2" in2="b3" mode="screen" result="c3" />

          {/* Layer 4: atmospheric haze */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="b4" />
          <feBlend in="c3" in2="b4" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
