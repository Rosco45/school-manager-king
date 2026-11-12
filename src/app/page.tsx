"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, NavTab } from "@/components/layout/Sidebar";
import { DirectorDashboard } from "@/components/dashboard/DirectorDashboard";
import { StudentsModule } from "@/components/students/StudentsModule";
import { PedagogyModule } from "@/components/pedagogy/PedagogyModule";
import { EvaluationsModule } from "@/components/evaluations/EvaluationsModule";
import { AccountingModule } from "@/components/accounting/AccountingModule";
import { AttendanceModule } from "@/components/attendance/AttendanceModule";
import { NotificationsModule } from "@/components/notifications/NotificationsModule";
import { TeacherPortal } from "@/components/teacher/TeacherPortal";
import { ParentPortal } from "@/components/parent/ParentPortal";
import { Role, Student, SchoolClass, Teacher, Subject, AcademicYear, SchoolSettings, FeeStructure } from "@/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [currentRole, setCurrentRole] = useState<Role>("ADMIN");
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");

  // Global loaded data
  const [settings, setSettings] = useState<SchoolSettings>({
    id: "default",
    name: "Complexe Scolaire Les Étoiles - Cotonou",
    motto: "Discipline - Rigueur - Réussite",
    address: "Avenue Jean-Paul II, Quartier Haie Vive, Cotonou (Bénin)",
    phone: "+229 21 30 45 88 / +229 97 48 12 34",
    email: "direction@lesetoiles-cotonou.bj",
    currency: "FCFA",
    directorName: "Dr. Marcellin KPADONOU",
  });
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all initial data from APIs
  const refreshAllData = async () => {
    try {
      const [bootRes, studRes] = await Promise.all([
        fetch("/api/bootstrap"),
        fetch("/api/students"),
      ]);
      const bootData = await bootRes.json();
      const studData = await studRes.json();

      if (bootData.success) {
        if (bootData.data.settings) setSettings(bootData.data.settings);
        setClasses(bootData.data.classes || []);
        setTeachers(bootData.data.teachers || []);
        setSubjects(bootData.data.subjects || []);
        setAcademicYears(bootData.data.academicYears || []);
        setFeeStructures(bootData.data.feeStructures || []);
      }

      if (studData.success) {
        setStudents(studData.data || []);
      }
    } catch (err) {
      console.error("Erreur chargement application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handle Role Switching
  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    if (role === "PARENT") {
      setCurrentTab("parent-space");
    } else if (role === "TEACHER") {
      setCurrentTab("teacher-space");
    } else if (role === "ACCOUNTANT") {
      setCurrentTab("accounting");
    } else {
      setCurrentTab("dashboard");
    }
  };

  // Dashboard Stats Computed
  const boysCount = students.filter((s) => s.gender === "M").length;
  const girlsCount = students.filter((s) => s.gender === "F").length;

  const dashboardStats = {
    totalStudents: students.length,
    boysCount,
    girlsCount,
    activeTeachers: teachers.length || 12,
    recoveryRate: 68.4,
    totalCollected: 18450000,
    totalExpected: 27000000,
    attendanceTodayRate: 96.5,
  };

  const monthlyRevenue = [
    { month: "Sept", montant: 4500000 },
    { month: "Oct", montant: 5800000 },
    { month: "Nov", montant: 2100000 },
    { month: "Déc", montant: 1450000 },
    { month: "Janv", montant: 3200000 },
    { month: "Févr", montant: 1400000 },
  ];

  const classAverages = [
    { className: "CM2 A", moyenne: 14.2, level: "PRIMAIRE" },
    { className: "6ème A", moyenne: 13.8, level: "COLLEGE" },
    { className: "4ème B", moyenne: 12.4, level: "COLLEGE" },
    { className: "3ème A", moyenne: 13.1, level: "COLLEGE" },
    { className: "2nde C", moyenne: 11.9, level: "LYCEE" },
    { className: "Tle D", moyenne: 13.6, level: "LYCEE" },
  ];

  const levelDistribution = [
    { name: "Collège (6e, 4e, 3e)", value: 30, color: "#0d9488" },
    { name: "Lycée (2nde, Tle)", value: 20, color: "#0284c7" },
    { name: "Primaire (CM2)", value: 10, color: "#f59e0b" },
  ];

  const recentPayments = [
    { id: "1", studentName: "DOSSOU Mahugnon", className: "Terminale D", amount: 110000, type: "Tranche 2", date: "2026-03-04" },
    { id: "2", studentName: "GBAGUIDI Fifamè", className: "3ème A", amount: 135000, type: "Tranche 1", date: "2026-03-03" },
    { id: "3", studentName: "HOUNGBÉDJI Sènan", className: "6ème A", amount: 65000, type: "Inscription", date: "2026-03-02" },
    { id: "4", studentName: "KPADONOU Boris", className: "Terminale D", amount: 90000, type: "Tranche 3", date: "2026-03-01" },
    { id: "5", studentName: "ZINSOU Espérance", className: "Seconde C", amount: 110000, type: "Tranche 2", date: "2026-02-28" },
  ];

  const recentAbsences = [
    { id: "1", studentName: "DOSSOU Bienvenu", className: "Terminale D", status: "ABSENT_UNJUSTIFIED", date: "2026-03-04" },
    { id: "2", studentName: "AGOSSA Chimène", className: "3ème A", status: "LATE", date: "2026-03-04" },
    { id: "3", studentName: "AÏVO Landry", className: "4ème B", status: "ABSENT_JUSTIFIED", date: "2026-03-03" },
    { id: "4", studentName: "SOSSOU Sédami", className: "6ème A", status: "ABSENT_UNJUSTIFIED", date: "2026-03-02" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenNotifications={() => setCurrentTab("notifications")}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          role={currentRole}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentTab === "dashboard" && (
            <DirectorDashboard
              stats={dashboardStats}
              monthlyRevenue={monthlyRevenue}
              classAverages={classAverages}
              levelDistribution={levelDistribution}
              recentPayments={recentPayments}
              recentAbsences={recentAbsences}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === "students" && (
            <StudentsModule
              students={students}
              classes={classes}
              schoolSettings={settings}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "pedagogy" && (
            <PedagogyModule
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              academicYears={academicYears}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "evaluations" && (
            <EvaluationsModule
              classes={classes}
              students={students}
              schoolSettings={settings}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "accounting" && (
            <AccountingModule
              students={students}
              schoolSettings={settings}
              feeStructures={feeStructures}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "attendance" && (
            <AttendanceModule
              classes={classes}
              students={students}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "notifications" && (
            <NotificationsModule
              students={students}
              classes={classes}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "teacher-space" && (
            <TeacherPortal
              classes={classes}
              students={students}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === "parent-space" && (
            <ParentPortal
              students={students}
              schoolSettings={settings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
