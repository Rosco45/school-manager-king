import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const search = searchParams.get("search");

    const where: any = {};
    if (classId && classId !== "ALL") {
      where.classId = classId;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { matricule: { contains: search } },
        { parentName: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        schoolClass: {
          include: {
            mainTeacher: true,
          },
        },
        payments: true,
        reportCards: true,
        attendances: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: [{ schoolClass: { name: "asc" } }, { lastName: "asc" }],
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Erreur GET students:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des élèves." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      gender,
      birthDate,
      birthPlace,
      address,
      parentName,
      parentPhone,
      parentEmail,
      parentWhatsApp,
      medicalNotes,
      classId,
    } = body;

    if (!firstName || !lastName || !classId) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    // Génération automatique du matricule béninois unique
    const count = await prisma.student.count();
    const matricule = `SMK-BEN-${String(count + 1).padStart(4, "0")}`;

    const newStudent = await prisma.student.create({
      data: {
        matricule,
        firstName,
        lastName,
        gender: gender || "M",
        birthDate: birthDate ? new Date(birthDate) : new Date("2012-01-01"),
        birthPlace: birthPlace || "Cotonou",
        address: address || "Cotonou, Bénin",
        parentName: parentName || `Parent de ${lastName}`,
        parentPhone: parentPhone || "+229 97 00 00 00",
        parentEmail: parentEmail || null,
        parentWhatsApp: parentWhatsApp || parentPhone || "+229 97 00 00 00",
        medicalNotes: medicalNotes || "Aucune contre-indication connue",
        classId,
        status: "ACTIVE",
      },
      include: {
        schoolClass: true,
      },
    });

    return NextResponse.json({ success: true, data: newStudent });
  } catch (error) {
    console.error("Erreur POST student:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'inscription de l'élève." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID élève requis." },
        { status: 400 }
      );
    }

    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate);
    }

    const updated = await prisma.student.update({
      where: { id },
      data,
      include: {
        schoolClass: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Erreur PUT student:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la modification de l'élève." },
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
        { success: false, error: "ID élève requis." },
        { status: 400 }
      );
    }

    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Élève supprimé." });
  } catch (error) {
    console.error("Erreur DELETE student:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
