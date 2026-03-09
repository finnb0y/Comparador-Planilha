// lib/sheetUtils.js
// All spreadsheet parsing and comparison logic

/**
 * Parse a spreadsheet File object and return structured data.
 * Returns: { name, sheets: [{ name, headers, rows }] }
 */
export async function parseSpreadsheet(file) {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const ws = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    if (raw.length === 0) return { name: sheetName, headers: [], rows: [] };

    const headers = raw[0].map((h) => String(h ?? '').trim());
    const rows = raw.slice(1).map((r) =>
      headers.reduce((acc, h, i) => {
        acc[h] = r[i] !== undefined ? String(r[i]) : '';
        return acc;
      }, {})
    );

    return { name: sheetName, headers, rows };
  });

  return { name: file.name, sheets };
}

/**
 * Compare two sheet datasets (master vs comparison).
 * Tries to match rows by the first column (key column).
 *
 * Returns an array of change objects:
 *  { type: 'added' | 'removed' | 'modified', key, sheet, row?, changes? }
 */
export function compareSheets(master, comparison) {
  const report = [];

  const masterSheetMap = Object.fromEntries(master.sheets.map((s) => [s.name, s]));
  const compSheetMap = Object.fromEntries(comparison.sheets.map((s) => [s.name, s]));

  const allSheetNames = new Set([
    ...Object.keys(masterSheetMap),
    ...Object.keys(compSheetMap),
  ]);

  for (const sheetName of allSheetNames) {
    const mSheet = masterSheetMap[sheetName];
    const cSheet = compSheetMap[sheetName];

    if (!mSheet) {
      report.push({ type: 'sheet_added', sheet: sheetName });
      continue;
    }
    if (!cSheet) {
      report.push({ type: 'sheet_removed', sheet: sheetName });
      continue;
    }

    const keyCol = mSheet.headers[0] || cSheet.headers[0];

    const mRowMap = buildRowMap(mSheet.rows, keyCol);
    const cRowMap = buildRowMap(cSheet.rows, keyCol);

    const allKeys = new Set([...Object.keys(mRowMap), ...Object.keys(cRowMap)]);
    const allHeaders = new Set([...mSheet.headers, ...cSheet.headers]);

    for (const key of allKeys) {
      const mRow = mRowMap[key];
      const cRow = cRowMap[key];

      if (!mRow) {
        report.push({ type: 'added', sheet: sheetName, key, row: cRow });
        continue;
      }
      if (!cRow) {
        report.push({ type: 'removed', sheet: sheetName, key, row: mRow });
        continue;
      }

      const changes = [];
      for (const col of allHeaders) {
        const mVal = mRow[col] ?? '';
        const cVal = cRow[col] ?? '';
        if (mVal !== cVal) {
          changes.push({ column: col, from: mVal, to: cVal });
        }
      }

      if (changes.length > 0) {
        report.push({ type: 'modified', sheet: sheetName, key, changes, row: cRow });
      }
    }
  }

  return report;
}

function buildRowMap(rows, keyCol) {
  const map = {};
  rows.forEach((row, i) => {
    const key = keyCol && row[keyCol] ? String(row[keyCol]) : `__row_${i}`;
    map[key] = row;
  });
  return map;
}

/** Summarize a comparison report */
export function summarizeReport(report) {
  return {
    added: report.filter((r) => r.type === 'added').length,
    removed: report.filter((r) => r.type === 'removed').length,
    modified: report.filter((r) => r.type === 'modified').length,
    sheetAdded: report.filter((r) => r.type === 'sheet_added').length,
    sheetRemoved: report.filter((r) => r.type === 'sheet_removed').length,
    total: report.length,
  };
}

/** Save master data to localStorage */
export function saveMaster(data) {
  try {
    localStorage.setItem('sheetcompare_master', JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Load master data from localStorage */
export function loadMaster() {
  try {
    const raw = localStorage.getItem('sheetcompare_master');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Remove master from localStorage */
export function clearMaster() {
  localStorage.removeItem('sheetcompare_master');
}
