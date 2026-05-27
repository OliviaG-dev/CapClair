# CapClair

> **Transforme le flou en direction**

CapClair est une application React qui aide a clarifier une situation personnelle, transformer des idees floues en objectifs concrets, puis suivre la progression dans le temps.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)
![LocalStorage](https://img.shields.io/badge/Storage-localStorage-2F80ED)

## Apercu du MVP

Le MVP propose un parcours simple et utile:

1. **Onboarding guide**: questions cles pour clarifier la situation.
2. **Synthese IA simulee**: themes, blocages, motivations et objectifs proposes.
3. **Dashboard**: vision globale des objectifs et progression.
4. **Objectifs**: detail d un objectif, statut, notes de progression.
5. **Journal**: humeur, energie et petites victoires.
6. **Stats**: repartition des objectifs et tendances personnelles.

## Fonctionnalites principales

- Questionnaire multi-etapes avec barre de progression.
- Generation automatique d une synthese et de 3 premiers objectifs.
- Suivi des objectifs (`todo`, `in_progress`, `done`).
- Historique de notes de progression par objectif.
- Journal quotidien (humeur + energie).
- Persistance locale avec `localStorage`.

## Stack technique

- **Frontend**: React + TypeScript
- **Routing**: React Router
- **Build tool**: Vite
- **Qualite**: ESLint
- **State management**: React Context + hooks maison
- **Persist**: localStorage

## Structure du projet

Architecture organisee par responsabilite:

- `src/app/` - point d entree applicatif et routing
- `src/pages/` - pages (Onboarding, Synthese, Dashboard, etc.)
- `src/components/` - composants UI reutilisables
- `src/hooks/` - hooks et provider de state global
- `src/services/` - logique de generation et persistence
- `src/types/` - types TypeScript partages

## Installation

```bash
npm install
```

## Lancer le projet en local

```bash
npm run dev
```

Application disponible ensuite sur l URL affichee par Vite (en general `http://localhost:5173`).

## Scripts utiles

```bash
npm run dev      # lancement en developpement
npm run lint     # verification ESLint
npm run build    # build production (TypeScript + Vite)
npm run preview  # previsualisation du build
```

## Roadmap suggeree

- Connecter une vraie API IA pour la synthese et le coaching.
- Ajouter des tests unitaires/integration sur les flows critiques.
- Ajouter authentification et synchronisation cloud.
- Ajouter une experience mobile encore plus guidee.

---

Si tu veux contribuer au projet, tu peux ouvrir une issue ou proposer une PR avec une amelioration ciblee.
