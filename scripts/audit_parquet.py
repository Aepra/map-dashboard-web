"""
Audit parquet datasets 2025 and 2026 for jenjang, status, verifikasi, jalur values.
"""
import pyarrow.parquet as pq
import urllib.request
import os
from collections import Counter

urls = {
    '2025': 'https://storage.googleapis.com/spmb-map-public/peta_murid_2025.parquet',
    '2026': 'https://storage.googleapis.com/spmb-map-public/peta_murid_2026.parquet'
}

for year, url in urls.items():
    print(f'\n{"="*60}')
    print(f'DATASET {year}')
    print(f'{"="*60}')
    
    local_file = f'peta_murid_{year}.parquet'
    
    if not os.path.exists(local_file):
        print(f'Downloading {url}...')
        urllib.request.urlretrieve(url, local_file)
        print('Download complete')
    
    table = pq.read_table(local_file)
    schema = table.schema
    print(f'\nSchema ({len(schema)} columns):')
    for field in schema:
        print(f'  {field.name}')
    
    # Column detection (same logic as duckdbEngine.js findCol)
    names_lower = [c.lower() for c in schema.names]
    
    def find_col(candidates):
        for cand in candidates:
            if cand in names_lower:
                return schema.names[names_lower.index(cand)]
        for cand in candidates:
            for i, c in enumerate(names_lower):
                if cand in c:
                    return schema.names[i]
        return None
    
    jenjang_col = find_col(['jenjang', 'jenjang_pendidikan', 'grade', 'level', 'tingkat'])
    status_col = find_col(['status_penerimaan', 'status', 'hasil', 'status_keputusan'])
    verifikasi_col = find_col(['status_verifikasi', 'verifikasi', 'status_v', 'verification_status'])
    jalur_col = find_col(['jalur', 'path', 'channel', 'jalur_pendaftaran'])
    jenis_pilihan_col = find_col(['jenis_pilihan', 'pilihan_ke', 'pilihan'])
    usia_col = find_col(['kategori_usia', 'usia', 'kelompok_usia', 'umur'])
    
    total_rows = table.num_rows
    print(f'\nTotal rows: {total_rows:,}')
    
    # Jenjang
    if jenjang_col:
        print(f'\n--- JENJANG (column: {jenjang_col}) ---')
        col_data = table.column(jenjang_col).to_pylist()
        counter = Counter(col_data)
        print(f'  Unique values: {len(counter)}')
        for val, count in counter.most_common():
            label = repr(val) if val is None else f'"{val}"'
            print(f'  {label}: {count:,} ({count/total_rows*100:.1f}%)')
    else:
        print(f'\n  !!! NO jenjang column found')
        print(f'  Available columns: {schema.names}')
    
    # Status Penerimaan
    if status_col:
        print(f'\n--- STATUS PENERIMAAN (column: {status_col}) ---')
        col_data = table.column(status_col).to_pylist()
        counter = Counter(col_data)
        print(f'  Unique values: {len(counter)}')
        for val, count in counter.most_common():
            label = repr(val) if val is None else f'"{val}"'
            print(f'  {label}: {count:,} ({count/total_rows*100:.1f}%)')
    else:
        print(f'\n  !!! NO status column found')
    
    # Status Verifikasi
    if verifikasi_col:
        print(f'\n--- STATUS VERIFIKASI (column: {verifikasi_col}) ---')
        col_data = table.column(verifikasi_col).to_pylist()
        counter = Counter(col_data)
        print(f'  Unique values: {len(counter)}')
        for val, count in counter.most_common():
            label = repr(val) if val is None else f'"{val}"'
            print(f'  {label}: {count:,} ({count/total_rows*100:.1f}%)')
    else:
        print(f'\n  !!! NO verifikasi column found')
    
    # Jalur
    if jalur_col:
        print(f'\n--- JALUR (column: {jalur_col}) ---')
        col_data = table.column(jalur_col).to_pylist()
        counter = Counter(col_data)
        print(f'  Unique values: {len(counter)}')
        for val, count in counter.most_common():
            label = repr(val) if val is None else f'"{val}"'
            print(f'  {label}: {count:,} ({count/total_rows*100:.1f}%)')
    else:
        print(f'\n  !!! NO jalur column found')
    
    # Jenis Pilihan
    if jenis_pilihan_col:
        print(f'\n--- JENIS PILIHAN (column: {jenis_pilihan_col}) ---')
        col_data = table.column(jenis_pilihan_col).to_pylist()
        counter = Counter(col_data)
        print(f'  Unique values: {len(counter)}')
        for val, count in counter.most_common():
            label = repr(val) if val is None else f'"{val}"'
            print(f'  {label}: {count:,} ({count/total_rows*100:.1f}%)')
    else:
        print(f'\n  !!! NO jenis_pilihan column found')
    
    # Kategori Usia
    if usia_col:
        print(f'\n--- KATEGORI USIA (column: {usia_col}) ---')
        col_data = table.column(usia_col).to_pylist()
        counter = Counter(col_data)
        print(f'  Unique values: {len(counter)}')
        for val, count in counter.most_common():
            label = repr(val) if val is None else f'"{val}"'
            print(f'  {label}: {count:,} ({count/total_rows*100:.1f}%)')
    else:
        print(f'\n  !!! NO kategori_usia column found')
    
    print()