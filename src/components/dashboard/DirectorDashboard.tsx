"use client";

import React from "react";
import {
  Users,
  Wallet,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  FileText,
  UserPlus,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DashboardProps {
  stats: {
    totalStudents: number;
    boysCount: number;
    girlsCount: number;
    activeTeachers: number;
    recoveryRate: number;
    totalCollected: number;
    totalExpected: number;
    attendanceTodayRate: number;
  };
  monthlyRevenue: Array<{ month: string; montant: number }>;
  classAverages: Array<{ className: string; moyenne: number; level: string }>;
  levelDistribution: Array<{ name: string; value: number; color: string }>;
  recentPayments: Array<{
    id: string;
    studentName: string;
    className: string;
    amount: number;
    type: string;
    date: string;
  }>;
  recentAbsences: Array<{
    id: string;
    studentName: string;
    className: string;
    status: string;
    date: string;
  }>;
  onNavigate: (tab: any) => void;
}

export const DirectorDashboard: React.FC<DashboardProps> = ({
  stats,
  monthlyRevenue,
  classAverages,
  levelDistribution,
  recentPayments,
  recentAbsences,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-sage-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-sage-200 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilotage Académique & Financier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tableau de Bord de Direction
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Bienvenue sur School Manager-King. Suivez en temps réel la progression des inscriptions, les moyennes par niveau, l'assiduité scolaire et le recouvrement financier.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate("students")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-500 text-white text-xs font-bold transition-all shadow-md shadow-sage-900/30 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouvel Élève</span>
            </button>
            <button
              onClick={() => onNavigate("evaluations")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Calculer Bulletins</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 -bottom-20 w-96 h-96 bg-sage-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Effectif Élèves */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Effectif Total
            </span>
            <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.totalStudents}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-marine-500"></span>
                {stats.boysCount} Garçons ({Math.round((stats.boysCount / (stats.totalStudents || 1)) * 100)}%)
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-coral-500"></span>
                {stats.girlsCount} Filles ({Math.round((stats.girlsCount / (stats.totalStudents || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Taux de Recouvrement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recouvrement Scolarité
            </span>
            <div className="w-10 h-10 rounded-xl bg-marine-50 text-marine-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-slate-900">
                {stats.recoveryRate}%
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" /> En cours
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 truncate">
              {formatCurrency(stats.totalCollected)} / {formatCurrency(stats.totalExpected)}
            </div>
          </div>
        </div>

        {/* KPI 3: Taux de Présence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Taux de Présence
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.attendanceTodayRate}%
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Assiduité globale du jour</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Corps Enseignant */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enseignants Actifs
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.activeTeachers}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span>100% des matières pourvues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Évolution des Encaissements Mensuels (Recharts Area/Bar) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Évolution des Encaissements Mensuels
              </h3>
              <p className="text-xs text-slate-500">
                Total des règlements reçus par tranche et inscription (en FCFA)
              </p>
            </div>
            <button
              onClick={() => onNavigate("accounting")}
              className="text-xs font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1"
            >
              Voir détails <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString("fr-FR")} FCFA`, "Encaissement"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Répartition par Niveau d'Étude (PieChart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Répartition des Effectifs
            </h3>
            <p className="text-xs text-slate-500">Par cycle d'enseignement</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} élèves`, "Effectif"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {levelDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} élèves</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Moyenne Générale par Classe */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Moyenne Générale par Classe
              </h3>
              <p className="text-xs text-slate-500">Semestre 1 (sur 20)</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Seuil admis: 10/20
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAverages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="className" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 20]} />
                <Tooltip
                  formatter={(val: any) => [`${val} / 20`, "Moyenne"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="moyenne" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flux d'Activités Récentes: Règlements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Derniers Encaissements
              </h3>
              <p className="text-xs text-slate-500">Paiements de scolarité</p>
            </div>
            <button
              onClick={() => onNavigate("accounting")}
              className="text-xs font-semibold text-sage-600 hover:text-sage-700"
            >
              Journal
            </button>
          </div>

          <div className="space-y-3">
            {recentPayments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {pay.studentName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {pay.className} • {pay.type}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-emerald-600">
                    +{Number(pay.amount).toLocaleString("fr-FR")} F
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(pay.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flux d'Activités Récentes: Absences signalées */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Absences Signalées
              </h3>
              <p className="text-xs text-slate-500">Vie scolaire récente</p>
            </div>
            <button
              onClick={() => onNavigate("attendance")}
              className="text-xs font-semibold text-coral-600 hover:text-coral-700"
            >
              Faire l'appel
            </button>
          </div>

          <div className="space-y-3">
            {recentAbsences.slice(0, 5).map((abs) => {
              const isUnjustified = abs.status === "ABSENT_UNJUSTIFIED";
              const isLate = abs.status === "LATE";
              return (
                <div
                  key={abs.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {abs.studentName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {abs.className}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isUnjustified
                          ? "bg-coral-50 text-coral-600 border border-coral-200"
                          : isLate
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}
                    >
                      {isUnjustified
                        ? "Non justifiée"
                        : isLate
                        ? "En retard"
                        : "Justifiée"}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(abs.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
