import ProfileForm from '../components/ProfileForm.jsx';

export default function ProfilePage({ profile, onProfileCreated }) {
  const currentProfile = normalizeProfile(profile);

  return (
    <div>
      {profile && (
        <div className="section profile-info">
          <strong>Profil actuel :</strong>
          <p>Compétences obligatoires : {formatList(currentProfile.requiredSkills)}</p>
          <p>Compétences souhaitables : {formatList(currentProfile.preferredSkills)}</p>
          <p>Expérience minimale : {currentProfile.minExperience} ans</p>
          <p>Stack cible : {currentProfile.expectedStack || 'peu importe'}</p>
          <p>Type d'entreprise : {currentProfile.expectedCompanyType || 'peu importe'}</p>
          <p>Niveau attendu : {currentProfile.expectedLevel || 'peu importe'}</p>
          <p>Technologies backend : {formatList(currentProfile.backendTechnologies)}</p>
          <p>Technologies frontend : {formatList(currentProfile.frontendTechnologies)}</p>
          <p>Outils DevOps : {formatList(currentProfile.devopsTools)}</p>
        </div>
      )}
      <div className="section">
        <h2>{profile ? 'Modifier le profil' : 'Définir le profil cible'}</h2>
        <ProfileForm initialProfile={profile} onCreated={onProfileCreated} />
      </div>
    </div>
  );
}

function normalizeProfile(profile) {
  return {
    requiredSkills: profile?.requiredSkills || profile?.required_skills || [],
    preferredSkills: profile?.preferredSkills || profile?.preferred_skills || [],
    minExperience: profile?.minExperience ?? profile?.min_experience ?? 0,
    expectedStack: profile?.expectedStack || profile?.expected_stack || '',
    expectedCompanyType: profile?.expectedCompanyType || profile?.expected_company_type || '',
    expectedLevel: profile?.expectedLevel || profile?.expected_level || '',
    backendTechnologies: profile?.backendTechnologies || profile?.backend_technologies || [],
    frontendTechnologies: profile?.frontendTechnologies || profile?.frontend_technologies || [],
    devopsTools: profile?.devopsTools || profile?.devops_tools || [],
  };
}

function formatList(values) {
  return values.length > 0 ? values.join(', ') : 'aucun';
}
