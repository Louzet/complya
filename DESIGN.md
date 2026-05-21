COMPLYA — Design System & UI Specification Prompt
  
  ▎ Instructions d'utilisation : Ce prompt est la source de vérité pour toute décision visuelle sur Complya. Colle-le en 
  ▎ contexte système de tout agent IA ou designer qui doit produire de l'UI.

  ---
  0. Contexte produit
  
  Complya est un SaaS B2B de conformité fiscale & déclarative pour PME en zone OHADA/CEMAC (Gabon, Cameroun, Congo, RCA). Cible
  principale : comptables et directeurs financiers de PME africaines. L'interface doit inspirer confiance institutionnelle, être
   dense en données mais jamais écrasante, et fonctionner correctement sur des connexions lentes (connexion 3G fréquente en
  Afrique centrale).

  Principes directeurs (dans l'ordre de priorité) :
  1. Clarté de conformité — l'utilisateur sait exactement ce qu'il doit faire, quand, et l'état de chaque obligation
  2. Densité maîtrisée — beaucoup d'info dans peu d'espace, jamais de surcharge cognitive
  3. Confiance institutionnelle — design sérieux, proche d'un outil bancaire ou d'audit
  4. Performance perçue — skeletons systématiques, pas d'écrans blancs, cache agressif
  5. Accessibilité — WCAG AA minimum, focus visible, contraste 4.5:1

  ---
  1. Système de couleurs

  1.1 Palette de marque

  Couleur              Token sémantique         Hex        Usage
  ─────────────────────────────────────────────────────────────────────
  Bleu marine foncé    --color-brand-950        #0F172A    Sidebar, headers autoritaires
  Bleu marine          --color-brand-900        #1E293B    Texte principal, titres
  Bleu marque          --color-brand-700        #0F4C8A    Navigation active, boutons primaires CTA
  Bleu moyen           --color-brand-500        #2563EB    Liens, focus rings, highlights
  Bleu clair           --color-brand-100        #DBEAFE    Backgrounds d'éléments actifs
  Bleu très clair      --color-brand-50         #EFF6FF    Hover sur lignes, accents subtils

  Vert conformité      --color-success-700      #15803D    Badge "Conforme", statut OK
  Vert doux            --color-success-100      #DCFCE7    Background statut conforme
  Vert texte           --color-success-800      #166534    Texte dans badge vert

  Orange alerte        --color-warning-600      #D97706    Échéance < 7 jours, attention
  Orange doux          --color-warning-100      #FEF3C7    Background alerte
  Orange foncé         --color-warning-800      #92400E    Texte dans badge orange

  Rouge danger         --color-danger-600       #DC2626    Retard, non-conforme, erreur
  Rouge doux           --color-danger-100       #FEE2E2    Background erreur
  Rouge foncé          --color-danger-800       #991B1B    Texte dans badge rouge

  Violet informatif    --color-info-600         #7C3AED    Déclarations DUS (code couleur entité)
  Indigo CNSS          --color-cnss-600         #4F46E5    Code couleur CNSS
  Teal CNAMGS          --color-cnamgs-500       #0D9488    Code couleur CNAMGS
  Bleu DGI             --color-dgi-600          #0369A1    Code couleur DGI

  1.2 Tokens neutres (système complet)

  Token                Hex        Rôle
  ───────────────────────────────────────────────────────────────
  --neutral-950        #020617    Texte sur fond blanc — jamais utilisé pur sur fond coloré
  --neutral-900        #0F172A    Titres h1, sidebar text, valeurs critiques
  --neutral-800        #1E293B    Corps de texte principal (reading text)
  --neutral-700        #334155    Texte secondaire, labels de formulaire
  --neutral-500        #64748B    Placeholder, helper text, timestamps
  --neutral-400        #94A3B8    Icônes inactives, borders légères
  --neutral-300        #CBD5E1    Dividers, séparateurs de tableau
  --neutral-200        #E2E8F0    Borders de cards, input borders
  --neutral-100        #F1F5F9    Background de rows alternées, hover subtle
  --neutral-50         #F8FAFC    Background global de l'app
  --white              #FFFFFF    Surface de carte, modal, panel

  1.3 Tokens sémantiques CSS (à définir dans globals.css)

  :root {
    /* Surfaces */
    --surface-background: #F8FAFC;      /* Page background */
    --surface-card: #FFFFFF;            /* Cards, panels, modals */
    --surface-sidebar: #0F172A;         /* Sidebar navigation */
    --surface-header: #FFFFFF;          /* Top bar */
    --surface-muted: #F1F5F9;           /* Input backgrounds, code blocks */

    /* Texte */
    --text-primary: #1E293B;
    --text-secondary: #64748B;
    --text-disabled: #94A3B8;
    --text-inverse: #FFFFFF;            /* Sur fond sombre */
    --text-brand: #2563EB;

    /* Borders */
    --border-default: #E2E8F0;
    --border-strong: #CBD5E1;
    --border-focus: #2563EB;            /* Ring de focus — jamais supprimé */
    --border-error: #DC2626;

    /* États */
    --state-hover-on-light: rgba(15, 76, 138, 0.06);   /* Hover row */
    --state-active-on-light: rgba(37, 99, 235, 0.10);  /* Selected row */
    --state-hover-sidebar: rgba(255, 255, 255, 0.08);  /* Hover sur sidebar sombre */
    --state-active-sidebar: rgba(37, 99, 235, 0.20);   /* Actif sidebar */

    /* Focus ring */
    --ring-width: 2px;
    --ring-offset: 2px;
    --ring-color: #2563EB;

    /* Ombres */
    --shadow-xs:  0 1px 2px 0 rgba(15, 23, 42, 0.05);
    --shadow-sm:  0 1px 3px 0 rgba(15, 23, 42, 0.10), 0 1px 2px -1px rgba(15, 23, 42, 0.10);
    --shadow-md:  0 4px 6px -1px rgba(15, 23, 42, 0.10), 0 2px 4px -2px rgba(15, 23, 42, 0.10);
    --shadow-lg:  0 10px 15px -3px rgba(15, 23, 42, 0.10), 0 4px 6px -4px rgba(15, 23, 42, 0.10);
    --border-error: #DC2626;

    --text-disabled: #94A3B8;
    --text-inverse: #FFFFFF;            /* Sur fond sombre */
    --text-brand: #2563EB;
    --text-primary: #1E293B;
    --text-secondary: #64748B;
    --text-disabled: #94A3B8;
    --text-inverse: #FFFFFF;            /* Sur fond sombre */
    --text-brand: #2563EB;

    /* Borders */
    --border-default: #E2E8F0;
    --border-strong: #CBD5E1;
    --border-focus: #2563EB;            /* Ring de focus — jamais supprimé */
    --border-error: #DC2626;

    /* États */
    --state-hover-on-light: rgba(15, 76, 138, 0.06);   /* Hover row */
    --state-active-on-light: rgba(37, 99, 235, 0.10);  /* Selected row */
    --state-hover-sidebar: rgba(255, 255, 255, 0.08);  /* Hover sur sidebar sombre */
    --state-active-sidebar: rgba(37, 99, 235, 0.20);   /* Actif sidebar */

    /* Focus ring */
    --ring-width: 2px;
    --ring-offset: 2px;
    --ring-color: #2563EB;

    /* Ombres */
    --shadow-xs:  0 1px 2px 0 rgba(15, 23, 42, 0.05);
    --shadow-sm:  0 1px 3px 0 rgba(15, 23, 42, 0.10), 0 1px 2px -1px rgba(15, 23, 42, 0.10);
    --shadow-md:  0 4px 6px -1px rgba(15, 23, 42, 0.10), 0 2px 4px -2px rgba(15, 23, 42, 0.10);
    --shadow-lg:  0 10px 15px -3px rgba(15, 23, 42, 0.10), 0 4px 6px -4px rgba(15, 23, 42, 0.10);
    --shadow-xl:  0 20px 25px -5px rgba(15, 23, 42, 0.10), 0 8px 10px -6px rgba(15, 23, 42, 0.10);

    /* Radius */
    --radius-sm:  4px;    /* Badges, chips, petits éléments */
    --radius-md:  8px;    /* Inputs, boutons, petites cards */
    --radius-lg:  12px;   /* Cards standards */
    --radius-xl:  16px;   /* Modals, grands panels */
    --radius-full: 9999px; /* Pills, avatars */
  }

  1.4 Palette entités administratives (code couleur constant)

  Chaque administration a une couleur fixe utilisée systématiquement dans toutes les UI (badges, graphiques, filtres) :

  DGI      → Bleu #0369A1  (fond #EFF6FF)
  CNSS     → Indigo #4F46E5 (fond #EEF2FF)
  CNAMGS   → Teal #0D9488   (fond #F0FDFA)
  DUS      → Violet #7C3AED (fond #F5F3FF)
  Gabon Connect → Emeraude #059669 (fond #ECFDF5)

  ---
  2. Typographie

  2.1 Famille

  Police unique : Plus Jakarta Sans (Google Fonts)
  - Justification : lisibilité excellente sur écrans moyens, supporte le français (accents, ligatures), caractère professionnel
  sans être froid, disponible en variable font pour performance

  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&di
  splay=swap');

  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  Monospace pour chiffres et codes : font-variant-numeric: tabular-nums sur tous les montants, NIF, RCCM, pourcentages — évite
  le sautillement dans les tableaux.

  2.2 Échelle typographique complète

  Token          Size   Weight   Line-h   Letter-spacing   Usage
  ──────────────────────────────────────────────────────────────────────────
  --text-xs      12px   400      16px     +0.3px           Timestamps, footnotes, mentions légales
  --text-sm      13px   400      20px     0                Helper text, captions, labels tableaux
  --text-base    14px   400      22px     0                Corps par défaut dans l'app (dense)
  --text-md      15px   400      24px     0                Paragraphes, descriptions de sections
  --text-lg      16px   500      24px     -0.1px           Titres de cards, sous-titres de section
  --text-xl      18px   600      28px     -0.2px           Titres de sections de page
  --text-2xl     22px   700      32px     -0.3px           Titres de pages principales (h1 dashboard)
  --text-3xl     28px   800      36px     -0.4px           KPI cards (montant principal)
  --text-4xl     36px   800      44px     -0.5px           Chiffres clés (total obligations)
  --text-display 48px   800      56px     -0.8px           Landing page hero uniquement

  Règles strictes :
  - Minimum 14px pour tout texte fonctionnel (jamais 12px pour du contenu lu)
  - Minimum 12px autorisé pour timestamps et footnotes uniquement 
  - font-feature-settings: "tnum" 1 sur tous les chiffres monétaires
  - text-rendering: optimizeLegibility sur les titres h1–h3

  2.3 Hiérarchie dans l'app

  H1 — Titre de page        : 22px / 700 / #1E293B   (ex: "Tableau de bord")
  H2 — Section principale   : 18px / 600 / #1E293B   (ex: "Obligations du mois")
  H3 — Sous-section / card  : 16px / 600 / #334155   (ex: "CNSS Employeur")
  H4 — Label de groupe      : 13px / 600 / #64748B / uppercase + tracking+0.5px
  Body — Texte standard     : 14px / 400 / #1E293B
  Body muted                : 14px / 400 / #64748B
  Caption                   : 12px / 400 / #94A3B8

  ---
  3. Espacement et grille
  
  3.1 Échelle d'espacement (base 4px)

  Token         Valeur   Alias Tailwind
  ──────────────────────────────────────
  --space-0.5   2px      py-0.5, px-0.5
  --space-1     4px      p-1
  --space-1.5   6px      p-1.5
  --space-2     8px      p-2      — gap minimal entre éléments inline
  --space-3     12px     p-3      — padding interne bouton sm, badge
  --space-4     16px     p-4      — padding card compact, cell tableau
  --space-5     20px     p-5
  --space-6     24px     p-6      — padding card standard, sections
  --space-8     32px     p-8      — padding grandes sections
  --space-10    40px     p-10
  --space-12    48px     p-12     — spacing vertical entre sections
  --space-16    64px     p-16     — hero sections
  --space-20    80px     p-20
  --space-24    96px     p-24

  3.2 Grille d'application

  Sidebar (fixed) : 240px largeur, collapsed 64px
  Header (fixed) : 56px hauteur (pas 64, économie d'espace vertical)
  Zone de contenu principale : calc(100vw - 240px), max-width 1400px, padding horizontal 24px
  Grille interne : 12 colonnes, gap 16px (24px sur > 1280px)
  Breakpoints :
  sm  : 640px   — pas de sidebar (mobile : bottom nav ou drawer)
  md  : 768px   — sidebar collapsed (64px)
  lg  : 1024px  — sidebar expanded (240px)
  xl  : 1280px  — layout confortable
  2xl : 1536px  — layout large écran, 2 panels côte à côte

  ---
  4. Composants — spécifications détaillées

  4.1 Boutons

  Sizes :
  xs : height 28px, px 10px, text 12px/500, radius 6px
  sm : height 32px, px 12px, text 13px/500, radius 6px
  md : height 36px, px 14px, text 14px/500, radius 8px   ← défaut
  lg : height 40px, px 16px, text 15px/500, radius 8px
  xl : height 44px, px 20px, text 15px/600, radius 8px   ← CTA principal

  Variants :
  primary   : bg #2563EB, text white, hover bg #1D4ED8, active bg #1E40AF
  secondary : bg white, border #E2E8F0, text #334155, hover bg #F1F5F9
  ghost     : bg transparent, text #334155, hover bg #F1F5F9
  danger    : bg #DC2626, text white, hover bg #B91C1C
  outline-danger : border #DC2626, text #DC2626, hover bg #FEE2E2
  link      : bg none, text #2563EB, underline on hover, no padding block

  États obligatoires :
  - hover : transition 150ms ease-out
  - active : scale(0.98) + couleur plus foncée, 80ms
  - focus-visible : ring 2px #2563EB, offset 2px — JAMAIS supprimé
  - disabled : opacity 0.45, cursor not-allowed, pointer-events none
  - loading : spinner 14px + texte masqué ou remplacé par "…" + disabled

  Iconographie dans boutons :
  - Icon left : gap 8px, icon 16px
  - Icon only : taille identique aux sizes ci-dessus, tooltip obligatoire via title + aria-label

  4.2 Badges / Pills de statut

  Toujours une combinaison fond + texte du même ton sémantique. Jamais de fond blanc avec juste une bordure colorée.

  conforme        : bg #DCFCE7, text #166534, dot #15803D
  en_attente      : bg #FEF3C7, text #92400E, dot #D97706
  en_retard       : bg #FEE2E2, text #991B1B, dot #DC2626
  non_depose      : bg #F1F5F9, text #334155, dot #94A3B8
  traitement      : bg #EFF6FF, text #1D4ED8, dot animé pulse #2563EB
  annule          : bg #F9FAFB, text #6B7280, dot #9CA3AF

  Anatomie : dot 8px (rond) + texte 12px/500 + padding 6px 10px + radius full

  Badges entité :
  DGI     : bg #EFF6FF, text #0369A1
  CNSS    : bg #EEF2FF, text #4F46E5
  CNAMGS  : bg #F0FDFA, text #0D9488

  4.3 Cards

  Card standard (obligation, déclaration) :
  bg white
  border 1px solid #E2E8F0
  border-radius 12px
  padding 20px 24px
  box-shadow 0 1px 3px rgba(15,23,42,0.08)
  hover: shadow-md + border-color #CBD5E1, transition 200ms ease

  Card KPI (dashboard) :
  bg white
  border 1px solid #E2E8F0
  border-radius 12px
  padding 24px
  structure:
    - label : 13px/500/uppercase/#64748B + letter-spacing 0.5px
    - valeur : 32–36px/800/#1E293B + tabular-nums
    - delta  : 13px/500 + badge (↑ vert / ↓ rouge / → neutre)
    - icône  : 40px×40px bg coloré (#EFF6FF) radius 10px, icon 20px
  accent-left optionnel : border-left 3px solid [couleur entité]

  Card document :
  Layout : thumbnail 48×48px (prévisualisation) + métadonnées à droite
  Status : badge + date upload + type MIME
  Actions : hover reveal — bouton "Voir" + "Relancer OCR" si failed

  Card d'échéance urgente (< 7 jours) :
  border-left 4px solid #D97706
  bg #FFFBEB
  
  Card overdue (retard) :
  border-left 4px solid #DC2626
  bg #FFF5F5

  4.4 Tableaux de données

  Structure cible : toutes les listes d'obligations, d'employés, de déclarations.

  Header de colonne : bg #F8FAFC, border-bottom 2px #E2E8F0
                     text 12px/600/uppercase/#64748B
                     padding 12px 16px
                     sortable : icon ChevronUp/Down Lucide 14px, toujours visible (opacity 30% si inactif)

  Row standard : height 52px, border-bottom 1px #F1F5F9
                padding 0 16px
                hover : bg #F8FAFC + transition 100ms

  Row sélectionnée : bg #EFF6FF + border-left 2px #2563EB

  Checkbox colonne : width 44px, centré
  Actions colonne : width 100px, icônes ghost, visible au hover de la row

  Colonnes monétaires : text-align right, font-variant-numeric tabular-nums, #1E293B/600
  Colonnes dates : text 13px/#64748B
  Colonnes statut : badge centré
  Colonnes entité : badge coloré entité

  Pagination : composant shadcn Pagination, taille par page [10/25/50/100], count total

  Empty state de tableau :
  Centre vertical dans le body du tableau
  Icon Lucide 48px #CBD5E1 (ex: FileSearch pour liste vide)
  Titre 16px/600/#334155 : "Aucune obligation trouvée"
  Sous-titre 14px/#64748B : texte contextuel selon le filtre actif
  CTA optionnel : bouton primary si une action est possible

  4.5 Formulaires

  Input text/number :
  height 36px (md) / 40px (lg)
  bg white
  border 1px solid #E2E8F0
  border-radius 8px
  padding 0 12px
  text 14px/#1E293B
  placeholder 14px/#94A3B8

  focus: border-color #2563EB + ring 2px #2563EB offset 0px (pas de double ring)
  error: border-color #DC2626 + bg #FFF5F5
  disabled: bg #F8FAFC + text #94A3B8 + cursor not-allowed
  read-only: bg #F8FAFC + border-color #E2E8F0 (visuellement distinct du disabled)
  
  Label : 13px/500/#334155 + mb-1.5
  Helper text : 12px/#64748B + mt-1.5
  Error message : 12px/#DC2626 + mt-1.5 + icon AlertCircle 12px
  Required : asterisk rouge après le label (aria-required="true" sur l'input)

  Select/Combobox :
  Même apparence que l'input
  Icône ChevronDown 16px right-aligned, couleur #64748B
  Dropdown : bg white, border 1px #E2E8F0, radius 8px, shadow-lg
  Option hover : bg #F1F5F9
  Option selected : bg #EFF6FF + text #2563EB + icon Check 14px right
  Recherche dans combobox : input intégré en top du dropdown

  Textarea :
  min-height 80px
  resize vertical uniquement
  même styles que input
  
  Checkbox / Radio :
  Size 16px × 16px
  Border 1.5px #CBD5E1, radius 4px (checkbox) / full (radio)
  Checked : bg #2563EB, border #2563EB, icon Check 10px white
  Focus : ring 2px #2563EB
  Label à droite, gap 8px, text 14px/#1E293B
  Disabled : opacity 0.45
  
  Date picker :
  Basé sur shadcn/ui Calendar
  Format fr-GA : DD/MM/YYYY
  Highlight : jours d'échéances fiscales en orange/rouge

  Montants financiers :
  Input type="text" avec pattern numérique
  Formatage automatique en temps réel : "1 500 000 XAF"
  Séparateur milliers : espace insécable
  Devise : XAF (Franc CFA BEAC), toujours affiché
  Validation : nombre positif, max raisonnable selon contexte

  4.6 Navigation — Sidebar

  Largeur expanded  : 240px (lg+)
  Largeur collapsed : 64px (md)
  Mobile            : drawer (off-canvas, overlay semi-transparent)
  Background        : #0F172A (bleu marine très foncé)
  Transition        : width 200ms ease-in-out

  En-tête sidebar :
    - Logo Complya : 28px height, variante blanche
    - Nom de l'organisation (tenant) : 13px/500/white/opacity-80, truncate

  Sections de navigation :
    [Séparateur] label 10px/600/uppercase/#64748B/opacity-50 + padding-top 16px

  Items de nav :
    height 36px
    padding 0 12px (expanded) / 0 (collapsed, centré)
    border-radius 8px
    gap 10px
    text 14px/500/#94A3B8

    Icône : Lucide, 18px, stroke-width 1.75
    Hover : bg rgba(255,255,255,0.06) + text white
    Actif : bg rgba(37,99,235,0.20) + text white + icône couleur #60A5FA + dot actif gauche 3px
    Focus : ring 2px #2563EB inside

  Items avec badge :
    Badge pill 18px min-width, bg #DC2626 (alertes) ou #D97706 (warnings), text white 11px/600
    Positionné à droite dans l'item (expanded) ou en overlay top-right de l'icône (collapsed)

  Structure navigation :
    ─────────────────────────────────
    [Logo + Nom organisation]
    [Sélecteur d'exercice fiscal] ← dropdown année
    ─────────────────────────────────
    PRINCIPAL
    ├── Dashboard            (LayoutDashboard)
    ├── Obligations          (FileCheck) + badge count
    ├── Déclarations         (FileSend) + badge pending
    ├── Calendrier fiscal    (CalendarDays)
    ─────────────────────────────────
    GESTION
    ├── Employés & Paie      (Users)
    ├── Documents            (FolderOpen) + badge processing
    ├── Journaux comptables  (BookOpen)
    ─────────────────────────────────
    PARAMÈTRES
    ├── Mon organisation     (Building2)
    ├── Utilisateurs         (UserCog)
    ├── Intégrations         (Plug)
    ─────────────────────────────────
    [Avatar + Nom utilisateur] (bas)
    [Logout]

  4.7 Top Header

  Height : 56px
  Background : white
  Border-bottom : 1px #E2E8F0
  Position : sticky top-0, z-index 40
  Padding : 0 24px

  Contenu gauche : breadcrumb (Chevron separator, text 14px, dernier élément bold)
  Contenu centre : SearchBar globale (shortcut kbd⌘K affiché) — 280px max-width
  Contenu droit :
    - IconButton : Bell (notifications) + badge count
    - IconButton : HelpCircle (aide contextuelle)
    - Séparateur 1px
    - Avatar utilisateur 32px + nom tronqué 14px (dropdown : profil, orga, logout)

  4.8 Modals / Dialogs

  Overlay : bg rgba(15,23,42,0.6) — jamais transparent
  Entrée : scale(0.95)+opacity(0) → scale(1)+opacity(1), 180ms ease-out
  Sortie : 120ms ease-in
  Centré écran, mt 10vh max

  Tailles :
    sm  : max-w 400px  — confirmations, alertes simples
    md  : max-w 560px  — formulaires courts (défaut)
    lg  : max-w 720px  — formulaires complets
    xl  : max-w 960px  — tableaux dans modal, multi-step
    full: max-w 1200px — éditeurs, preview documents

  Structure :
    - Header : titre 18px/700 + bouton X (ghost, 32px×32px) — toujours présent
    - Divider 1px
    - Body : padding 24px, overflow-y auto, max-height calc(100vh - 200px)
    - Footer : padding 16px 24px, flex justify-end, gap 8px (annuler | action primaire)

  Gestion fermeture :
    - Escape ferme toujours
    - Click overlay ferme (sauf si formulaire non-sauvé → confirmation)
    - Si non-sauvé : dialog de confirmation "Voulez-vous quitter sans sauvegarder ?"

  4.9 Toasts / Notifications

  Position : top-right, 16px de bord, z-index 100
  Largeur : max 380px
  Stack : max 3 simultanés, pile vers le bas

  Anatomie :
    radius 10px
    padding 14px 16px
    shadow-lg
    icon 20px à gauche (couleur du type)
    titre 14px/600
    description 13px/muted (optionnel)
    bouton dismiss (X) 20px top-right
    barre de progression en bas (auto-dismiss 5s)

  Types :
    success : border-left 4px #15803D, icon Check, bg white
    error   : border-left 4px #DC2626, icon AlertCircle, bg white
    warning : border-left 4px #D97706, icon AlertTriangle, bg white
    info    : border-left 4px #2563EB, icon Info, bg white

  Actions optionnelles : lien/bouton text "Voir" ou "Annuler" dans le toast

  4.10 Skeletons (états de chargement)

  Règle : toujours un skeleton, jamais un spinner seul pour un chargement > 300ms.

  Couleur de base : #F1F5F9
  Couleur shimmer : #E2E8F0
  Animation : shimmer latéral 1.5s linear infinite (pas de pulse, trop agressif)

  Skeleton KPI card : rectangles proportionnels à la vraie card
  Skeleton tableau : 5 rows, hauteur 52px chacune, colonnes proportionnelles
  Skeleton sidebar nav : items 36px height, largeur variable
  Skeleton texte : lignes 12–16px height, largeur 100%/80%/60% alternée

  ---
  5. Écrans — spécifications page par page

  5.1 Dashboard principal

  Layout : 3 zones verticales

  Zone 1 — KPI row (4 cards) :
  col-span-3 chacune sur grille 12
  [Total obligations mois] [Montant total dû] [Déclarations soumises] [Prochaine échéance]

  Card "Total obligations" : chiffre 36px, delta vs mois précédent
  Card "Montant total dû"  : chiffre 36px, devise XAF, delta
  Card "Déclarations soumises" : fraction X/N + progress bar 4px
  Card "Prochaine échéance" : date countdown, urgence si < 7j → orange

  Zone 2 — Obligations du mois (2/3) + Agenda (1/3) :
  Liste obligations :
    - Chaque obligation = card inline (pas ligne de tableau)
    - Entité (badge coloré) + Type + Période + Montant + Échéance + Statut + Bouton action
    - Groupe par entité : section "DGI" / "CNSS" / "CNAMGS"
    - Sort par urgence d'abord
    
  Agenda droite :
    - Mini-calendrier mois courant (shadcn Calendar)
    - Points de couleur sur les jours d'échéance
    - Liste "Prochaines échéances" sous le calendrier

  Zone 3 — Activité récente :
  Timeline verticale : icon cercle + texte action + date relative + acteur
  Items : "Déclaration CNSS mai soumise par X", "Document facture OCR terminé", etc.
  Max 10 items, bouton "Voir tout" → /audit

  5.2 Page Obligations

  Header de page :
  Titre "Obligations fiscales"
  Sous-titre avec exercice fiscal courant (ex: "Exercice 2026")
  Actions : [Filtre] [Période: mois/trimestre/année] [Exporter CSV]

  Filtres (inline, pas de sidebar) :
  Tabs horizontal : Toutes | DGI | CNSS | CNAMGS
  Filtre statut : dropdown multi-select (shadcn Popover)
  Filtre période : date range picker
  Recherche texte : input avec icon Search

  Tableau principal :
  Colonnes :
    □  | Entité | Type d'obligation | Période | Montant dû | Échéance | Statut | Actions

  Tri par défaut : Échéance ASC (urgences d'abord)
  Row expanded (accordion) : détail calcul, décomposition du montant
  Actions row : [Déclarer] [Marquer payé] [Voir calcul] [Télécharger]
  Bulk actions (multi-select) : [Exporter sélection] [Marquer payé en masse]

  5.3 Page Employés & Paie

  Tabs de sous-navigation :
  [Employés] [Fiches de paie] [Calcul DUS] [Historique]

  Tab Employés — tableau :
  Colonnes : Employé (avatar+nom) | Poste | Date embauche | Salaire brut | Statut | Actions
  CTA header : [+ Ajouter employé] [Importer CSV]
  Drawer latéral (800px) : fiche employé complète sur click

  Tab Calcul DUS :
  Sélecteur : [Mois] [Année]
  Bouton : "Lancer le calcul" → loading skeleton → résultats
  Tableau résultats :
    Colonnes : Employé | Salaire brut | Retenue IR | CNSS salarial | CNSS patronal | CNAMGS | Net imposable | Net à payer
  Footer tableau : Total par colonne
  Bouton : "Générer DUS" → job Trigger.dev → toast "Génération en cours…" → polling

  5.4 Page Documents

  Layout : vue grille (défaut) / vue liste (toggle)

  Vue grille :
  Cards 3 colonnes (lg), 4 colonnes (xl)
  Card : thumbnail 160px height (PDF preview ou icon générique) + nom (tronqué) + date + badge statut OCR
  Statuts OCR :
    "En attente"  : badge gris + icon Clock
    "Traitement"  : badge bleu + spinner animé
    "Traité"      : badge vert + icon CheckCircle
    "Échec"       : badge rouge + icon AlertTriangle + bouton Relancer

  Zone d'upload :
  Dropzone (dashed border 2px #CBD5E1, radius 12px, bg #F8FAFC)
  Centre : icon UploadCloud 48px #CBD5E1 + texte "Glissez vos documents ici" + sous-texte "PDF, JPG, PNG — 20 Mo max"
  Hover : border-color #2563EB + bg #EFF6FF
  Upload en cours : liste des fichiers avec progress bars individuelles

  5.5 Page Déclarations (Filings)

  Timeline de déclarations :
  Filtre : [Année] [Entité] [Statut]

  Item timeline :
    - Ligne verticale connexion entre items
    - Dot coloré (couleur entité)
    - Card inline : entité + type + période + date soumission + statut + preuve (PDF download)

  Statuts :
    "Brouillon"  : gris
    "Soumise"    : bleu + date soumission
    "Validée"    : vert + date validation + numéro de quittance
    "Rejetée"    : rouge + motif + bouton "Corriger"

  5.6 Page Calendrier fiscal

  Vue : mois courant (défaut) / semaine / liste

  Évènements calendrier :
    Couleur par entité (DGI/CNSS/CNAMGS)
    Badge "urgent" si < 3 jours
    Click → modal : détail obligation, actions, montant estimé

  Sidebar calendrier :
    "Ce mois-ci" : count par entité
    "Prochaines 30 jours" : liste chronologique

  ---
  6. États UI

  6.1 Loading

  Initial page load    : skeleton de la page entière
  Mutation en cours    : bouton en état loading (spinner + disabled) + toast "Traitement..."
  Background job       : toast persistent (sans timer) "Génération DUS en cours…" + dismiss manuel après done
  Data refetch         : skeleton overlay sur les données existantes (pas de flash blanc)

  6.2 Erreurs

  Erreur réseau        : banner top (#FFF5F5 + border rouge) "Erreur de connexion — Vérifiez votre connexion internet
  [Réessayer]"
  Erreur 4xx formulaire: message inline sous le champ concerné + scroll vers premier champ en erreur au submit
  Erreur 5xx           : page d'erreur avec illustration + "Une erreur s'est produite. Notre équipe a été notifiée." +
  [Réessayer]
  Erreur OCR           : badge rouge sur la card document + bouton "Relancer OCR" visible
  Erreur calcul fiscal : inline dans la section calcul + détail technique en accordion "Voir les détails"

  6.3 États vides

  Tableau vide         : illustration SVG centrée + titre + sous-titre + CTA contextuel
  Dashboard vide       : onboarding checklist (wizard) à la place du dashboard normal
  Documents vides      : dropzone mise en avant avec guide upload
  Employés vides       : CTA "Ajouter votre premier employé" + lien vers import CSV

  6.4 Confirmation

  Action irréversible  : Dialog modal — titre "Confirmer la suppression" + description impact + [Annuler] [Supprimer] (danger)
  Soumission déclaration : Dialog modal — résumé des montants + période + entité + checkbox "Je confirme l'exactitude" +
  [Soumettre]
  Marquage payé        : inline confirm dans la row (pas de modal) — petit popover avec [Confirmer] [Annuler]

  ---
  7. Iconographie

  Librairie : Lucide React exclusivement (lucide-react)
  Jamais : emojis comme icônes, images raster pour des icônes, mélange de librairies

  Tailles standard :
  12px : timestamps, meta inline
  14px : boutons xs/sm, texte contextuel
  16px : boutons md, nav items, labels
  18px : nav items (sidebar)
  20px : headers, actions principales
  24px : empty states, KPI cards
  32px : onboarding steps
  48px : empty state illustrations (monochrome #CBD5E1)

  Mapping icônes fixes :
  Dashboard      : LayoutDashboard
  Obligations    : FileCheck
  Déclarations   : FileSend / FileUp
  Calendrier     : CalendarDays
  Employés       : Users
  Paie/DUS       : Calculator
  Documents      : FolderOpen / File / FileText
  Journaux       : BookOpen
  Organisation   : Building2
  Utilisateurs   : UserCog
  Paramètres     : Settings
  Notifications  : Bell
  Aide           : HelpCircle
  Recherche      : Search
  Filtre         : Filter / SlidersHorizontal
  Exporter       : Download
  Upload         : UploadCloud
  OCR            : Scan
  Ajouter        : Plus / PlusCircle
  Modifier       : Pencil / Edit2
  Supprimer      : Trash2
  Voir           : Eye
  Fermer         : X
  Confirmer      : Check / CheckCircle
  Alerte         : AlertTriangle / AlertCircle
  Info           : Info
  Succès         : CheckCircle2
  Erreur         : XCircle
  Refresh        : RefreshCw
  Lien ext.      : ExternalLink
  Télécharger    : Download
  Logo DGI       : [SVG personnalisé]
  Logo CNSS      : [SVG personnalisé]
  Logo CNAMGS    : [SVG personnalisé]

  ---
  8. Motion & animations
  
  Règles générales :
  - prefers-reduced-motion: reduce → toutes les animations désactivées
  - Jamais d'animation décorative sans sens
  - Toujours transform + opacity — jamais width, height, top, left animés

  Durées et easing :
  Micro-interaction (hover, focus)  : 100–150ms ease-out
  Transitions d'état (badge, icon)  : 150ms ease-out
  Entrée de composant (modal, toast): 180ms ease-out
  Sortie de composant               : 120ms ease-in  (sortie = plus rapide)
  Skeleton shimmer                  : 1500ms linear infinite
  Spinner                           : 600ms linear infinite
  Progress bar                      : animation linéaire selon la durée réelle

  Transitions de page (App Router) :
  Entrée de page : opacity 0→1, 150ms ease-out
  Les données chargent via suspense : skeleton immédiat, pas de flash

  Micro-animations spécifiques :
  Bouton loading : spinner fade-in 100ms
  Badge statut change : cross-fade 200ms (pas de saut)
  Row sélectionnée : bg transition 100ms
  KPI card hover : shadow elevation change 200ms
  Toast entrée : slide-in depuis droite + fade 200ms
  Toast sortie : slide-out droite + fade 150ms
  Accordéon : height expand via max-height 250ms ease-out
  Sidebar collapse : width 200ms ease-in-out

  ---
  9. Accessibilité (WCAG AA)

  Contrastes :
    Texte normal     : ≥ 4.5:1 sur son fond
    Texte large (18+ px bold) : ≥ 3:1
    Icônes UI        : ≥ 3:1
    Bordures d'input : ≥ 3:1 sur fond de page

  Focus :
    Tous les éléments interactifs : ring 2px #2563EB, offset 2px
    Order de focus : identique à l'ordre visuel
    JAMAIS outline: none sans alternative

  Navigation clavier :
    Sidebar nav : Tab pour naviguer, Enter pour activer
    Tableaux : Tab dans les cellules, navigation intra-cellule
    Modals : trap focus dans la modal, Escape = ferme
    Menus dropdown : Arrow keys pour naviguer les options

  ARIA :
    aria-label sur tous les boutons icon-only
    aria-current="page" sur le nav item actif
    aria-live="polite" sur les toasts et zones de statut
    role="alert" sur les erreurs de formulaire
    aria-expanded sur accordéons et dropdowns
    aria-sort sur les colonnes de tableau
    aria-busy="true" pendant les chargements
    aria-invalid="true" sur les inputs en erreur

  Images/icônes :
    Icônes décoratives : aria-hidden="true"
    Icônes porteuses de sens : aria-label descriptif

  ---
  10. Internationalisation & localisation

  Langue primaire      : Français (fr-GA / fr-CM selon tenant)
  Devise               : XAF (Franc CFA BEAC), symbole "FCFA" dans l'UI
  Format monétaire     : "1 500 000 FCFA" (espace insécable comme séparateur milliers)
  Format date          : JJ/MM/AAAA (ex: 31/05/2026), toujours explicite — jamais ambigu
  Format heure         : HH:mm (24h)
  Jours fériés         : calendrier fiscal Gabon intégré dans le date picker
  Exercice fiscal      : Janvier–Décembre (Gabon)
  Textes d'erreur      : toujours en français, jamais de codes techniques exposés
  Noms d'entités       : toujours orthographe officielle (DGI, CNSS, CNAMGS — pas d'abréviation inventée)
  Périodes déclaratives: "Mai 2026", "T1 2026", "Exercice 2026" — pas "Month 5"

  ---
  11. Performance UI

  Images :
    Format WebP (conversion à l'upload)
    Thumbnail PDF : généré côté Trigger.dev, stocké R2
    Lazy loading : loading="lazy" sur tout hors-fold
    Dimensions déclarées : width + height pour éviter CLS

  Fonts :
    preload de Plus Jakarta Sans 400 + 600 dans <head>
    font-display: swap
    Subset latin + latin-extended pour les accents

  Skeletons :
    Affichés dès 0ms (pas après un délai)
    Dimensions fixes identiques au contenu réel (évite CLS au chargement)

  Code splitting :
    Chaque route = chunk séparé (Next.js App Router natif)
    shadcn/ui : import component par component, pas d'import barrel

  Tableaux longs :
    Virtualisation (react-virtual) si > 200 lignes
    Pagination côté serveur par défaut

  Connexion lente (3G) :
    Timeout de requête à 30s avec message explicite
    Retry automatique x2 sur erreur réseau
    Cache React Query : staleTime 5min sur données peu changeantes (règles fiscales, liste employés)

  ---
  12. Anti-patterns — ce qu'il ne faut JAMAIS faire

  ❌ Design "startup coloré" — pas de dégradés violet/pink, pas de confetti, pas d'illustrations cartoon
  ❌ Skeleton absent — tout chargement > 300ms doit avoir un skeleton
  ❌ Toast sans timer ou sans dismiss — max 5 secondes, toujours dismissable
  ❌ Bouton sans état loading lors d'une mutation async
  ❌ Erreur exposant une stack trace ou un code SQL
  ❌ Focus ring supprimé (outline: none sans alternative)
  ❌ Montant sans devise — toujours "FCFA" visible
  ❌ Date ambiguë — jamais "05/06/26", toujours "05 juin 2026" ou "05/06/2026"
  ❌ Icône emoji dans l'UI fonctionnelle
  ❌ Couleur comme seul indicateur de statut (toujours + icône + texte)
  ❌ Sidebar sans état collapsed sur tablette
  ❌ Modal sans bouton de fermeture visible
  ❌ Tableau sans empty state
  ❌ Input sans label visible (placeholder-only)
  ❌ Texte inférieur à 12px
  ❌ Animation width/height (toujours transform/opacity)
  ❌ Contenu derrière la sidebar sur mobile
  ❌ Z-index aléatoire sans système

  ---
  13. Stack d'implémentation cible

  Framework     : Next.js 14 App Router (TypeScript strict)
  Styles        : Tailwind CSS v3 (config étendue avec les tokens ci-dessus)
  Composants    : shadcn/ui (base) — personnalisation via CSS variables
  Icônes        : lucide-react
  Formulaires   : react-hook-form + zod
  État async    : React Query (TanStack Query) — mutations + cache
  Date          : date-fns (locale fr)
  Tableaux      : TanStack Table v8
  Charts        : Recharts (accessible, léger, React-natif)
  Toasts        : sonner (shadcn recommandé)
  Animations    : Framer Motion (motion/react) — minimal, ciblé
  Virtualisation: @tanstack/react-virtual (grands tableaux)
  PDF preview   : react-pdf (import dynamique, lazy)