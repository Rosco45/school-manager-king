import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "ALL", "INSOLVENT"

    const [payments, feeStructures, students] = await Promise.all([
      prisma.payment.findMany({
        include: {
          student: {
            include: {
              schoolClass: true,
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.feeStructure.findMany(),
      prisma.student.findMany({
        include: {
          schoolClass: true,
          payments: true,
        },
      }),
    ]);

    // Calcul des totaux et de l'insolvabilité
    // Tarifs par défaut
    const feeMap: Record<string, number> = {
      PRIMAIRE: 300000,
      COLLEGE: 450000,
      LYCEE: 550000,
    };

    feeStructures.forEach((f) => {
      feeMap[f.level] = f.registrationFee + f.tranche1 + f.tranche2 + f.tranche3;
    });

    let totalExpected = 0;
    let totalCollected = 0;

    const studentLedger = students.map((s) => {
      const level = s.schoolClass?.level || "COLLEGE";
      const totalDue = feeMap[level] || 450000;
      const paid = s.payments.reduce((acc, p) => acc + p.amount, 0);
      const balance = Math.max(0, totalDue - paid);

      totalExpected += totalDue;
      totalCollected += paid;

      return {
        id: s.id,
        matricule: s.matricule,
        studentName: `${s.lastName} ${s.firstName}`,
        className: s.schoolClass?.name || "Non assigné",
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        parentWhatsApp: s.parentWhatsApp,
        totalExpected: totalDue,
        totalPaid: paid,
        balanceDue: balance,
        isInsolvent: balance > 0,
      };
    });

    const recoveryRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
    const insolventStudents = studentLedger.filter((s) => s.isInsolvent);

    // Grouping by Month for Recharts
    const monthlyData: Record<string, number> = {};
    const months = ["Sept", "Oct", "Nov", "Déc", "Janv", "Févr", "Mars", "Avr", "Mai", "Juin"];
    months.forEach((m) => (monthlyData[m] = 0));

    payments.forEach((p) => {
      const monthIdx = new Date(p.date).getMonth(); // 0 = Jan
      const mapIdxToName: Record<number, string> = {
        8: "Sept",
        9: "Oct",
        10: "Nov",
        11: "Déc",
        0: "Janv",
        1: "Févr",
        2: "Mars",
        3: "Avr",
        4: "Mai",
        5: "Juin",
      };
      const name = mapIdxToName[monthIdx];
      if (name && monthlyData[name] !== undefined) {
        monthlyData[name] += p.amount;
      }
    });

    const monthlyChart = Object.keys(monthlyData).map((month) => ({
      month,
      montant: monthlyData[month],
    }));

    let filteredPayments = payments;
    if (filter === "INSOLVENT") {
      // Élèves avec solde restant
    }

    return NextResponse.json({
      success: true,
      data: {
        payments: filteredPayments,
        feeStructures,
        summary: {
          totalExpected,
          totalCollected,
          recoveryRate: parseFloat(recoveryRate.toFixed(1)),
          insolventCount: insolventStudents.length,
          totalStudents: students.length,
        },
        insolventStudents,
        monthlyChart,
      },
    });
  } catch (error) {
    console.error("Erreur GET accounting:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des données comptables." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      amount,
      paymentType,
      paymentMethod,
      reference,
      note,
      recordedBy,
    } = body;

    if (!studentId || !amount || !paymentType || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    // Génération du numéro de reçu béninois
    const year = new Date().getFullYear();
    const count = await prisma.payment.count();
    const receiptNumber = `REC-COT-${year}-${String(count + 1).padStart(4, "0")}`;

    const newPayment = await prisma.payment.create({
      data: {
        receiptNumber,
        studentId,
        amount: Number(amount),
        paymentType,
        paymentMethod,
        reference: reference || null,
        note: note || null,
        recordedBy: recordedBy || "Mme Clarisse Houndété (Économe)",
        date: new Date(),
      },
      include: {
        student: {
          include: {
            schoolClass: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newPayment });
  } catch (error) {
    console.error("Erreur POST payment:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'encaissement." },
      { status: 500 }
    );
  }
}
