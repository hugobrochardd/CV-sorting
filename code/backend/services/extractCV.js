import { chatCompletion } from './mistralClient.js';

const SYSTEM_PROMPT = `Tu es un système d'extraction de données de CV.
Tu dois extraire les informations suivantes du CV fourni et retourner un JSON strict.

Règles :
- Si une information n'est pas présente dans le CV, la valeur doit être null.
- Ne jamais inventer ou supposer des informations absentes.
- Ne jamais faire d'inférence démographique.
- Pas de texte décoratif, uniquement du JSON.

Format de sortie attendu (JSON strict) :
{
  "skills": ["compétence1", "compétence2"],
  "years_of_experience": <number|null>,
  "education": ["formation1", "formation2"],
  "environment": ["startup"|"grand groupe"|"freelance"|"PME"|null],
  "languages": ["langue1", "langue2"],
  "certifications": ["certification1"],
  "summary": "résumé court du profil en une phrase"
}

Retourne UNIQUEMENT le JSON, rien d'autre.`;

export async function extractCV(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    return {
      skills: [],
      years_of_experience: null,
      education: [],
      environment: [],
      languages: [],
      certifications: [],
      summary: 'CV vide — aucune information extraite.',
    };
  }

  try {
    const result = await chatCompletion(SYSTEM_PROMPT, rawText);

    // Validate and sanitize result
    return {
      skills: Array.isArray(result.skills) ? result.skills : [],
      years_of_experience: typeof result.years_of_experience === 'number' ? result.years_of_experience : null,
      education: Array.isArray(result.education) ? result.education : [],
      environment: Array.isArray(result.environment) ? result.environment : [],
      languages: Array.isArray(result.languages) ? result.languages : [],
      certifications: Array.isArray(result.certifications) ? result.certifications : [],
      summary: typeof result.summary === 'string' ? result.summary : null,
    };
  } catch (error) {
    console.error('Extraction error:', error.message);
    return {
      skills: [],
      years_of_experience: null,
      education: [],
      environment: [],
      languages: [],
      certifications: [],
      summary: 'Erreur lors de l\'extraction — données non disponibles.',
      error: true,
    };
  }
}
