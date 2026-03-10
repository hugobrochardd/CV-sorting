import ProfileForm from '../components/ProfileForm.jsx';

export default function ProfilePage({ profile, onProfileCreated }) {
  return (
    <div>
      {profile && (
        <div className="section profile-info">
          <strong>Profil actuel :</strong>
          <p>Compétences obligatoires : {profile.required_skills.join(', ') || 'aucune'}</p>
          <p>Compétences souhaitables : {profile.preferred_skills.join(', ') || 'aucune'}</p>
          <p>Expérience minimale : {profile.min_experience} ans</p>
        </div>
      )}
      <div className="section">
        <h2>{profile ? 'Modifier le profil' : 'Définir le profil cible'}</h2>
        <ProfileForm onCreated={onProfileCreated} />
      </div>
    </div>
  );
}
