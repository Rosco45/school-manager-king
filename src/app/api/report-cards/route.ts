import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const term = searchParams.get("term") ? parseInt(searchParams.get("term")!) : 1;
    const studentId = searchParams.get("studentId");

    const where: any = { term };
    if (studentId) {
      where.studentId = studentId;
    } else if (classId && classId !== "ALL") {
      where.student = { classId };
    }

    const reportCards = await prisma.reportCard.findMany({
      where,
      include: {
        student: {
          include: {
            schoolClass: {
              include: { mainTeacher: true },
            },
          },
        },
      },
      orderBy: { rank: "asc" },
    });

    return NextResponse.json({ success: true, data: reportCards });
  } catch (error) {
    console.error("Erreur GET reportCards:", error);
    return NextResponse.json(
      { success: false, error: "Erreur récupération des bulletins." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { classId, term, academicYear } = await request.json();

    if (!classId || !term) {
      return NextResponse.json(
        { success: false, error: "Classe et trimestre requis." },
        { status: 400 }
      );
    }

    const year = academicYear || "2025-2026";

    // 1. Récupérer les élèves de la classe
    const students = await prisma.student.findMany({
      where: { classId, status: "ACTIVE" },
    });

    // 2. Récupérer les matières de la classe avec coefficients
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true },
    });

    if (students.length === 0 || classSubjects.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucun élève ou aucune matière configurée pour cette classe." },
        { status: 400 }
      );
    }

    // 3. Calculer les moyennes par élève
    const studentScores: {
      studentId: string;
      overallAvg: number;
      absences: number;
      lates: number;
    }[] = [];

    for (const st of students) {
      let totalWeighted = 0;
      let totalCoeffs = 0;

      for (const cs of classSubjects) {
        const grades = await prisma.grade.findMany({
          where: {
            studentId: st.id,
            evaluation: {
              classSubjectId: cs.id,
              term: Number(term),
            },
          },
          include: { evaluation: true },
        });

        if (grades.length > 0) {
          const interros = grades.filter((g) => g.evaluation.type === "INTERRO");
          const devoirs = grades.filter((g) => g.evaluation.type === "DEVOIR");

          let subjectAvg = 0;
          if (interros.length > 0 && devoirs.length > 0) {
            const mInt = interros.reduce((sum, g) => sum + g.score, 0) / interros.length;
            const sumDevoirs = devoirs.reduce((sum, g) => sum + g.score, 0);
            subjectAvg = (mInt + sumDevoirs) / (1 + devoirs.length);
          } else {
            subjectAvg = grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
          }

          totalWeighted += subjectAvg * cs.coefficient;
          totalCoeffs += cs.coefficient;
        }
      }

      const overall = totalCoeffs > 0 ? totalWeighted / totalCoeffs : 10;

      // Compter les absences et retards
      const absences = await prisma.attendance.count({
        where: {
          studentId: st.id,
          status: { in: ["ABSENT_UNJUSTIFIED", "ABSENT_JUSTIFIED"] },
        },
      });

      const lates = await prisma.attendance.count({
        where: {
          studentId: st.id,
          status: "LATE",
        },
      });

      studentScores.push({
        studentId: st.id,
        overallAvg: parseFloat(overall.toFixed(2)),
        absences,
        lates,
      });
    }

    // 4. Trier par moyenne décroissante pour déterminer le rang
    studentScores.sort((a, b) => b.overallAvg - a.overallAvg);

    // 5. Sauvegarder ou mettre à jour les bulletins
    const savedCards = [];
    for (let i = 0; i < studentScores.length; i++) {
      const item = studentScores[i];
      const rank = i + 1;

      let mention = "Passable";
      if (item.overallAvg >= 16) mention = "Tableau d'Honneur avec Félicitations (Très Bien)";
      else if (item.overallAvg >= 14) mention = "Tableau d'Honneur avec Encouragements (Bien)";
      else if (item.overallAvg >= 12) mention = "Tableau d'Honneur (Assez Bien)";
      else if (item.overallAvg >= 10) mention = "Encouragements (Passable)";
      else mention = "Avertissement de travail";

      const card = await prisma.reportCard.upsert({
        where: {
          studentId_term_academicYear: {
            studentId: item.studentId,
            term: Number(term),
            academicYear: year,
          },
        },
        create: {
          studentId: item.studentId,
          term: Number(term),
          academicYear: year,
          overallAverage: item.overallAvg,
          rank,
          totalStudents: studentScores.length,
          absencesCount: item.absences,
          lateCount: item.lates,
          mention,
          teacherRemarks:
            item.overallAvg >= 14
              ? "Excellente régularité et participation active."
              : item.overallAvg >= 10
              ? "Bon trimestre, poursuivez vos efforts."
              : "Résultats insuffisants, un travail plus rigoureux est exigé.",
          isLocked: true,
        },
        update: {
          overallAverage: item.overallAvg,
          rank,
          totalStudents: studentScores.length,
          absencesCount: item.absences,
          lateCount: item.lates,
          mention,
          isLocked: true,
        },
      });

      savedCards.push(card);
    }

    return NextResponse.json({
      success: true,
      message: `${savedCards.length} bulletins calculés et validés avec succès !`,
      data: savedCards,
    });
  } catch (error) {
    console.error("Erreur calcul bulletins:", error);
    return NextResponse.json(
      { success: false, error: "Erreur calcul des bulletins." },
      { status: 500 }
    );
  }
}
