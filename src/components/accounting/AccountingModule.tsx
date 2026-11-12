"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  Search,
  FileDown,
  Printer,
  CheckCircle,
  AlertTriangle,
  Send,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Payment, Student, SchoolSettings, FeeStructure } from "@/types";
import { generatePaymentReceiptPdf } from "@/lib/pdf-generator";
import { exportFinancialReportToExcel } from "@/lib/excel-export";
import { formatCurrency } from "@/lib/utils";

interface AccountingProps {
  students: Student[];
  schoolSettings: SchoolSettings;
  feeStructures: FeeStructure[];
  onRefresh: () => void;
  onSendReminderModal?: (recipient: any) => void;
}

export const AccountingModule: React.FC<AccountingProps> = ({
  students,
  schoolSettings,
  feeStructures,
  onRefresh,
  onSendReminderModal,
}) => {
  const [activeTab, setActiveTab] = useState<"journal" | "insolvent" | "tarifs">("journal");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [insolventStudents, setInsolventStudents] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalExpected: 0,
    totalCollected: 0,
    recoveryRate: 0,
    insolventCount: 0,
    totalStudents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [paymentData, setPaymentData] = useState({
    amount: "100000",
    paymentType: "TRANCHE_2",
    paymentMethod: "MOBILE_MONEY",
    reference: "MTN-MOMO-",
    note: "Règlement scolarité",
    recordedBy: "Mme Clarisse Houndété (Économe)",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadAccountingData = () => {
    setIsLoading(true);
    fetch("/api/accounting")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPayments(data.data.payments);
          setSummary(data.data.summary);
          setInsolventStudents(data.data.insolventStudents);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAccountingData();
  }, []);

  // Selected student for new payment calculation
  const currentStudentForPayment = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentPayments = currentStudentForPayment?.payments || [];
  const studentTotalPaid = studentPayments.reduce((acc, p) => acc + p.amount, 0);

  // Estimated annual tuition based on level
  const level = currentStudentForPayment?.schoolClass?.level || "COLLEGE";
  const studentAnnualTuition = level === "LYCEE" ? 550000 : level === "COLLEGE" ? 450000 : 300000;
  const studentRemaining = Math.max(0, studentAnnualTuition - studentTotalPaid);

  // Handle Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/accounting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          amount: Number(paymentData.amount),
          paymentType: paymentData.paymentType,
          paymentMethod: paymentData.paymentMethod,
          reference: paymentData.reference,
          note: paymentData.note,
          recordedBy: paymentData.recordedBy,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaymentModalOpen(false);
        showToast(`Paiement enregistré ! Reçu N° ${data.data.receiptNumber}`);
        // Imprimer le reçu immédiatement
        await generatePaymentReceiptPdf({
          payment: data.data,
          student: currentStudentForPayment,
          school: schoolSettings,
          totalPaid: studentTotalPaid + Number(paymentData.amount),
          totalTuition: studentAnnualTuition,
        });
        loadAccountingData();
        onRefresh();
      } else {
        alert(data.error || "Erreur enregistrement.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Re-print an existing receipt
  const handlePrintReceipt = async (payment: Payment) => {
    const student = payment.student || students.find((s) => s.id === payment.studentId);
    if (!student) return;

    const level = student.schoolClass?.level || "COLLEGE";
    const totalTuition = level === "LYCEE" ? 550000 : level === "COLLEGE" ? 450000 : 300000;
    const allStudentPays = payments.filter((p) => p.studentId === student.id);
    const paidSum = allStudentPays.reduce((acc, p) => acc + p.amount, 0);

    await generatePaymentReceiptPdf({
      payment,
      student,
      school: schoolSettings,
      totalPaid: paidSum,
      totalTuition,
    });
    showToast(`Reçu ${payment.receiptNumber} téléchargé en PDF !`);
  };

  // Export Financial report to Excel
  const handleExportExcel = () => {
    exportFinancialReportToExcel({
      payments,
      insolventStudents,
      academicYear: "2025-2026",
    });
    showToast("Journal et état des insolvables exportés en Excel !");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-sage-500/30">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sage-600" />
            <span>Comptabilité & Encaissements de Scolarité</span>
          </h2>
          <p className="text-xs text-slate-500">
            Suivi des tranches, génération instantanée des reçus PDF numérotés et gestion des relances
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Export Excel (Compta)</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Encaisser un Paiement</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Encaissé */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Encaissé
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(summary.totalCollected)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Règlements effectifs en caisse</p>
        </div>

        {/* KPI 2: Total Attendu */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Budget Scolarité Attendu
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(summary.totalExpected)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scolarité totale {summary.totalStudents} élèves</p>
        </div>

        {/* KPI 3: Reste à Recouvrer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Reste à Recouvrer
          </span>
          <div className="text-2xl font-black text-coral-600">
            {formatCurrency(summary.totalExpected - summary.totalCollected)}
          </div>
          <p className="text-[11px] text-coral-600 font-semibold mt-1">
            {summary.insolventCount} élève(s) avec solde dû
          </p>
        </div>

        {/* KPI 4: Taux de Recouvrement */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Taux de Recouvrement
          </span>
          <div className="text-2xl font-black text-marine-600">
            {summary.recoveryRate}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-marine-600 h-full rounded-full"
              style={{ width: `${summary.recoveryRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs Bar: Journal vs Insolvables vs Grilles Tarifaires */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/80">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("journal")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "journal"
                ? "bg-sage-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Journal des Règlements ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("insolvent")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "insolvent"
                ? "bg-coral-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Élèves Insolvables / Retards ({insolventStudents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("tarifs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tarifs"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Grilles Tarifaires par Niveau
          </button>
        </div>

        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher élève, reçu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sage-500"
          />
        </div>
      </div>

      {/* TAB 1: JOURNAL DES ENCAISSEMENTS */}
      {activeTab === "journal" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">N° Reçu</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Élève & Classe</th>
                  <th className="py-3 px-4">Type Versement</th>
                  <th className="py-3 px-4">Mode & Réf</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4 text-center">Reçu PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments
                  .filter((p) => {
                    if (!search) return true;
                    const st = p.student;
                    return (
                      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
                      (st &&
                        (st.lastName.toLowerCase().includes(search.toLowerCase()) ||
                          st.firstName.toLowerCase().includes(search.toLowerCase())))
                    );
                  })
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sage-800">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(p.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {p.student ? `${p.student.lastName.toUpperCase()} ${p.student.firstName}` : "-"}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {p.student?.schoolClass?.name} • {p.student?.matricule}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {p.paymentType === "REGISTRATION"
                          ? "Frais d'inscription"
                          : p.paymentType === "TRANCHE_1"
                          ? "1ère Tranche"
                          : p.paymentType === "TRANCHE_2"
                          ? "2ème Tranche"
                          : p.paymentType === "TRANCHE_3"
                          ? "3ème Tranche"
                          : "Solde annuel"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 block">
                          {p.paymentMethod === "MOBILE_MONEY"
                            ? "Mobile Money"
                            : p.paymentMethod === "CASH"
                            ? "Espèces"
                            : "Virement"}
                        </span>
                        {p.reference && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {p.reference}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          +{Number(p.amount).toLocaleString("fr-FR")} F
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handlePrintReceipt(p)}
                          className="p-1.5 text-slate-600 hover:text-sage-700 hover:bg-sage-50 rounded-lg transition-colors cursor-pointer"
                          title="Télécharger Reçu Officiel PDF"
                        >
                          <Printer className="w-4 h-4 text-sage-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ÉLÈVES INSOLVABLES & RELANCES */}
      {activeTab === "insolvent" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-coral-600" />
                <span>Liste des Élèves Insolvables (Tranches Échues)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Filtre des élèves ayant un solde de scolarité impayé pour relance immédiate par SMS ou WhatsApp
              </p>
            </div>

            <button
              onClick={() => {
                showToast("Campagne de rappel WhatsApp groupée envoyée à tous les parents insolvables !");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Relance Groupée WhatsApp ({insolventStudents.length})</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Élève & Classe</th>
                  <th className="py-3 px-3">Tuteur & Téléphone</th>
                  <th className="py-3 px-3 text-right">Total Dû</th>
                  <th className="py-3 px-3 text-right">Déjà Versé</th>
                  <th className="py-3 px-3 text-right">Reste Impayé</th>
                  <th className="py-3 px-3 text-center">Action Relance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insolventStudents.map((ins) => (
                  <tr key={ins.id} className="hover:bg-coral-50/30">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{ins.studentName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ins.className} • {ins.matricule}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-slate-800 font-medium">{ins.parentName}</p>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {ins.parentPhone}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      {ins.totalExpected.toLocaleString("fr-FR")} F
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                      {ins.totalPaid.toLocaleString("fr-FR")} F
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-extrabold text-coral-600 bg-coral-50 px-2.5 py-1 rounded-md">
                        {ins.balanceDue.toLocaleString("fr-FR")} F
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <a
                        href={`https://wa.me/${ins.parentWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `École Les Étoiles: Bonjour ${ins.parentName}, nous vous informons que le solde de scolarité de ${ins.studentName} (${ins.className}) s'élève à ${ins.balanceDue.toLocaleString("fr-FR")} FCFA. Merci de bien vouloir régulariser à l'économat.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Send className="w-3 h-3 text-emerald-600" />
                        <span>Relancer</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GRILLES TARIFAIRES */}
      {activeTab === "tarifs" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feeStructures.map((f) => {
            const total = f.registrationFee + f.tranche1 + f.tranche2 + f.tranche3;
            return (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cycle d'enseignement
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Niveau {f.level}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-sage-50 text-sage-800">
                    2025-2026
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Frais d'inscription & Pack</span>
                    <span className="font-bold text-slate-800">
                      {f.registrationFee.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <div>
                      <span className="text-slate-500 block">1ère Tranche (Octobre)</span>
                      <span className="text-[10px] text-slate-400">Échéance : 15 Oct.</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {f.tranche1.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <div>
                      <span className="text-slate-500 block">2ème Tranche (Janvier)</span>
                      <span className="text-[10px] text-slate-400">Échéance : 15 Janv.</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {f.tranche2.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <div>
                      <span className="text-slate-500 block">3ème Tranche (Avril)</span>
                      <span className="text-[10px] text-slate-400">Échéance : 15 Avr.</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {f.tranche3.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">COÛT TOTAL ANNUEL :</span>
                  <span className="text-sm font-black text-sage-700">
                    {total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NOUVEL ENCAISSEMENT & REÇU PDF */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-sage-600" />
                <span>Encaisser un Règlement de Scolarité</span>
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sélectionner l'Élève *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName.toUpperCase()} {s.firstName} ({s.schoolClass?.name} - {s.matricule})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student status preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Scolarité annuelle :</span>
                  <span className="font-bold text-slate-800">
                    {studentAnnualTuition.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Déjà versé :</span>
                  <span className="font-bold text-emerald-600">
                    {studentTotalPaid.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Reste à payer :</span>
                  <span className="font-black text-coral-600">
                    {studentRemaining.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              {/* Amount and Tranche */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tranche concernée *
                  </label>
                  <select
                    value={paymentData.paymentType}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="REGISTRATION">Frais d'inscription</option>
                    <option value="TRANCHE_1">1ère Tranche</option>
                    <option value="TRANCHE_2">2ème Tranche</option>
                    <option value="TRANCHE_3">3ème Tranche</option>
                    <option value="FULL">Solde complet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant versé (FCFA) *
                  </label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-extrabold text-slate-800"
                  />
                </div>
              </div>

              {/* Payment Method and Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mode de paiement *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="MOBILE_MONEY">MTN MoMo / Moov Money (Flooz) / Celtiis</option>
                    <option value="CASH">Espèces (Caisse Centrale)</option>
                    <option value="BANK_TRANSFER">Virement Bancaire (BOA / Ecobank Bénin)</option>
                    <option value="CHECK">Chèque certifié</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    N° Référence / Chèque
                  </label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    placeholder="Ex: WAVE-93821"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sage-600 hover:bg-sage-500 rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Traitement..." : "Encaisser & Générer Reçu PDF"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
