# RELEASE_PLAN.md — 30 Alphas → MVP

> **Philosophie :** chaque alpha teste une hypothèse précise, livre un incrément visible, et se boucle en quelques jours.
> Le MVP est atteint après A30 — pas avant.

---

## Principes non négociables

1. **Une alpha = une hypothèse** à valider (pas un sprint fourre-tout)
2. **Livrable réel** : chaque alpha doit être déployable et testable par au moins un utilisateur
3. **Pas de régression** : les alphas précédentes restent stables
4. **Checklist CLAUDE.md** respectée sur chaque PR (tenantId, typage strict, pas de logique fiscale côté Next)
5. **Convention de branche** : `alpha/AXX-slug` → merge dans `main` avec tag `vAXX`

---

## Vue d'ensemble

| # | Alpha | Couche | Hypothèse testée |
|---|-------|--------|-----------------|
| A01 | Boot & tenants | 🏗️ Fondations | Le modèle multi-tenant org/entreprise couvre nos cas |
| A02 | Users & rôles de base | 🏗️ Fondations | L'intégration Clerk → user interne est suffisante |
| A03 | Entreprises & périodes fiscales | 🏗️ Fondations | Le modèle de période fiscale est juste |
| A04 | Employés & contrats | 💰 Paie | La structure de contrat couvre les PME gabonaises |
| A05 | Paie mensuelle simple | 💰 Paie | L'UX de saisie paie est adoptable |
| A06 | Cotisations sociales v0 | 💰 Paie | Les règles CNSS/CNAMGS sont implémentables |
| A07 | Obligations DGI v0 | 💰 Paie | L'agrégation paie → obligations est correcte |
| A08 | Dashboard obligations v0 | 💰 Paie | "Ce mois-ci à payer" est clair en < 3 secondes |
| A09 | Rappels & notifications v0 | 💰 Paie | Les rappels réduisent les retards de déclaration |
| A10 | Export CSV déclaratif v0 | 💰 Paie | Un CSV suffit aux comptables comme pont déclaratif |
| A11 | Upload documents v0 | 📄 Documents | Le pattern signed URL R2 fonctionne en prod |
| A12 | Viewer PDF & pièces | 📄 Documents | Le viewer intégré remplace l'email de pièces |
| A13 | OCR pipeline v0 | 📄 Documents | Le pipeline async Mistral OCR est fiable |
| A14 | Extraction bulletins v0 | 📄 Documents | L'extraction champs bulletins est assez précise |
| A15 | Validation OCR & corrections | 📄 Documents | La validation humaine est rapide et non bloquante |
| A16 | Journal SYSCOHADA v0 | 📒 Comptabilité | Les écritures générées sont utilisables par un expert |
| A17 | Logs d'audit v0 | 🔒 Conformité | L'audit trail convainc lors d'un contrôle fiscal |
| A18 | Rapprochement manuel v0 | 🔒 Conformité | Le matching manuel est viable pour une PME |
| A19 | Rapprochement assisté v1 | 🔒 Conformité | Les propositions auto accélèrent le rapprochement |
| A20 | Historique déclarations v0 | 🔒 Conformité | La timeline rassure PME et cabinet |
| A21 | Règles fiscales versionnées v0 | ⚙️ Moteur | Le YAML de règles est maintenable sans dev |
| A22 | Simulation changements de règles | ⚙️ Moteur | La simulation aide à anticiper les changements de taux |
| A23 | Workflow DUS v0 | 🇬🇦 Gabon | Le flux DUS bout-en-bout est le wedge gabonais |
| A24 | Onboarding PME guidé | 🚀 Adoption | L'onboarding réduit le time-to-value < 1 heure |
| A25 | Onboarding cabinet v0 | 🚀 Adoption | Le cabinet est un canal de distribution viable |
| A26 | Rôles & permissions avancées | 🔐 RBAC | Le RBAC couvre les cas cabinet + PME |
| A27 | Rapport mensuel PDF v0 | 📊 Reporting | Le rapport PDF devient l'objet d'échange principal |
| A28 | Alertes anomalies v0 | 📊 Reporting | Les alertes proactives créent de la valeur perçue |
| A29 | Préparation multi-pays v0 | 🌍 Expansion | Le refactor multi-pays ne casse rien |
| A30 | Alpha MVP-ready | 🏁 Stabilisation | La plateforme est prête pour un pilote client réel |

---

## 🏗️ Couche 1 — Fondations (A01–A03)

### A01 — Boot & tenants

**Hypothèse :** Le modèle multi-tenant org / entreprise couvre tous nos personas.

**Features**
- Création d'une organisation (cabinet ou PME directe)
- Création d'une entreprise dans une organisation
- Page `/status` : ping DB (Neon), R2, Mistral, Trigger.dev

**Schéma Prisma clé**
```prisma
model Organization { id, name, slug, createdAt }
model Company { id, orgId, name, nif, country, currency, createdAt }
```

**Critères de validation (Definition of Done)**
- [ ] Une org peut contenir N entreprises
- [ ] La page status retourne 200 avec état de chaque service
- [ ] Toute ressource créée a `orgId` ET `companyId`

---

### A02 — Users & rôles de base

**Hypothèse :** Le mapping Clerk → user interne est suffisant pour démarrer.

**Features**
- Webhook Clerk → création `InternalUser` (clerkUserId, email, name)
- Rôles : `ORG_OWNER`, `ORG_MEMBER`
- Invitation d'un membre par l'owner

**Logique métier**
- Un `ORG_OWNER` voit toutes les entreprises de son org
- Un `ORG_MEMBER` idem (pas encore de restriction par entreprise)
- Pas de RBAC fin : c'est l'objet de A26

**Critères de validation**
- [ ] Login via Clerk crée automatiquement l'user interne si inexistant
- [ ] L'owner peut inviter un membre (email)
- [ ] Guards NestJS rejettent les requêtes sans JWT valide

---

### A03 — Entreprises & périodes fiscales

**Hypothèse :** Le modèle de période fiscale mensuelle est adapté aux obligations CEMAC.

**Features**
- Fiche entreprise complète : raison sociale, NIF, numéros CNSS/CNAMGS, pays, devise
- Périodes fiscales mensuelles : `{ year, month, status: open | locked }`
- Auto-création de la période courante à l'onboarding

**Logique métier**
- Les obligations se calculent toujours dans le contexte d'une `FiscalPeriod`
- Période `locked` = modification de paie/obligations interdite
- Seul un `ORG_OWNER` ou `ORG_ADMIN` peut verrouiller une période

**Critères de validation**
- [ ] Impossible de modifier une paie sur une période locked
- [ ] La période courante est créée automatiquement si inexistante
- [ ] `companyId + year + month` est une contrainte d'unicité

---

## 💰 Couche 2 — Paie & obligations (A04–A10)

### A04 — Employés & contrats

**Hypothèse :** La structure de contrat couvre les PME gabonaises (CDI, CDD, journalier).

**Features**
- CRUD employé : identité, matricule, type de contrat
- Contrat actif : salaire brut, date début/fin, fréquence paie
- Historique des contrats (1 actif à la fois)

**Logique métier**
- `Contract.isActive` = vrai si `startDate <= now <= endDate` (ou pas de `endDate`)
- Les calculs de paie se basent toujours sur le contrat actif à la date de la période

**Critères de validation**
- [ ] Un employé avec deux contrats : seul l'actif est utilisé pour les calculs
- [ ] Fin de contrat = désactivation automatique

---

### A05 — Paie mensuelle simple

**Hypothèse :** L'UX de saisie de paie est adoptable par une PME non comptable.

**Features**
- Saisie des salaires bruts par employé pour la période
- Calcul net simple : brut – retenue forfaitaire configurable
- Vue récap paie de la période (liste + totaux)

**Logique métier**
- Pas encore de règles officielles CNSS/CNAMGS (A06)
- Valide le modèle de données et l'UX de saisie
- `Payslip { employeeId, periodId, grossSalary, netSalary, status }`

**Critères de validation**
- [ ] Saisie masse pour N employés en < 2 minutes (UX)
- [ ] Recalcul automatique si le contrat change
- [ ] Verrouillage impossible si paie incomplète

---

### A06 — Cotisations sociales v0 (Gabon simplifié)

**Hypothèse :** Les premiers taux CNSS/CNAMGS sont implémentables et corrects.

**Features**
- Taux de cotisations employeur/salarié pour CNSS et CNAMGS
- Calcul des cotisations par employé × période
- Affichage sur le bulletin : brut → cotisations → net

**Logique métier**
- Règles isolées dans `tax-engine/social/gabon` (pas hardcodées dans les services)
- Chaque règle porte : taux, plafond mensuel, source légale, date d'effet
- Ces règles migreront en YAML versionné à A21

> ⚠️ **TODO règles à confirmer :** taux CNSS employeur/salarié, plafond CNAMGS — vérifier sur textes officiels DGI/CNSS Gabon avant merge.

**Critères de validation**
- [ ] Calcul CNSS et CNAMGS aligné sur référence légale (source citée dans le code)
- [ ] Tests unitaires sur le module `tax-engine/social`

---

### A07 — Obligations DGI v0

**Hypothèse :** L'agrégation paie + cotisations → obligations est modélisée correctement.

**Features**
- Création automatique de 3 obligations par période : `DGI`, `CNSS`, `CNAMGS`
- Calcul du montant dû par agrégation de la paie de la période
- Statuts : `pending`, `paid`, `overdue`

**Logique métier**
- `Obligation { companyId, periodId, type, amount, dueDate, status }`
- Le calcul est déclenché manuellement (bouton) ou automatiquement à la clôture de paie
- Montant DGI = IRPP retenu à la source (simplifié au départ)

> ⚠️ **TODO :** formule IRPP Gabon à confirmer — structure tauxée ou forfaitaire selon tranches.

**Critères de validation**
- [ ] 1 entreprise × 1 période → exactement 3 obligations créées
- [ ] Recalcul si la paie est modifiée et la période encore ouverte

---

### A08 — Dashboard obligations v0

**Hypothèse :** L'utilisateur sait en < 3 secondes quoi faire ce mois-ci.

**Features**
- Vue principale post-login : obligations du mois courant par entreprise
- Indicateurs : montant total, statut (à payer / payé / en retard)
- Filtre par entreprise + navigation entre périodes

**UX**
- Vert = payé · Orange = à payer · Rouge = en retard
- CTA direct : "Marquer comme payé" + attacher une preuve (A11)

**Critères de validation**
- [ ] Chargement < 1 s pour une org avec 10 entreprises
- [ ] Les 3 obligations sont visibles sans scroll sur desktop

---

### A09 — Rappels & notifications v0

**Hypothèse :** Les rappels automatiques réduisent les retards de déclaration.

**Features**
- Configuration des dates limites par type d'obligation (DGI le 15, CNSS le 20…)
- Jobs Trigger.dev : rappels à J-7, J-2, J+1 (retard)
- Notification in-app + email

**Logique métier**
- `NotificationRule { obligationType, daysBefore, channel }`
- J+1 sans paiement = statut `overdue` + alerte rouge

**Critères de validation**
- [ ] Job Trigger.dev planifié et exécuté aux bonnes dates
- [ ] Email reçu avec les bons montants et dates

---

### A10 — Export CSV déclaratif v0

**Hypothèse :** Un CSV bien structuré suffit aux comptables comme pont déclaratif.

**Features**
- Export CSV paie + synthèse obligations par période
- Colonnes : employé, brut, cotisations salarié/employeur, net, IRPP
- Téléchargement depuis le dashboard

**Logique métier**
- Ce CSV est la "bouée de secours" pour les early adopters sans intégration portail
- Format pensé pour être importé dans un tableur ou porté à la DGI/CNSS manuellement

**Critères de validation**
- [ ] CSV ouvrable sans erreur dans Excel et LibreOffice
- [ ] Totaux cohérents avec le dashboard

---

## 📄 Couche 3 — Documents & OCR (A11–A15)

### A11 — Upload documents v0

**Hypothèse :** Le pattern signed URL → R2 fonctionne de bout en bout en prod.

**Features**
- Upload direct client → R2 via signed URL (PDF, images)
- NestJS reçoit uniquement les métadonnées : type, entreprise, période, nom fichier
- Listing des documents par entreprise/période

**Logique métier**
- `Document { id, companyId, periodId, type, r2Key, ocrStatus: none }`
- Types : `payslip`, `receipt`, `invoice`, `other`
- NestJS ne transporte **jamais** le binaire

**Critères de validation**
- [ ] Upload de 10 Mo réussi sans passer par l'API NestJS
- [ ] Metadata correctement créée côté DB après upload

---

### A12 — Viewer PDF & pièces

**Hypothèse :** Un viewer intégré remplace l'email de pièces justificatives.

**Features**
- Viewer PDF intégré (URL signée R2, accès temporaire)
- Liste des pièces par obligation (preuve de paiement, quittance…)
- Attacher un document à une obligation existante

**Logique métier**
- URL signée générée côté NestJS (expirée en 15 min)
- 1 obligation `paid` devrait avoir ≥ 1 document de preuve (contrainte souple)

**Critères de validation**
- [ ] PDF visible sans téléchargement
- [ ] URL expirée après 15 min → 403

---

### A13 — OCR pipeline v0

**Hypothèse :** Le pipeline async Mistral OCR via Trigger.dev est fiable et scalable.

**Features**
- Déclenchement OCR sur un document (type `payslip` pour commencer)
- Job Trigger.dev → appel Mistral OCR → stockage JSON brut
- Statut `ocrStatus` : `none → pending → processed | failed`

**Logique métier**
- Jamais d'appel OCR synchrone dans une requête HTTP
- Stocker : fichier brut + JSON OCR + version modèle + score confiance
- Retry automatique (max 3) en cas d'échec Mistral

**Critères de validation**
- [ ] Job planifié < 2 s après upload
- [ ] Statut `processed` visible dans l'UI après traitement
- [ ] Retry fonctionnel sur échec simulé

---

### A14 — Extraction bulletins v0

**Hypothèse :** L'extraction automatique des champs de bulletins est assez précise pour aider la saisie.

**Features**
- Mapping JSON OCR → `ExtractedPayslip { name, grossSalary, netSalary, period, number }`
- Vue split : PDF à gauche, champs extraits à droite
- Indicateur de confiance par champ

**Logique métier**
- Distinction nette : `ocrRaw` (JSON Mistral) ≠ `extractedData` (schéma interne) ≠ `validatedData` (A15)
- Pas de propagation automatique vers la paie : aide à la saisie uniquement

**Critères de validation**
- [ ] Taux d'extraction correct > 80 % sur un échantillon de 10 bulletins
- [ ] Les champs extraits sont visibles < 5 s après le statut `processed`

---

### A15 — Validation OCR & corrections

**Hypothèse :** La validation humaine est rapide (< 1 min par bulletin) et non bloquante.

**Features**
- Écran de validation : corriger les champs extraits et confirmer
- Validation → création ou mise à jour de la paie pour l'employé
- Historisation des corrections (champ modifié, valeur avant/après)

**Logique métier**
- Après validation, la paie est considérée "fiable" pour la période
- Les corrections sont loguées pour améliorer les prompts OCR
- Un bulletin validé ne peut plus être modifié sans action explicite de déverrouillage

**Critères de validation**
- [ ] Validation d'un bulletin en < 1 min (test utilisateur)
- [ ] Les corrections sont persistées dans `AuditLog`

---

## 📒 Couche 4 — Comptabilité & conformité (A16–A20)

### A16 — Journal SYSCOHADA v0

**Hypothèse :** Les écritures générées automatiquement sont utilisables par un expert-comptable.

**Features**
- Génération d'écritures comptables issues de la paie (charges personnel + cotisations)
- Comptes SYSCOHADA : 661 (salaires), 663 (cotisations), 422/431/432 (passifs sociaux)
- Export CSV du journal mensuel

**Logique métier**
- 1 période = 1 écriture de synthèse par type (pas de détail par employé au départ)
- Comptes utilisés documentés dans `/packages/tax-rules/syscohada/`
- Aucune écriture automatique sans validation de la paie (A15)

> ⚠️ **TODO :** faire valider le mapping de comptes par un expert-comptable OHADA.

**Critères de validation**
- [ ] Journal équilibré (débit = crédit) pour une période de test
- [ ] Export CSV conforme à la présentation journal SYSCOHADA

---

### A17 — Logs d'audit v0

**Hypothèse :** L'audit trail convainc lors d'un contrôle fiscal simulé.

**Features**
- Table `AuditLog { id, userId, action, entityType, entityId, before, after, timestamp }`
- Journalisation sur : modification paie, validation OCR, changement statut obligation, lock période
- Vue audit par entreprise/période (filtrable)

**Logique métier**
- L'audit est **non répudiable** : jamais de suppression de ligne
- Implémenté via `AuditInterceptor` NestJS sur tous les endpoints de mutation sensibles
- Lisible par PME et cabinet pour justifier les chiffres

**Critères de validation**
- [ ] Toute modification de paie crée une ligne d'audit avec before/after
- [ ] Vue audit chargée en < 2 s pour 1 000 entrées

---

### A18 — Rapprochement manuel v0

**Hypothèse :** Le matching manuel bancaire ↔ obligations est viable pour une PME.

**Features**
- Import CSV de relevé bancaire ou mobile money
- UI pour associer lignes de relevé ↔ obligations payées
- Gestion des écarts (justifiés / non justifiés)

**Logique métier**
- `BankLine { id, date, amount, label, matchedObligationIds[] }`
- 1 ligne peut couvrir N obligations (et inversement)
- Rapprochement clôturé = obligation passe en `paid`

**Critères de validation**
- [ ] Import CSV de 50 lignes sans erreur
- [ ] Matching manuel mis à jour dans l'audit log

---

### A19 — Rapprochement assisté v1

**Hypothèse :** Les propositions automatiques accélèrent le rapprochement de 50 %.

**Features**
- Matching automatique : montant ±5 %, date ±3 jours, libellé contenant l'administration
- Score de confiance et tri par pertinence
- Validation humaine obligatoire avant clôture

**Logique métier**
- Le système ne clôt **jamais** un rapprochement sans action utilisateur
- Les cas ambigus sont mis en évidence pour traitement prioritaire

**Critères de validation**
- [ ] Precision > 70 % sur un jeu de données test (10 obligations × 15 lignes bancaires)
- [ ] Aucune clôture automatique sans confirmation

---

### A20 — Historique déclarations v0

**Hypothèse :** La timeline rassure la PME et le cabinet lors d'un audit.

**Features**
- Timeline par entreprise : déclarations, paiements, documents, qui a fait quoi et quand
- Filtres : administration, période, statut
- Export PDF de l'historique pour une période

**Logique métier**
- C'est la "preuve de bonne foi" : reconstituer l'historique en < 2 clics
- S'appuie sur `AuditLog` (A17) + obligations + documents

**Critères de validation**
- [ ] Historique complet d'une PME sur 6 mois affiché correctement
- [ ] Export PDF lisible et professionnel

---

## ⚙️ Couche 5 — Moteur de règles (A21–A22)

### A21 — Règles fiscales versionnées v0

**Hypothèse :** Le format YAML de règles est maintenable sans compétences dev.

**Features**
- Structure YAML : `country / administration / period / rules[]`
- Champs par règle : `id`, `type`, `rate`, `ceiling`, `source`, `effectiveFrom`, `effectiveTo`
- CLI ou UI simple pour lister les versions actives

**Structure type**
```yaml
country: GA
administration: CNSS
effectiveFrom: "2024-01-01"
rules:
  - id: cnss_employee_rate
    type: percentage
    base: grossSalary
    rate: 0.025
    ceiling: 1_500_000
    source: "Décret n° 2023-XXX, art. 12"
```

**Logique métier**
- Toute obligation calculée porte une référence à la version de règle utilisée
- Activation d'une nouvelle version = action explicite (pas de déploiement silencieux)

**Critères de validation**
- [ ] Migration des règles hardcodées (A06, A07) vers YAML sans changement de résultats
- [ ] Chaque obligation créée porte l'`id` de la version de règle

---

### A22 — Simulation de changements de règles

**Hypothèse :** La simulation aide les PME à anticiper l'impact d'un changement de taux.

**Features**
- Simulateur : "Si taux CNSS passe de X % à Y %, impact sur la période M ?"
- Comparaison avant/après : montants obligations, net employé, coût employeur
- Aucun impact sur les obligations réelles tant que la version n'est pas activée

**Logique métier**
- La simulation s'exécute en mémoire, sans persister de données
- Résultat affiché comme "simulation — non officielle"

**Critères de validation**
- [ ] Simulation et réalité ne peuvent pas être confondues (label explicite, pas de persistance)
- [ ] Résultat cohérent avec le calcul réel après activation de la nouvelle version

---

## 🇬🇦 Couche 6 — Workflow DUS & adoption (A23–A25)

### A23 — Workflow DUS v0

**Hypothèse :** Le flux DUS bout-en-bout est le wedge gabonais qui génère de l'adoption.

**Features**
- Assistant pas-à-pas : paie validée → génération export DUS
- Vérification de complétude : champs manquants mis en évidence
- Export au format attendu ou proche de Gabon Connect

**Logique métier**
- Tous les champs DUS requis doivent être présents ou signalés manquants (pas de déclaration partielle silencieuse)
- Cette alpha formalise le wedge : PME qui fait sa DUS sans sortir de la plateforme

> ⚠️ **TODO :** vérifier le format exact d'export DUS Gabon Connect — se procurer la documentation DGI/CNSS officielle.

**Critères de validation**
- [ ] Un utilisateur non comptable complète le workflow en < 30 min (test utilisateur)
- [ ] Tous les champs manquants sont signalés avant génération

---

### A24 — Onboarding PME guidé

**Hypothèse :** Un onboarding guidé réduit le time-to-value à moins d'1 heure.

**Features**
- Wizard : créer entreprise → ajouter employés → définir période → importer bulletins
- Checklist de complétion avec progression visuelle
- Email de bienvenue avec prochaines étapes

**Logique métier**
- L'onboarding vise : 1er calcul d'obligation + 1ère DUS simulée dès la première session
- Pas de wizard bloquant : l'utilisateur peut quitter et reprendre

**Critères de validation**
- [ ] Time-to-value < 1 h (test utilisateur avec une PME réelle)
- [ ] Taux de complétion du wizard > 70 %

---

### A25 — Onboarding cabinet v0

**Hypothèse :** Le cabinet est un canal de distribution qui multiplie l'adoption.

**Features**
- Vue "cabinet" : liste de tous les dossiers PME de l'organisation
- Création d'un nouveau dossier PME depuis l'espace cabinet
- Accès rapide aux obligations en retard pour tous les dossiers

**Logique métier**
- Un cabinet peut gérer N entreprises sans friction de switching
- La vue cabinet devient l'écran principal post-login pour le persona `ORG_OWNER` cabinet

**Critères de validation**
- [ ] Switching entre 5 dossiers en < 5 secondes
- [ ] Vue consolidée "en retard" identifie les PME prioritaires

---

## 🔐 Couche 7 — Permissions, reporting & expansion (A26–A30)

### A26 — Rôles & permissions avancées (RBAC complet)

**Hypothèse :** Le RBAC couvre tous les cas d'usage cabinet + PME sans friction excessive.

**Features**
- Rôles : `ORG_OWNER`, `ORG_ADMIN`, `STAFF`, `VIEWER`, `EXTERNAL_ACCOUNTANT`
- Granularité par entreprise (rôles différents selon le dossier)
- Actions protégées : validation OCR, lock période, activation version règle → rôles forts uniquement

**Logique métier**
- Guards NestJS réécrits pour supporter la granularité par `companyId`
- Permission check = `(userId, companyId, action)` → vrai/faux

**Critères de validation**
- [ ] Un `VIEWER` ne peut pas modifier de paie (test d'intrusion)
- [ ] Un `EXTERNAL_ACCOUNTANT` voit uniquement les dossiers qui lui sont assignés

---

### A27 — Rapport mensuel PDF v0

**Hypothèse :** Le rapport PDF devient l'objet d'échange principal entre PME, cabinet et administration.

**Features**
- Rapport mensuel : paie consolidée, obligations, paiements, écarts, pièces jointes
- Téléchargement depuis le dashboard + envoi par email
- Généré de façon asynchrone (job Trigger.dev)

**Logique métier**
- Format professionnel : en-tête entreprise, numérotation, pied de page
- Le rapport est immutable une fois généré (preuve de conformité)

**Critères de validation**
- [ ] Rapport généré en < 30 s pour une PME de 50 employés
- [ ] PDF ouvert sans erreur dans les principaux lecteurs

---

### A28 — Alertes anomalies v0

**Hypothèse :** Les alertes proactives augmentent la valeur perçue et la rétention.

**Features**
- Règles d'alerte : variation salaire > 20 %, obligation non payée J+3, incohérence cotisation
- Notifications dashboard + email
- Vue dédiée "Anomalies à traiter" avec statut `open | acknowledged | resolved`

**Logique métier**
- Ne pas sur-alerter : regrouper les anomalies de même nature par période
- Une alerte doit pointer vers l'action corrective à faire

**Critères de validation**
- [ ] Une anomalie détectée génère une notification dans les 10 min
- [ ] Taux de faux positifs < 15 % sur un jeu de données test

---

### A29 — Préparation multi-pays v0

**Hypothèse :** Le refactor multi-pays peut être fait sans aucune régression fonctionnelle.

**Features**
- Ajout de `countryCode` partout dans le tax engine et les obligations
- Refactor des règles YAML pour inclure `country` et `administration` locaux
- Aucune nouvelle règle réelle pour un 2ème pays — uniquement l'abstraction

**Logique métier**
- Rien de "Gabon-centré" ne doit rester hardcodé dans le code après cette alpha
- Les règles Gabon existantes deviennent simplement `country: GA`

**Critères de validation**
- [ ] Tous les tests existants passent après le refactor (zéro régression)
- [ ] Un nouveau pays peut être ajouté en créant uniquement un fichier YAML

---

### A30 — Alpha MVP-ready (stabilisation)

**Hypothèse :** La plateforme est prête pour un pilote client réel.

**Features**
- Nettoyage dette technique : `any` résiduels, endpoints non paginés, index manquants
- Tests e2e sur les flux critiques : workflow DUS, paie complète, upload OCR, rapprochement
- Hardening : rate limiting, quotas par tenant, logs structurés, monitoring

**Checklist finale**
- [ ] Tous les endpoints sont paginés
- [ ] Zéro `any` TypeScript dans `apps/api` et `apps/web`
- [ ] Tests e2e verts sur : login → paie → obligations → DUS → export
- [ ] Monitoring (erreurs, latences) actif sur NestJS et Trigger.dev
- [ ] RLS vérifié : impossible d'accéder aux données d'un autre tenant
- [ ] Revue sécurité : signed URLs, JWT expiry, RBAC testé par intrusion

---

## Annexe — Conventions

### Tags de version
```
v0.1.0-a01   # Alpha A01
v0.1.0-a30   # Alpha A30 (MVP-ready)
v0.1.0       # MVP public
```

### Fichiers de suivi par alpha
Créer `/docs/alphas/AXX-slug.md` pour chaque alpha livrée, avec :
- Hypothèse initiale + résultat observé
- Schémas Prisma modifiés
- Endpoints NestJS et routes Next.js ajoutés
- Décisions prises / abandonnées
- Retours utilisateur (si testée)

### Graphe de dépendances
```
A01 → A02 → A03 → A04 → A05 → A06 → A07 → A08
                                          ↓
A11 → A12 → A13 → A14 → A15    A09 → A10
                  ↓
            A16 → A17 → A18 → A19 → A20
                         ↓
                   A21 → A22 → A23 → A24 → A25
                                      ↓
                               A26 → A27 → A28 → A29 → A30
```