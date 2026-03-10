Spécifications fonctionnelles

Projet : Système de tri de CVs avec apprentissage

1. Objectif du système

Construire une application web permettant :
• d’importer des CVs,
• d’extraire automatiquement les informations clés,
• de scorer les candidats selon un profil cible,
• de permettre à un auditeur de valider ou rejeter les candidats,
• d’ajuster dynamiquement le scoring en fonction des décisions prises.

Le système doit être explicable, persistant et maintenable.

2. Acteurs

Auditeur / Recruteur
• Définit le profil recherché
• Importe les CVs
• Consulte les scores
• Valide / rejette des candidats

3. User Stories

3.1 Gestion du profil recherché

US-01 — Définir un profil cible

En tant qu’auditeur,
je veux définir des critères obligatoires et souhaitables,
afin de scorer les CVs selon le poste visé.

Critères d’acceptation :
• Possibilité d’ajouter :
• compétences obligatoires
• compétences souhaitables
• nombre minimal d’années d’expérience
• Les critères sont persistés en base.

3.2 Import et extraction

US-02 — Importer un CV

En tant qu’auditeur,
je veux importer un CV en format texte,
afin qu’il soit analysé automatiquement.

Critères d’acceptation :
• Upload via interface
• Stockage du texte brut en base
• Aucun crash si fichier vide

US-03 — Extraction structurée

En tant que système,
je dois extraire du CV :
• compétences techniques
• années d’expérience
• formation
• type d’environnement (startup, grand groupe…)

Critères d’acceptation :
• Résultat structuré en JSON
• Pas d’invention si information absente
• Données stockées en base

3.3 Scoring

US-04 — Scorer un candidat

En tant qu’auditeur,
je veux obtenir un score basé sur les critères définis,
afin de classer les candidats.

Critères d’acceptation :
• Score numérique (0–100)
• Critères obligatoires éliminatoires
• Justification textuelle détaillée
• Explication vérifiable dans le CV

US-05 — Voir le classement

En tant qu’auditeur,
je veux voir les candidats triés par score,
afin d’identifier rapidement les meilleurs profils.

Critères d’acceptation :
• Liste triée décroissante
• Affichage statut (nouveau / accepté / rejeté)

3.4 Apprentissage via feedback

US-06 — Valider ou rejeter un candidat

En tant qu’auditeur,
je veux pouvoir accepter ou rejeter un candidat,
afin d’affiner le système.

Critères d’acceptation :
• Bouton Accept / Reject
• Décision persistée en base
• Historique des décisions stocké

US-07 — Ajustement du scoring

En tant que système,
je dois intégrer les exemples validés/rejetés
afin d’ajuster les prochains scorings.

Critères d’acceptation :
• Après au moins 2 décisions, le score évolue
• Le changement est explicable
• Les CV similaires aux validés voient leur score augmenter

3.5 Explicabilité

US-08 — Justification détaillée

En tant qu’auditeur,
je veux comprendre pourquoi un candidat a obtenu ce score,
afin de garantir la transparence.

Critères d’acceptation :
• Liste des critères satisfaits
• Liste des critères manquants
• Indication des éléments détectés dans le CV

3.6 Persistance

US-09 — Sauvegarde des données

En tant qu’utilisateur,
je veux retrouver mes candidats et décisions après redémarrage,
afin de ne pas perdre l’historique.

Critères d’acceptation :
• Base SQLite persistante
• Rechargement correct des données

4. Exigences non fonctionnelles
   • Pas de crash si :
   • CV vide
   • API IA indisponible
   • Critères non définis
   • Temps de réponse raisonnable (< 5 secondes)
   • Données structurées valides
   • Code maintenable (architecture claire)

5. Contraintes techniques
   • Frontend : React + Vite
   • Backend : Node.js + Express
   • Base de données : SQLite
   • IA :
   • Extraction structurée
   • Scoring
   • Few-shot learning pour apprentissage

6. Cas limites identifiés
   • CV très court
   • CV très long
   • CV sans compétences techniques
   • Candidat ne respectant aucun critère obligatoire
   • Décisions contradictoires

7. Définition du MVP

Le projet est considéré comme MVP validé si :
• 5 à 10 CV peuvent être importés
• Extraction fonctionne
• Scoring explicable fonctionne
• Feedback modifie le scoring
• Les données persistent
