import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [settings, academicYears, classes, teachers, subjects, feeStructures] =
      await Promise.all([
        prisma.schoolSettings.findFirst(),
        prisma.academicYear.findMany({ orderBy: { startDate: "desc" } }),
        prisma.schoolClass.findMany({
          include: {
            mainTeacher: true,
            academicYear: true,
            classSubjects: {
              include: { subject: true, teacher: true },
            },
            _count: {
              select: { students: true },
            },
          },
          orderBy: { name: "asc" },
        }),
        prisma.teacher.findMany({ orderBy: { lastName: "asc" } }),
        prisma.subject.findMany({ orderBy: { name: "asc" } }),
        prisma.feeStructure.findMany(),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        academicYears,
        classes,
        teachers,
        subjects,
        feeStructures,
      },
    });
  } catch (error) {
    console.error("Erreur bootstrap:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du chargement des données de configuration." },
      { status: 500 }
    );
  }
}
