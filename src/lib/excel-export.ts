import * as XLSX from "xlsx";
import { Student, Payment } from "@/types";

export function exportClassListToExcel(
  students: Student[],
  className: string,
  academicYear: string
) {
  const data = students.map((s, index) => ({
    N: index + 1,
    Matricule: s.matricule,
    "Nom de famille": s.lastName.toUpperCase(),
    Prénoms: s.firstName,
    Genre: s.gender === "M" ? "Masculin" : "Féminin",
    "Date de naissance": new Date(s.birthDate).toLocaleDateString("fr-FR"),
    "Lieu de naissance": s.birthPlace,
    "Nom du Tuteur": s.parentName,
    "Téléphone Tuteur": s.parentPhone,
    "WhatsApp Tuteur": s.parentWhatsApp,
    "Adresse géographique": s.address,
    "Observations Médicales": s.medicalNotes || "R.A.S.",
    Statut: s.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Classe ${className}`);

  // Auto-width adjustment
  worksheet["!cols"] = [
    { wch: 4 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 10 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 },
    { wch: 25 },
    { wch: 10 },
  ];

  XLSX.writeFile(workbook, `Liste_Eleves_${className}_${academicYear}.xlsx`);
}

export function exportGradesToExcel({
  className,
  subjectName,
  term,
  academicYear,
  records,
}: {
  className: string;
  subjectName: string;
  term: number;
  academicYear: string;
  records: Array<{
    rank: number;
    matricule: string;
    studentName: string;
    interro1?: number;
    interro2?: number;
    devoir?: number;
    compo?: number;
    moyenne: number;
    mention: string;
  }>;
}) {
  const data = records.map((r) => ({
    Rang: r.rank,
    Matricule: r.matricule,
    "Nom & Prénoms": r.studentName,
    "Interro 1": r.interro1 !== undefined ? r.interro1 : "-",
    "Interro 2": r.interro2 !== undefined ? r.interro2 : "-",
    "Devoir Surveillé": r.devoir !== undefined ? r.devoir : "-",
    Composition: r.compo !== undefined ? r.compo : "-",
    "Moyenne /20": r.moyenne.toFixed(2),
    Mention: r.mention,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Relevé de notes");

  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 26 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 25 },
  ];

  XLSX.writeFile(
    workbook,
    `Notes_${className}_${subjectName}_T${term}_${academicYear}.xlsx`
  );
}

export function exportFinancialReportToExcel({
  payments,
  insolventStudents,
  academicYear,
}: {
  payments: Payment[];
  insolventStudents: Array<{
    matricule: string;
    studentName: string;
    className: string;
    parentPhone: string;
    totalExpected: number;
    totalPaid: number;
    balanceDue: number;
  }>;
  academicYear: string;
}) {
  const workbook = XLSX.utils.book_new();

  // 1. Transactions Sheet
  const txData = payments.map((p, idx) => ({
    N: idx + 1,
    "N° Reçu": p.receiptNumber,
    Date: new Date(p.date).toLocaleDateString("fr-FR"),
    Matricule: p.student?.matricule || "-",
    Élève: p.student ? `${p.student.lastName} ${p.student.firstName}` : "-",
    Classe: p.student?.schoolClass?.name || "-",
    Type: p.paymentType,
    Mode: p.paymentMethod,
    "Montant (FCFA)": p.amount,
    Référence: p.reference || "-",
    Caissier: p.recordedBy,
  }));
  const txSheet = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(workbook, txSheet, "Journal des Encaissements");

  // 2. Insolvables Sheet
  const insolvData = insolventStudents.map((s, idx) => ({
    N: idx + 1,
    Matricule: s.matricule,
    "Nom de l'élève": s.studentName,
    Classe: s.className,
    "Contact Relance Tuteur": s.parentPhone,
    "Total Scolarité": s.totalExpected,
    "Total Déjà Versé": s.totalPaid,
    "RESTE DÛ (Impayé)": s.balanceDue,
  }));
  const insolvSheet = XLSX.utils.json_to_sheet(insolvData);
  XLSX.utils.book_append_sheet(workbook, insolvSheet, "Élèves Insolvables");

  XLSX.writeFile(workbook, `Etat_Financier_Scolarite_${academicYear}.xlsx`);
}
