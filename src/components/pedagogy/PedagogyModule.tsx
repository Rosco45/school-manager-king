"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  Settings,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { SchoolClass, Teacher, Subject, AcademicYear } from "@/types";

interface PedagogyProps {
  classes: SchoolClass[];
  teachers: Teacher[];
  subjects: Subject[];
  academicYears: AcademicYear[];
  onRefresh: () => void;
}

export const PedagogyModule: React.FC<PedagogyProps> = ({
  classes,
  teachers,
  subjects,
  academicYears,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<"classes" | "teachers" | "years">("classes");
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(classes[0] || null);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Class Form State
  const [newClassData, setNewClassData] = useState({
    name: "",
    level: "COLLEGE",
    section: "Générale",
    capacity: 40,
    mainTeacherId: teachers[0]?.id || "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClassData),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddClassModalOpen(false);
        showToast(`Classe "${data.data.name}" créée avec succès !`);
        onRefresh();
      } else {
        alert(data.error || "Erreur lors de la création.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-sage-500/30">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage-600" />
            <span>Gestion Pédagogique & Enseignement</span>
          </h2>
          <p className="text-xs text-slate-500">
            Structure des classes, coefficients des matières et affectation des enseignants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "classes"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Classes & Coefficients ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "teachers"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Enseignants ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab("years")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "years"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Années Scolaires
            </button>
          </div>

          {activeTab === "classes" && (
            <button
              onClick={() => setIsAddClassModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sage-600 hover:bg-sage-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une Classe</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab: Classes & Coefficients */}
      {activeTab === "classes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Cards List (Left Column) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Liste des Classes
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {classes.length} classes actives
              </span>
            </div>

            {classes.map((cls) => {
              const isSelected = selectedClass?.id === cls.id;
              const count = cls._count?.students || 0;
              const percent = Math.min(100, Math.round((count / (cls.capacity || 40)) * 100));

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sage-50/80 border-sage-500 ring-2 ring-sage-500/20 shadow-sm"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {cls.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cls.level === "PRIMAIRE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : cls.level === "COLLEGE"
                          ? "bg-marine-50 text-marine-700 border border-marine-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {cls.level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Prof. Principal :{" "}
                    <span className="font-semibold text-slate-700">
                      {cls.mainTeacher
                        ? `${cls.mainTeacher.firstName} ${cls.mainTeacher.lastName}`
                        : "Non assigné"}
                    </span>
                  </p>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Effectif : {count} / {cls.capacity}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sage-600 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Class Detail: Matières & Coefficients (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {selectedClass ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Classe de {selectedClass.name}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {selectedClass.section || "Générale"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Professeur Principal :{" "}
                      <span className="font-bold text-sage-700">
                        {selectedClass.mainTeacher
                          ? `${selectedClass.mainTeacher.firstName} ${selectedClass.mainTeacher.lastName} (${selectedClass.mainTeacher.specialty})`
                          : "Aucun"}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block uppercase">
                      Total Coefficients
                    </span>
                    <span className="text-xl font-extrabold text-sage-700">
                      {(selectedClass.classSubjects || []).reduce(
                        (sum, cs) => sum + cs.coefficient,
                        0
                      )}
                    </span>
                  </div>
                </div>

                {/* Table of Subjects in this class */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Matières enseignées, Coefficients & Enseignants
                  </h4>

                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Matière</th>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3 text-center">Coefficient</th>
                          <th className="py-2.5 px-3">Enseignant Responsable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedClass.classSubjects || []).map((cs) => (
                          <tr key={cs.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-800">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: cs.subject.color }}
                                ></span>
                                <span>{cs.subject.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">
                              {cs.subject.code}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-extrabold bg-sage-50 text-sage-800 border border-sage-200">
                                Coeff {cs.coefficient}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-700">
                              {cs.teacher
                                ? `${cs.teacher.firstName} ${cs.teacher.lastName}`
                                : "Non assigné"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                Sélectionnez une classe pour afficher ses matières et coefficients.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Teachers Directory */}
      {activeTab === "teachers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {t.firstName.charAt(0)}{t.lastName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">
                    {t.firstName} {t.lastName}
                  </h4>
                  <p className="text-[11px] font-semibold text-purple-700 truncate">
                    {t.specialty}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">
                    {t.matricule}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                <p className="truncate">Email : {t.email}</p>
                <p>Téléphone : {t.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Academic Years */}
      {activeTab === "years" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm max-w-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sage-600" />
                <span>Gestion des Années Scolaires</span>
              </h3>
              <p className="text-xs text-slate-500">
                Historique et bascule de l'année scolaire active
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {academicYears.map((ay) => (
              <div
                key={ay.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {ay.name}
                    </span>
                    {ay.isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Année En Cours
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Du {new Date(ay.startDate).toLocaleDateString("fr-FR")} au {new Date(ay.endDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {ay.isCurrent ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Actif
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Archivée</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Class */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Créer une nouvelle classe
              </h3>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de la classe (ex: Terminale C, 5ème B) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Première D"
                  value={newClassData.name}
                  onChange={(e) => setNewClassData({ ...newClassData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Niveau d'études *
                  </label>
                  <select
                    value={newClassData.level}
                    onChange={(e) => setNewClassData({ ...newClassData, level: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PRIMAIRE">PRIMAIRE</option>
                    <option value="COLLEGE">COLLÈGE</option>
                    <option value="LYCEE">LYCÉE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacité maximale
                  </label>
                  <input
                    type="number"
                    value={newClassData.capacity}
                    onChange={(e) => setNewClassData({ ...newClassData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professeur Principal *
                </label>
                <select
                  value={newClassData.mainTeacherId}
                  onChange={(e) => setNewClassData({ ...newClassData, mainTeacherId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sage-600 hover:bg-sage-500 rounded-xl"
                >
                  {isSubmitting ? "Création..." : "Enregistrer la Classe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
