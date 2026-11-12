import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const classSubjectId = searchParams.get("classSubjectId");
    const term = searchParams.get("term") ? parseInt(searchParams.get("term")!) : 1;

    const where: Record<string, any> = { term };

    if (classSubjectId) {
      where.classSubjectId = classSubjectId;
    } else if (classId) {
      where.classSubject = {
        classId: classId,
      };
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        classSubject: {
          include: {
            subject: true,
            teacher: true,
            schoolClass: true,
          },
        },
        grades: {
          include: {
            student: true,
          },
        },
      },
      orderBy: [{ type: "asc" }, { date: "asc" }],
    });

    return NextResponse.json({ success: true, data: evaluations });
  } catch (error) {
    console.error("Erreur GET evaluations:", error);
    return NextResponse.json(
      { success: false, error: "Erreur récupération des évaluations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      type, // "INTERRO" | "DEVOIR"
      term, // 1 (Semestre 1) or 2 (Semestre 2)
      date,
      maxScore,
      classSubjectId,
      grades, // Array of { studentId: string, score: number, comment?: string }
    } = body;

    if (!title || !type || !classSubjectId) {
      return NextResponse.json(
        { success: false, error: "Titre, type et matière requis pour l'évaluation." },
        { status: 400 }
      );
    }

    // 1. Création de l'évaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        title,
        type,
        term: Number(term) || 1,
        date: date ? new Date(date) : new Date(),
        maxScore: Number(maxScore) || 20,
        classSubjectId,
      },
    });

    // 2. Enregistrement des notes si fournies
    if (grades && Array.isArray(grades) && grades.length > 0) {
      for (const g of grades) {
        if (g.studentId && g.score !== undefined && g.score !== null && g.score !== "") {
          await prisma.grade.upsert({
            where: {
              studentId_evaluationId: {
                studentId: g.studentId,
                evaluationId: evaluation.id,
              },
            },
            create: {
              studentId: g.studentId,
              evaluationId: evaluation.id,
              score: Number(g.score),
              comment: g.comment || null,
            },
            update: {
              score: Number(g.score),
              comment: g.comment || null,
            },
          });
        }
      }
    }

    const fullEvaluation = await prisma.evaluation.findUnique({
      where: { id: evaluation.id },
      include: {
        classSubject: {
          include: { subject: true, teacher: true, schoolClass: true },
        },
        grades: {
          include: { student: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Évaluation "${title}" ajoutée avec succès !`,
      data: fullEvaluation,
    });
  } catch (error) {
    console.error("Erreur POST evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur enregistrement de l'évaluation." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { evaluationId, title, date, grades } = body;

    if (!evaluationId) {
      return NextResponse.json(
        { success: false, error: "ID évaluation requis." },
        { status: 400 }
      );
    }

    // Mise à jour métadonnées
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title;
    if (date) updateData.date = new Date(date);

    if (Object.keys(updateData).length > 0) {
      await prisma.evaluation.update({
        where: { id: evaluationId },
        data: updateData,
      });
    }

    // Mise à jour des notes si fournies
    if (grades && Array.isArray(grades)) {
      for (const g of grades) {
        if (g.studentId && g.score !== undefined && g.score !== null && g.score !== "") {
          await prisma.grade.upsert({
            where: {
              studentId_evaluationId: {
                studentId: g.studentId,
                evaluationId,
              },
            },
            create: {
              studentId: g.studentId,
              evaluationId,
              score: Number(g.score),
              comment: g.comment || null,
            },
            update: {
              score: Number(g.score),
              comment: g.comment || null,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Évaluation et notes mises à jour avec succès !",
    });
  } catch (error) {
    console.error("Erreur PUT evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur mise à jour de l'évaluation." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID évaluation requis." },
        { status: 400 }
      );
    }

    await prisma.evaluation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Évaluation supprimée avec succès.",
    });
  } catch (error) {
    console.error("Erreur DELETE evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur suppression de l'évaluation." },
      { status: 500 }
    );
  }
}
