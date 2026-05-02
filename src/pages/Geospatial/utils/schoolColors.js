const COLOR_PALETTE = [
  [255, 107, 107],
  [255, 159, 64],
  [255, 206, 86],
  [75, 192, 75],
  [54, 162, 235],
  [153, 102, 255],
  [255, 99, 132],
  [83, 102, 255],
  [99, 255, 153],
  [255, 195, 0],
];

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getSchoolColorRGB = (schoolName) => {
  if (!schoolName) return 'rgb(156, 163, 175)';
  const index = hashString(schoolName) % COLOR_PALETTE.length;
  const [r, g, b] = COLOR_PALETTE[index];
  return `rgb(${r}, ${g}, ${b})`;
};
