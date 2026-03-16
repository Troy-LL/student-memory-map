export function retentionToColor(value: number): string {
  const v = Math.max(0, Math.min(100, value));
  const t = v / 100;

  // Dark background friendly \"heat\" scale: deep violet -> magenta -> hot orange
  const hue = 260 - 180 * t; // 260 (violet) down to ~80 (orange)
  const sat = 70 + 20 * t; // 70–90%
  const light = 20 + 25 * t; // 20–45%

  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

