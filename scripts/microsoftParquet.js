#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import sql from 'mssql';
const require = createRequire(import.meta.url);
const parquet = require('parquetjs-lite');
const { ParquetSchema, ParquetWriter } = parquet;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const envFiles = [
  path.join(projectRoot, '.env.local'),
  path.join(projectRoot, '.env'),
];

for (const envPath of envFiles) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

export const OUTPUT_PATH = path.join(projectRoot, 'public/data/peta_murid.parquet');
export const LOG_FILE = path.join(projectRoot, 'public/data/download.log');

export const DEFAULT_MSSQL_QUERY = `
SELECT
  CAST(lintang AS NVARCHAR(100)) AS lintang,
  CAST(bujur AS NVARCHAR(100)) AS bujur,
  CAST(jenjang AS NVARCHAR(100)) AS jenjang,
  CAST(nama_sekolah_tujuan AS NVARCHAR(255)) AS nama_sekolah_tujuan,
  CAST(status_penerimaan AS NVARCHAR(100)) AS status_penerimaan,
  CAST(status_verifikasi AS NVARCHAR(100)) AS status_verifikasi,
  CAST(kecamatan AS NVARCHAR(150)) AS kecamatan,
  CAST(desa AS NVARCHAR(150)) AS desa,
  CAST(lintang_sekolah AS NVARCHAR(100)) AS lintang_sekolah,
  CAST(bujur_sekolah AS NVARCHAR(100)) AS bujur_sekolah,
  CAST(jarak AS NVARCHAR(100)) AS jarak,
  CAST(id_peserta AS NVARCHAR(120)) AS id_peserta,
  CAST(jalur AS NVARCHAR(120)) AS jalur
FROM dbo.peta_murid
`;

export const isValidParquetFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stats = fs.statSync(filePath);
    if (stats.size < 8) return false;

    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(4);
    const footer = Buffer.alloc(4);
    fs.readSync(fd, header, 0, 4, 0);
    fs.readSync(fd, footer, 0, 4, stats.size - 4);
    fs.closeSync(fd);

    return header.toString('utf8') === 'PAR1' && footer.toString('utf8') === 'PAR1';
  } catch {
    return false;
  }
};

export const logDownload = (message) => {
  const timestamp = new Date().toLocaleString('id-ID');
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
};

const parseBoolean = (value, defaultValue) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseNumber = (value, defaultValue) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

export const getMicrosoftConfig = () => {
  const connectionString = process.env.MSSQL_CONNECTION_STRING || '';
  const query = process.env.MSSQL_QUERY || DEFAULT_MSSQL_QUERY;

  if (connectionString) {
    return { connectionString, query };
  }

  const server = process.env.MSSQL_SERVER;
  const database = process.env.MSSQL_DATABASE;
  const user = process.env.MSSQL_USERNAME;
  const password = process.env.MSSQL_PASSWORD;

  if (!server || !database || !user || !password) {
    throw new Error(
      'Missing Microsoft SQL configuration. Set MSSQL_CONNECTION_STRING or MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USERNAME, and MSSQL_PASSWORD.'
    );
  }

  return {
    connectionString: null,
    config: {
      server,
      database,
      user,
      password,
      port: parseNumber(process.env.MSSQL_PORT, 1433),
      options: {
        encrypt: parseBoolean(process.env.MSSQL_ENCRYPT, true),
        trustServerCertificate: parseBoolean(process.env.MSSQL_TRUST_SERVER_CERTIFICATE, false),
      },
      pool: {
        max: parseNumber(process.env.MSSQL_POOL_MAX, 5),
        min: parseNumber(process.env.MSSQL_POOL_MIN, 0),
        idleTimeoutMillis: parseNumber(process.env.MSSQL_IDLE_TIMEOUT_MS, 30000),
      },
      requestTimeout: parseNumber(process.env.MSSQL_REQUEST_TIMEOUT_MS, 600000),
    },
    query,
  };
};

export const fetchRowsFromMicrosoft = async () => {
  const { connectionString, config, query } = getMicrosoftConfig();
  const pool = connectionString
    ? new sql.ConnectionPool(connectionString)
    : new sql.ConnectionPool(config);

  await pool.connect();

  try {
    const result = await pool.request().query(query);
    return result.recordset || [];
  } finally {
    await pool.close();
  }
};

const normalizeValue = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  const text = String(value).trim();
  return text === '' ? null : text;
};

const buildParquetSchema = (rows) => {
  const sample = rows.find((row) => row && typeof row === 'object') || {};
  const fields = Object.keys(sample).reduce((accumulator, key) => {
    accumulator[key] = { type: 'UTF8', optional: true };
    return accumulator;
  }, {});

  return new ParquetSchema(fields);
};

export const writeRowsToParquet = async (rows, outputPath = OUTPUT_PATH) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('No rows returned from Microsoft SQL query.');
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const schema = buildParquetSchema(rows);
  const tempPath = `${outputPath}.tmp`;
  const writer = await ParquetWriter.openFile(schema, tempPath);

  try {
    for (const row of rows) {
      const normalizedRow = Object.fromEntries(
        Object.entries(row || {}).map(([key, value]) => [key, normalizeValue(value)])
      );
      await writer.appendRow(normalizedRow);
    }
  } finally {
    await writer.close();
  }

  fs.renameSync(tempPath, outputPath);
  return outputPath;
};

export const syncMicrosoftDataToParquet = async () => {
  const rows = await fetchRowsFromMicrosoft();
  await writeRowsToParquet(rows, OUTPUT_PATH);
  return rows.length;
};
