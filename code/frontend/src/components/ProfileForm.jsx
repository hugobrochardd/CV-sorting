import { useState } from 'react';
import { createProfile } from '../api.js';

export default function ProfileForm({ onCreated }) {
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profile = await createProfile({
        required_skills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        min_experience: Number(minExperience),
      });
      onCreated(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <label>Compétences obligatoires (séparées par des virgules) :</label>
      <input
        type="text"
        value={requiredSkills}
        onChange={(e) => setRequiredSkills(e.target.value)}
        placeholder="React, Node.js, SQL"
      />

      <label>Compétences souhaitables (séparées par des virgules) :</label>
      <input
        type="text"
        value={preferredSkills}
        onChange={(e) => setPreferredSkills(e.target.value)}
        placeholder="Docker, TypeScript, AWS"
      />

      <label>Années d'expérience minimales :</label>
      <input
        type="number"
        value={minExperience}
        onChange={(e) => setMinExperience(e.target.value)}
        min="0"
      />

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
      </button>
    </form>
  );
}
