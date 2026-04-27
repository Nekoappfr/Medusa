# Neko Backend — Medusa v2

Repo : `https://github.com/Nekoappfr/Medusa`
API prod : `https://api.nekoapp.fr`
Admin prod : `https://api.nekoapp.fr/app`
Identifiants admin : `neko.app@proton.me` (mdp dans Coolify env)

## Modules custom

`owner`, `sitter`, `cat`, `ad`, `application`, `booking`, `review` — tous dans `src/modules/`.
Tous enregistrés dans `medusa-config.ts`.

## Clés & config

- Publishable API key : `pk_02454d6725796fc4e706310bac6cba7f5ca2c46ea493b61b70e700fac788247d`
- `STORE_CORS` / `AUTH_CORS` = `https://nekoapp.fr` (configurés dans Coolify)

## Coolify

- URL panel : `https://coolify.nekoapp.fr`
- Token API : `7|MbVLOVa0mYW3LAdWTA12FuteYa7hGhhhTlPbICdw47a4de30`
- App UUID Medusa : `h30215jlpztpg88za92wlpyx`
- Déclencher un redéploiement : `GET https://coolify.nekoapp.fr/api/v1/deploy?uuid=h30215jlpztpg88za92wlpyx`

## Modèles

### Sitter
```
id, user_id (nullable), email, first_name (nullable), last_name (nullable), phone (nullable),
bio (nullable), profile_type (student/teenager/traveler), service_types[], tags[] (obligatoire → [] par défaut),
city, neighborhood (nullable), arrondissement (nullable), is_available, is_expert,
rating, review_count, price_per_night, years_experience, completed_bookings, color_tint (nullable)
```

### Owner
```
id, user_id (nullable), email, first_name (nullable), last_name (nullable),
phone (nullable), arrondissement (nullable)
```

## API store

- `GET/POST /store/sitters` — liste et création sitters
- `GET /store/sitters/:id`
- `GET/POST /store/owners` — liste et création owners
- Middleware Bearer auth sur POST `/store/sitters` et POST `/store/owners` : `src/api/middlewares.ts`

## Panel admin custom (Extensions)

- Sitters : `src/admin/routes/sitters/page.tsx` → `https://api.nekoapp.fr/app/sitters`
- Propriétaires : `src/admin/routes/owners/page.tsx` → `https://api.nekoapp.fr/app/owners`
- Les deux fetchent depuis `/store/*` avec `x-publishable-api-key` en header

---

## Problèmes Docker résolus (avril 2026) — LIRE AVANT TOUTE MODIF DOCKERFILE

### Problème 1 : Windows node_modules copiés dans le container Linux

**Symptôme** : `medusa build` échouait silencieusement en prod, admin non buildé, server crashait.

**Cause** : Pas de `.dockerignore`. `COPY . .` dans le Dockerfile copiait les `node_modules/` Windows (compilés pour win32) par-dessus les `node_modules/` Linux installés par `npm install`. Les binaires Windows ne s'exécutent pas sur Linux.

**Fix** : `.dockerignore` créé à la racine du repo, excluant `node_modules/`, `.medusa/`, `.git/`.

---

### Problème 2 : `Cannot find module '/app/.medusa/server/index.js'`

**Symptôme** : Docker build OK, migrations OK, puis crash : `Error: Cannot find module '/app/.medusa/server/index.js'`.

**Cause** : `npx medusa build` ne génère PAS de `index.js` à la racine de `.medusa/server/`. La structure réelle est `.medusa/server/src/`, `.medusa/server/public/admin/`, etc. La CMD `node /app/.medusa/server/index.js` ne pointe vers rien.

**Fix** : Utiliser `npx medusa start` à la place de `node index.js`.

---

### Problème 3 : `Could not find index.html in the admin build directory`

**Symptôme** : Migrations OK, "Creating server" apparaît, puis crash : `Could not find index.html in the admin build directory`.

**Cause** : `npx medusa start` utilise `process.cwd()` pour construire le chemin vers l'admin. Lancé depuis `/app`, il cherche `/app/public/admin/index.html`. Mais `medusa build` génère l'admin dans `/app/.medusa/server/public/admin/index.html`. Ces chemins ne correspondent pas.

**Fix** : Lancer `npx medusa start` depuis `/app/.medusa/server/` :
```dockerfile
CMD npx medusa db:migrate && cd /app/.medusa/server && npx medusa start
```
Depuis `.medusa/server/`, `process.cwd()` = `/app/.medusa/server/`, donc le chemin vers `public/admin/` est correct. Node résout les `node_modules` en remontant jusqu'à `/app/node_modules/` automatiquement.

---

## Dockerfile actuel (fonctionnel)

```dockerfile
FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN npx medusa build

RUN test -f /app/.medusa/server/public/admin/index.html || (echo "ERROR: admin index.html missing" && exit 1)

EXPOSE 9000

CMD npx medusa db:migrate && cd /app/.medusa/server && npx medusa start
```

Points clés :
- `npm install --include=dev` car vite/react/typescript sont nécessaires au build admin
- Le `test -f` fait échouer le build Docker si l'admin n'a pas été compilé (évite un crash silencieux en prod)
- Les migrations tournent depuis `/app` (où se trouve `medusa-config.ts`)
- Le serveur démarre depuis `/app/.medusa/server` (chemin admin correct)

---

## Ce qui est fonctionnel en prod

- Inscription sitter → POST `/store/sitters` avec Bearer token
- Inscription owner → POST `/store/owners` avec Bearer token
- Panel admin : Sitters + Propriétaires visibles dans Extensions
- API `/store/sitters` et `/store/owners` accessibles publiquement (GET)

## Ce qui reste à brancher

- Connexion (`connexion.html`)
- Création d'annonce (`creer-annonce.html`)
- Messagerie, réservations
