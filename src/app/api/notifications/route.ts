import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        student: {
          include: {
            schoolClass: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Erreur GET notifications:", error);
    return NextResponse.json(
      { success: false, error: "Erreur récupération notifications." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type, // "ABSENCE_ALERT", "FEE_REMINDER", "REPORT_CARD_READY", "GENERAL"
      channel, // "WHATSAPP", "SMS"
      templateText,
      recipients, // Array of { recipientName, recipientPhone, studentId?, studentName?, className?, amountDue? }
    } = body;

    if (!templateText || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Modèle de message et destinataires requis." },
        { status: 400 }
      );
    }

    const todayStr = new Date().toLocaleDateString("fr-FR");
    const notificationsToCreate = [];

    for (const r of recipients) {
      let personalizedMessage = templateText
        .replace(/\{nom_eleve\}/g, r.studentName || "Votre enfant")
        .replace(/\{classe\}/g, r.className || "sa classe")
        .replace(/\{montant_du\}/g, r.amountDue ? `${Number(r.amountDue).toLocaleString("fr-FR")} FCFA` : "le solde dû")
        .replace(/\{date\}/g, todayStr);

      notificationsToCreate.push({
        type: type || "GENERAL",
        recipientType: "PARENT",
        recipientName: r.recipientName || "Parent d'élève",
        recipientPhone: r.recipientPhone,
        message: personalizedMessage,
        channel: channel || "WHATSAPP",
        status: "SENT", // En mode simulation / cloud
        sentAt: new Date(),
        studentId: r.studentId || null,
      });
    }

    await prisma.notification.createMany({
      data: notificationsToCreate,
    });

    return NextResponse.json({
      success: true,
      message: `${notificationsToCreate.length} message(s) ${channel || "WHATSAPP"} envoyé(s) avec succès !`,
      count: notificationsToCreate.length,
    });
  } catch (error) {
    console.error("Erreur POST notification:", error);
    return NextResponse.json(
      { success: false, error: "Erreur envoi notification." },
      { status: 500 }
    );
  }
}
