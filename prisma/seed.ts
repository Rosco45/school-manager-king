import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🇧🇯 Début du remplissage de la base selon le Système Éducatif Béninois...");

  // 1. Nettoyage de la base
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.reportCard.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.schoolClass.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.schoolSettings.deleteMany();

  // 2. Paramètres de l'école (Bénin - Cotonou)
  await prisma.schoolSettings.create({
    data: {
      id: "default",
      name: "Complexe Scolaire Les Étoiles - Cotonou",
      motto: "Discipline - Rigueur - Réussite",
      address: "Avenue Jean-Paul II, Quartier Haie Vive, Cotonou, République du Bénin",
      phone: "+229 21 30 45 88 / +229 97 48 12 34",
      email: "direction@lesetoiles-cotonou.bj",
      currency: "FCFA",
      directorName: "Dr. Marcellin KPADONOU",
      logoUrl: "/logo-school.png",
      stampUrl: "/stamp.png",
    },
  });

  // 3. Années scolaires
  await prisma.academicYear.create({
    data: {
      name: "2024-2025",
      startDate: new Date("2024-09-16"),
      endDate: new Date("2025-06-27"),
      isCurrent: false,
    },
  });

  const yearCurrent = await prisma.academicYear.create({
    data: {
      name: "2025-2026",
      startDate: new Date("2025-09-15"),
      endDate: new Date("2026-06-26"),
      isCurrent: true,
    },
  });

  // 4. Grilles tarifaires béninoises par cycle (Primaire, Collège 1er Cycle, Second Cycle Lycée)
  await prisma.feeStructure.createMany({
    data: [
      {
        academicYear: "2025-2026",
        level: "PRIMAIRE",
        registrationFee: 45000,
        tranche1: 85000,
        tranche2: 70000,
        tranche3: 50000,
        dueDateT1: new Date("2025-10-15"),
        dueDateT2: new Date("2026-01-15"),
        dueDateT3: new Date("2026-04-15"),
      },
      {
        academicYear: "2025-2026",
        level: "COLLEGE",
        registrationFee: 65000,
        tranche1: 135000,
        tranche2: 110000,
        tranche3: 90000,
        dueDateT1: new Date("2025-10-15"),
        dueDateT2: new Date("2026-01-15"),
        dueDateT3: new Date("2026-04-15"),
      },
      {
        academicYear: "2025-2026",
        level: "LYCEE",
        registrationFee: 80000,
        tranche1: 160000,
        tranche2: 140000,
        tranche3: 120000,
        dueDateT1: new Date("2025-10-15"),
        dueDateT2: new Date("2026-01-15"),
        dueDateT3: new Date("2026-04-15"),
      },
    ],
  });

  // 5. Utilisateurs RBAC béninois
  await prisma.user.createMany({
    data: [
      {
        email: "directeur@lesetoiles-cotonou.bj",
        name: "Dr. Marcellin Kpadonou",
        role: "ADMIN",
        phone: "+229 97 48 12 34",
        password: "password123",
      },
      {
        email: "econome@lesetoiles-cotonou.bj",
        name: "Mme Clarisse Houndété",
        role: "ACCOUNTANT",
        phone: "+229 95 12 34 56",
        password: "password123",
      },
      {
        email: "prof.diop@lesetoiles-cotonou.bj",
        name: "M. Romaric Gbaguidi (Maths)",
        role: "TEACHER",
        phone: "+229 96 23 45 67",
        password: "password123",
      },
      {
        email: "parent.dossou@lesetoiles-cotonou.bj",
        name: "M. Toussaint Dossou",
        role: "PARENT",
        phone: "+229 97 99 88 77",
        password: "password123",
      },
    ],
  });

  // 6. 12 Enseignants aux spécialités du secondaire béninois
  const teachersData = [
    { matricule: "ENS-BEN-001", firstName: "Romaric", lastName: "Gbaguidi", specialty: "Mathématiques", email: "romaric.gbaguidi@lesetoiles-cotonou.bj", phone: "+229 96 23 45 67" },
    { matricule: "ENS-BEN-002", firstName: "Fifamè", lastName: "Houngbédji", specialty: "Français & Littérature", email: "fifame.houngbedji@lesetoiles-cotonou.bj", phone: "+229 97 34 56 78" },
    { matricule: "ENS-BEN-003", firstName: "Mahugnon", lastName: "Codjia", specialty: "Histoire-Géographie", email: "mahugnon.codjia@lesetoiles-cotonou.bj", phone: "+229 95 45 67 89" },
    { matricule: "ENS-BEN-004", firstName: "Sènan", lastName: "Agossa", specialty: "Sciences de la Vie et de la Terre (SVT)", email: "senan.agossa@lesetoiles-cotonou.bj", phone: "+229 94 56 78 90" },
    { matricule: "ENS-BEN-005", firstName: "Ulrich", lastName: "Koundé", specialty: "Physique, Chimie et Technologie (PCT)", email: "ulrich.kounde@lesetoiles-cotonou.bj", phone: "+229 97 67 89 01" },
    { matricule: "ENS-BEN-006", firstName: "Espérance", lastName: "Zinsou", specialty: "Anglais", email: "esperance.zinsou@lesetoiles-cotonou.bj", phone: "+229 96 78 90 12" },
    { matricule: "ENS-BEN-007", firstName: "Bienvenu", lastName: "Aïvo", specialty: "Philosophie", email: "bienvenu.aivo@lesetoiles-cotonou.bj", phone: "+229 95 89 01 23" },
    { matricule: "ENS-BEN-008", firstName: "Prudence", lastName: "Tossou", specialty: "Éducation Physique et Sportive (EPS)", email: "prudence.tossou@lesetoiles-cotonou.bj", phone: "+229 94 90 12 34" },
    { matricule: "ENS-BEN-009", firstName: "Boris", lastName: "Bio", specialty: "Allemand / Espagnol", email: "boris.bio@lesetoiles-cotonou.bj", phone: "+229 97 01 23 45" },
    { matricule: "ENS-BEN-010", firstName: "Enagnon", lastName: "Allagbé", specialty: "Informatique & TIC", email: "enagnon.allagbe@lesetoiles-cotonou.bj", phone: "+229 96 12 34 56" },
    { matricule: "ENS-BEN-011", firstName: "Gloria", lastName: "Sanni", specialty: "Éducation Artistique & Dessin", email: "gloria.sanni@lesetoiles-cotonou.bj", phone: "+229 95 23 45 67" },
    { matricule: "ENS-BEN-012", firstName: "Sédami", lastName: "Ahoussinou", specialty: "Pédagogie Fondamentale Primaire (CM2)", email: "sedami.ahoussinou@lesetoiles-cotonou.bj", phone: "+229 94 34 56 78" },
  ];

  const createdTeachers = [];
  for (const t of teachersData) {
    const teacher = await prisma.teacher.create({ data: t });
    createdTeachers.push(teacher);
  }

  // 7. Matières officielles au Bénin (avec PCT - Physique, Chimie et Technologie)
  const subjectsData = [
    { name: "Mathématiques", code: "MATH", color: "#2563eb" },
    { name: "Français & Expression Écrite", code: "FRAN", color: "#0d9488" },
    { name: "Physique, Chimie et Technologie (PCT)", code: "PCT", color: "#8b5cf6" },
    { name: "Sciences de la Vie et de la Terre (SVT)", code: "SVT", color: "#10b981" },
    { name: "Histoire-Géographie", code: "HIST", color: "#f59e0b" },
    { name: "Anglais", code: "ANG", color: "#06b6d4" },
    { name: "Philosophie", code: "PHILO", color: "#ec4899" },
    { name: "Éducation Physique et Sportive (EPS)", code: "EPS", color: "#f97316" },
    { name: "Informatique & Algorithmique", code: "INFO", color: "#3b82f6" },
  ];

  const createdSubjects: Record<string, any> = {};
  for (const s of subjectsData) {
    const sub = await prisma.subject.create({ data: s });
    createdSubjects[s.code] = sub;
  }

  // 8. 6 Classes réparties selon le système béninois
  const classesData = [
    { name: "CM2", level: "PRIMAIRE", section: "Cycle Primaire - Préparation CEP", capacity: 35, mainTeacherIndex: 11 },
    { name: "6ème A", level: "COLLEGE", section: "Premier Cycle Général", capacity: 40, mainTeacherIndex: 1 },
    { name: "4ème B", level: "COLLEGE", section: "Premier Cycle - Moderne Long", capacity: 40, mainTeacherIndex: 5 },
    { name: "3ème A", level: "COLLEGE", section: "Classe d'Examen - BEPC", capacity: 38, mainTeacherIndex: 2 },
    { name: "Seconde C", level: "LYCEE", section: "Second Cycle - Mathématiques & Physiques", capacity: 35, mainTeacherIndex: 4 },
    { name: "Terminale D", level: "LYCEE", section: "Classe Terminale - Baccalauréat Série D", capacity: 35, mainTeacherIndex: 0 },
  ];

  const createdClasses = [];
  for (const c of classesData) {
    const sc = await prisma.schoolClass.create({
      data: {
        name: c.name,
        level: c.level,
        section: c.section,
        capacity: c.capacity,
        academicYearId: yearCurrent.id,
        mainTeacherId: createdTeachers[c.mainTeacherIndex].id,
      },
    });
    createdClasses.push(sc);
  }

  // 9. Association Matières-Classes avec Coefficients officiels béninois
  // Terminale D (Bénin) : SVT (coeff 5), Math (coeff 4), PCT (coeff 4), Français (coeff 2), Philo (coeff 2), Anglais (coeff 2), Histoire-Géo (coeff 2), EPS (coeff 1)
  const tD = createdClasses[5];
  const coeffTerminaleD = [
    { code: "SVT", coeff: 5, teacherIdx: 3 },
    { code: "MATH", coeff: 4, teacherIdx: 0 },
    { code: "PCT", coeff: 4, teacherIdx: 4 },
    { code: "FRAN", coeff: 2, teacherIdx: 1 },
    { code: "PHILO", coeff: 2, teacherIdx: 6 },
    { code: "ANG", coeff: 2, teacherIdx: 5 },
    { code: "HIST", coeff: 2, teacherIdx: 2 },
    { code: "EPS", coeff: 1, teacherIdx: 7 },
  ];

  for (const item of coeffTerminaleD) {
    await prisma.classSubject.create({
      data: {
        classId: tD.id,
        subjectId: createdSubjects[item.code].id,
        teacherId: createdTeachers[item.teacherIdx].id,
        coefficient: item.coeff,
      },
    });
  }

  // 3ème A (Préparation BEPC Bénin)
  const t3A = createdClasses[3];
  const coeff3eme = [
    { code: "FRAN", coeff: 3, teacherIdx: 1 },
    { code: "MATH", coeff: 3, teacherIdx: 0 },
    { code: "PCT", coeff: 2, teacherIdx: 4 },
    { code: "SVT", coeff: 2, teacherIdx: 3 },
    { code: "HIST", coeff: 2, teacherIdx: 2 },
    { code: "ANG", coeff: 2, teacherIdx: 5 },
    { code: "EPS", coeff: 1, teacherIdx: 7 },
  ];

  for (const item of coeff3eme) {
    await prisma.classSubject.create({
      data: {
        classId: t3A.id,
        subjectId: createdSubjects[item.code].id,
        teacherId: createdTeachers[item.teacherIdx].id,
        coefficient: item.coeff,
      },
    });
  }

  // 6ème A (Bénin)
  const t6A = createdClasses[1];
  const coeff6eme = [
    { code: "FRAN", coeff: 4, teacherIdx: 1 },
    { code: "MATH", coeff: 3, teacherIdx: 0 },
    { code: "PCT", coeff: 2, teacherIdx: 4 },
    { code: "SVT", coeff: 2, teacherIdx: 3 },
    { code: "HIST", coeff: 2, teacherIdx: 2 },
    { code: "ANG", coeff: 2, teacherIdx: 5 },
    { code: "EPS", coeff: 1, teacherIdx: 7 },
  ];

  for (const item of coeff6eme) {
    await prisma.classSubject.create({
      data: {
        classId: t6A.id,
        subjectId: createdSubjects[item.code].id,
        teacherId: createdTeachers[item.teacherIdx].id,
        coefficient: item.coeff,
      },
    });
  }

  // Autres classes (CM2, 4ème B, Seconde C)
  for (const otherClass of [createdClasses[0], createdClasses[2], createdClasses[4]]) {
    const list = [
      { code: "MATH", coeff: 3, teacherIdx: 0 },
      { code: "FRAN", coeff: 3, teacherIdx: 1 },
      { code: "PCT", coeff: 2, teacherIdx: 4 },
      { code: "SVT", coeff: 2, teacherIdx: 3 },
      { code: "HIST", coeff: 2, teacherIdx: 2 },
      { code: "ANG", coeff: 2, teacherIdx: 5 },
      { code: "EPS", coeff: 1, teacherIdx: 7 },
    ];
    for (const item of list) {
      await prisma.classSubject.create({
        data: {
          classId: otherClass.id,
          subjectId: createdSubjects[item.code].id,
          teacherId: createdTeachers[item.teacherIdx].id,
          coefficient: item.coeff,
        },
      });
    }
  }

  // 10. Génération de 60 élèves aux patronymes et prénoms authentiques béninois
  const firstNamesM = [
    "Mahugnon", "Sènan", "Enagnon", "Yémalin", "Boris", "Ulrich", "Bienvenu",
    "Romaric", "Landry", "Aurel", "Toussaint", "Espoir", "Christian", "Désiré",
    "Gaspard", "Wilfried"
  ];
  const firstNamesF = [
    "Fifamè", "Sédami", "Espérance", "Gloria", "Prudence", "Chimène", "Flora",
    "Grâce", "Bénédicte", "Merveille", "Pélagie", "Rolande", "Yabo", "Edwige",
    "Christelle", "Syntyche"
  ];
  const lastNames = [
    "Dossou", "Gbaguidi", "Houngbédji", "Kpadonou", "Agossa", "Sossou", "Zinsou",
    "Houndété", "Aïvo", "Koundé", "Allagbé", "Bio", "Sanni", "Chabi", "Codjia",
    "Ahoussinou", "Tossou", "Adjanohoun", "Dègbo", "Mensah", "Tokpo", "Hounkpatin"
  ];

  const quartersCotonou = [
    "Haie Vive, Cotonou", "Akpakpa Dodomè, Cotonou", "Cadjèhoun, Cotonou",
    "Fidjrossè Calvaire, Cotonou", "Agla Les Pylônes, Cotonou", "Gbégamey, Cotonou",
    "Sikècodji, Cotonou", "Zogbo, Cotonou", "Abomey-Calavi, Tankpè", "Mènontin, Cotonou"
  ];

  const allStudents = [];
  let studentCounter = 1;

  for (let cIdx = 0; cIdx < createdClasses.length; cIdx++) {
    const currentClass = createdClasses[cIdx];

    for (let sIdx = 0; sIdx < 10; sIdx++) {
      const isMale = (sIdx % 2 === 0);
      const firstName = isMale
        ? firstNamesM[(studentCounter * 3) % firstNamesM.length]
        : firstNamesF[(studentCounter * 3) % firstNamesF.length];
      const lastName = lastNames[(studentCounter * 7) % lastNames.length];
      const matricule = `SMK-BEN-${String(studentCounter).padStart(4, "0")}`;

      const birthYear = cIdx === 0 ? 2014 : cIdx === 1 ? 2013 : cIdx === 2 ? 2011 : cIdx === 3 ? 2010 : cIdx === 4 ? 2009 : 2008;
      const birthDate = new Date(`${birthYear}-0${(sIdx % 9) + 1}-1${(sIdx % 8) + 1}`);

      const parentName = `M./Mme ${lastName}`;
      // Numéro Bénin (+229)
      const parentPhone = `+229 ${96 + (studentCounter % 4)} ${String(10 + studentCounter).padStart(2, "0")} ${String(20 + sIdx).padStart(2, "0")} ${String(30 + cIdx).padStart(2, "0")}`;
      const parentWhatsApp = parentPhone;

      const student = await prisma.student.create({
        data: {
          matricule,
          firstName,
          lastName,
          gender: isMale ? "M" : "F",
          birthDate,
          birthPlace: sIdx % 3 === 0 ? "Cotonou (Maternité Lagune)" : sIdx % 3 === 1 ? "Porto-Novo" : "Abomey-Calavi",
          address: quartersCotonou[(studentCounter + sIdx) % quartersCotonou.length],
          parentName,
          parentPhone,
          parentEmail: `parent.${lastName.toLowerCase()}${studentCounter}@yahoo.fr`,
          parentWhatsApp,
          medicalNotes: studentCounter % 7 === 0 ? "Asthme d'effort - Dispense ponctuelle d'endurance" : "R.A.S. - Apte aux activités scolaires et sportives",
          status: "ACTIVE",
          classId: currentClass.id,
        },
      });

      allStudents.push(student);
      studentCounter++;
    }
  }

  console.log(`✅ 60 élèves béninois créés avec succès.`);

  // 11. Évaluations & Notes (Devoirs Surveillés Départementaux & Compositions)
  console.log("📝 Enregistrement des devoirs surveillés et compositions...");

  const evalClasses = [createdClasses[3], createdClasses[5]]; // 3ème A et Terminale D
  for (const c of evalClasses) {
    const classSubs = await prisma.classSubject.findMany({
      where: { classId: c.id },
      include: { subject: true },
    });

    const studentsInClass = await prisma.student.findMany({
      where: { classId: c.id },
    });

    for (const cs of classSubs) {
      // Semestre 1 : 3 Interros + 3 Devoirs Surveillés (DS1, DS2, DS3)
      const eS1_Int1 = await prisma.evaluation.create({
        data: {
          title: "Interrogation 1",
          type: "INTERRO",
          term: 1,
          date: new Date("2025-10-05"),
          classSubjectId: cs.id,
        },
      });

      const eS1_Int2 = await prisma.evaluation.create({
        data: {
          title: "Interrogation 2",
          type: "INTERRO",
          term: 1,
          date: new Date("2025-10-25"),
          classSubjectId: cs.id,
        },
      });

      const eS1_Int3 = await prisma.evaluation.create({
        data: {
          title: "Interrogation 3",
          type: "INTERRO",
          term: 1,
          date: new Date("2025-11-15"),
          classSubjectId: cs.id,
        },
      });

      const eS1_DS1 = await prisma.evaluation.create({
        data: {
          title: "Devoir Surveillé 1 (DS1)",
          type: "DEVOIR",
          term: 1,
          date: new Date("2025-11-02"),
          classSubjectId: cs.id,
        },
      });

      const eS1_DS2 = await prisma.evaluation.create({
        data: {
          title: "Devoir Surveillé 2 (DS2)",
          type: "DEVOIR",
          term: 1,
          date: new Date("2025-11-28"),
          classSubjectId: cs.id,
        },
      });

      const eS1_DS3 = await prisma.evaluation.create({
        data: {
          title: "Devoir Surveillé 3 (DS3)",
          type: "DEVOIR",
          term: 1,
          date: new Date("2025-12-18"),
          classSubjectId: cs.id,
        },
      });

      // Semestre 2 : 3 Interros + 3 Devoirs
      const eS2_Int1 = await prisma.evaluation.create({
        data: {
          title: "Interrogation 1 (S2)",
          type: "INTERRO",
          term: 2,
          date: new Date("2026-01-20"),
          classSubjectId: cs.id,
        },
      });

      const eS2_Int2 = await prisma.evaluation.create({
        data: {
          title: "Interrogation 2 (S2)",
          type: "INTERRO",
          term: 2,
          date: new Date("2026-02-10"),
          classSubjectId: cs.id,
        },
      });

      const eS2_Int3 = await prisma.evaluation.create({
        data: {
          title: "Interrogation 3 (S2)",
          type: "INTERRO",
          term: 2,
          date: new Date("2026-03-05"),
          classSubjectId: cs.id,
        },
      });

      const eS2_DS1 = await prisma.evaluation.create({
        data: {
          title: "Devoir Surveillé 1 - S2",
          type: "DEVOIR",
          term: 2,
          date: new Date("2026-02-14"),
          classSubjectId: cs.id,
        },
      });

      const eS2_DS2 = await prisma.evaluation.create({
        data: {
          title: "Devoir Surveillé 2 - S2",
          type: "DEVOIR",
          term: 2,
          date: new Date("2026-03-12"),
          classSubjectId: cs.id,
        },
      });

      const eS2_DS3 = await prisma.evaluation.create({
        data: {
          title: "Devoir Surveillé 3 - S2",
          type: "DEVOIR",
          term: 2,
          date: new Date("2026-04-10"),
          classSubjectId: cs.id,
        },
      });

      for (let i = 0; i < studentsInClass.length; i++) {
        const student = studentsInClass[i];
        const baseScore = 9 + ((i * 1.3 + cs.coefficient) % 10.5);

        const int1 = Math.min(20, Math.max(5, parseFloat((baseScore + (i % 3) * 0.4 - 0.4).toFixed(1))));
        const int2 = Math.min(20, Math.max(5, parseFloat((baseScore + ((i + 1) % 3) * 0.5 - 0.2).toFixed(1))));
        const int3 = Math.min(20, Math.max(5, parseFloat((baseScore + ((i + 2) % 3) * 0.3).toFixed(1))));

        const ds1 = Math.min(20, Math.max(6, parseFloat((baseScore + ((i + 1) % 4) * 0.4).toFixed(1))));
        const ds2 = Math.min(20, Math.max(6, parseFloat((baseScore + ((i + 2) % 3) * 0.6).toFixed(1))));
        const ds3 = Math.min(20, Math.max(7, parseFloat((baseScore + ((i + 3) % 4) * 0.5).toFixed(1))));

        await prisma.grade.createMany({
          data: [
            { score: int1, studentId: student.id, evaluationId: eS1_Int1.id, comment: "Bien" },
            { score: int2, studentId: student.id, evaluationId: eS1_Int2.id, comment: "Correct" },
            { score: int3, studentId: student.id, evaluationId: eS1_Int3.id, comment: "Bonne révision" },
            { score: ds1, studentId: student.id, evaluationId: eS1_DS1.id, comment: ds1 >= 14 ? "Très bon DS" : "Méthode à revoir" },
            { score: ds2, studentId: student.id, evaluationId: eS1_DS2.id, comment: ds2 >= 12 ? "Bien assimilé" : "Passable" },
            { score: ds3, studentId: student.id, evaluationId: eS1_DS3.id, comment: ds3 >= 14 ? "Excellente synthèse" : "Efforts visibles" },
            { score: int1 + 0.5, studentId: student.id, evaluationId: eS2_Int1.id, comment: "En progrès" },
            { score: ds1 + 0.5, studentId: student.id, evaluationId: eS2_DS1.id, comment: "Bonne implication" },
          ],
        });
      }
    }

    // Calcul automatique des bulletins semestriels béninois
    const studentAverages: { studentId: string; avg: number }[] = [];
    for (const student of studentsInClass) {
      let totalPoints = 0;
      let totalCoeffs = 0;

      for (const cs of classSubs) {
        const grades = await prisma.grade.findMany({
          where: {
            studentId: student.id,
            evaluation: { classSubjectId: cs.id, term: 1 },
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

          totalPoints += subjectAvg * cs.coefficient;
          totalCoeffs += cs.coefficient;
        }
      }

      const overall = totalCoeffs > 0 ? parseFloat((totalPoints / totalCoeffs).toFixed(2)) : 10;
      studentAverages.push({ studentId: student.id, avg: overall });
    }

    studentAverages.sort((a, b) => b.avg - a.avg);

    for (let r = 0; r < studentAverages.length; r++) {
      const item = studentAverages[r];
      const rank = r + 1;
      let mention = "Passable";
      if (item.avg >= 16) mention = "Tableau d'Honneur avec Félicitations (Très Bien)";
      else if (item.avg >= 14) mention = "Tableau d'Honneur avec Encouragements (Bien)";
      else if (item.avg >= 12) mention = "Tableau d'Honneur (Assez Bien)";
      else if (item.avg >= 10) mention = "Encouragements (Passable)";
      else mention = "Avertissement de travail";

      await prisma.reportCard.create({
        data: {
          studentId: item.studentId,
          term: 1,
          academicYear: "2025-2026",
          overallAverage: item.avg,
          rank: rank,
          totalStudents: studentAverages.length,
          absencesCount: r % 4,
          lateCount: r % 3,
          mention,
          teacherRemarks: item.avg >= 14 ? "Élève modèle et assidu, persévérez pour le Baccalauréat !" : "Travail régulier, intensifiez les efforts en PCT et SVT.",
          isLocked: true,
        },
      });
    }
  }

  // 12. Comptabilité : Versements via MTN Mobile Money, Moov Money (Flooz), Celtiis Cash & Espèces
  console.log("💰 Enregistrement des paiements (MTN MoMo, Moov Money, Celtiis Cash)...");
  let receiptIndex = 1;

  for (let idx = 0; idx < allStudents.length; idx++) {
    const student = allStudents[idx];
    const receipt1 = `REC-COT-2026-${String(receiptIndex++).padStart(4, "0")}`;

    // Frais d'inscription
    await prisma.payment.create({
      data: {
        receiptNumber: receipt1,
        studentId: student.id,
        amount: 65000,
        paymentType: "REGISTRATION",
        paymentMethod: idx % 3 === 0 ? "MOBILE_MONEY" : idx % 3 === 1 ? "CASH" : "BANK_TRANSFER",
        reference: idx % 3 === 0 ? `MTN-MOMO-${847392 + idx}` : `BOA-BENIN-${10042 + idx}`,
        note: "Frais d'inscription et carnet de correspondance",
        date: new Date("2025-09-18"),
        recordedBy: "Mme Clarisse Houndété (Économe)",
      },
    });

    // 70% ont payé la Tranche 1
    if (idx % 10 !== 3 && idx % 10 !== 7) {
      const receipt2 = `REC-COT-2026-${String(receiptIndex++).padStart(4, "0")}`;
      await prisma.payment.create({
        data: {
          receiptNumber: receipt2,
          studentId: student.id,
          amount: 135000,
          paymentType: "TRANCHE_1",
          paymentMethod: idx % 2 === 0 ? "MOBILE_MONEY" : "CASH",
          reference: `MOOV-FLOOZ-${44392 + idx}`,
          note: "Règlement 1ère Tranche",
          date: new Date("2025-10-14"),
          recordedBy: "Mme Clarisse Houndété (Économe)",
        },
      });
    }

    // 40% ont déjà payé la Tranche 2
    if (idx % 5 === 0 || idx % 5 === 1) {
      const receipt3 = `REC-COT-2026-${String(receiptIndex++).padStart(4, "0")}`;
      await prisma.payment.create({
        data: {
          receiptNumber: receipt3,
          studentId: student.id,
          amount: 110000,
          paymentType: "TRANCHE_2",
          paymentMethod: "MOBILE_MONEY",
          reference: `CELTIIS-CASH-${99201 + idx}`,
          note: "Règlement 2ème Tranche",
          date: new Date("2026-01-12"),
          recordedBy: "Mme Clarisse Houndété (Économe)",
        },
      });
    }

    // 15% ont tout soldé
    if (idx % 7 === 0) {
      const receipt4 = `REC-COT-2026-${String(receiptIndex++).padStart(4, "0")}`;
      await prisma.payment.create({
        data: {
          receiptNumber: receipt4,
          studentId: student.id,
          amount: 90000,
          paymentType: "TRANCHE_3",
          paymentMethod: "CASH",
          reference: "CAISSE-COT-01",
          note: "Solde intégral annuel",
          date: new Date("2026-02-08"),
          recordedBy: "Mme Clarisse Houndété (Économe)",
        },
      });
    }
  }

  // 13. Absences & Retards récents
  console.log("⏰ Enregistrement des présences et absences...");
  const recentDays = [
    new Date("2026-03-02"),
    new Date("2026-03-03"),
    new Date("2026-03-04"),
    new Date("2026-03-05"),
  ];

  for (const date of recentDays) {
    for (const s of allStudents.slice(0, 30)) {
      const rand = (s.matricule.charCodeAt(s.matricule.length - 1) + date.getDate()) % 15;
      let status = "PRESENT";
      let lateMinutes = 0;
      let reason: string | null = null;

      if (rand === 1) {
        status = "ABSENT_UNJUSTIFIED";
        reason = "Non justifié à ce jour";
      } else if (rand === 2) {
        status = "ABSENT_JUSTIFIED";
        reason = "Certificat médical délivré par le CNHU de Cotonou";
      } else if (rand === 3) {
        status = "LATE";
        lateMinutes = 15;
        reason = "Embouteillages Carrefour Vêdoko / Étoile Rouge";
      }

      await prisma.attendance.create({
        data: {
          studentId: s.id,
          classId: s.classId,
          date,
          timeSlot: "08:00 - 10:00",
          status,
          lateMinutes,
          reason,
          recordedBy: "Surveillant Général",
        },
      });
    }
  }

  // 14. Notifications de simulation béninoises
  console.log("📲 Enregistrement des notifications de démonstration...");
  const sampleNotifications = [
    {
      type: "ABSENCE_ALERT",
      recipientType: "PARENT",
      recipientName: "M. Dossou",
      recipientPhone: "+229 97 10 20 30",
      message: "Complexe Les Étoiles Cotonou: Bonjour M. Dossou, nous vous signalons l'absence non justifiée de Mahugnon en Terminale D ce matin à 08:00.",
      channel: "WHATSAPP",
      status: "SENT",
      sentAt: new Date("2026-03-04T08:35:00"),
      studentId: allStudents[50].id,
    },
    {
      type: "FEE_REMINDER",
      recipientType: "PARENT",
      recipientName: "Mme Gbaguidi",
      recipientPhone: "+229 95 15 25 35",
      message: "Complexe Les Étoiles Cotonou: Chers parents de Fifamè (3ème A), le solde de la 2ème tranche (110 000 FCFA) est échu. Règlement possible par MTN MoMo ou Moov Money.",
      channel: "SMS",
      status: "SENT",
      sentAt: new Date("2026-03-01T10:00:00"),
      studentId: allStudents[33].id,
    },
    {
      type: "REPORT_CARD_READY",
      recipientType: "PARENT",
      recipientName: "M. Houngbédji",
      recipientPhone: "+229 96 18 28 38",
      message: "Complexe Les Étoiles Cotonou: Le bulletin du 1er Trimestre de Sènan est disponible. Moyenne: 15.60/20 - Rang: 2ème. Téléchargeable sur l'espace parent avec vérification QR.",
      channel: "WHATSAPP",
      status: "SENT",
      sentAt: new Date("2026-01-05T14:20:00"),
      studentId: allStudents[52].id,
    },
  ];

  for (const n of sampleNotifications) {
    await prisma.notification.create({ data: n });
  }

  console.log("✨ Seeding terminé avec succès pour le Complexe Scolaire Les Étoiles - Cotonou (Bénin) !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
