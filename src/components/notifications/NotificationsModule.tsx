"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCheck,
  Clock,
  Sparkles,
  Users,
  AlertTriangle,
  Award,
  Layers,
  CheckCircle,
} from "lucide-react";
import { Student, SchoolClass, NotificationItem } from "@/types";

interface NotificationsProps {
  students: Student[];
  classes: SchoolClass[];
  onRefresh: () => void;
}

export const NotificationsModule: React.FC<NotificationsProps> = ({
  students,
  classes,
  onRefresh,
}) => {
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [templateType, setTemplateType] = useState<string>("FEE_REMINDER");
  const [targetType, setTargetType] = useState<"INSOLVENT" | "CLASS" | "SINGLE">("INSOLVENT");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");

  // Message template
  const [messageTemplate, setMessageTemplate] = useState<string>(
    "Complexe Les Étoiles Cotonou: Bonjour {nom_eleve}, nous vous rappelons que le solde de scolarité en {classe} s'élève à {montant_du}. Merci de bien vouloir le régulariser avant le {date}."
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadNotificationsHistory = () => {
    setIsLoadingHistory(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingHistory(false));
  };

  useEffect(() => {
    loadNotificationsHistory();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Pre-configured templates
  const handleSelectTemplate = (type: string) => {
    setTemplateType(type);
    if (type === "ABSENCE_ALERT") {
      setMessageTemplate(
        "Complexe Les Étoiles Cotonou: Bonjour, nous vous informons que votre enfant {nom_eleve} ({classe}) a été noté(e) absent(e) ce jour ({date}). Merci de contacter la vie scolaire."
      );
    } else if (type === "FEE_REMINDER") {
      setMessageTemplate(
        "Complexe Les Étoiles Cotonou: Chers parents de {nom_eleve} ({classe}), le solde de la scolarité de {montant_du} est échu. Règlement possible par MTN MoMo, Moov Money ou à l'économat."
      );
    } else if (type === "REPORT_CARD_READY") {
      setMessageTemplate(
        "Complexe Les Étoiles Cotonou: Le bulletin officiel du 1er Semestre de {nom_eleve} ({classe}) est disponible avec QR Code de vérification sur votre espace parent."
      );
    } else {
      setMessageTemplate(
        "Complexe Les Étoiles Cotonou: Chers parents de {nom_eleve}, nous vous convions à la réunion parents-enseignants ce samedi à 09h00."
      );
    }
  };

  // Insert variable into message
  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => `${prev} ${variable}`);
  };

  // Compute live simulated preview
  const sampleStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const simulatedMessage = messageTemplate
    .replace(/\{nom_eleve\}/g, sampleStudent ? `${sampleStudent.firstName} ${sampleStudent.lastName}` : "Kouadio Emmanuel")
    .replace(/\{classe\}/g, sampleStudent?.schoolClass?.name || "Terminale D")
    .replace(/\{montant_du\}/g, "125 000 FCFA")
    .replace(/\{date\}/g, new Date().toLocaleDateString("fr-FR"));

  // Send Notification
  const handleSendNotification = async () => {
    setIsSending(true);

    let recipients: any[] = [];
    if (targetType === "SINGLE") {
      if (sampleStudent) {
        recipients.push({
          recipientName: sampleStudent.parentName,
          recipientPhone: sampleStudent.parentWhatsApp || sampleStudent.parentPhone,
          studentId: sampleStudent.id,
          studentName: `${sampleStudent.firstName} ${sampleStudent.lastName}`,
          className: sampleStudent.schoolClass?.name,
          amountDue: 125000,
        });
      }
    } else if (targetType === "CLASS") {
      const clsStudents = students.filter((s) => s.classId === selectedClassId);
      recipients = clsStudents.map((s) => ({
        recipientName: s.parentName,
        recipientPhone: s.parentWhatsApp || s.parentPhone,
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.schoolClass?.name,
        amountDue: 100000,
      }));
    } else if (targetType === "INSOLVENT") {
      // Pick first 8 demo insolvents
      recipients = students.slice(0, 8).map((s) => ({
        recipientName: s.parentName,
        recipientPhone: s.parentWhatsApp || s.parentPhone,
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.schoolClass?.name,
        amountDue: 150000,
      }));
    }

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: templateType,
          channel,
          templateText: messageTemplate,
          recipients,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadNotificationsHistory();
        onRefresh();
      } else {
        alert(data.error || "Erreur envoi.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Centre de Notifications WhatsApp & SMS Cloud</span>
          </h2>
          <p className="text-xs text-slate-500">
            Modèles dynamiques, passerelle d'envoi et simulateur de smartphone en direct
          </p>
        </div>

        {/* Channel Selection Badge */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setChannel("WHATSAPP")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              channel === "WHATSAPP"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <span>WhatsApp Cloud API</span>
          </button>
          <button
            onClick={() => setChannel("SMS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              channel === "SMS"
                ? "bg-marine-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Passerelle SMS Locale</span>
          </button>
        </div>
      </div>

      {/* Main Row: Editor & Smartphone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Template Builder */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              1. Choisir un Modèle Prédéfini
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTemplate("ABSENCE_ALERT")}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  templateType === "ABSENCE_ALERT"
                    ? "bg-coral-50 border-coral-400 text-coral-800 ring-1 ring-coral-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-bold">Alerte Absence</span>
                <span className="text-[10px] text-slate-500">Immédiate</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate("FEE_REMINDER")}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  templateType === "FEE_REMINDER"
                    ? "bg-amber-50 border-amber-400 text-amber-800 ring-1 ring-amber-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-bold">Rappel Scolarité</span>
                <span className="text-[10px] text-slate-500">Impayés</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate("REPORT_CARD_READY")}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  templateType === "REPORT_CARD_READY"
                    ? "bg-sage-50 border-sage-500 text-sage-800 ring-1 ring-sage-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-bold">Bulletins Prêts</span>
                <span className="text-[10px] text-slate-500">Résultats</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate("GENERAL")}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  templateType === "GENERAL"
                    ? "bg-purple-50 border-purple-400 text-purple-800 ring-1 ring-purple-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-bold">Circulaire Générale</span>
                <span className="text-[10px] text-slate-500">Événement</span>
              </button>
            </div>
          </div>

          {/* Dynamic Variable Injectors */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Variables dynamiques (cliquer pour insérer) :
              </label>
              <span className="text-[11px] text-slate-400">Remplacement automatique</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: "{nom_eleve}", label: "Nom Élève" },
                { tag: "{classe}", label: "Classe" },
                { tag: "{montant_du}", label: "Montant Dû" },
                { tag: "{date}", label: "Date du jour" },
              ].map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertVariable(v.tag)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  + {v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corps du Message :
            </label>
            <textarea
              rows={4}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-slate-800 font-sans"
            />
          </div>

          {/* Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audience Cible :
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
              >
                <option value="INSOLVENT">Parents ayant un solde de scolarité échu</option>
                <option value="SINGLE">Élève individuel (test)</option>
                <option value="CLASS">Tous les parents d'une classe</option>
              </select>
            </div>

            {targetType === "SINGLE" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choisir l'élève :
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} ({s.schoolClass?.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === "CLASS" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choisir la classe :
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c._count?.students || 10} élèves)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Trigger Send Button */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Mode Simulation active : aucun coût réseau débité
            </span>

            <button
              onClick={handleSendNotification}
              disabled={isSending}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                channel === "WHATSAPP"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20"
                  : "bg-marine-600 hover:bg-marine-500 shadow-marine-700/20"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? "Envoi en cours..." : `Diffuser sur ${channel}`}</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Smartphone Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Aperçu en Direct sur Smartphone
            </span>
            <span className="text-[11px] text-slate-400">
              Rendu réel tel que reçu par le parent
            </span>
          </div>

          {/* Phone Frame */}
          <div className="w-72 bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-950">
            {/* Speaker & Camera notch */}
            <div className="h-4 flex items-center justify-center gap-2 mb-2">
              <span className="w-12 h-1 bg-slate-700 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-700"></span>
            </div>

            {/* Screen Content */}
            <div className="bg-[#efeae2] rounded-[26px] h-96 overflow-hidden flex flex-col justify-between border border-slate-300">
              {/* WhatsApp / SMS Header */}
              <div
                className={`p-3 text-white flex items-center gap-2.5 shadow-sm ${
                  channel === "WHATSAPP" ? "bg-[#075e54]" : "bg-slate-800"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  É
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Complexe Les Étoiles Cotonou</p>
                  <p className="text-[9px] text-white/80">
                    {channel === "WHATSAPP" ? "Compte Officiel Vérifié ✓" : "Message Direct"}
                  </p>
                </div>
              </div>

              {/* Chat messages body */}
              <div className="p-3 space-y-2 overflow-y-auto flex-1">
                <div className="text-center my-1">
                  <span className="text-[9px] bg-white/80 px-2 py-0.5 rounded-md text-slate-500 font-medium shadow-sm">
                    Aujourd'hui
                  </span>
                </div>

                {/* Message Bubble */}
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-sm text-[11px] text-slate-800 leading-relaxed border border-slate-100 max-w-[92%]">
                  <p className="whitespace-pre-wrap">{simulatedMessage}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                    <span>10:42</span>
                    {channel === "WHATSAPP" && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Fake message input bar */}
              <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 text-slate-400 text-[10px]">
                <div className="flex-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                  Répondre au message...
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Journal d'Audit des Notifications Envoyées
            </h3>
            <p className="text-[11px] text-slate-400">
              Suivi en temps réel de la délivrabilité des alertes
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {notifications.length} notifications enregistrées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Canal</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Destinataire</th>
                <th className="py-2.5 px-4">Contenu du Message</th>
                <th className="py-2.5 px-4">Horodatage</th>
                <th className="py-2.5 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                        n.channel === "WHATSAPP"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {n.channel}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">
                    {n.type === "ABSENCE_ALERT"
                      ? "Alerte Absence"
                      : n.type === "FEE_REMINDER"
                      ? "Rappel Scolarité"
                      : n.type === "REPORT_CARD_READY"
                      ? "Bulletin Disponible"
                      : "Circulaire"}
                  </td>
                  <td className="py-2.5 px-4">
                    <p className="font-bold text-slate-900">{n.recipientName}</p>
                    <span className="font-mono text-[10px] text-slate-400">
                      {n.recipientPhone}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 max-w-xs truncate text-slate-600">
                    {n.message}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {new Date(n.sentAt).toLocaleDateString("fr-FR")} à {new Date(n.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCheck className="w-3 h-3 text-emerald-600" /> Envoyé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
