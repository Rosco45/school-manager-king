# 🎓 School Manager-King

**School Manager-King** est une plateforme SaaS complète, moderne et responsive de **gestion scolaire intelligente** destinée aux écoles primaires, collèges et lycées.

---

## 🌟 Points Forts & Spécifications

- **Design Moderne & Apaisant** : Palette soignée combinant vert sauge (`#0d9488`, `#0f766e`), bleu marine ardoise, blanc cassé et accents chaleureux ambre & corail.
- **Architecture Multi-Rôles (RBAC)** :
  1. 🏛️ **Direction / Administration** (Vue globale, inscriptions, affectations, validation des bulletins, années scolaires).
  2. 💰 **Comptabilité / Économat** (Encaissement, suivi des tranches, filtre insolvables, reçus PDF numérotés, relances WhatsApp).
  3. 📚 **Enseignants** (Saisie rapide des notes par coefficient, appel numérique, emploi du temps, liste des élèves).
  4. 👨‍👩‍👧 **Parents / Élèves** (Suivi temps réel des notes, téléchargement des bulletins certifiés QR, absences, historique paiements).
- **Génération PDF Haute Précision avec QR Code d'Authenticité** :
  - 📜 **Bulletins Scolaires Trimestriels Officiels** (En-tête républicain/établissement, tableau complet avec coefficients, devoirs, compositions, moyennes, rangs, mentions, cachet et QR code de vérification).
  - 🪪 **Cartes Scolaires d'Identification (Badge CR80)** avec photo/monogramme, QR code de sécurité et contact tuteur d'urgence.
  - 📄 **Certificats de Scolarité Officiels** avec numéro d'enregistrement unique et QR code d'authentification.
  - 🧾 **Reçus de Paiement Numérotés** avec détail de tranche, reste dû calculé en temps réel et cachet caissier.
- **Exports Tableur Excel (SheetJS `xlsx`)** :
  - Export de la liste d'une classe complète.
  - Export des relevés de notes avec calculs et classements.
  - Export financier (journal des encaissements et liste des insolvables).
- **Centre de Notifications WhatsApp & SMS** :
  - Simulation de smartphone interactif en direct.
  - Modèles dynamiques avec variables `{nom_eleve}`, `{classe}`, `{montant_du}`, `{date}`.
  - Alertes automatiques d'absence/retard, rappels d'impayés groupés, avis de bulletin prêt.

---

## 🛠️ Stack Technique

- **Frontend & Framework** : [Next.js 14 (App Router)](https://nextjs.org), TypeScript, Tailwind CSS, Lucide Icons.
- **Base de Données & ORM** : SQLite avec [Prisma ORM 5.22](https://www.prisma.io).
- **Génération PDF & Codes QR** : `jspdf`, `jspdf-autotable`, `qrcode`.
- **Analytics & Graphiques** : `recharts` (encaissements mensuels, effectifs filles/garçons, moyennes par classe).
- **Export Tableur** : `xlsx` (SheetJS).

---

## 🚀 Démarrage Rapide

```bash
# 1. Se positionner dans le dossier
cd /home/roserick/school-manager-king

# 2. Synchroniser la base de données SQLite
npx prisma db push

# 3. Charger le jeu de données réaliste (Seed complet)
npx tsx prisma/seed.ts

# 4. Lancer le serveur de développement
npm run dev

# Ou exécuter le build de production
npm run build && npm run start
```

L'application est accessible à l'adresse : **[http://localhost:3000](http://localhost:3000)**.

---

## 🏫 Jeu de Données de Démonstration (Seed)

- **Établissement** : *Complexe Scolaire Les Étoiles*
- **6 Classes Réparties** : CM2 A (Primaire), 6ème A, 4ème B, 3ème A (Collège), Seconde C, Terminale D (Lycée).
- **12 Enseignants Spécialisés** : Mathématiques, Français, Histoire-Géo, SVT, Physique-Chimie, Anglais, Philo, EPS, Espagnol, Informatique, Arts, Primaire.
- **60 Élèves Répartis** avec matricules uniques (`SMK-2026-XXXX`), contacts tuteurs WhatsApp, dossiers médicaux.
- **Notes sur 2 Trimestres**, moyennes pondérées calculées automatiquement par coefficient et rangs.
- **Paiements et Tranches Échues** permettant de tester immédiatement le filtre d'insolvabilité et les reçus PDF.
- **Historique d'Appel Numérique** avec statuts (Présent, Absent non justifié, Absent justifié, En retard).
