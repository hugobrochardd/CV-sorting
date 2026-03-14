# JOURNAL.md

---

# Session 1 — Démarrage et premier MVP

## 🎯 Objectif

Générer l’architecture backend + intégration Mistral

## Agent utilisé

Claude Opus 4.6

---

## 💬 Prompt envoyé

PROMPT — Initialisation projet + MVP complet

Tu es un assistant senior full-stack spécialisé en architecture propre, maintenable et explicable.

Tu dois générer un MVP fonctionnel pour le projet suivant :

Projet : Système de tri de CVs avec apprentissage
Stack :
• Frontend : React + Vite
• Backend : Node.js + Express
• Base de données : SQLite
• IA : Mistral API (mistral-medium-latest)

Le projet doit respecter une architecture claire, modulaire et maintenable.

⸻

1️⃣ Contexte métier

Le système doit :
• Permettre de définir un profil recherché (critères obligatoires et souhaitables)
• Permettre d’importer des CVs (texte brut)
• Extraire automatiquement les données clés via Mistral
• Scorer les candidats selon les critères
• Permettre validation / rejet
• Ajuster les scorings futurs via few-shot learning
• Fournir une explication détaillée et vérifiable du score

Deux documents doivent être pris en compte dans la conception :
• AGENT.md → règles de contrôle de l’IA (pas d’invention, JSON strict, explicabilité)
• spec.md → user stories et exigences fonctionnelles

L’architecture doit être alignée avec ces documents.

⸻

2️⃣ Ce que tu dois générer

Tu dois : 1. Créer l’arborescence complète du projet :
• backend/
• frontend/
• services IA
• config SQLite
• routes API
• dossier models
• dossier controllers 2. Générer le code complet minimal mais fonctionnel :
• Initialisation Express
• Connexion SQLite
• Création automatique des tables
• Routes :
• POST /profile
• POST /candidates
• GET /candidates
• POST /candidates/:id/decision
• Services :
• extractCV()
• scoreCandidate() 3. Intégrer Mistral correctement :
• Fichier mistralClient.js
• Utilisation de mistral-medium-latest
• Temperature = 0
• JSON strict
• Gestion try/catch
• Pas de clé en dur
• Lecture depuis process.env.MISTRAL_API_KEY 4. Fournir un .env.example 5. Générer le schéma SQLite :
• profiles
• candidates
• decisions 6. Créer un frontend minimal :
• Formulaire création profil
• Upload CV (textarea)
• Liste candidats avec score
• Boutons Accept / Reject

Pas de design sophistiqué.
Priorité à la logique métier.

⸻

3️⃣ Contraintes strictes
• Ne pas utiliser Prisma.
• Ne pas utiliser d’ORM lourd.
• Utiliser better-sqlite3.
• Séparer extraction et scoring.
• Respecter AGENT.md.
• Le scoring doit être explicable.
• Les critères obligatoires doivent être éliminatoires.
• Le système doit fonctionner même si l’IA échoue (gestion d’erreur propre).
• Pas d’authentification.
• Pas de docker.

⸻

4️⃣ Architecture attendue (obligatoire)

backend/
• app.js
• db.js
• routes/
• controllers/
• services/
• mistralClient.js
• extractCV.js
• scoreCandidate.js
• models/

frontend/
• src/
• pages/
• components/
• api.js

⸻

5️⃣ Important

Ne donne pas uniquement du pseudo-code.

Tu dois générer :
• Code réel
• Prêt à lancer avec :
• npm install
• npm run dev

À la fin, fournir les commandes exactes pour lancer :
• backend
• frontend

⸻

6️⃣ Qualité attendue

Le code doit :
• Être clair
• Être modulaire
• Être compréhensible
• Être cohérent avec le MVP
• Permettre évolution vers version avancée

⸻

Génère maintenant :

1️⃣ L’arborescence complète
2️⃣ Tous les fichiers backend
3️⃣ Tous les fichiers frontend
4️⃣ Le .env.example
5️⃣ Les commandes d’installation

Ne fais aucune explication inutile.
Génère uniquement le code et la structure.

---

## 📤 Résultat

- Ce qui a été généré : Interface Web avec Front fontionnel
- Ce qui fonctionne : fonctionnalités de base fontionnent
- Ce qui ne fonctionne pas : recalcul du score du CV en fonction des acceptations ou des refus (apprentissage continu)

---

## ⚠️ Problèmes rencontrés

- Score trop rigide (seulement des dizaines)
- Critères de score figés qui n'évolue pas à la suite d'une acceptation ou d'un refus (trouver les points communs entre tous les CV rejetés et tous les CV acceptés pour influencer les prochains score)
- Pour l'instant, le CV s'importe avec du texte, le but va être d'upload un fichier CV et qu'il soit analysé puis ses critères ressortis pour être analysé
- Trop peu de critère pour une version finale (pour vrmt bien marché je devrais avoir pas mal de critères)

## 🧪 Tests / Cas limites

- CV vide : Fonctionnel : blocage de la fonctionnalité si CV vide
- Critère obligatoire absent : Critère obligatoire non présent -> perte de point
- API indisponible : Pas testé
- Résultat : Plutot positif pour une première version

---

## 📌 Apprentissage

- Ce que j’ai appris :
  Bien définir les limites de l'agent avec un agent.md et mettre les specs dans un fichier ce qui aide beaucoup l'IA
- Ce que je dois améliorer :
  Lui donner tous les retours que j'ai fait pour lui définir exactement les prochaines amélioration du projet

# Session 2 : Scoring adaptatif réel + robustesse + upload fichier

## 🎯 Objectif

Apprentissage adaptatif + enrichissement des critères

## Agent utilisé

Chat GPT 4.6

---

## 💬 Prompt envoyé

PROMPT — Session 2 : Apprentissage adaptatif + enrichissement des critères

Tu es un architecte backend senior spécialisé en systèmes de scoring adaptatif et explicable.

Le projet existe déjà :
• React + Vite
• Express + SQLite (better-sqlite3)
• Extraction Mistral fonctionnelle
• scoreCandidate.js existant
• Accept / Reject persisté
• Base scoring opérationnel

Problèmes actuels :

❌ Score trop rigide
❌ Pas d’impact réel des décisions
❌ Peu de critères
❌ Plafonnement artificiel

⸻

🎯 OBJECTIF 1. Implémenter un apprentissage adaptatif déterministe 2. Étendre le nombre de critères analysés 3. Rendre le scoring plus fin et progressif 4. Enrichir l’explication

On ne touche pas au frontend.
On modifie uniquement backend scoring + analytics.

⸻

1️⃣ NOUVEAUX CRITÈRES À INTÉGRER

En plus de :
• compétences
• années d’expérience
• formation

Ajouter :
• Stack dominante (frontend / backend / fullstack / devops)
• Type d’entreprise détectée (startup / corporate si présent)
• Niveau estimé (junior / confirmé / senior basé sur expérience)
• Technologies backend spécifiques
• Technologies frontend spécifiques
• DevOps / cloud tools

Le scoring doit prendre en compte ces dimensions.

⸻

2️⃣ ARCHITECTURE À AJOUTER

Créer :

backend/services/analyticsService.js
backend/services/adaptiveScoring.js

Modifier :

backend/services/scoreCandidate.js
backend/controllers/decisionController.js

⸻

3️⃣ ANALYSE HISTORIQUE ENRICHIE

Dans analyticsService.js :

Créer getDecisionAnalytics() qui calcule :
• Fréquence des compétences chez ACCEPTED / REJECTED
• Fréquence stack dominante ACCEPTED / REJECTED
• Fréquence type entreprise ACCEPTED / REJECTED
• Moyenne années expérience ACCEPTED / REJECTED
• Répartition niveau (junior / confirmé / senior)

Retour attendu :

{
acceptedSkillFrequency: {},
rejectedSkillFrequency: {},
acceptedStacks: {},
rejectedStacks: {},
acceptedCompanyTypes: {},
rejectedCompanyTypes: {},
avgExperienceAccepted: 0,
avgExperienceRejected: 0,
levelDistributionAccepted: {},
levelDistributionRejected: {}
}

⸻

4️⃣ SCORING ADAPTATIF MULTI-CRITÈRES

Dans adaptiveScoring.js :

Créer computeAdaptiveAdjustment(candidate, analytics)

Logique :

Pour chaque dimension :

Compétences :
• Bonus si corrélée aux ACCEPTED
• Malus si corrélée aux REJECTED

Stack dominante :
• Bonus si stack majoritaire chez ACCEPTED

Type entreprise :
• Bonus si type majoritaire chez ACCEPTED

Expérience :
• Bonus progressif si > moyenne ACCEPTED

Niveau :
• Bonus si correspond au niveau dominant chez ACCEPTED

Formule finale :

adaptiveScore = Σ (bonus) − Σ (malus)

Score progressif.
Pas de seuil fixe.

⸻

5️⃣ MODIFICATION scoreCandidate.js

FinalScore devient :

finalScore = baseScore + adaptiveScore

Contraintes :
• Borné 0–100
• Critères obligatoires restent éliminatoires
• Plus de plafonnement par paliers fixes
• Pondération fine et graduelle

⸻

6️⃣ RE-CALCUL AUTOMATIQUE

Après chaque Accept / Reject :
• Recalculer score des candidats NEW
• Mettre à jour en base
• Ne pas recalculer inutilement ACCEPTED / REJECTED

⸻

7️⃣ EXPLICATION ENRICHIE OBLIGATOIRE

La justification doit inclure :
• Base score détaillé
• Ajustements adaptatifs par critère
• Facteurs influents détectés

Exemple attendu :

“Bonus +8 : Stack Fullstack dominante chez profils validés
Bonus +5 : React fortement corrélé aux acceptations
Malus -3 : Expérience inférieure à la moyenne des profils validés”

⸻

8️⃣ CONTRAINTES
• Pas de ML externe
• Pas d’IA pour cette partie
• Tout déterministe backend
• Code modulaire
• Pas de refactor global inutile
• Fournir uniquement nouveaux fichiers + fichiers modifiés

⸻

9️⃣ FORMAT DE RÉPONSE

Fournir :

1️⃣ analyticsService.js
2️⃣ adaptiveScoring.js
3️⃣ scoreCandidate.js modifié
4️⃣ decisionController.js modifié
5️⃣ Instructions d’intégration

Pas d’explication longue.
Code prêt à intégrer.

## 📤 Résultat

- Ce qui a été généré : Critères d'acceptation et de refus bien pris en compte dans les CV pas encore review
- Ce qui fonctionne : fonctionnalité demandé fonctionne bien, score plus souple qui rentre dans les unités
- Ce qui ne fonctionne pas : plus de criteres pris en compte dans la note mais pas assez de criteres lors de l'élaboration du profil voulu

## ⚠️ Problèmes rencontrés

- Pas de nouveau critères dans l'établissement du profil

## 🧪 Tests / Cas limites

- Score changeant : fonctionnel
- Plus de critères pris en compte pour le score : fonctionnel
- Plus de critères pour établir le profil : Pas disponible

---

## 📌 Apprentissage

- Ce que j’ai appris :
  Rentrer un peu plus dans le détail pour bien différencier critères pris en compte pour le calcul des score et pcritères défini en amont pour établir le profil qui sont encore corrélés
- Ce que je dois améliorer :
  Rectifier et ajouter le fait que l'on puisse ajouté plus de critères lors de l'établissement du profil + définir l'upload du CV par fichier et non pas par texte

# Session 3 : Redéfinition profil + ajout upload

## 🎯 Objectif

Enrichir la définition du profil (cohérent avec les nouveaux critères backend)
Remplacer textarea par upload PDF propre

## Agent utilisé

Chat GPT 4.6

---

## 💬 Prompt envoyé

Parfait.
Session 3 doit corriger 2 choses ciblées :

1️⃣ Enrichir la définition du profil (cohérent avec les nouveaux critères backend)
2️⃣ Remplacer textarea par upload PDF propre

On fait ça proprement et séparé du scoring.

Voici ton Prompt Session 3 complet, prêt à envoyer.

⸻

PROMPT — Session 3 : Enrichissement profil + Upload PDF propre

Tu es un architecte full-stack senior.

Le projet fonctionne déjà avec :
• React + Vite
• Express + SQLite (better-sqlite3)
• Extraction Mistral
• Scoring adaptatif multi-critères
• Recalcul automatique après Accept / Reject

Problèmes restants :

❌ Les nouveaux critères utilisés dans le scoring ne sont pas configurables lors de la création du profil
❌ Le CV est importé uniquement en texte brut
❌ Pas d’upload fichier PDF

⸻

🎯 OBJECTIFS SESSION 3

1️⃣ Étendre le modèle de profil pour inclure tous les nouveaux critères
2️⃣ Mettre à jour le frontend pour permettre la configuration de ces critères
3️⃣ Implémenter upload PDF sécurisé
4️⃣ Réutiliser le pipeline existant sans casser le scoring

⸻

1️⃣ ÉVOLUTION DU MODÈLE PROFIL

Actuellement le profil contient :
• compétences obligatoires
• compétences souhaitables
• années min

Tu dois étendre le modèle profile pour inclure :
• stackDominante souhaitée (frontend / backend / fullstack / devops)
• typeEntreprise souhaité (startup / corporate / peu importe)
• niveau attendu (junior / confirmé / senior)
• technologiesBackend attendues
• technologiesFrontend attendues
• outilsDevOps attendus
• poids personnalisables par critère (optionnel mais recommandé)

⸻

2️⃣ MODIFICATION BACKEND

Modifier :
• db.js (ajout colonnes ou JSON profileConfig)
• models/profileModel.js
• controllers/profileController.js

Les profils doivent maintenant stocker un objet structuré :

{
requiredSkills: [],
preferredSkills: [],
minExperience: number,
expectedStack: string | null,
expectedCompanyType: string | null,
expectedLevel: string | null,
backendTechnologies: [],
frontendTechnologies: [],
devopsTools: []
}

⚠️ Ne pas casser la compatibilité avec les profils existants.

⸻

3️⃣ MISE À JOUR FRONTEND

Modifier :

frontend/src/pages/ProfilePage.jsx (ou équivalent)

Ajouter champs :
• Select stack dominante
• Select type entreprise
• Select niveau attendu
• Champs dynamiques pour backend tech
• Champs dynamiques pour frontend tech
• Champs dynamiques pour devops tools

Formulaire propre, simple, sans design excessif.

⸻

4️⃣ UPLOAD PDF

Backend :

Installer :

npm install multer pdf-parse

Créer :

backend/routes/uploadRoute.js

Ajouter :

POST /candidates/upload

Logique :
• multer configuration
• max file size : 2MB
• accepter uniquement PDF
• extraire texte avec pdf-parse
• passer le texte au pipeline existant (extractCV + scoreCandidate)

Ne pas dupliquer logique.

⸻

5️⃣ FRONTEND UPLOAD

Remplacer textarea par :

<input type="file" accept=".pdf" />

Envoyer en FormData vers /candidates/upload

Afficher message erreur si :
• Mauvais type fichier
• Fichier trop lourd
• PDF illisible

⸻

6️⃣ CONTRAINTES
• Ne pas refactor tout le projet
• Ne pas casser scoring adaptatif
• Ne pas supprimer ancienne route texte (la garder pour debug)
• Code modulaire
• Fournir uniquement fichiers modifiés + nouveaux fichiers
• Fournir instructions d’intégration

⸻

7️⃣ FORMAT DE RÉPONSE ATTENDU

1️⃣ Fichiers backend modifiés
2️⃣ Nouveau uploadRoute.js
3️⃣ Configuration multer
4️⃣ Modifications frontend
5️⃣ Instructions installation

Pas d’explication longue.
Code prêt à intégrer.

## 📤 Résultat

- Ce qui a été généré : Upload + Critères en plus au niveau du profil
- Ce qui fonctionne : fonctionnalité d'upload + nouveau profil
- Ce qui ne fonctionne pas : X

## ⚠️ Problèmes rencontrés

- J'ai eu quelques problèmes pour relancer le back après les modifications

## 🧪 Tests / Cas limites

- CV Pdf correspondant parfaitement obtiens tjrs un score de 100%
- CV Pdf correspondant partiellement au profil obtient bien un score mitigé (granularité meilleure car plus de critères)

---

## 📌 Apprentissage

- Ce que j’ai appris :
  Si bien prompté, l'IA est capable d'aller me chercher des extensions pour des fonctionnalités dont j'ai besoin (aucune friction)
- Ce que je dois améliorer :
  Maintenant que la fonctionnalité principale marche, je dois maintenant améliorer quelques détails par ci par là :
  De l'UI/UX et l'interface, avec notamment sur l'onglet candidat, séparer la consultations des candidats en fonction de son statut, soit nouveau, soit accepté, soit refusé. De plus, je veux que les scores soit une note sur 100 représentés par un rond qu'il l'entoure et pourquoi pas une couleur qui permettent de vite repéré les profils qui correspondent bcp, moyennement, un peu, pas du tout ect ...
  J'aimerai revoir l'interface pour qu'elle soit plus agréable à utiliser et plus acceuillante.
  Enfin, je veux que il y ait une partie réservé pour la Détection de biais potentiel ("vous avez rejeté tous les profils de X") et les Suggestions de critères ("les profils validés ont souvent Y")

# Session 4 : UX avancée + Visual scoring + Détection biais + Suggestions intelligentes

## 🎯 Objectif

UX avancée + Visual scoring + Détection biais + Suggestions intelligentes

## Agent utilisé

Chat GPT 4.6

---

## 💬 Prompt envoyé

PROMPT — Session 4 : UX avancée + Visual scoring + Détection biais + Suggestions intelligentes

Tu es un architecte full-stack senior orienté produit.

Le projet fonctionne déjà avec :
• React + Vite
• Express + SQLite (better-sqlite3)
• Upload PDF
• Extraction Mistral
• Scoring adaptatif multi-critères
• Profil enrichi
• Recalcul automatique après décision

La logique métier est stable.

⸻

🎯 OBJECTIFS SESSION 4

1️⃣ Améliorer l’UX globale
2️⃣ Séparer les candidats par statut
3️⃣ Implémenter un visual scoring clair et professionnel
4️⃣ Ajouter un module Détection de biais
5️⃣ Ajouter un module Suggestions intelligentes

On ne refactor pas l’architecture existante.
On améliore proprement.

⸻

1️⃣ SEGMENTATION CANDIDATS

Modifier la page Candidats :

Créer 3 onglets :
• NEW
• ACCEPTED
• REJECTED

Chaque onglet doit afficher uniquement les candidats du statut correspondant.

Ne pas dupliquer logique backend.
Utiliser filtre côté frontend via API existante.

⸻

2️⃣ VISUAL SCORING PROFESSIONNEL

Remplacer le score texte “XX/100” par :

Un cercle (progress ring) affichant :
• Score centré
• Arc circulaire proportionnel au score
• Couleur dynamique :

0–39 → Rouge
40–69 → Orange
70–84 → Bleu
85–100 → Vert

Le composant doit être réutilisable :

frontend/src/components/ScoreRing.jsx

Code propre, sans librairie lourde.

⸻

3️⃣ UX AMÉLIORÉE

Améliorer :
• Cartes candidats plus aérées
• Badges propres (Stack, Niveau, Entreprise)
• Animation légère hover
• Mise en évidence critères satisfaits
• Mise en évidence adaptative bonus/malus

Pas de design sophistiqué.
UI sobre, professionnelle.

⸻

4️⃣ DÉTECTION DE BIAIS POTENTIEL

Créer backend/services/biasDetectionService.js

Logique attendue :

Analyser décisions ACCEPTED / REJECTED.

Détecter patterns :
• Tous profils “junior” rejetés ?
• Tous profils “startup” acceptés ?
• Toutes stacks backend rejetées ?

Retourner structure :

{
warnings: [
“Vous avez rejeté 100% des profils Junior”,
“Tous les profils Startup ont été acceptés”
]
}

Créer route :

GET /analytics/bias

Afficher module dans frontend :

Section “Analyse & Biais”

⸻

5️⃣ SUGGESTIONS INTELLIGENTES

Créer backend/services/suggestionService.js

Objectif :

Analyser ACCEPTED :
• Compétences fréquentes
• Stack dominante
• Niveau dominant
• Type entreprise dominant

Retourner :

{
suggestions: [
“Les profils validés ont souvent Docker”,
“La majorité des profils validés sont Fullstack”,
“Le niveau Confirmé est dominant”
]
}

Créer route :

GET /analytics/suggestions

Afficher module frontend sous la section biais.

⸻

6️⃣ CONTRAINTES
• Pas de ML
• Pas d’IA pour cette partie
• Tout déterministe backend
• Ne pas casser scoring
• Code modulaire
• Fournir uniquement nouveaux fichiers + fichiers modifiés
• Fournir instructions intégration

⸻

7️⃣ FORMAT DE RÉPONSE ATTENDU

1️⃣ Nouveaux services backend
2️⃣ Nouvelles routes
3️⃣ Composant ScoreRing.jsx
4️⃣ Modifications CandidatePage.jsx
5️⃣ Instructions intégration

Pas d’explication théorique.
Code prêt à intégrer.

## 📤 Résultat

- Ce qui a été généré : Une interface clean et bien structuré, plus lisible qu'avant
- Ce qui fonctionne :
- Ce qui ne fonctionne pas :

## ⚠️ Problèmes rencontrés

-

## 🧪 Tests / Cas limites

-
-
- ***

## 📌 Apprentissage

- Ce que j’ai appris :
- Ce que je dois améliorer :
