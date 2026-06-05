# CapClair

> **Transforme le flou en direction**

CapClair est une application React qui aide a clarifier une situation personnelle, transformer des idees floues en objectifs concrets, puis suivre la progression dans le temps.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)
![LocalStorage](https://img.shields.io/badge/Storage-localStorage-2F80ED)
[![CI](https://github.com/OliviaG-dev/CapClair/actions/workflows/ci.yml/badge.svg)](https://github.com/OliviaG-dev/CapClair/actions/workflows/ci.yml)
[![Vercel Deploy](https://github.com/OliviaG-dev/CapClair/actions/workflows/vercel-deploy.yml/badge.svg)](https://github.com/OliviaG-dev/CapClair/actions/workflows/vercel-deploy.yml)
![Cloudflare Turnstile](https://img.shields.io/badge/Cloudflare_Turnstile-enabled-F38020?logo=cloudflare&logoColor=white)

## Apercu du MVP

Le MVP propose un parcours simple et utile:

1. **Onboarding guide**: questions cles pour clarifier la situation.
2. **Synthese IA**: themes, blocages, motivations et objectifs proposes.
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

## Securite API: Cloudflare Turnstile

CapClair protege la generation de synthese IA avec **Cloudflare Turnstile**.

Turnstile est un mecanisme anti-bot moderne: avant d'appeler l'endpoint `/api/synthesize`,
l'utilisateur doit valider un challenge. Le token recu cote front est ensuite
verifie cote serveur via l'API officielle Cloudflare.

Ce que cela apporte concretement au projet:

- **Reduction des abus automatises** sur l'endpoint de synthese.
- **Protection des couts OpenAI** en limitant les appels malveillants.
- **Renforcement de la securite** en complement du controle d'origine et du rate limiting.
- **Meilleure fiabilite produit**: moins de risques de saturation de l'API par des bots.

Le systeme de protection combine:

- verification Turnstile (preuve humaine),
- validation stricte des payloads,
- rate limiting par IP (local + mode distribue),
- controles d'acces sur l'API de synthese.

## Tests et garantie qualite

CapClair embarque une strategie de tests orientee produit: l'objectif n'est pas seulement de
verifier le code, mais de proteger l'experience utilisateur et la fiabilite business a chaque release.

Ce qui est en place:

- **Tests unitaires (Vitest + Testing Library)** pour valider les composants et la logique critique.
- **Tests E2E (Playwright)** sur le parcours cle `onboarding -> synthese`.
- **Checks CI/CD automatiques**: lint, tests unitaires, build et tests end-to-end.
- **Controles d'accessibilite integres** sur les elements interactifs majeurs (progression et navigation des suggestions).

Valeur "commerciale" apportee:

- **Moins de regressions en production**: les bugs visibles par les utilisateurs sont detectes avant livraison.
- **Experience utilisateur plus stable**: le parcours principal reste fiable meme quand le produit evolue vite.
- **Confiance produit renforcee**: chaque deploiement est valide par des controles automatiques coherents.
- **Reduction des couts de maintenance**: moins de correctifs d'urgence et de temps passe a diagnostiquer des incidents evitable.

## Lancer le projet en local

```bash
npm run dev
```

Application disponible ensuite sur l URL affichee par Vite (en general `http://localhost:5173`).

## Scripts utiles

```bash
npm run dev      # lancement en developpement
npm run lint     # verification ESLint
npm run test     # tests unitaires (Vitest)
npm run test:e2e # tests end-to-end (Playwright)
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
