import { useState, useEffect } from 'react';
import ProfilePage from './pages/ProfilePage.jsx';
import CandidatesPage from './pages/CandidatesPage.jsx';
import { getProfile } from './api.js';

export default function App() {
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const handleProfileCreated = (p) => {
    setProfile(p);
    setTab('candidates');
  };

  return (
    <div className="app">
      <h1>Système de tri de CVs</h1>

      <div className="tabs">
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>
          Profil cible
        </button>
        <button className={tab === 'candidates' ? 'active' : ''} onClick={() => setTab('candidates')}>
          Candidats
        </button>
      </div>

      {tab === 'profile' && (
        <ProfilePage profile={profile} onProfileCreated={handleProfileCreated} />
      )}
      {tab === 'candidates' && (
        <CandidatesPage profile={profile} />
      )}
    </div>
  );
}
