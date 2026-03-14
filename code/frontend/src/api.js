const API_BASE = '';

export async function createProfile(data) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_BASE}/profile`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function uploadCV(rawText) {
  const res = await fetch(`${API_BASE}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function uploadCVFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/candidates/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function getCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function getBiasAnalysis() {
  const res = await fetch(`${API_BASE}/analytics/bias`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function getSuggestionsAnalysis() {
  const res = await fetch(`${API_BASE}/analytics/suggestions`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function makeDecision(id, decision) {
  const res = await fetch(`${API_BASE}/candidates/${id}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

async function readErrorMessage(res) {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    if (data?.error) {
      return data.error;
    }
  }

  const text = await res.text().catch(() => '');
  return text || 'Une erreur est survenue.';
}
