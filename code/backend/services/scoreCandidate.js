import { chatCompletion } from './mistralClient.js';
import { getAllDecisionsWithCandidates } from '../models/decisionModel.js';

function buildFewShotExamples() {
  const decisions = getAllDecisionsWithCandidates();
  if (decisions.length < 2) return '';

  let examples = '\n\nExemples de décisions précédentes (few-shot learning) :\n';
  for (const d of decisions) {
    if (!d.extracted_data) continue;
    examples += `\nCandidat (score: ${d.score}) — Décision: ${d.decision}\n`;
    examples += `Compétences: ${d.extracted_data.skills?.join(', ') || 'aucune'}\n`;
    examples += `Expérience: ${d.extracted_data.years_of_experience ?? 'inconnue'} ans\n`;
  }
  examples += '\nUtilise ces exemples pour ajuster ton évaluation. Les profils similaires aux candidats acceptés doivent être mieux notés. Les profils similaires aux candidats rejetés doivent être moins bien notés.\n';
  return examples;
}

export async function scoreCandidate(extractedData, profile) {
  if (!profile) {
    return {
      score: 0,
      satisfied_criteria: [],
      missing_criteria: ['Aucun profil cible défini'],
      explanation: 'Impossible de scorer : aucun profil cible n\'a été défini.',
    };
  }

  if (!extractedData || extractedData.error) {
    return {
      score: 0,
      satisfied_criteria: [],
      missing_criteria: ['Extraction échouée'],
      explanation: 'Impossible de scorer : l\'extraction des données a échoué.',
    };
  }

  const fewShot = buildFewShotExamples();

  const systemPrompt = `Tu es un système de scoring de CV. Tu dois évaluer un candidat par rapport à un profil cible.

Règles strictes :
- Score entre 0 et 100.
- Si un critère OBLIGATOIRE n'est pas satisfait, le score est PLAFONNÉ à 30 maximum.
- Ne jamais inventer de compétences non présentes dans les données extraites.
- Chaque critère doit être justifié par un élément présent dans les données.
- Distinguer critères satisfaits, manquants et partiellement satisfaits.

Format de sortie (JSON strict) :
{
  "score": <number 0-100>,
  "satisfied_criteria": ["critère satisfait 1", "..."],
  "missing_criteria": ["critère manquant 1", "..."],
  "partially_satisfied": ["critère partiel 1", "..."],
  "mandatory_met": <boolean>,
  "explanation": "explication textuelle concise du score"
}

Retourne UNIQUEMENT le JSON.${fewShot}`;

  const userPrompt = `Profil cible :
- Compétences obligatoires : ${JSON.stringify(profile.required_skills)}
- Compétences souhaitables : ${JSON.stringify(profile.preferred_skills)}
- Expérience minimale requise : ${profile.min_experience} ans

Données du candidat :
${JSON.stringify(extractedData, null, 2)}`;

  try {
    const result = await chatCompletion(systemPrompt, userPrompt);

    const score = typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : 0;
    const mandatoryMet = result.mandatory_met !== false;

    return {
      score: mandatoryMet ? score : Math.min(score, 30),
      satisfied_criteria: Array.isArray(result.satisfied_criteria) ? result.satisfied_criteria : [],
      missing_criteria: Array.isArray(result.missing_criteria) ? result.missing_criteria : [],
      partially_satisfied: Array.isArray(result.partially_satisfied) ? result.partially_satisfied : [],
      mandatory_met: mandatoryMet,
      explanation: typeof result.explanation === 'string' ? result.explanation : 'Score calculé.',
    };
  } catch (error) {
    console.error('Scoring error:', error.message);
    return {
      score: 0,
      satisfied_criteria: [],
      missing_criteria: ['Erreur lors du scoring'],
      partially_satisfied: [],
      mandatory_met: false,
      explanation: 'Erreur lors de l\'appel au service de scoring.',
      error: true,
    };
  }
}
