"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Wallet,
  Clock,
  MessageSquare,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "students"
  | "pedagogy"
  | "evaluations"
  | "accounting"
  | "attendance"
  | "notifications"
  | "teacher-space"
  | "parent-space";

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  role: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  role,
}) => {
  const mainNavItems = [
    {
      id: "dashboard" as NavTab,
      label: "Tableau de Bord",
      icon: LayoutDashboard,
      roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
      id: "students" as NavTab,
      label: "Élèves & Inscriptions",
      icon: Users,
      roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
      id: "pedagogy" as NavTab,
      label: "Classes & Matières",
      icon: BookOpen,
      roles: ["ADMIN", "TEACHER"],
    },
    {
      id: "evaluations" as NavTab,
      label: "Notes & Bulletins",
      icon: Award,
      badge: "PDF QR",
      roles: ["ADMIN", "TEACHER"],
    },
    {
      id: "accounting" as NavTab,
      label: "Comptabilité & Frais",
      icon: Wallet,
      badge: "Insolvables",
      roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
      id: "attendance" as NavTab,
      label: "Vie Scolaire & Appel",
      icon: Clock,
      roles: ["ADMIN", "TEACHER"],
    },
    {
      id: "notifications" as NavTab,
      label: "WhatsApp & SMS",
      icon: MessageSquare,
      badge: "Direct",
      roles: ["ADMIN", "ACCOUNTANT", "TEACHER"],
    },
  ];

  const portalItems = [
    {
      id: "teacher-space" as NavTab,
      label: "Espace Enseignant",
      icon: GraduationCap,
      roles: ["ADMIN", "TEACHER"],
    },
    {
      id: "parent-space" as NavTab,
      label: "Espace Parent / Élève",
      icon: Users,
      roles: ["ADMIN", "PARENT"],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0 shadow-sm">
      <div className="space-y-6">
        {/* Main Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Gestion Globale
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isRelevant = item.roles.includes(role);

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-sage-600 text-white shadow-sm shadow-sage-700/20 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-sage-700 text-sage-100"
                          : item.badge === "Insolvables"
                          ? "bg-coral-50 text-coral-700 border border-coral-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Portals Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Espaces Dédiés
          </p>
          <nav className="space-y-1">
            {portalItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-marine-700 text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.id === "parent-space" && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-marine-800 text-marine-100"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      Portail
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Institution Quick Info Footer */}
      <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>School Manager-King</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Plateforme certifiée • Normes MESTFP & MEMP (République du Bénin).
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
          <span>v2.4 LTS</span>
          <span className="text-sage-600 font-semibold">Système connecté</span>
        </div>
      </div>
    </aside>
  );
};
