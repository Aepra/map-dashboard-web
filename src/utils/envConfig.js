/**
 * Utility to parse environment variables and group them by year.
 * Expects variables in the format: VITE_{TYPE}_{YEAR}=URL
 * Example: VITE_BERANDA_2025=https://...
 */

export const getDashboardsConfig = () => {
  const env = import.meta.env;
  const config = {};

  // Supported types
  const types = ['BERANDA', 'GEOSPATIAL', 'PAUD', 'SD', 'SMP'];

  Object.keys(env).forEach((key) => {
    if (key.startsWith('VITE_')) {
      const parts = key.split('_');
      // e.g., ['VITE', 'BERANDA', '2025'] or ['VITE', 'GEOSPATIAL', 'DATA', '2025']
      
      // The last part should be the year
      const yearStr = parts[parts.length - 1];
      const year = parseInt(yearStr, 10);

      if (!isNaN(year) && year > 2000 && year < 2100) {
        // Extract the type by joining the parts between VITE_ and _YEAR
        const typeStr = parts.slice(1, parts.length - 1).join('_').toUpperCase();
        
        // Match with supported types (ignoring extra words like 'DATA')
        const matchedType = types.find(t => typeStr.includes(t));
        
        if (matchedType) {
          if (!config[year]) {
            config[year] = {};
          }
          config[year][matchedType.toLowerCase()] = env[key];
        }
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
