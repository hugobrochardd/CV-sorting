# JOURNAL.md

---

# Session X — Titre

## 🎯 Objectif

(Ex : Générer l’architecture backend + intégration Mistral)

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
- Ce qui fonctionne : fonctionnalités de base fontionne
- Ce qui ne fonctionne pas : recalcul du score du CV en fonction des acceptations ou des refus (apprentissage continu)

---

## ⚠️ Problèmes rencontrés

- Score trop rigide
- Critères de score trop succint
- Trop peu de critère pour une version finale


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

