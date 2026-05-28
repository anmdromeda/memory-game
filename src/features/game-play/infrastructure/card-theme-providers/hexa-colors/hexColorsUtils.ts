export function generateFriendlyColor(): string {
  const hue = Math.floor(Math.random() * 360);

  const saturation = 70;
  const lightness = 60;

  return hslToHex(hue, saturation, lightness);
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;

  const a = (s * Math.min(l, 1 - l)) / 100;

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getHexaColorsList(count: number) {
  const colors: string[] = [];
  const step = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = i * step;

    const hexColor = hslToHex(hue, 70, 60);

    colors.push(hexColor);
  }

  return colors;
}
