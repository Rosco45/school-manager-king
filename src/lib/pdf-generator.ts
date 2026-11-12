import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { Student, SchoolSettings } from "@/types";

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 120,
      color: {
        dark: "#0f766e",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Erreur génération QR Code:", err);
    return "";
  }
}

// 1. BULLETIN SCOLAIRE OFFICIEL - SYSTÈME ÉDUCATIF BÉNINOIS
export async function generateReportCardPdf({
  student,
  school,
  term,
  academicYear,
  subjectsData,
  summary,
}: {
  student: Student;
  school: SchoolSettings;
  term: number;
  academicYear: string;
  subjectsData: Array<{
    subjectName: string;
    teacherName: string;
    coefficient: number;
    mInt?: number | string;
    devoirsStr?: string;
    gradesStr?: string;
    examScore?: number;
    average: number;
    weightedPoints: number;
    rank: number;
    appreciation: string;
  }>;
  summary: {
    totalCoeff: number;
    totalPoints: number;
    overallAverage: number;
    classAverage: number;
    rank: number;
    totalStudents: number;
    mention: string;
    absences: number;
    lates: number;
    teacherRemark: string;
  };
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const isSecondary =
    student.schoolClass?.level === "COLLEGE" ||
    student.schoolClass?.level === "LYCEE" ||
    (!student.schoolClass?.name?.toLowerCase().includes("cm") &&
      !student.schoolClass?.name?.toLowerCase().includes("ci") &&
      !student.schoolClass?.name?.toLowerCase().includes("cp") &&
      !student.schoolClass?.name?.toLowerCase().includes("ce"));

  const periodLabel = isSecondary
    ? `SEMESTRE ${term}`
    : term === 1
    ? "1er TRIMESTRE"
    : term === 2
    ? "2ème TRIMESTRE"
    : "3ème TRIMESTRE";

  const qrData = `BENIN-EDU:MAT=${student.matricule}|ECOLE=${school.name}|PERIODE=${periodLabel}|ANNEE=${academicYear}|MOY=${summary.overallAverage}|RANG=${summary.rank}/${summary.totalStudents}`;
  const qrDataUrl = await generateQrDataUrl(qrData);

  // Bordure générale
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, 194, 281);
  doc.setLineWidth(0.2);
  doc.rect(9.5, 9.5, 191, 278);

  // Cartouche officiel République du Bénin
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("RÉPUBLIQUE DU BÉNIN", 15, 15);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.text("Fraternité - Justice - Travail", 15, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE,", 15, 23);
  doc.text("TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE", 15, 26);
  doc.text("DDESTFP DU LITTORAL - COTONOU", 15, 29);

  // Titre Établissement (Centre-Droite)
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(100, 12, 98, 20, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text(school.name.toUpperCase(), 149, 18, { align: "center" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Devise : "${school.motto}"`, 149, 23, { align: "center" });
  doc.text(
    `${school.address.split(",")[0]}, Cotonou | Tél : ${school.phone.split("/")[0]}`,
    149,
    28,
    { align: "center" }
  );

  // Titre du Bulletin
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 36, 190, 9, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    `BULLETIN OFFICIEL DE NOTES • ${periodLabel} • ANNÉE SCOLAIRE ${academicYear}`,
    105,
    42,
    { align: "center" }
  );

  // Fiche Élève
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 48, 186, 27, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Nom & Prénoms :", 16, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, 50, 54);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("N° Matricule :", 16, 61);
  doc.setFont("helvetica", "normal");
  doc.text(student.matricule, 50, 61);

  doc.setFont("helvetica", "bold");
  doc.text("Date & Lieu de Naissance :", 16, 68);
  doc.setFont("helvetica", "normal");
  const birthFormatted = new Date(student.birthDate).toLocaleDateString("fr-FR");
  doc.text(`${birthFormatted} à ${student.birthPlace || "Cotonou"}`, 62, 68);

  // Colonne Droite
  doc.setFont("helvetica", "bold");
  doc.text("Classe fréquentée :", 120, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.text(student.schoolClass?.name || "Terminale D", 155, 54);

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Effectif de la classe :", 120, 61);
  doc.setFont("helvetica", "normal");
  doc.text(`${summary.totalStudents} élèves`, 155, 61);

  doc.setFont("helvetica", "bold");
  doc.text("Professeur Responsable :", 120, 68);
  doc.setFont("helvetica", "normal");
  const teacherFullName = student.schoolClass?.mainTeacher
    ? `${student.schoolClass.mainTeacher.firstName} ${student.schoolClass.mainTeacher.lastName}`
    : "M. Romaric Gbaguidi";
  doc.text(teacherFullName, 160, 68);

  // Tableau des Matières (Normes Système Éducatif Béninois)
  const tableRows = subjectsData.map((s) => [
    s.subjectName,
    s.teacherName,
    s.coefficient.toString(),
    s.mInt !== undefined
      ? typeof s.mInt === "number"
        ? s.mInt.toFixed(2)
        : s.mInt
      : s.average
      ? (s.average - 0.2).toFixed(2)
      : "-",
    s.devoirsStr || s.gradesStr || "-",
    s.average.toFixed(2),
    s.weightedPoints.toFixed(2),
    s.rank > 0 ? `${s.rank}e` : "-",
    s.appreciation,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [
      [
        "Matières d'Enseignement",
        "Professeur",
        "Coeff",
        "Moy. Interros",
        "Devoirs (DS1, DS2, DS3)",
        "Moy /20",
        "Points",
        "Rang",
        "Appréciations des Enseignants",
      ],
    ],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: 24 },
      2: { cellWidth: 11, halign: "center" },
      3: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 28, halign: "center" },
      5: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      6: { cellWidth: 14, halign: "center" },
      7: { cellWidth: 10, halign: "center" },
      8: { cellWidth: 24 },
    },
    margin: { left: 12, right: 12 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // Récapitulatif Semestriel / Trimestriel
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, finalY, 186, 44, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);

  doc.text(`BILAN PÉDAGOGIQUE DU ${isSecondary ? "SEMESTRE" : "TRIMESTRE"}`, 16, finalY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(`Total des Coefficients : ${summary.totalCoeff}`, 16, finalY + 14);
  doc.text(`Total des Points Pondérés : ${summary.totalPoints.toFixed(2)}`, 16, finalY + 20);
  doc.text(`Moyenne Générale de la Classe : ${summary.classAverage.toFixed(2)} / 20`, 16, finalY + 26);

  // Moyenne Générale mise en valeur
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(70, finalY + 6, 60, 24, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("MOYENNE GÉNÉRALE (MGP)", 100, finalY + 12, { align: "center" });
  doc.setFontSize(16);
  doc.text(`${summary.overallAverage.toFixed(2)} / 20`, 100, finalY + 20, {
    align: "center",
  });
  doc.setFontSize(8.5);
  doc.text(
    `Rang : ${summary.rank}${summary.rank === 1 ? "er" : "ème"} sur ${summary.totalStudents}`,
    100,
    finalY + 26,
    { align: "center" }
  );

  // Assiduité & Discipline
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Discipline & Assiduité", 138, finalY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(`Absences : ${summary.absences} heure(s)`, 138, finalY + 14);
  doc.text(`Retards : ${summary.lates} fois`, 138, finalY + 20);

  // Mentions officielles béninoises
  doc.setFont("helvetica", "bold");
  doc.text("Décision du Conseil de Classe :", 16, finalY + 34);
  doc.setTextColor(15, 118, 110);
  doc.text(summary.mention.toUpperCase(), 68, finalY + 34);

  doc.setTextColor(30, 41, 59);
  doc.text("Avis du Titulaire :", 16, finalY + 40);
  doc.setFont("helvetica", "normal");
  doc.text(
    summary.teacherRemark || `${isSecondary ? "Semestre" : "Trimestre"} très satisfaisant, continuez ainsi.`,
    48,
    finalY + 40
  );

  // Signatures et Authentification
  const sigY = finalY + 49;

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 16, sigY, 26, 26);
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Vérification QR MESTFP Bénin", 29, sigY + 29, { align: "center" });
    doc.text(student.matricule, 29, sigY + 32, { align: "center" });
  }

  // Visa du Titulaire
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Le Professeur Principal", 85, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text("Visa & Observations", 85, sigY + 9, { align: "center" });
  doc.text("[ Lu et approuvé ]", 85, sigY + 24, { align: "center" });

  // Visa et Cachet du Chef d'Établissement
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Le Directeur des Études / Proviseur", 160, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(school.directorName, 160, sigY + 10, { align: "center" });

  // Cachet béninois officiel
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.6);
  doc.circle(160, sigY + 22, 11);
  doc.setFontSize(5.5);
  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DU BÉNIN", 160, sigY + 19, { align: "center" });
  doc.text("COMPLEXE LES ÉTOILES", 160, sigY + 22, { align: "center" });
  doc.text("* DIRECTION COTONOU *", 160, sigY + 25, { align: "center" });

  // Pied de page légal
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Document scolaire officiel certifié • Conforme aux programmes et normes du MESTFP - République du Bénin.",
    105,
    285,
    { align: "center" }
  );

  doc.save(`Bulletin_${student.matricule}_T${term}.pdf`);
}

// 2. CARTE SCOLAIRE CR80 (BÉNIN)
export async function generateStudentCardPdf({
  student,
  school,
  academicYear,
}: {
  student: Student;
  school: SchoolSettings;
  academicYear: string;
}) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [85.6, 53.98],
  });

  const qrData = `BENIN-CARD:ID=${student.matricule}|NOM=${student.lastName}_${student.firstName}|CLASSE=${student.schoolClass?.name}|ANNEE=${academicYear}|URGENCE=${student.parentPhone}`;
  const qrDataUrl = await generateQrDataUrl(qrData);

  // Fond
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 85.6, 53.98, "F");

  // Bandeau supérieur
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 85.6, 12.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("RÉPUBLIQUE DU BÉNIN • MESTFP", 42.8, 4.5, { align: "center" });
  doc.setFontSize(7);
  doc.text(school.name.toUpperCase(), 42.8, 8, { align: "center" });
  doc.setFontSize(5);
  doc.setFont("helvetica", "normal");
  doc.text(`CARTE D'IDENTITÉ SCOLAIRE • ${academicYear}`, 42.8, 11.5, {
    align: "center",
  });

  // Cadre Photo
  doc.setFillColor(226, 232, 240);
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.4);
  doc.roundedRect(4, 15, 20, 24, 1.5, 1.5, "FD");

  doc.setTextColor(15, 118, 110);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;
  doc.text(initials, 14, 28, { align: "center" });
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "normal");
  doc.text("PHOTO", 14, 34, { align: "center" });

  // Détails Élève
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.lastName.toUpperCase()}`, 27, 18);
  doc.setFontSize(6.5);
  doc.text(`${student.firstName}`, 27, 22);

  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Matricule :", 27, 27);
  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.text(student.matricule, 42, 27);

  doc.setTextColor(100, 116, 139);
  doc.text("Classe :", 27, 31);
  doc.setTextColor(15, 23, 42);
  doc.text(student.schoolClass?.name || "-", 42, 31);

  doc.setTextColor(100, 116, 139);
  doc.text("Né(e) le :", 27, 35);
  doc.setTextColor(15, 23, 42);
  doc.text(new Date(student.birthDate).toLocaleDateString("fr-FR"), 42, 35);

  doc.setTextColor(100, 116, 139);
  doc.text("Urgence :", 27, 39);
  doc.setTextColor(225, 29, 72);
  doc.text(student.parentPhone, 42, 39);

  // QR Code
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 62, 16, 20, 20);
    doc.setFontSize(4);
    doc.setTextColor(100, 116, 139);
    doc.text("Contrôle DDESTFP", 72, 38, { align: "center" });
  }

  // Bandeau inférieur
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 48.5, 85.6, 5.48, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Cotonou • Bénin | Tél : ${school.phone.split("/")[0]} | Validité : ${academicYear}`,
    42.8,
    52,
    { align: "center" }
  );

  doc.save(`Carte_Scolaire_${student.matricule}.pdf`);
}

// 3. CERTIFICAT DE SCOLARITÉ (BÉNIN)
export async function generateSchoolCertificatePdf({
  student,
  school,
  academicYear,
}: {
  student: Student;
  school: SchoolSettings;
  academicYear: string;
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const certNumber = `CERT-COT-${academicYear.split("-")[0]}-${student.matricule.slice(-4)}`;
  const qrData = `BENIN-CERT:${certNumber}|STUDENT=${student.matricule}|CLASS=${student.schoolClass?.name}|DATE=${new Date().toISOString()}`;
  const qrDataUrl = await generateQrDataUrl(qrData);

  // Bordures
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.2);
  doc.rect(11.5, 11.5, 187, 274);

  // En-tête officiel béninois
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("RÉPUBLIQUE DU BÉNIN", 105, 22, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Fraternité - Justice - Travail", 105, 26, { align: "center" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE, TECHNIQUE", 105, 31, { align: "center" });
  doc.text("ET DE LA FORMATION PROFESSIONNELLE (MESTFP)", 105, 35, { align: "center" });
  doc.text("DIRECTION DÉPARTEMENTALE DES ENSEIGNEMENTS DU LITTORAL", 105, 39, { align: "center" });

  // Établissement
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.text(school.name.toUpperCase(), 105, 47, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(`"${school.motto}"`, 105, 52, { align: "center" });
  doc.text(
    `${school.address} - Tél: ${school.phone} - Email: ${school.email}`,
    105,
    57,
    { align: "center" }
  );

  // Titre Certificat
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(35, 68, 140, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICAT DE SCOLARITÉ", 105, 77, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`N° Enregistrement : ${certNumber}`, 105, 88, { align: "center" });

  // Texte
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  const text1 =
    `Je soussigné(e), ${school.directorName}, Chef d'Établissement du ${school.name} à Cotonou, atteste par la présente que l'élève :`;
  const splitText1 = doc.splitTextToSize(text1, 160);
  doc.text(splitText1, 25, 102);

  // Encadré de l'élève
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(25, 114, 160, 48, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.text("Nom & Prénoms :", 32, 124);
  doc.setTextColor(15, 118, 110);
  doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, 75, 124);

  doc.setTextColor(30, 41, 59);
  doc.text("Date & Lieu de Naissance :", 32, 132);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${new Date(student.birthDate).toLocaleDateString("fr-FR")} à ${student.birthPlace || "Cotonou"}`,
    85,
    132
  );

  doc.setFont("helvetica", "bold");
  doc.text("Numéro Matricule National :", 32, 140);
  doc.setFont("helvetica", "normal");
  doc.text(student.matricule, 88, 140);

  doc.setFont("helvetica", "bold");
  doc.text("Classe fréquentée :", 32, 148);
  doc.setTextColor(15, 118, 110);
  doc.text(
    `${student.schoolClass?.name || "Terminale D"} (${student.schoolClass?.level || "LYCÉE"}) - République du Bénin`,
    75,
    148
  );

  // Texte de validité
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  const text2 =
    `est régulièrement inscrit(e) sur les registres matricules de notre établissement et suit assidûment les cours pour le compte de l'année scolaire ${academicYear}.\n\nEn foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit auprès de toutes autorités administratives, scolaires ou de bourses compétentes.`;
  const splitText2 = doc.splitTextToSize(text2, 160);
  doc.text(splitText2, 25, 172);

  // Lieu et Date
  const todayStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setFont("helvetica", "italic");
  doc.text(`Fait à Cotonou, le ${todayStr}`, 115, 212);

  // QR Code
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 30, 222, 28, 28);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Vérification d'authenticité", 44, 253, { align: "center" });
    doc.text(`Réf : ${certNumber}`, 44, 257, { align: "center" });
  }

  // Signature et Cachet
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Le Chef d'Établissement / Proviseur", 145, 224, { align: "center" });
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(school.directorName, 145, 230, { align: "center" });

  doc.setDrawColor(15, 118, 110);
  doc.circle(145, 245, 13);
  doc.setFontSize(6);
  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DU BÉNIN", 145, 242, { align: "center" });
  doc.text("MESTFP - DDESTFP LITTORAL", 145, 245, { align: "center" });
  doc.text("* DIRECTION COTONOU *", 145, 249, { align: "center" });

  doc.save(`Certificat_Scolarite_${student.matricule}.pdf`);
}

// 4. REÇU DE PAIEMENT NUMÉROTÉ (BÉNIN)
export async function generatePaymentReceiptPdf({
  payment,
  student,
  school,
  totalPaid,
  totalTuition,
}: {
  payment: {
    receiptNumber: string;
    amount: number;
    paymentType: string;
    paymentMethod: string;
    reference?: string | null;
    date: string | Date;
    recordedBy: string;
    note?: string | null;
  };
  student: Student;
  school: SchoolSettings;
  totalPaid: number;
  totalTuition: number;
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

  const remaining = Math.max(0, totalTuition - totalPaid);
  const qrData = `BENIN-PAY:${payment.receiptNumber}|STUDENT=${student.matricule}|MONTANT=${payment.amount}|DATE=${payment.date}|SOLDE=${remaining}`;
  const qrDataUrl = await generateQrDataUrl(qrData);

  // Bordure
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, 132, 194);

  // Bandeau Supérieur
  doc.setFillColor(15, 118, 110);
  doc.rect(8.5, 8.5, 131, 20, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text(school.name.toUpperCase(), 74, 16, { align: "center" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Service de l'Économat & Caisse • Cotonou, Bénin | Tél : ${school.phone}`,
    74,
    22,
    { align: "center" }
  );

  // Titre Reçu
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("REÇU OFFICIEL DE SCOLARITÉ", 74, 35, { align: "center" });

  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text(`N° ${payment.receiptNumber}`, 74, 40, { align: "center" });

  // Fiche Élève
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 45, 124, 25, 2, 2, "FD");

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Élève :", 16, 52);
  doc.setFont("helvetica", "normal");
  doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, 38, 52);

  doc.setFont("helvetica", "bold");
  doc.text("Matricule :", 16, 58);
  doc.setFont("helvetica", "normal");
  doc.text(student.matricule, 38, 58);

  doc.setFont("helvetica", "bold");
  doc.text("Classe :", 85, 52);
  doc.setFont("helvetica", "normal");
  doc.text(student.schoolClass?.name || "-", 100, 52);

  doc.setFont("helvetica", "bold");
  doc.text("Tuteur :", 85, 58);
  doc.setFont("helvetica", "normal");
  doc.text(student.parentName, 100, 58);

  doc.setFont("helvetica", "bold");
  doc.text("Date versement :", 16, 64);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(payment.date).toLocaleDateString("fr-FR"), 40, 64);

  // Table Versement
  const paymentTypeLabels: Record<string, string> = {
    REGISTRATION: "Frais d'inscription & Carnet de liaison",
    TRANCHE_1: "Scolarité - 1ère Tranche",
    TRANCHE_2: "Scolarité - 2ème Tranche",
    TRANCHE_3: "Scolarité - 3ème Tranche",
    FULL: "Règlement intégral de scolarité",
    OTHER: "Autre versement",
  };

  const methodLabels: Record<string, string> = {
    CASH: "Espèces (Caisse Centrale)",
    MOBILE_MONEY: "MTN MoMo / Moov Money / Celtiis",
    BANK_TRANSFER: "Virement Bancaire (BOA / Ecobank)",
    CHECK: "Chèque certifié",
  };

  autoTable(doc, {
    startY: 74,
    head: [["Libellé de l'opération", "Mode de Règlement", "Montant Versé"]],
    body: [
      [
        paymentTypeLabels[payment.paymentType] || payment.paymentType,
        methodLabels[payment.paymentMethod] || payment.paymentMethod,
        `${payment.amount.toLocaleString("fr-FR")} ${school.currency}`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold" },
      1: { cellWidth: 35, halign: "center" },
      2: { cellWidth: 34, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 12, right: 12 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Bilan Financier
  doc.setFillColor(241, 245, 249);
  doc.rect(12, finalY, 124, 28, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Montant total scolarité annuelle :", 16, finalY + 6);
  doc.text(`${totalTuition.toLocaleString("fr-FR")} ${school.currency}`, 130, finalY + 6, {
    align: "right",
  });

  doc.text("Cumul total réglé à ce jour :", 16, finalY + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.text(`${totalPaid.toLocaleString("fr-FR")} ${school.currency}`, 130, finalY + 12, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("SOLDE RESTANT DÛ :", 16, finalY + 20);
  doc.setFontSize(9);
  doc.setTextColor(remaining > 0 ? 225 : 15, remaining > 0 ? 29 : 118, remaining > 0 ? 72 : 110);
  doc.text(`${remaining.toLocaleString("fr-FR")} ${school.currency}`, 130, finalY + 20, {
    align: "right",
  });

  if (payment.reference) {
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Réf Transaction : ${payment.reference}`, 16, finalY + 25);
  }

  // QR et Signature
  const sigY = finalY + 34;

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 16, sigY, 22, 22);
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text("Contrôle Économat Bénin", 27, sigY + 24, { align: "center" });
  }

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("L'Économe / Caissier(e)", 105, sigY + 4, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(payment.recordedBy || "Mme Clarisse Houndété", 105, sigY + 10, {
    align: "center",
  });

  doc.setDrawColor(15, 118, 110);
  doc.circle(105, sigY + 18, 8);
  doc.setFontSize(4.5);
  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.text("CAISSE ÉCONOMAT", 105, sigY + 17, { align: "center" });
  doc.text("PAYÉ / REÇU", 105, sigY + 20, { align: "center" });

  doc.save(`Recu_${payment.receiptNumber}.pdf`);
}
