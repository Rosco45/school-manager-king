"use client";

import React from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";
import { SchoolClass, Student } from "@/types";

interface TeacherPortalProps {
  classes: SchoolClass[];
  students: Student[];
  onNavigate: (tab: any) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  classes,
  students,
  onNavigate,
}) => {
  const teacherClass = classes.find((c) => c.name.includes("Terminale D")) || classes[0];
  const classStudents = students.filter((s) => s.classId === teacherClass?.id);

  // Weekly Schedule Demo
  const schedule = [
    { day: "Lundi", time: "08h00 - 10h00", class: "Terminale D", subject: "Mathématiques", room: "Salle 12" },
    { day: "Lundi", time: "10h15 - 12h15", class: "3ème A", subject: "Mathématiques", room: "Salle 04" },
    { day: "Mardi", time: "14h00 - 16h00", class: "Terminale D", subject: "Travaux Dirigés Maths", room: "Labo 02" },
    { day: "Mercredi", time: "08h00 - 10h00", class: "6ème A", subject: "Mathématiques", room: "Salle 01" },
    { day: "Jeudi", time: "10h15 - 12h15", class: "Terminale D", subject: "Mathématiques", room: "Salle 12" },
    { day: "Vendredi", time: "15h00 - 17h00", class: "3ème A", subject: "Devoir Surveillé", room: "Amphi B" },
  ];

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-extrabold text-2xl text-amber-300">
            RG
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-200 mb-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Professeur Titulaire & Responsable Pédagogique</span>
            </div>
            <h2 className="text-xl font-black">M. Romaric GBAGUIDI</h2>
            <p className="text-xs text-slate-300">
              Département des Mathématiques & Sciences • Professeur Principal :{" "}
              <span className="font-bold text-white">{teacherClass?.name}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate("attendance")}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Faire l'Appel Numérique
          </button>
          <button
            onClick={() => onNavigate("evaluations")}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer shadow-md"
          >
            Saisie des Notes
          </button>
        </div>
      </div>

      {/* Main Grid: Schedule and Class Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Mon Emploi du Temps Hebdomadaire</span>
              </h3>
              <p className="text-xs text-slate-500">Créneaux de cours et devoirs surveillés</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-amber-50 px-2.5 py-1 rounded-md text-amber-800">
              18h / semaine
            </span>
          </div>

          <div className="space-y-2.5">
            {schedule.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 text-center font-bold text-xs text-slate-600 py-1 bg-white rounded-lg border border-slate-200">
                    {item.day}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {item.subject} • <span className="text-amber-700">{item.class}</span>
                    </p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time} ({item.room})
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  Confirmé
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* My Main Class Quick Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sage-600" />
                <span>Ma Classe Principale ({teacherClass?.name})</span>
              </h3>
              <p className="text-xs text-slate-500">{classStudents.length} élèves inscrits</p>
            </div>
            <button
              onClick={() => onNavigate("evaluations")}
              className="text-xs font-bold text-sage-600 hover:text-sage-700"
            >
              Bulletins
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {classStudents.map((st, i) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono text-[11px] text-slate-400">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900">
                      {st.lastName.toUpperCase()} {st.firstName}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {st.matricule}
                    </span>
                  </div>
                </div>

                <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                  En règle
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
