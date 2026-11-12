"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowRightLeft,
  FileDown,
  CreditCard,
  FileText,
  Phone,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Sparkles,
  HeartPulse,
} from "lucide-react";
import { Student, SchoolClass, SchoolSettings } from "@/types";
import {
  generateStudentCardPdf,
  generateSchoolCertificatePdf,
} from "@/lib/pdf-generator";
import { exportClassListToExcel } from "@/lib/excel-export";

interface StudentsModuleProps {
  students: Student[];
  classes: SchoolClass[];
  schoolSettings: SchoolSettings;
  onRefresh: () => void;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({
  students,
  classes,
  schoolSettings,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReEnrollModalOpen, setIsReEnrollModalOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null);
  const [targetClassId, setTargetClassId] = useState("");
  const [viewDossierStudent, setViewDossierStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "M",
    birthDate: "2012-05-15",
    birthPlace: "Cotonou",
    address: "Haie Vive, Cotonou (Bénin)",
    parentName: "",
    parentPhone: "+229 97 ",
    parentEmail: "",
    parentWhatsApp: "+229 97 ",
    medicalNotes: "R.A.S. - Apte aux activités physiques",
    classId: classes[0]?.id || "",
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClass === "ALL" || s.classId === selectedClass;
    const matchGender = selectedGender === "ALL" || s.gender === selectedGender;
    const matchSearch =
      search === "" ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.matricule.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchGender && matchSearch;
  });

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Handle New Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewModalOpen(false);
        showNotification(`Élève inscrit avec succès ! Matricule : ${data.data.matricule}`);
        onRefresh();
      } else {
        alert(data.error || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 1-Click Re-enrollment to higher class
  const handleReEnroll = async () => {
    if (!selectedStudentForAction || !targetClassId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/students/re-enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentForAction.id,
          targetClassId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsReEnrollModalOpen(false);
        showNotification(data.message);
        onRefresh();
      } else {
        alert(data.error || "Erreur lors de la réinscription.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle PDF ID Card
  const handleDownloadCard = async (student: Student) => {
    await generateStudentCardPdf({
      student,
      school: schoolSettings,
      academicYear: "2025-2026",
    });
    showNotification(`Carte scolaire téléchargée pour ${student.firstName} ${student.lastName}`);
  };

  // Handle PDF Certificate
  const handleDownloadCertificate = async (student: Student) => {
    await generateSchoolCertificatePdf({
      student,
      school: schoolSettings,
      academicYear: "2025-2026",
    });
    showNotification(`Certificat de scolarité généré pour ${student.firstName} ${student.lastName}`);
  };

  // Handle Excel Export
  const handleExportExcel = () => {
    const classObj = classes.find((c) => c.id === selectedClass);
    const className = classObj ? classObj.name : "Tous_Niveaux";
    exportClassListToExcel(filteredStudents, className, "2025-2026");
    showNotification(`Export Excel généré avec succès (${filteredStudents.length} élèves) !`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-sage-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sage-600" />
            <span>Gestion des Élèves & Inscriptions</span>
          </h2>
          <p className="text-xs text-slate-500">
            Dossiers scolaires, matricules uniques, cartes avec QR code et certificats
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Exporter la liste en Excel (XLSX)"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              if (classes.length > 0) {
                setFormData((prev) => ({ ...prev, classId: classes[0].id }));
              }
              setIsNewModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-500 text-white text-xs font-bold transition-all shadow-sm shadow-sage-700/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouvelle Inscription</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, tuteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filter Class */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Classe :</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">Toutes les classes ({students.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Gender */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Genre :</span>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tous</option>
              <option value="M">Garçons</option>
              <option value="F">Filles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Âge & Sexe</th>
                <th className="py-3 px-4">Tuteur Légal</th>
                <th className="py-3 px-4">Contact Tuteur</th>
                <th className="py-3 px-4 text-center">Actions & Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun élève ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const birthDateObj = new Date(s.birthDate);
                  const age = new Date().getFullYear() - birthDateObj.getFullYear();
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Name & Matricule */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              s.gender === "M"
                                ? "bg-marine-100 text-marine-700"
                                : "bg-coral-100 text-coral-700"
                            }`}
                          >
                            {s.firstName.charAt(0)}
                            {s.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-sage-700 transition-colors">
                              {s.lastName.toUpperCase()} {s.firstName}
                            </p>
                            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              {s.matricule}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sage-50 text-sage-800 border border-sage-200/60">
                          {s.schoolClass?.name || "Non assigné"}
                        </span>
                      </td>

                      {/* Age & Gender */}
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {age} ans • {s.gender === "M" ? "Garçon" : "Fille"}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 truncate max-w-[140px]">
                          {s.parentName}
                        </p>
                      </td>

                      {/* Contacts */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${s.parentWhatsApp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors"
                            title="Ouvrir WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {s.parentPhone}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Student ID Card PDF */}
                          <button
                            onClick={() => handleDownloadCard(s)}
                            className="p-1.5 text-slate-600 hover:text-sage-700 hover:bg-sage-50 rounded-lg transition-colors cursor-pointer"
                            title="Télécharger Carte Scolaire avec QR Code"
                          >
                            <CreditCard className="w-4 h-4 text-sage-600" />
                          </button>

                          {/* Certificate PDF */}
                          <button
                            onClick={() => handleDownloadCertificate(s)}
                            className="p-1.5 text-slate-600 hover:text-marine-700 hover:bg-marine-50 rounded-lg transition-colors cursor-pointer"
                            title="Générer Certificat de Scolarité PDF"
                          >
                            <FileText className="w-4 h-4 text-marine-600" />
                          </button>

                          {/* 1-Click Re-enroll */}
                          <button
                            onClick={() => {
                              setSelectedStudentForAction(s);
                              setIsReEnrollModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Réinscription rapide en classe supérieure"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* View Medical & Info Dossier */}
                          <button
                            onClick={() => setViewDossierStudent(s)}
                            className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Consulter le dossier médical & tuteur"
                          >
                            <Eye className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nouvelle Inscription */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sage-600" />
                  <span>Dossier d'Inscription - Nouvel Élève</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Matricule officiel généré automatiquement avec QR Code
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="Ex: KOUASSI"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prénom(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="Ex: Jean-Marc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Genre *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lieu de naissance
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classe d'affectation *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.level}) - Capacité: {c.capacity}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse géographique
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                </div>
              </div>

              {/* Tuteurs */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sage-600" />
                  <span>Informations Tuteur Légal & Urgence</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nom complet tuteur *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                      placeholder="Ex: M. Bernard Kouassi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Numéro Téléphone / SMS *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp (Alertes automatiques) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentWhatsApp}
                      onChange={(e) => setFormData({ ...formData, parentWhatsApp: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medical notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-coral-500" />
                  <span>Antécédents médicaux / Allergies / Précautions</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  placeholder="Ex: Asthmatique, allergie aux arachides, traitement de secours..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sage-600 hover:bg-sage-500 rounded-xl shadow-md shadow-sage-700/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : "Valider l'Inscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Réinscription Rapide en 1 Clic */}
      {isReEnrollModalOpen && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>Passage en Classe Supérieure (1-Clic)</span>
              </h3>
              <button
                onClick={() => setIsReEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500">Élève sélectionné :</p>
                <p className="text-sm font-extrabold text-slate-900">
                  {selectedStudentForAction.lastName.toUpperCase()} {selectedStudentForAction.firstName}
                </p>
                <p className="text-xs text-slate-600">
                  Matricule : <span className="font-mono">{selectedStudentForAction.matricule}</span>
                </p>
                <p className="text-xs text-slate-600">
                  Classe actuelle : <span className="font-bold text-sage-700">{selectedStudentForAction.schoolClass?.name}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sélectionner la nouvelle classe de passage :
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Choisir la classe de destination --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Passage en {c.name} ({c.level} - {c.section || "Générale"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsReEnrollModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleReEnroll}
                disabled={!targetClassId || isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Validation..." : "Confirmer le Passage"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Voir Dossier Étudiant */}
      {viewDossierStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center font-bold text-sm">
                  {viewDossierStudent.firstName.charAt(0)}{viewDossierStudent.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {viewDossierStudent.lastName.toUpperCase()} {viewDossierStudent.firstName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {viewDossierStudent.matricule}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewDossierStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Classe :</span>
                  <span className="font-bold text-slate-800">{viewDossierStudent.schoolClass?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date de naissance :</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(viewDossierStudent.birthDate).toLocaleDateString("fr-FR")} à {viewDossierStudent.birthPlace}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Adresse :</span>
                  <span className="font-semibold text-slate-800">{viewDossierStudent.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Statut scolaire :</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    {viewDossierStudent.status}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <p className="font-bold text-slate-800">Tuteur Légal :</p>
                <p className="text-slate-700">{viewDossierStudent.parentName}</p>
                <p className="text-slate-600">Téléphone : <span className="font-mono">{viewDossierStudent.parentPhone}</span></p>
                <p className="text-slate-600">WhatsApp : <span className="font-mono text-emerald-600">{viewDossierStudent.parentWhatsApp}</span></p>
              </div>

              <div className="bg-coral-50/50 p-3 rounded-xl border border-coral-200/60 space-y-1">
                <p className="font-bold text-coral-800 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-coral-600" />
                  <span>Dossier Médical & Antécédents</span>
                </p>
                <p className="text-slate-700 italic">
                  {viewDossierStudent.medicalNotes || "Aucune observation médicale enregistrée."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadCard(viewDossierStudent)}
                  className="px-3 py-1.5 text-xs font-semibold bg-sage-50 text-sage-700 hover:bg-sage-100 rounded-lg flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Carte QR
                </button>
                <button
                  onClick={() => handleDownloadCertificate(viewDossierStudent)}
                  className="px-3 py-1.5 text-xs font-semibold bg-marine-50 text-marine-700 hover:bg-marine-100 rounded-lg flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Certificat
                </button>
              </div>
              <button
                onClick={() => setViewDossierStudent(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
