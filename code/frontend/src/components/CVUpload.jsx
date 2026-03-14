import { useRef, useState } from 'react';
import { uploadCVFile } from '../api.js';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function CVUpload({ onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;

    setSuccess(false);
    setError(null);

    if (!nextFile) {
      setFile(null);
      return;
    }

    const isPdf =
      nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      event.target.value = '';
      setFile(null);
      setError('Seuls les fichiers PDF sont acceptés.');
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      event.target.value = '';
      setFile(null);
      setError('Le fichier dépasse la taille maximale de 2 Mo.');
      return;
    }

    setFile(nextFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await uploadCVFile(file);
      setFile(null);
      setSuccess(true);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">CV PDF importé et analysé avec succès.</div>}

      <label>CV au format PDF</label>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />

      <button type="submit" className="btn-primary" disabled={loading || !file}>
        {loading ? 'Analyse en cours...' : 'Importer le CV'}
      </button>
    </form>
  );
}
