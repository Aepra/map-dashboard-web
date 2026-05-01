import { IconLayer, ScatterplotLayer } from '@deck.gl/layers';
import { LAYER_CONFIG, COLORS } from './constants';

/**
 * Factory function untuk membuat ScatterplotLayer
 * Optimized dengan memoization di parent component
 */
const SCHOOL_ICON_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">' +
      '<defs>' +
        '<linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#ef4444"/>' +
          '<stop offset="100%" stop-color="#b91c1c"/>' +
        '</linearGradient>' +
        '<linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#ffffff"/>' +
          '<stop offset="100%" stop-color="#dbeafe"/>' +
        '</linearGradient>' +
        '<linearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#bfdbfe"/>' +
          '<stop offset="100%" stop-color="#93c5fd"/>' +
        '</linearGradient>' +
        '<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">' +
          '<feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.35"/>' +
        '</filter>' +
      '</defs>' +
      '<g filter="url(#shadow)">' +
        '<path d="M48 14L14 32h68L48 14z" fill="url(#roofGrad)"/>' +
        '<path d="M22 34h52v40H22z" fill="url(#wallGrad)"/>' +
        '<path d="M74 34l8-2v42l-8 0z" fill="url(#sideGrad)"/>' +
        '<path d="M22 34l-8-2v42l8 0z" fill="#bfdbfe"/>' +
        '<rect x="43" y="52" width="10" height="22" rx="1.5" fill="#1e3a8a"/>' +
        '<rect x="30" y="44" width="9" height="8" fill="#60a5fa"/>' +
        '<rect x="57" y="44" width="9" height="8" fill="#60a5fa"/>' +
        '<rect x="30" y="58" width="9" height="8" fill="#60a5fa"/>' +
        '<rect x="57" y="58" width="9" height="8" fill="#60a5fa"/>' +
        '<rect x="38" y="23" width="20" height="7" rx="1.5" fill="#fef3c7"/>' +
      '</g>' +
    '</svg>'
  );

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const hslToRgb = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp >= 1 && hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp >= 2 && hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp >= 3 && hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp >= 4 && hp < 5) [r1, g1, b1] = [x, 0, c];
  else if (hp >= 5 && hp < 6) [r1, g1, b1] = [c, 0, x];

  const m = l - c / 2;
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
};

const getDistinctSchoolColor = (schoolName, hueOffset) => {
  if (!schoolName) return COLORS.others;

  const hash = hashString(schoolName);
  const hueBase = (hash * 137.508 + hueOffset) % 360;
  const satBands = [0.92, 0.78, 0.66];
  const lightBands = [0.52, 0.44, 0.60];
  const band = Math.floor(hash / 23) % 3;

  return hslToRgb(hueBase, satBands[band], lightBands[band]);
};

const getPaudColor = (schoolName) => {
  if (!schoolName) return COLORS.others;
  if (schoolName.trim().toLowerCase() === 'paud negeri mariso') return [175, 82, 222];
  return getDistinctSchoolColor(schoolName, 18);
};

const getSmpColor = (schoolName) => {
  if (!schoolName) return COLORS.smp;
  return getDistinctSchoolColor(schoolName, 196);
};

const getSdColor = (schoolName) => {
  if (!schoolName) return COLORS.sd;
  return getDistinctSchoolColor(schoolName, 332);
};

export const createStudentLayer = (filteredData, zoom, vizMode) => {
  const config = vizMode === 'dense' ? LAYER_CONFIG.dense : LAYER_CONFIG.normal;

  const getRadius = () => {
    const minZoom = LAYER_CONFIG.minZoom;
    const maxZoom = LAYER_CONFIG.maxZoom;
    const minRadius = config.minRadius;
    const maxRadius = config.maxRadius;
    const zoomClamped = Math.max(minZoom, Math.min(maxZoom, zoom));
    return minRadius + ((zoomClamped - minZoom) / (maxZoom - minZoom)) * (maxRadius - minRadius);
  };

  return new ScatterplotLayer({
    id: 'pendaftar-layer',
    data: filteredData,
    getPosition: (d) => [d.bujur, d.lintang],
    getFillColor: (d) => {
      if (d.jenjang.includes('SD')) return getSdColor(d.nama_sekolah_tujuan);
      if (d.jenjang.includes('SMP')) return getSmpColor(d.nama_sekolah_tujuan);
      return getPaudColor(d.nama_sekolah_tujuan);
    },
    getRadius,
    radiusUnits: 'pixels',
    pickable: true,
    opacity: Math.min(config.opacity, 0.65),
    stroked: false,
    lineWidthMinPixels: 0,
    updateTriggers: {
      getRadius: [zoom],
    },
  });
};

export const createSchoolLayer = (schoolData, zoom, onSelectSchool) => {
  return new IconLayer({
    id: 'sekolah-layer',
    data: schoolData,
    getPosition: (d) => [d.bujur, d.lintang],
    getIcon: () => ({
      url: SCHOOL_ICON_URL,
      width: 96,
      height: 96,
      anchorY: 90,
    }),
    getSize: (d) => {
      const base = 13;
      const scale = Math.log2(Math.max(1, d.totalSiswa));
      return base + Math.min(12, scale * 1.8);
    },
    sizeUnits: 'pixels',
    sizeScale: 1,
    getColor: () => [31, 41, 55],
    opacity: 0.9,
    pickable: true,
    wrapLongitude: false,
    visible: zoom >= 10,
    onClick: ({ object }) => {
      if (object && onSelectSchool) onSelectSchool(object.nama);
    },
  });
};
