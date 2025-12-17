import React from "react"
import Svg, { Circle, G } from "react-native-svg"
import { Colors } from "../theme"

export default function ProgressRing({
  progress, // 0 to 1 (Legacy support)
  segments = [], // Array of { color, completed } (New segmented mode)
  size = 36,
  strokeWidth = 3,
  color = Colors.primary, // Fallback color
}) {
  const r = (size - strokeWidth) / 2
  const circum = 2 * Math.PI * r

  // -- Segmented Mode --
  if (segments.length > 0) {
    const total = segments.length
    const gap = total > 1 ? 0.1 : 0 // Small gap between segments in radians (relative to circum? No, let's use Dasharray)

    // Actually, dashed circles are easier.
    // Each segment covers 1/total of the circle.
    // We can just render ONE circle with strokeDasharray to create gaps?
    // No, we need different colors. So we render 'total' circles, each rotated.
    // Or 'total' Arcs. Arcs are cleaner but require PATH.
    // Let's stick to rotated Circles with strokeDasharray for simplicity and smooth caps.

    // Arc length for one segment
    const arcLength = circum / total
    // Visual gap size (pixels)
    const gapSize = total > 1 ? (size < 40 ? 2 : 4) : 0
    const dashLength = Math.max(0, arcLength - gapSize)

    return (
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const rotation = -90 + (360 / total) * i
          return (
            <G key={i} rotation={rotation} origin={`${size / 2}, ${size / 2}`}>
              {/* Using a Circle for each segment. 
                   strokeDasharray = [dashedPart, gapPart] 
                   dashedPart = dashLength
                   gapPart = circum - dashLength 
               */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke={seg.color || color}
                strokeOpacity={seg.completed ? 1 : 0.25} // Low opacity if not taken
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circum - dashLength}`}
                strokeLinecap="round"
              />
            </G>
          )
        })}
      </Svg>
    )
  }

  // -- Legacy Mode (Single Progress) --
  const strokeDashoffset = circum - progress * circum

  return (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="transparent"
        stroke={color}
        strokeOpacity={0.2}
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circum} ${circum}`}
        strokeDashoffset={strokeDashoffset}
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
        strokeLinecap="round"
      />
    </Svg>
  )
}
