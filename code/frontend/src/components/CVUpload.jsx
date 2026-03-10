import { useState } from 'react';
import { uploadCV } from '../api.js';

export default function CVUpload({ onUploaded }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await uploadCV(text);
      setText('');
      setSuccess(true);
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
      {success && <div className="success">CV importé et analysé avec succès.</div>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Collez le texte du CV ici..."
      />

      <button type="submit" className="btn-primary" disabled={loading || !text.trim()}>
        {loading ? 'Analyse en cours...' : 'Importer le CV'}
      </button>
    </form>
  );
}
