import { IconLayer, ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import { LAYER_CONFIG, COLORS } from '../utils/constants';
import { getSchoolColorRGB } from './schoolColors';

/**
 * Factory function untuk membuat ScatterplotLayer
 * Optimized dengan memoization di parent component
 */
const parseRgb = (colorValue) => {
  const matches = colorValue.match(/\d+/g);
  if (!matches || matches.length < 3) return [255, 255, 255];
  return matches.slice(0, 3).map((component) => Number(component));
};

const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

const tintRgb = ([red, green, blue], factor) =>
  [
    clampChannel(red * factor),
    clampChannel(green * factor),
    clampChannel(blue * factor),
  ].join(',');

const schoolIconUrlCache = new Map();

const createSchoolIconUrl = (schoolName) => {
  const cacheKey = schoolName || 'N/A';
  if (schoolIconUrlCache.has(cacheKey)) {
    return schoolIconUrlCache.get(cacheKey);
  }

  const baseColor = parseRgb(getSchoolColorRGB(schoolName));
  const roofColor = tintRgb(baseColor, 0.82);
  const wallColor = tintRgb(baseColor, 1.18);
  const sideColor = tintRgb(baseColor, 0.96);
  const accentColor = tintRgb(baseColor, 1.35);
  const shadowColor = tintRgb(baseColor, 0.58);

  const iconUrl =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">' +
        '<defs>' +
          '<linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="rgb(' + roofColor + ')"/>' +
            '<stop offset="100%" stop-color="rgb(' + shadowColor + ')"/>' +
          '</linearGradient>' +
          '<linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="rgb(' + wallColor + ')"/>' +
            '<stop offset="100%" stop-color="#ffffff"/>' +
          '</linearGradient>' +
          '<linearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="rgb(' + sideColor + ')"/>' +
            '<stop offset="100%" stop-color="rgb(' + shadowColor + ')"/>' +
          '</linearGradient>' +
          '<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">' +
            '<feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.35"/>' +
          '</filter>' +
        '</defs>' +
        '<g filter="url(#shadow)">' +
          '<path d="M48 14L14 32h68L48 14z" fill="url(#roofGrad)"/>' +
          '<path d="M22 34h52v40H22z" fill="url(#wallGrad)"/>' +
          '<path d="M74 34l8-2v42l-8 0z" fill="url(#sideGrad)"/>' +
          '<path d="M22 34l-8-2v42l8 0z" fill="url(#sideGrad)"/>' +
          '<rect x="43" y="52" width="10" height="22" rx="1.5" fill="rgb(' + shadowColor + ')"/>' +
          '<rect x="30" y="44" width="9" height="8" fill="rgb(' + accentColor + ')"/>' +
          '<rect x="57" y="44" width="9" height="8" fill="rgb(' + accentColor + ')"/>' +
          '<rect x="30" y="58" width="9" height="8" fill="rgb(' + accentColor + ')"/>' +
          '<rect x="57" y="58" width="9" height="8" fill="rgb(' + accentColor + ')"/>' +
          '<rect x="38" y="23" width="20" height="7" rx="1.5" fill="#fef3c7"/>' +
        '</g>' +
      '</svg>'
    );

  schoolIconUrlCache.set(cacheKey, iconUrl);
  return iconUrl;
};
const getEstimatedStudentSize = (zoom) => {
  if (zoom < 8) return 2;
  if (zoom < 11) return 3;
  if (zoom < 14) return 5;
  return 11;
};

const getSchoolIconSize = (zoom) => getEstimatedStudentSize(zoom) * 3;

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

export const createStudentLayer = (filteredData, zoom, vizMode, onSelectStudent) => {
  // Determine zoom level and config
  const zoomLevels = LAYER_CONFIG.zoomLevels;
  let zoomLevel = zoomLevels.veryFar;

  if (zoom >= 14) {
    zoomLevel = zoomLevels.close;
  } else if (zoom >= 11) {
    zoomLevel = zoomLevels.medium;
  } else if (zoom >= 8) {
    zoomLevel = zoomLevels.far;
  } else {
    // Very far zoom - might want to show aggregated points
    zoomLevel = zoomLevels.veryFar;
  }

  // Apply viz mode adjustments
  const baseDensityMultiplier = vizMode === 'dense' ? 0.5 : 1.0;
  const opacityAdjustment = vizMode === 'dense' ? 0.6 : 1.0;

  const getRadius = (d) => {
    // Smooth interpolation based on zoom
    const [zoomMin, zoomMax] = zoomLevel.zoom;
    const [radiusMin, radiusMax] = zoomLevel.radius;

    // Clamp zoom to level's range
    const zoomNorm = Math.max(0, Math.min(1, (zoom - zoomMin) / (zoomMax - zoomMin)));

    // Smooth easing: ease-in-out for more natural feel
    const eased = zoomNorm < 0.5
      ? 2 * zoomNorm * zoomNorm
      : -1 + (4 - 2 * zoomNorm) * zoomNorm;

    const baseRadius = radiusMin + eased * (radiusMax - radiusMin);

    // Slight random variation so dots don't look uniform (more organic)
    const variation = (hashString(d.id_peserta || '') % 20 - 10) / 100;
    return Math.max(0.5, baseRadius * (1 + variation * 0.1)) * baseDensityMultiplier;
  };

  // Opacity curve: more opaque when closer, transparent when far
  const getOpacity = () => {
    const [zoomMin, zoomMax] = zoomLevel.zoom;
    const [opacityMin, opacityMax] = zoomLevel.opacity;

    if (zoom <= zoomMin) return opacityMin * opacityAdjustment;
    if (zoom >= zoomMax) return opacityMax * opacityAdjustment;

    const zoomNorm = (zoom - zoomMin) / (zoomMax - zoomMin);
    // Smooth cubic easing
    const eased = zoomNorm * zoomNorm * (3 - 2 * zoomNorm);
    return (opacityMin + eased * (opacityMax - opacityMin)) * opacityAdjustment;
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
    pickable: zoomLevel.pickable,
    opacity: getOpacity(),
    stroked: zoom >= 12, // Only show stroke when zoomed in
    getLineColor: zoom >= 12 ? [255, 255, 255, 100] : [255, 255, 255, 0],
    getLineWidth: zoom >= 12 ? 1 : 0,
    lineWidthMinPixels: 0,
    antialiasing: zoom >= 11,
    onClick: ({ object }) => {
      if (object && onSelectStudent && zoomLevel.pickable) {
        onSelectStudent(object);
      }
    },
    // Only update when zoom or data changes (not on every frame)
    updateTriggers: {
      getRadius: [zoom, vizMode],
      getOpacity: [zoom, vizMode],
      getLineColor: [zoom],
      getLineWidth: [zoom],
      pickable: [zoom],
    },
  });
};

export const createSchoolLayer = (schoolData, zoom, onSelectSchool) => {
  // School layer visibility thresholds
  const shouldShow = zoom >= 9.5; // Show schools earlier for better context

  const getSize = () => getSchoolIconSize(zoom);

  const getOpacity = () => {
    if (zoom < 9.5) return 0; // Hidden
    if (zoom < 10) return 0.3 * ((zoom - 9.5) / 0.5); // Fade in
    if (zoom < 12) return 0.3 + (0.5 * ((zoom - 10) / 2)); // Gradually increase
    return 0.8; // Full opacity when close
  };

  return new IconLayer({
    id: 'sekolah-layer',
    data: shouldShow ? schoolData : [], // Empty array when hidden = no render cost
    getPosition: (d) => [d.bujur, d.lintang],
    getIcon: (d) => ({
      url: createSchoolIconUrl(d.nama),
      width: 96,
      height: 96,
      anchorY: 90,
    }),
    getSize,
    sizeUnits: 'pixels',
    sizeScale: 1,
    getColor: () => [255, 255, 255],
    opacity: getOpacity(),
    pickable: zoom >= 10, // Only clickable when visible
    wrapLongitude: false,
    antialiasing: zoom >= 11,
    onClick: ({ object }) => {
      if (object && onSelectSchool && zoom >= 10) {
        onSelectSchool(object.nama);
      }
    },
    updateTriggers: {
      getSize: [zoom],
      getOpacity: [zoom],
      pickable: [zoom],
      data: [shouldShow],
    },
  });
};

export const createLineLayer = (selectedStudent, schoolData, zoom = 0) => {
  if (!selectedStudent || !schoolData) return null;

  const destinationSchool = schoolData.find(
    (s) => s.nama === selectedStudent.nama_sekolah_tujuan
  );

  if (!destinationSchool) return null;

  const lineData = [
    {
      sourcePosition: [selectedStudent.bujur, selectedStudent.lintang],
      targetPosition: [destinationSchool.bujur, destinationSchool.lintang],
    },
  ];

  // Adaptive line width based on zoom
  const getLineWidth = () => {
    if (zoom < 10) return 1;
    if (zoom < 12) return 1.5;
    if (zoom < 14) return 2;
    return 2.5;
  };

  // Smooth opacity: more visible when zoomed in
  const getOpacity = () => {
    if (zoom < 10) return 0.5;
    if (zoom < 12) return 0.65;
    return 0.8;
  };

  return new LineLayer({
    id: 'student-to-school-line',
    data: lineData,
    getSourcePosition: (d) => d.sourcePosition,
    getTargetPosition: (d) => d.targetPosition,
    getColor: () => [59, 130, 246, 200], // Blue with transparency
    getWidth: getLineWidth,
    widthUnits: 'pixels',
    opacity: getOpacity(),
    pickable: false,
    antialiasing: true,
    updateTriggers: {
      getWidth: [zoom],
      getOpacity: [zoom],
    },
  });
};
