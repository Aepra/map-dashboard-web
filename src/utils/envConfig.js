/**
 * Utility to parse environment variables and group them by year.
 * Expects variables in the format: VITE_{TYPE}_{YEAR}=URL
 * Example: VITE_BERANDA_2025=https://...
 */

export const getDashboardsConfig = () => {
  const env = import.meta.env;
  const config = {};

  const typeMapping = {
    'REGISTRASI_DATA_ID': 'registrasi_data_id',
    'REGISTRASI_ID': 'registrasi_data_id',
    'REGISTRASI_DATA_NIK': 'registrasi_data_nik',
    'REGISTRASI_NIK': 'registrasi_data_nik',
    'GEOSPATIAL': 'geospatial',
    'PAUD': 'tk',
    'TK': 'tk',
    'SD': 'sd',
    'SMP': 'smp',
    'PENDAFTARAN_AKUN': 'pendaftaran_akun',
    'OUTLIER': 'outlier',
  };

  const defaultYear = 2025;

  Object.keys(env).forEach((key) => {
    if (key.startsWith('VITE_')) {
      let typeMatch = null;

      for (const [envType, mappedType] of Object.entries(typeMapping)) {
        if (key.includes(envType)) {
          typeMatch = mappedType;
          break;
        }
      }

      if (typeMatch) {
        const parts = key.split('_');
        const yearStr = parts[parts.length - 1];
        let year = parseInt(yearStr, 10);

        if (isNaN(year) || year < 2000 || year > 2100) {
          year = defaultYear;
        }

        if (!config[year]) {
          config[year] = {};
        }
        
        config[year][typeMatch] = env[key];
      }
    }
  });

  return config;
};

export const getAvailableYears = () => {
  const config = getDashboardsConfig();
  return Object.keys(config).map(Number).sort((a, b) => b - a); // Descending order (newest first)
};

export const getUrlForTypeAndYear = (type, year) => {
  const config = getDashboardsConfig();
  return config[year]?.[type.toLowerCase()] || null;
};

export const getDeltaUrlForTypeAndYear = (type, year) => {
  const env = import.meta.env;
  // Looks for VITE_GEOSPATIAL_DELTA_2025
  return env[`VITE_${type.toUpperCase()}_DELTA_${year}`] || null;
};
