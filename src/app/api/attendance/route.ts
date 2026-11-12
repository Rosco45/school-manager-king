import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const dateStr = searchParams.get("date");

    const date = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const where: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (classId && classId !== "ALL") {
      where.classId = classId;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: true,
        schoolClass: true,
      },
      orderBy: { student: { lastName: "asc" } },
    });

    return NextResponse.json({ success: true, data: attendances });
  } catch (error) {
    console.error("Erreur GET attendance:", error);
    return NextResponse.json(
      { success: false, error: "Erreur récupération feuille d'appel." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      classId,
      date,
      timeSlot,
      records, // Array of { studentId: string, status: string, lateMinutes?: number, reason?: string }
      notifyParents,
    } = body;

    if (!classId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { success: false, error: "Classe et liste d'appel requis." },
        { status: 400 }
      );
    }

    const attendanceDate = date ? new Date(date) : new Date();
    const slot = timeSlot || "08:00 - 10:00";

    const savedRecords = [];
    const notificationsToCreate = [];

    for (const r of records) {
      const record = await prisma.attendance.create({
        data: {
          studentId: r.studentId,
          classId,
          date: attendanceDate,
          timeSlot: slot,
          status: r.status || "PRESENT",
          lateMinutes: Number(r.lateMinutes) || 0,
          reason: r.reason || null,
          recordedBy: "Enseignant / Surveillant",
        },
        include: {
          student: true,
        },
      });
      savedRecords.push(record);

      // Si absence non justifiée ou retard et option notifyParents cochée
      if (
        notifyParents &&
        (r.status === "ABSENT_UNJUSTIFIED" || r.status === "LATE")
      ) {
        const student = record.student;
        const statusText =
          r.status === "LATE"
            ? `un retard de ${r.lateMinutes || 15} minutes`
            : "une absence non justifiée";

        const message = `Complexe Les Étoiles Cotonou: Bonjour ${student.parentName}, nous vous informons que votre enfant ${student.firstName} a enregistré ${statusText} ce jour (${new Date(attendanceDate).toLocaleDateString("fr-FR")}) au créneau ${slot}.`;

        notificationsToCreate.push({
          type: "ABSENCE_ALERT",
          recipientType: "PARENT",
          recipientName: student.parentName,
          recipientPhone: student.parentWhatsApp || student.parentPhone,
          message,
          channel: "WHATSAPP",
          status: "SENT",
          sentAt: new Date(),
          studentId: student.id,
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Appel enregistré pour ${savedRecords.length} élève(s). ${notificationsToCreate.length} notification(s) envoyée(s).`,
      data: savedRecords,
    });
  } catch (error) {
    console.error("Erreur POST attendance:", error);
    return NextResponse.json(
      { success: false, error: "Erreur enregistrement de l'appel." },
      { status: 500 }
    );
  }
}
