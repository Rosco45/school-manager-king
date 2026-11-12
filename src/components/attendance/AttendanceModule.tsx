"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Send,
  Save,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { SchoolClass, Student } from "@/types";

interface AttendanceProps {
  classes: SchoolClass[];
  students: Student[];
  onRefresh: () => void;
}

export const AttendanceModule: React.FC<AttendanceProps> = ({
  classes,
  students,
  onRefresh,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState<string>("08:00 - 10:00");
  const [notifyParents, setNotifyParents] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Roll call marks state: { [studentId]: { status, lateMinutes, reason } }
  const [rollCall, setRollCall] = useState<
    Record<string, { status: string; lateMinutes: number; reason: string }>
  >({});

  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Initialize or reset roll call for the selected class
  useEffect(() => {
    const initial: Record<string, { status: string; lateMinutes: number; reason: string }> = {};
    classStudents.forEach((st) => {
      initial[st.id] = {
        status: "PRESENT",
        lateMinutes: 0,
        reason: "",
      };
    });
    setRollCall(initial);
  }, [selectedClassId, students]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, any> = {};
    classStudents.forEach((st) => {
      updated[st.id] = { status: "PRESENT", lateMinutes: 0, reason: "" };
    });
    setRollCall(updated);
    showToast("Tous les élèves marqués présents !");
  };

  const handleStatusChange = (studentId: string, status: string) => {
    const current = rollCall[studentId] || { status: "PRESENT", lateMinutes: 0, reason: "" };
    setRollCall({
      ...rollCall,
      [studentId]: {
        ...current,
        status,
        lateMinutes: status === "LATE" ? 15 : 0,
      },
    });
  };

  const handleSaveAttendance = async () => {
    setIsSubmitting(true);
    const records = Object.keys(rollCall).map((studentId) => ({
      studentId,
      status: rollCall[studentId].status,
      lateMinutes: rollCall[studentId].lateMinutes,
      reason: rollCall[studentId].reason,
    }));

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          date,
          timeSlot,
          records,
          notifyParents,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Feuille d'appel enregistrée !");
        onRefresh();
      } else {
        alert(data.error || "Erreur enregistrement.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick metrics for this roll call
  const absentUnjustifiedCount = Object.values(rollCall).filter(
    (r) => r.status === "ABSENT_UNJUSTIFIED"
  ).length;
  const absentJustifiedCount = Object.values(rollCall).filter(
    (r) => r.status === "ABSENT_JUSTIFIED"
  ).length;
  const lateCount = Object.values(rollCall).filter((r) => r.status === "LATE").length;
  const presentCount = Object.values(rollCall).filter((r) => r.status === "PRESENT").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-sage-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sage-600" />
            <span>Vie Scolaire & Feuille d'Appel Numérique</span>
          </h2>
          <p className="text-xs text-slate-500">
            Gestion des présences, retards et déclenchement automatique d'alertes WhatsApp aux tuteurs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            Tous Présents
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Enregistrement..." : "Valider l'Appel"}</span>
          </button>
        </div>
      </div>

      {/* Filtering & Configuration Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Classe :</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white font-extrabold text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Time Slot Select */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="08:00 - 10:00">08:00 - 10:00 (Matinée 1)</option>
              <option value="10:15 - 12:15">10:15 - 12:15 (Matinée 2)</option>
              <option value="14:00 - 16:00">14:00 - 16:00 (Après-midi 1)</option>
              <option value="16:00 - 18:00">16:00 - 18:00 (Après-midi 2)</option>
            </select>
          </div>
        </div>

        {/* WhatsApp Auto-notify Toggle */}
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
          <input
            type="checkbox"
            checked={notifyParents}
            onChange={(e) => setNotifyParents(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Alerter automatiquement les parents (WhatsApp/SMS)</span>
        </label>
      </div>

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800">Présents</span>
          <span className="text-lg font-black text-emerald-700">{presentCount}</span>
        </div>
        <div className="bg-coral-50 border border-coral-200/80 p-3 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-coral-800">Absences Non Justifiées</span>
          <span className="text-lg font-black text-coral-700">{absentUnjustifiedCount}</span>
        </div>
        <div className="bg-blue-50 border border-blue-200/80 p-3 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-blue-800">Absences Justifiées</span>
          <span className="text-lg font-black text-blue-700">{absentJustifiedCount}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-amber-800">En Retard</span>
          <span className="text-lg font-black text-amber-700">{lateCount}</span>
        </div>
      </div>

      {/* Roll Call Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-4 text-center">Statut de Présence</th>
                <th className="py-3 px-4">Précisions (Retard / Motif)</th>
                <th className="py-3 px-4">Tuteur & Numéro Notifié</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((st) => {
                const mark = rollCall[st.id] || { status: "PRESENT", lateMinutes: 0, reason: "" };

                return (
                  <tr key={st.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {st.lastName.toUpperCase()} {st.firstName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {st.matricule}
                      </span>
                    </td>

                    {/* Status selection buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-xl p-1 bg-slate-100 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, "PRESENT")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            mark.status === "PRESENT"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, "ABSENT_UNJUSTIFIED")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            mark.status === "ABSENT_UNJUSTIFIED"
                              ? "bg-coral-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-coral-700"
                          }`}
                        >
                          Absent N.J.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, "ABSENT_JUSTIFIED")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            mark.status === "ABSENT_JUSTIFIED"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-blue-700"
                          }`}
                        >
                          Justifié
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, "LATE")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            mark.status === "LATE"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-amber-700"
                          }`}
                        >
                          Retard
                        </button>
                      </div>
                    </td>

                    {/* Late minutes / Reason */}
                    <td className="py-3 px-4">
                      {mark.status === "LATE" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Minutes :</span>
                          <input
                            type="number"
                            min="5"
                            step="5"
                            value={mark.lateMinutes}
                            onChange={(e) =>
                              setRollCall({
                                ...rollCall,
                                [st.id]: { ...mark, lateMinutes: Number(e.target.value) },
                              })
                            }
                            className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-200 text-center font-bold"
                          />
                        </div>
                      ) : mark.status === "ABSENT_JUSTIFIED" || mark.status === "ABSENT_UNJUSTIFIED" ? (
                        <input
                          type="text"
                          placeholder="Motif / Justificatif..."
                          value={mark.reason}
                          onChange={(e) =>
                            setRollCall({
                              ...rollCall,
                              [st.id]: { ...mark, reason: e.target.value },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                        />
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Parent & Notification Info */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{st.parentName}</p>
                      <span className="text-[11px] font-mono text-emerald-600">
                        {st.parentWhatsApp}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
