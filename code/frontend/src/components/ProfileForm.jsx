import { useEffect, useState } from 'react';
import { createProfile } from '../api.js';
import ListField from './ListField.jsx';

const DEFAULT_WEIGHT_FIELDS = {
  requiredSkills: '',
  preferredSkills: '',
  experience: '',
  education: '',
  stackAlignment: '',
  frontendDepth: '',
  backendDepth: '',
  devopsDepth: '',
  companyType: '',
  level: '',
};

const WEIGHT_LABELS = {
  requiredSkills: 'Compétences obligatoires',
  preferredSkills: 'Compétences souhaitées',
  experience: 'Expérience',
  education: 'Formation',
  stackAlignment: 'Stack dominante',
  frontendDepth: 'Technologies frontend',
  backendDepth: 'Technologies backend',
  devopsDepth: 'Outils DevOps',
  companyType: 'Type entreprise',
  level: 'Niveau',
};

export default function ProfileForm({ initialProfile, onCreated }) {
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [expectedStack, setExpectedStack] = useState('');
  const [expectedCompanyType, setExpectedCompanyType] = useState('');
  const [expectedLevel, setExpectedLevel] = useState('');
  const [backendTechnologies, setBackendTechnologies] = useState([]);
  const [frontendTechnologies, setFrontendTechnologies] = useState([]);
  const [devopsTools, setDevopsTools] = useState([]);
  const [criteriaWeights, setCriteriaWeights] = useState(DEFAULT_WEIGHT_FIELDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const profile = normalizeProfile(initialProfile);

    setRequiredSkills(profile.requiredSkills.join(', '));
    setPreferredSkills(profile.preferredSkills.join(', '));
    setMinExperience(profile.minExperience);
    setExpectedStack(profile.expectedStack);
    setExpectedCompanyType(profile.expectedCompanyType);
    setExpectedLevel(profile.expectedLevel);
    setBackendTechnologies(profile.backendTechnologies);
    setFrontendTechnologies(profile.frontendTechnologies);
    setDevopsTools(profile.devopsTools);
    setCriteriaWeights(buildWeightState(profile.criteriaWeights));
  }, [initialProfile]);

  const handleWeightChange = (key, value) => {
    setCriteriaWeights(current => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profile = await createProfile({
        required_skills: splitCommaSeparatedValues(requiredSkills),
        preferred_skills: splitCommaSeparatedValues(preferredSkills),
        min_experience: Number(minExperience) || 0,
        expected_stack: expectedStack || null,
        expected_company_type: expectedCompanyType || null,
        expected_level: expectedLevel || null,
        backend_technologies: sanitizeDynamicList(backendTechnologies),
        frontend_technologies: sanitizeDynamicList(frontendTechnologies),
        devops_tools: sanitizeDynamicList(devopsTools),
        criteria_weights: sanitizeWeights(criteriaWeights),
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

      <div className="form-grid">
        <div>
          <label>Compétences obligatoires (séparées par des virgules)</label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(event) => setRequiredSkills(event.target.value)}
            placeholder="React, Node.js, SQL"
          />
        </div>

        <div>
          <label>Compétences souhaitables (séparées par des virgules)</label>
          <input
            type="text"
            value={preferredSkills}
            onChange={(event) => setPreferredSkills(event.target.value)}
            placeholder="Docker, TypeScript, AWS"
          />
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label>Années d'expérience minimales</label>
          <input
            type="number"
            value={minExperience}
            onChange={(event) => setMinExperience(event.target.value)}
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <label>Stack dominante souhaitée</label>
          <select value={expectedStack} onChange={(event) => setExpectedStack(event.target.value)}>
            <option value="">Peu importe</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Fullstack</option>
            <option value="devops">DevOps</option>
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label>Type d'entreprise souhaité</label>
          <select
            value={expectedCompanyType}
            onChange={(event) => setExpectedCompanyType(event.target.value)}
          >
            <option value="">Peu importe</option>
            <option value="startup">Startup</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        <div>
          <label>Niveau attendu</label>
          <select value={expectedLevel} onChange={(event) => setExpectedLevel(event.target.value)}>
            <option value="">Peu importe</option>
            <option value="junior">Junior</option>
            <option value="confirme">Confirmé</option>
            <option value="senior">Senior</option>
          </select>
        </div>
      </div>

      <ListField
        label="Technologies backend attendues"
        values={backendTechnologies}
        onChange={setBackendTechnologies}
        placeholder="Node.js"
        addLabel="Ajouter une techno backend"
      />

      <ListField
        label="Technologies frontend attendues"
        values={frontendTechnologies}
        onChange={setFrontendTechnologies}
        placeholder="React"
        addLabel="Ajouter une techno frontend"
      />

      <ListField
        label="Outils DevOps attendus"
        values={devopsTools}
        onChange={setDevopsTools}
        placeholder="Docker"
        addLabel="Ajouter un outil DevOps"
      />

      <details className="weights-panel">
        <summary>Poids personnalisés (facultatif)</summary>
        <div className="weights-grid">
          {Object.entries(WEIGHT_LABELS).map(([key, label]) => (
            <div key={key}>
              <label>{label}</label>
              <input
                type="number"
                min="1"
                step="1"
                value={criteriaWeights[key]}
                onChange={(event) => handleWeightChange(key, event.target.value)}
                placeholder="Poids par défaut"
              />
            </div>
          ))}
        </div>
      </details>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
      </button>
    </form>
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
    criteriaWeights: profile?.criteriaWeights || profile?.criteria_weights || {},
  };
}

function buildWeightState(criteriaWeights = {}) {
  return Object.fromEntries(
    Object.keys(DEFAULT_WEIGHT_FIELDS).map(key => [key, criteriaWeights[key] ?? ''])
  );
}

function splitCommaSeparatedValues(value) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function sanitizeDynamicList(values) {
  return values
    .map(value => value.trim())
    .filter(Boolean);
}

function sanitizeWeights(weights) {
  return Object.fromEntries(
    Object.entries(weights)
      .map(([key, value]) => [key, Number(value)])
      .filter(([, value]) => Number.isFinite(value) && value > 0)
  );
}
