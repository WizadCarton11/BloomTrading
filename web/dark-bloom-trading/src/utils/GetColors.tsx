/**
 * Generates an array of `len` evenly distributed colors using HSL.
 * The result is returned in HEX format.
 *
 * @param len - Number of colors to generate
 * @returns Array of HEX color strings
 */
export function generateColorPalette(len: number): string[] {
  if (len <= 0) return [];

  const colors: string[] = [];

  for (let i = 0; i < len; i++) {
    const hue = Math.round((360 / len) * i);
    const color = hslToHex(hue, 70, 50); // S = 70%, L = 50%
    colors.push(color);
  }

  return colors;
}

/**
 * Converts HSL to HEX.
 *
 * @param h - Hue (0–360)
 * @param s - Saturation (0–100)
 * @param l - Lightness (0–100)
 * @returns HEX color string
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

  return `#${[f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}
