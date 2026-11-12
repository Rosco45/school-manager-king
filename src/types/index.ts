export type Role = "ADMIN" | "ACCOUNTANT" | "TEACHER" | "PARENT";

export interface SchoolSettings {
  id: string;
  name: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  directorName: string;
  logoUrl?: string | null;
  stampUrl?: string | null;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Teacher {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  avatar?: string | null;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: "PRIMAIRE" | "COLLEGE" | "LYCEE";
  section?: string | null;
  capacity: number;
  academicYearId: string;
  academicYear?: AcademicYear;
  mainTeacherId?: string | null;
  mainTeacher?: Teacher | null;
  classSubjects?: ClassSubject[];
  _count?: {
    students: number;
    classSubjects: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherId?: string | null;
  coefficient: number;
  subject: Subject;
  teacher?: Teacher | null;
  schoolClass?: SchoolClass;
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  birthDate: string;
  birthPlace: string;
  address: string;
  photo?: string | null;
  medicalNotes?: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  parentWhatsApp: string;
  status: "ACTIVE" | "TRANSFERRED" | "GRADUATED";
  classId: string;
  schoolClass?: SchoolClass;
  payments?: Payment[];
  reportCards?: ReportCard[];
  attendances?: Attendance[];
}

export interface Evaluation {
  id: string;
  title: string;
  type: "INTERRO" | "DEVOIR" | "COMPOSITION";
  term: number;
  date: string;
  maxScore: number;
  classSubjectId: string;
  classSubject?: ClassSubject;
  grades?: Grade[];
}

export interface Grade {
  id: string;
  score: number;
  comment?: string | null;
  studentId: string;
  evaluationId: string;
  student?: Student;
  evaluation?: Evaluation;
}

export interface ReportCard {
  id: string;
  studentId: string;
  student?: Student;
  term: number;
  academicYear: string;
  overallAverage: number;
  rank: number;
  totalStudents: number;
  absencesCount: number;
  lateCount: number;
  mention: string;
  teacherRemarks?: string | null;
  isLocked: boolean;
  generatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  timeSlot: string;
  status: "PRESENT" | "ABSENT_UNJUSTIFIED" | "ABSENT_JUSTIFIED" | "LATE";
  lateMinutes: number;
  reason?: string | null;
  recordedBy?: string | null;
  student?: Student;
  schoolClass?: SchoolClass;
}

export interface FeeStructure {
  id: string;
  academicYear: string;
  level: "PRIMAIRE" | "COLLEGE" | "LYCEE";
  registrationFee: number;
  tranche1: number;
  tranche2: number;
  tranche3: number;
  dueDateT1: string;
  dueDateT2: string;
  dueDateT3: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  studentId: string;
  student?: Student;
  amount: number;
  paymentType: "REGISTRATION" | "TRANCHE_1" | "TRANCHE_2" | "TRANCHE_3" | "FULL" | "OTHER";
  paymentMethod: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CHECK";
  reference?: string | null;
  note?: string | null;
  date: string;
  recordedBy: string;
}

export interface NotificationItem {
  id: string;
  type: "ABSENCE_ALERT" | "FEE_REMINDER" | "REPORT_CARD_READY" | "GENERAL";
  recipientType: "PARENT" | "TEACHER" | "STUDENT";
  recipientName: string;
  recipientPhone: string;
  message: string;
  channel: "WHATSAPP" | "SMS";
  status: "SENT" | "PENDING" | "FAILED";
  sentAt: string;
  studentId?: string | null;
  student?: Student;
}
