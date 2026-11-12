"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Award,
  Wallet,
  Clock,
  Printer,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Student, SchoolSettings } from "@/types";
import {
  generateReportCardPdf,
  generateStudentCardPdf,
  generatePaymentReceiptPdf,
} from "@/lib/pdf-generator";
import { formatCurrency } from "@/lib/utils";

interface ParentPortalProps {
  students: Student[];
  schoolSettings: SchoolSettings;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  schoolSettings,
}) => {
  // Let's pick student 0 as default demo student for this parent
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ""
  );

  const student = students.find((s) => s.id === selectedStudentId) || students[0];
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Mocked rich grade data for the active student (Bénin Série D - Semestre 1)
  const gradesData = [
    { subject: "Sciences de la Vie et de la Terre (SVT)", coeff: 5, mInt: 15.5, ds1: 15.0, ds2: 16.0, ds3: 16.5, avg: 15.75, appreciation: "Excellente analyse et rigueur scientifique" },
    { subject: "Mathématiques", coeff: 4, mInt: 16.5, ds1: 16.0, ds2: 17.0, ds3: 17.5, avg: 16.75, appreciation: "Raisonnement très solide" },
    { subject: "Physique, Chimie et Technologie (PCT)", coeff: 4, mInt: 15.0, ds1: 15.5, ds2: 15.0, ds3: 16.5, avg: 15.50, appreciation: "Très bonne maîtrise des lois physiques et calculs" },
    { subject: "Français & Expression Écrite", coeff: 2, mInt: 13.5, ds1: 13.0, ds2: 14.0, ds3: 14.5, avg: 13.75, appreciation: "Expression soignée et argumentée" },
    { subject: "Philosophie", coeff: 2, mInt: 12.0, ds1: 12.5, ds2: 13.0, ds3: 13.0, avg: 12.63, appreciation: "Bonne réflexion conceptuelle" },
    { subject: "Anglais", coeff: 2, mInt: 15.0, ds1: 15.5, ds2: 16.0, ds3: 16.0, avg: 15.63, appreciation: "Très bonne aisance à l'écrit" },
    { subject: "Histoire-Géographie", coeff: 2, mInt: 14.0, ds1: 14.0, ds2: 14.5, ds3: 15.0, avg: 14.38, appreciation: "Bonne maîtrise des repères historiques" },
    { subject: "EPS", coeff: 1, mInt: 17.0, ds1: 16.5, ds2: 16.0, ds3: 17.0, avg: 16.63, appreciation: "Excellente condition physique" },
  ];

  const overallAvg = 15.65;
  const studentRank = 2;
  const totalStudents = 10;
  const mention = "Tableau d'Honneur avec Félicitations (Très Bien)";

  // Tuition financial status
  const tuitionTotal = 500000;
  const tuitionPaid = 310000;
  const tuitionRemaining = tuitionTotal - tuitionPaid;

  // Handle Download Report Card
  const handleDownloadReportCard = async () => {
    if (!student) return;

    const subjectsData = gradesData.map((g) => ({
      subjectName: g.subject,
      teacherName: "M. Romaric Gbaguidi",
      coefficient: g.coeff,
      mInt: g.mInt,
      devoirsStr: `${g.ds1.toFixed(1)} | ${g.ds2.toFixed(1)} | ${g.ds3.toFixed(1)}`,
      gradesStr: `DS1: ${g.ds1.toFixed(1)} | DS2: ${g.ds2.toFixed(1)} | DS3: ${g.ds3.toFixed(1)}`,
      examScore: g.avg,
      average: g.avg,
      weightedPoints: parseFloat((g.avg * g.coeff).toFixed(2)),
      rank: 2,
      appreciation: g.appreciation,
    }));

    await generateReportCardPdf({
      student,
      school: schoolSettings,
      term: 1,
      academicYear: "2025-2026",
      subjectsData,
      summary: {
        totalCoeff: 19,
        totalPoints: 297.35,
        overallAverage: overallAvg,
        classAverage: 12.8,
        rank: studentRank,
        totalStudents: totalStudents,
        mention: mention,
        absences: 2,
        lates: 1,
        teacherRemark: "Élève sérieux, assidu et très motivé. Félicitations du conseil !",
      },
    });

    showToast("Bulletin officiel du 1er Semestre téléchargé avec succès !");
  };

  // Handle Download Badge
  const handleDownloadCard = async () => {
    if (!student) return;
    await generateStudentCardPdf({
      student,
      school: schoolSettings,
      academicYear: "2025-2026",
    });
    showToast("Carte scolaire téléchargée !");
  };

  // Handle Download Receipt
  const handleDownloadReceipt = async () => {
    if (!student) return;
    await generatePaymentReceiptPdf({
      payment: {
        receiptNumber: "REC-COT-2026-0042",
        amount: 135000,
        paymentType: "TRANCHE_1",
        paymentMethod: "MOBILE_MONEY",
        reference: "MTN-MOMO-BENIN-99482",
        date: new Date("2025-10-14"),
        recordedBy: "Mme Clarisse Houndété (Économe)",
      },
      student,
      school: schoolSettings,
      totalPaid: tuitionPaid,
      totalTuition: tuitionTotal,
    });
    showToast("Reçu de paiement officiel téléchargé !");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-sage-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-coral-900 via-slate-900 to-marine-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-coral-500/20 border border-coral-400/30 flex items-center justify-center font-extrabold text-2xl text-coral-300">
            {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-coral-200 mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Espace Tuteur & Suivi Parental en Temps Réel</span>
            </div>
            <h2 className="text-xl font-black">
              {student ? `${student.lastName.toUpperCase()} ${student.firstName}` : "Élève"}
            </h2>
            <p className="text-xs text-slate-300">
              Classe de <span className="font-bold text-white">{student?.schoolClass?.name || "Terminale D"}</span> • Matricule :{" "}
              <span className="font-mono text-emerald-300">{student?.matricule}</span>
            </p>
          </div>
        </div>

        {/* Quick Documents Download */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCard}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Badge Scolaire QR</span>
          </button>
          <button
            onClick={handleDownloadReportCard}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger Bulletin Semestre 1</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Moyenne */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Moyenne Générale (S1)
          </span>
          <div className="text-3xl font-black text-emerald-600">
            {overallAvg} <span className="text-sm font-medium text-slate-400">/ 20</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Moyenne de classe: 12.80</p>
        </div>

        {/* Rang */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Rang dans la Classe
          </span>
          <div className="text-3xl font-black text-slate-900">
            {studentRank}
            <span className="text-sm font-semibold text-amber-500">ème</span>
            <span className="text-sm font-medium text-slate-400"> / {totalStudents}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Dans le Top 20% de l'établissement
          </p>
        </div>

        {/* Mention */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Distinction / Mention
          </span>
          <div className="text-sm font-black text-amber-600 mt-1">
            {mention}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Décerné par le Conseil de Classe</p>
        </div>

        {/* Assiduité */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Vie Scolaire & Présence
          </span>
          <div className="text-sm font-bold text-slate-800 mt-1">
            0 absence non justifiée
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1 retard de 15 min régularisé</p>
        </div>
      </div>

      {/* Main Grid: Grades Table & Financial State */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grades Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Relevé Détaillé des Notes par Matière</span>
              </h3>
              <p className="text-xs text-slate-500">Évaluations continues du Semestre 1 (Bénin)</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Validé par la Direction
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Matière</th>
                  <th className="py-2.5 px-3 text-center">Coeff</th>
                  <th className="py-2.5 px-3 text-center bg-amber-50/50 text-amber-900">Moy. Interros</th>
                  <th className="py-2.5 px-3 text-center bg-blue-50/50 text-blue-900">Devoirs (DS1, DS2, DS3)</th>
                  <th className="py-2.5 px-3 text-center bg-emerald-50/50 text-emerald-900">Moy. Semestre</th>
                  <th className="py-2.5 px-3">Appréciation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradesData.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{g.subject}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{g.coeff}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-amber-800 bg-amber-50/20">{g.mInt.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700 bg-blue-50/20">{g.ds1.toFixed(1)} | {g.ds2.toFixed(1)} | {g.ds3.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {g.avg.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 italic text-[11px]">
                      {g.appreciation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tuition State & Receipts */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-marine-600" />
              <span>Situation Comptable</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">2025-2026</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Scolarité Annuelle :</span>
              <span className="font-bold text-slate-900">{formatCurrency(tuitionTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Versé :</span>
              <span className="font-bold text-emerald-600">{formatCurrency(tuitionPaid)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-800">Reste à solder :</span>
              <span className="font-black text-coral-600">{formatCurrency(tuitionRemaining)}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Dernier Reçu de Paiement
            </h4>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-sage-800">REC-2026-0042</span>
                <span className="font-bold text-emerald-700">+150 000 FCFA</span>
              </div>
              <p className="text-[11px] text-slate-500">1ère Tranche • Mobile Money Orange</p>
              <button
                onClick={handleDownloadReceipt}
                className="w-full mt-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-sage-600" />
                <span>Télécharger Reçu PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
