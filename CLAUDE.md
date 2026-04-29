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
- Token API : `9|odHMdkouupQYtyRYivgR8jnWjZBtmlHjCgxNAni030e6fb65`
- App UUID Medusa : `h30215jlpztpg88za92wlpyx`
- Déclencher un redéploiement : `POST https://coolify.nekoapp.fr/api/v1/deploy?uuid=h30215jlpztpg88za92wlpyx`
- Vérifier le statut d'un déploiement : `GET https://coolify.nekoapp.fr/api/v1/deployments/{deployment_uuid}`

## Modèles

### Ad
```
id, owner_id, cat_id, service_type (boarding/visit/housesitting),
start_date, end_date, price_per_night, status (open/matched/confirmed/completed/cancelled → défaut open),
neighborhood (nullable), notes (nullable)
```

### Cat
```
id, name, breed, age, is_medicated, is_anxious, is_kitten, notes (nullable), owner_id
```

### Application
```
id, ad_id, sitter_id, message (nullable), status (pending/accepted/rejected → défaut pending)
```

### Booking
```
id, ad_id, sitter_id, owner_id, status (confirmed/in_progress/completed/cancelled → défaut confirmed),
total_price, platform_fee
```

### Review
```
id, booking_id, reviewer_id, reviewed_id, rating, comment (nullable)
```

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
- `GET/POST /store/ads` — liste (avec filtres `?status=`, `?owner_id=`, `?service_type=`) et création
- `GET /store/ads/:id`
- `POST /store/quick-ads` — création annonce sans inscription (owner + cat + ad en une seule requête)
- Middleware Bearer auth sur POST `/store/sitters` et POST `/store/owners` : `src/api/middlewares.ts`
- `/store/quick-ads` est exempt de middleware auth — gère ses propres CORS manuellement

## Panel admin custom (Extensions)

- Sitters : `src/admin/routes/sitters/page.tsx` → `https://api.nekoapp.fr/app/sitters`
- Propriétaires : `src/admin/routes/owners/page.tsx` → `https://api.nekoapp.fr/app/owners`
- Annonces : `src/admin/routes/ads/page.tsx` → `https://api.nekoapp.fr/app/ads`
- Tous fetchent depuis `/store/*` avec `x-publishable-api-key` en header
- La page Annonces a des boutons de filtre par statut (Ouverte, Matchée, Confirmée, Terminée, Annulée)

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

---

## Problème 4 : Tables custom absentes en prod — `relation "owner" does not exist` (avril 2026)

### Symptôme

POST `/store/quick-ads` → HTTP 500. Erreur réelle (visible après ajout du try/catch) :
`insert into "owner" (...) - relation "owner" does not exist`

### Cause

Les fichiers de migration des modules custom n'avaient jamais été générés ni committés dans le repo. La commande `npx medusa db:migrate` au démarrage ne fait rien s'il n'y a pas de fichiers de migration — elle ne crée pas les tables automatiquement depuis les définitions de modèles.

Les modules Medusa built-in (api_key, auth, etc.) ont leurs migrations dans leurs propres packages npm, donc leurs tables existent. Les modules custom (`owner`, `cat`, `ad`, etc.) n'avaient aucune migration → aucune table.

### Fix

Créer manuellement les fichiers de migration pour chaque module custom dans `src/modules/<module>/migrations/`. Format requis :

```typescript
import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000000_InitOwner extends Migration {
  async up(): Promise<void> {
    this.addSql(`create table if not exists "owner" (
      "id" text not null,
      ...
      constraint "owner_pkey" primary key ("id")
    );`)
  }
  async down(): Promise<void> {
    this.addSql(`drop table if exists "owner";`)
  }
}
```

Migrations créées (toutes dans `src/modules/<module>/migrations/`) :
- `Migration20260101000000_InitOwner.ts`
- `Migration20260101000001_InitCat.ts`
- `Migration20260101000002_InitAd.ts`
- `Migration20260101000003_InitSitter.ts`
- `Migration20260101000004_InitApplication.ts`
- `Migration20260101000005_InitBooking.ts`
- `Migration20260101000006_InitReview.ts`

**À retenir** : Tout nouveau module custom nécessite un fichier de migration avant le déploiement. Utiliser `CREATE TABLE IF NOT EXISTS` pour que la migration soit idempotente.

---

## Problème 5 : `undefined` vs `null` pour les champs nullable (avril 2026)

### Symptôme

Potentiel crash silencieux lors de l'insertion si un champ nullable reçoit `undefined` au lieu de `null`.

### Cause

MikroORM attend `null` pour représenter SQL NULL. Passer `undefined` JavaScript peut provoquer une erreur selon la version de l'ORM.

### Fix

Dans les handlers de routes, toujours passer `null` (pas `undefined`) pour les champs nullable :
```typescript
notes: cat_notes ? String(cat_notes) : null,       // ✓
neighborhood: neighborhood ? String(neighborhood) : null,  // ✓
// pas undefined ✗
```

---

## Bonnes pratiques routes custom

1. **Toujours entourer les appels de service d'un try/catch** et logger `err.message` :
   ```typescript
   } catch (err: any) {
     console.error("[route-name] POST error:", err)
     res.status(500).json({ message: err?.message ?? "Erreur serveur interne" })
   }
   ```
   Sans ça, les 500 sont opaques et impossibles à débugger sans accès aux logs Coolify.

2. **Valider les dates avant insertion** :
   ```typescript
   const parsed = new Date(String(start_date))
   if (isNaN(parsed.getTime())) return res.status(400).json({ message: "Date invalide" })
   ```

---

## Ce qui est fonctionnel en prod

- Inscription sitter → POST `/store/sitters` avec Bearer token
- Inscription owner → POST `/store/owners` avec Bearer token
- Création d'annonce sans inscription → POST `/store/quick-ads` (crée owner + cat + ad en une requête)
- Panel admin : Sitters + Propriétaires + Annonces visibles dans Extensions
- API `/store/sitters`, `/store/owners`, `/store/ads` accessibles publiquement (GET)
- Filtrage des annonces par statut depuis le panel admin

## Ce qui reste à brancher

- Connexion (`connexion.html`)
- Messagerie, réservations
