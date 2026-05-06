/**
 * Utility untuk download & save Parquet file locally
 */
export const downloadAndSaveParquet = async () => {
  try {
    console.log('📥 Downloading Parquet file...');
    const response = await fetch(
      'https://raw.githubusercontent.com/Aepra/map-data-pipeline/main/data/peta_murid.parquet'
    );

    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    const blob = await response.blob();
    console.log(`✅ Downloaded ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

    // Trigger download to user's device
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'peta_murid.parquet';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return blob;
  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
};

/**
 * Utility untuk convert Blob ke local file URL
 * (DuckDB-Wasm dapat membaca file:// URLs atau Blob URLs)
 */
export const getBlobAsArrayBuffer = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};
