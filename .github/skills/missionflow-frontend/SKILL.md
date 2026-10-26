Le rapport d'inspection est validé.

Passe maintenant à l'implémentation du frontend.

IMPORTANT :
Le backend existant est considéré comme terminé et validé.
Ne reconstruis pas le backend.
Ne modifie pas le backend sauf si une nécessité technique réelle est démontrée.

Le skill frontend réel est :
.github/skills/missionflow-frontend/SKILL.md

Utilise-le avec :
.github/copilot-instructions.md

## ÉTAPE 1 — INITIALISER LE FRONTEND

Crée l'application Next.js dans le dossier frontend existant.

Stack obligatoire :

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query si nécessaire
- Architecture propre et modulaire

Avant d'installer une dépendance, vérifie qu'elle n'existe pas déjà.

Ne crée pas un deuxième frontend ailleurs dans le repository.

## ÉTAPE 2 — AUTHENTIFICATION

Commence par l'authentification réelle avec le backend existant.

Inspecte une dernière fois les endpoints Auth et leurs DTOs avant de coder.

Implémente :

- Login
- Session
- Access token
- Refresh token
- Logout
- Gestion expiration
- Gestion 401
- Protection des routes
- Redirection vers /login
- Gestion du profil utilisateur

Utilise uniquement les vrais endpoints backend.

Aucune donnée fake.

## ÉTAPE 3 — API CLIENT

Crée un client API centralisé dans le frontend.

Il doit gérer proprement :

- Base URL
- Headers
- Authentification
- Refresh token
- Erreurs HTTP
- JSON
- Gestion 401
- Retry après refresh lorsque nécessaire

Ne mets pas des fetch() différents partout dans les composants.

## ÉTAPE 4 — STRUCTURE FRONTEND

Construis progressivement une architecture similaire à :

frontend/
└── src/
    ├── app/
    │   ├── login/
    │   ├── dashboard/
    │   ├── missions/
    │   ├── notifications/
    │   ├── profile/
    │   ├── admin/
    │   │   ├── users/
    │   │   ├── departments/
    │   │   └── teams/
    │   ├── direction/
    │   ├── rh/
    │   └── reports/
    │
    ├── components/
    │   ├── layout/
    │   ├── navigation/
    │   ├── ui/
    │   ├── missions/
    │   ├── users/
    │   └── forms/
    │
    ├── lib/
    │   ├── api/
    │   ├── auth/
    │   ├── permissions/
    │   └── utils/
    │
    ├── hooks/
    ├── types/
    └── config/

Adapte cette structure au projet réel.
Ne crée pas des dossiers inutiles.

## ÉTAPE 5 — LAYOUT

Après l'authentification, implémente :

- Sidebar desktop
- Navigation mobile
- Header
- Profil utilisateur
- Déconnexion
- Notifications
- Navigation basée sur les rôles
- Breadcrumb lorsque pertinent

L'interface doit être professionnelle, moderne et adaptée à une application B2B.

Langue utilisateur : français.

## ÉTAPE 6 — RBAC FRONTEND

Respecte exactement les rôles backend :

Global :
- ADMIN
- RH
- DIRECTION

Department :
- DIRECTEUR_DEPARTEMENT
- CHEF_EQUIPE
- EMPLOYE

Ne crée aucun autre rôle.

Les permissions frontend servent uniquement à l'UX.

Le backend reste l'autorité de sécurité.

## ÉTAPE 7 — DASHBOARD

Crée un dashboard adapté au rôle connecté.

EMPLOYE :
- Mes missions
- Créer une mission
- Missions en cours
- Notifications

CHEF_EQUIPE :
- Missions à valider
- Missions de son équipe

DIRECTEUR_DEPARTEMENT :
- Missions de son département

DIRECTION :
- Missions à traiter
- Ressources
- Validation finale

RH :
- Missions rejetées

ADMIN :
- Utilisateurs
- Départements
- Équipes
- Reports

N'affiche jamais des informations que l'utilisateur n'est pas autorisé à voir.

## ÉTAPE 8 — MISSIONS

Implémente ensuite :

- Liste missions
- Recherche
- Filtres
- Pagination si supportée
- Création
- Modification des brouillons
- Soumission
- Détail
- Historique
- Statut
- Rejet
- Validation

Utilise les vrais DTOs backend.

Ne devine aucun champ.

Le nombre de jours reste calculé par le backend.

## ÉTAPE 9 — WORKFLOW

Respecte exactement :

DRAFT
→ PENDING_TEAM_LEADER
→ PENDING_DEPARTMENT_DIRECTOR
→ PENDING_DIRECTION
→ APPROVED

Sans équipe :

DRAFT
→ PENDING_DEPARTMENT_DIRECTOR
→ PENDING_DIRECTION
→ APPROVED

Rejet uniquement par :

- CHEF_EQUIPE
- DIRECTEUR_DEPARTEMENT

DIRECTION ne peut pas rejeter.

RH ne peut pas rejeter.

EMPLOYE ne peut pas rejeter.

## ÉTAPE 10 — DIRECTION

Implémente :

- Liste missions à traiter
- Destination
- Départ
- Routing
- Distance
- Durée
- Carte carburant
- Montant carburant
- Hébergement
- Lieu hébergement
- Tickets Pluxee
- Montant Pluxee
- Validation finale

Utilise le résultat OSRM fourni par le backend.

Ne calcule pas de fausse distance dans le frontend.

## ÉTAPE 11 — RH

Créer l'espace RH :

- Missions rejetées
- Motif du rejet
- Rejeté par
- Date du rejet
- Informations mission

Aucun bouton Rejeter.

Aucun bouton Approuver.

## ÉTAPE 12 — ADMIN

Créer :

- Gestion utilisateurs
- Gestion départements
- Gestion équipes

Puis Reports :

- Export missions
- Export utilisateurs

Les exports sont ADMIN uniquement.

## ÉTAPE 13 — NOTIFICATIONS / DOCUMENTS

Implémente ensuite :

- Notifications
- Lecture/non-lue
- Documents
- PDF
- Téléchargement lorsque autorisé

Utilise les endpoints backend existants.

## RÈGLES ABSOLUES

NE PAS :

- recréer le backend
- recréer Prisma
- recréer PostgreSQL
- créer un deuxième API client
- créer des mocks
- créer des données fake
- inventer des endpoints
- inventer des rôles
- inventer des statuts
- utiliser `any`
- connecter directement PostgreSQL depuis Next.js
- déplacer la logique métier backend vers frontend
- créer des fichiers dupliqués

Toujours :

INSPECTER
→ RÉUTILISER
→ IMPLÉMENTER
→ INTÉGRER
→ TESTER
→ REVIEW
→ BUILD

## IMPORTANT

Ne fais pas tout en une seule génération gigantesque.

Travaille par étapes.

Commence maintenant uniquement par :

1. Initialiser correctement le frontend Next.js dans `frontend`
2. Installer/configurer uniquement les dépendances nécessaires
3. Créer le client API centralisé
4. Implémenter l'authentification réelle
5. Créer le layout de base

Ensuite teste cette partie.

Ne passe pas aux missions avant que la base frontend + authentification + layout soit propre et fonctionnelle.

À la fin, donne-moi :

### Modifié
Liste exacte des fichiers créés/modifiés.

### Backend utilisé
Endpoints réellement utilisés.

### Tests
Résultats de lint/typecheck/test/build.

### Problèmes
Erreurs restantes éventuelles.

### Prochaine étape
La prochaine fonctionnalité à implémenter.

Commence maintenant.