const STORAGE_DATA_KEY = 'copa2026_data';
const STORAGE_RESULTS_KEY = 'copa2026_results';

export function exportAllData() {
  try {
    const data = localStorage.getItem(STORAGE_DATA_KEY);
    const results = localStorage.getItem(STORAGE_RESULTS_KEY);
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      data: data ? JSON.parse(data) : null,
      results: results ? JSON.parse(results) : null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copa2026-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Export failed:', err);
    return false;
  }
}

export function importAllData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        if (!payload.data && !payload.results) {
          reject(new Error('Arquivo de backup inválido'));
          return;
        }
        if (payload.data) {
          localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(payload.data));
        }
        if (payload.results) {
          localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(payload.results));
        }
        resolve(true);
      } catch (err) {
        reject(new Error('Erro ao ler arquivo de backup'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}
