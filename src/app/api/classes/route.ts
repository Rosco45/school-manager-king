import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const classes = await prisma.schoolClass.findMany({
      include: {
        mainTeacher: true,
        academicYear: true,
        classSubjects: {
          include: {
            subject: true,
            teacher: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    console.error("Erreur GET classes:", error);
    return NextResponse.json(
      { success: false, error: "Erreur récupération des classes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, level, section, capacity, mainTeacherId, academicYearId } = body;

    let yearId = academicYearId;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });
      yearId = currentYear?.id;
    }

    if (!name || !level || !yearId) {
      return NextResponse.json(
        { success: false, error: "Nom, niveau et année scolaire sont requis." },
        { status: 400 }
      );
    }

    const newClass = await prisma.schoolClass.create({
      data: {
        name,
        level,
        section: section || null,
        capacity: Number(capacity) || 40,
        mainTeacherId: mainTeacherId || null,
        academicYearId: yearId,
      },
      include: {
        mainTeacher: true,
        academicYear: true,
        classSubjects: {
          include: { subject: true, teacher: true },
        },
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json({ success: true, data: newClass });
  } catch (error) {
    console.error("Erreur POST class:", error);
    return NextResponse.json(
      { success: false, error: "Erreur création de la classe." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, classSubjects, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de classe requis." },
        { status: 400 }
      );
    }

    if (data.capacity) {
      data.capacity = Number(data.capacity);
    }

    const updated = await prisma.schoolClass.update({
      where: { id },
      data,
      include: {
        mainTeacher: true,
        academicYear: true,
        classSubjects: {
          include: { subject: true, teacher: true },
        },
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Erreur PUT class:", error);
    return NextResponse.json(
      { success: false, error: "Erreur modification classe." },
      { status: 500 }
    );
  }
}
