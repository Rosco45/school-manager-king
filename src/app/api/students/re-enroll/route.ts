import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { studentId, targetClassId, resetAcademicHistory } = await request.json();

    if (!studentId || !targetClassId) {
      return NextResponse.json(
        { success: false, error: "Identifiant élève et classe cible requis." },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { schoolClass: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Élève introuvable." },
        { status: 404 }
      );
    }

    const targetClass = await prisma.schoolClass.findUnique({
      where: { id: targetClassId },
    });

    if (!targetClass) {
      return NextResponse.json(
        { success: false, error: "Classe cible introuvable." },
        { status: 404 }
      );
    }

    // Mise à jour de la classe et du statut
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        classId: targetClassId,
        status: "ACTIVE",
      },
      include: {
        schoolClass: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `L'élève ${student.firstName} ${student.lastName} a été réinscrit(e) avec succès en ${targetClass.name} !`,
      data: updated,
    });
  } catch (error) {
    console.error("Erreur réinscription:", error);
    return NextResponse.json(
      { success: false, error: "Échec de la réinscription." },
      { status: 500 }
    );
  }
}
