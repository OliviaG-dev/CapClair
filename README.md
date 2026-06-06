# CapClair

> **Transforme le flou en direction**

CapClair est une application React qui aide à clarifier une situation personnelle, transformer des idées floues en objectifs concrets, puis suivre la progression dans le temps.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)
![LocalStorage](https://img.shields.io/badge/Storage-localStorage-2F80ED)
[![CI](https://github.com/OliviaG-dev/CapClair/actions/workflows/ci.yml/badge.svg)](https://github.com/OliviaG-dev/CapClair/actions/workflows/ci.yml)
[![Vercel Deploy](https://github.com/OliviaG-dev/CapClair/actions/workflows/vercel-deploy.yml/badge.svg)](https://github.com/OliviaG-dev/CapClair/actions/workflows/vercel-deploy.yml)
![Cloudflare Turnstile](https://img.shields.io/badge/Cloudflare_Turnstile-enabled-F38020?logo=cloudflare&logoColor=white)
![Dark Mode](https://img.shields.io/badge/Theme-Light_%2F_Dark-111820)

## Aperçu du MVP

Le MVP propose un parcours simple et utile :

1. **Onboarding guidé** — questions clés pour clarifier la situation, avec suggestions par catégories.
2. **Synthèse IA** — thèmes, blocages, motivations et objectifs proposés (OpenAI + fallback local).
3. **Dashboard** — vision globale des objectifs et progression.
4. **Objectifs** — détail d'un objectif, statut, notes de progression.
5. **Journal** — humeur, énergie et petites victoires.
6. **Stats** — répartition des objectifs et tendances personnelles.

## Fonctionnalités principales

- Questionnaire multi-étapes avec barre de progression et suggestions interactives.
- Génération automatique d'une synthèse et de 3 premiers objectifs via API IA.
- Suivi des objectifs (`todo`, `in_progress`, `done`).
- Historique de notes de progression par objectif.
- Journal quotidien (humeur + énergie).
- Persistance locale avec `localStorage`.
- **Thème clair / sombre** avec bascule depuis le header (préférence système ou choix utilisateur).
- Protection anti-bot sur la génération de synthèse (Cloudflare Turnstile).

## Stack technique

- **Frontend** : React + TypeScript
- **Routing** : React Router
- **Build tool** : Vite
- **Qualité** : ESLint, Vitest, Playwright
- **State management** : React Context + hooks maison
- **Persist** : localStorage
- **API IA** : Vercel Serverless Function (`/api/synthesize`) + OpenAI
- **Sécurité API** : Turnstile, rate limiting, contrôle d'origine
- **Déploiement** : Vercel (preview + production via GitHub Actions)

## Structure du projet

Architecture organisée par responsabilité :

- `src/app/` — point d'entrée applicatif et routing
- `src/pages/` — pages (Onboarding, Synthèse, Dashboard, etc.)
- `src/components/` — composants UI réutilisables
- `src/hooks/` — hooks et provider de state global
- `src/services/` — logique de génération, appels API et persistence
- `src/types/` — types TypeScript partagés
- `src/data/` — contenus statiques (suggestions, navigation, textes coach)
- `api/` — fonctions serverless Vercel (synthèse IA)
- `e2e/` — tests end-to-end Playwright

## Design et thème

L'interface s'appuie sur un système de variables CSS (`--color-surface`, `--color-text`, etc.) pour garantir une cohérence visuelle entre le mode clair et le mode sombre.

- Bascule **Mode clair / Mode sombre** dans le header, à droite du menu.
- Préférence mémorisée dans `localStorage` (`capclair-theme`).
- Détection automatique de la préférence système au premier chargement.
- Toutes les pages (Onboarding, Dashboard, Objectifs, Synthèse, Journal, Stats) adaptent leurs cartes et champs internes au thème actif.

## Installation

```bash
npm install
```

## Sécurité API : Cloudflare Turnstile

CapClair protège la génération de synthèse IA avec **Cloudflare Turnstile**.

Turnstile est un mécanisme anti-bot moderne : avant d'appeler l'endpoint `/api/synthesize`,
l'utilisateur doit valider un challenge. Le token reçu côté front est ensuite
vérifié côté serveur via l'API officielle Cloudflare.

Ce que cela apporte concrètement au projet :

- **Réduction des abus automatisés** sur l'endpoint de synthèse.
- **Protection des coûts OpenAI** en limitant les appels malveillants.
- **Renforcement de la sécurité** en complément du contrôle d'origine et du rate limiting.
- **Meilleure fiabilité produit** : moins de risques de saturation de l'API par des bots.

Le système de protection combine :

- vérification Turnstile (preuve humaine),
- validation stricte des payloads,
- rate limiting par IP (local + mode distribué Upstash),
- contrôles d'accès sur l'API de synthèse.

## Tests et garantie qualité

CapClair embarque une stratégie de tests orientée produit : l'objectif n'est pas seulement de
vérifier le code, mais de protéger l'expérience utilisateur et la fiabilité business à chaque release.

Ce qui est en place :

- **Tests unitaires (Vitest + Testing Library)** — composants, hooks, services et logique critique.
- **Couverture de code** — seuils configurés via `test:coverage`.
- **Tests E2E (Playwright)** — parcours clé `onboarding → synthèse` et contrôles d'accessibilité.
- **Checks CI/CD automatiques** — lint, tests unitaires avec couverture, build et tests end-to-end.
- **Contrôles d'accessibilité intégrés** — barre de progression, onglets de suggestions, navigation.

Valeur apportée :

- **Moins de régressions en production** — les bugs visibles par les utilisateurs sont détectés avant livraison.
- **Expérience utilisateur plus stable** — le parcours principal reste fiable même quand le produit évolue vite.
- **Confiance produit renforcée** — chaque déploiement est validé par des contrôles automatiques cohérents.
- **Réduction des coûts de maintenance** — moins de correctifs d'urgence et de temps passé à diagnostiquer des incidents évitables.

## Lancer le projet en local

```bash
npm run dev
```

Application disponible ensuite sur l'URL affichée par Vite (en général `http://localhost:5173`).

> Pour tester la synthèse IA en local, configure les variables d'environnement nécessaires dans Vercel ou via un fichier `.env.local` (OpenAI, Turnstile, rate limiting). Sans configuration, l'application utilise un fallback local.

## Scripts utiles

```bash
npm run dev            # lancement en développement
npm run lint           # vérification ESLint
npm run test           # tests unitaires (Vitest)
npm run test:watch     # tests unitaires en mode watch
npm run test:coverage  # tests unitaires avec couverture
npm run test:e2e       # tests end-to-end (Playwright)
npm run test:e2e:ui    # tests E2E avec interface Playwright
npm run build          # build production (TypeScript + Vite)
npm run preview        # prévisualisation du build
```

## Roadmap suggérée

- Authentification et synchronisation cloud multi-appareils.
- Notifications et rappels pour ancrer les micro-actions.
- Export PDF ou partage de synthèse.
- Tableau de bord analytique avancé (tendances sur plusieurs semaines).
- Application mobile ou PWA avec expérience encore plus guidée.

---

Si tu veux contribuer au projet, tu peux ouvrir une issue ou proposer une PR avec une amélioration ciblée.
