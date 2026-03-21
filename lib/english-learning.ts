// ==================== ENGLISH LEARNING PLATFORM SERVICES ====================
// Business logic for the English learning platform

import Student, { IStudent } from '@/models/Student';
import Teacher, { ITeacher } from '@/models/Teacher';
import ClassSession, { IClassSession, IVocabulary, IGrammarFix } from '@/models/ClassSession';
import { connectDB } from './mongodb';

// ==================== EXTRACTION PROMPT ====================

export const EXTRACTION_PROMPT = `ACTÚA COMO UN ANALISTA PEDAGÓGICO DE INGLÉS PARA DESARROLLADORES.

CONTEXTO: La siguiente es una clase entre Valentina (Profesor) y Nico (Alumno). Nico es Full Stack Developer y vive en Mendoza, Argentina.

TU MISIÓN: Extraer la "médula" de la clase para alimentar una base de datos de progreso. Ignora el ruido y enfócate en lo que Nico debe aprender.

SALIDA REQUERIDA (JSON ESTRICTO):

{
  "topic": "Resumen de 1 oración del tema principal",
  "vocabulary": [{"word": "palabra", "meaning": "significado en español"}],
  "grammar": [{"error": "lo que dijo Nico", "fix": "lo correcto", "rule": "por qué"}],
  "strengths": ["lo que Nico hizo bien"],
  "weaknesses": ["lo que Nico debe practicar"],
  "scores": {"fluency": 1-10, "grammar": 1-10, "comprehension": 1-10}
}

TRANSCRIPCIÓN DE LA CLASE:
`;

// ==================== STUDENT SERVICES ====================

export interface CreateStudentData {
  clerkId: string;
  name: string;
  email: string;
  currentLevel?: string;
  focusAreas?: string[];
}

export async function createStudent(data: CreateStudentData): Promise<IStudent> {
  await connectDB();
  
  const student = new Student({
    ...data,
    currentLevel: data.currentLevel || 'A1',
    focusAreas: data.focusAreas || [],
    stats: {
      totalClasses: 0,
      vocabularyCount: 0,
      lastEvaluation: null,
    },
    masteredTopics: [],
    pendingTopics: [],
    weeklyProgress: [],
  });

  return student.save();
}

export async function getStudentByClerkId(clerkId: string): Promise<IStudent | null> {
  await connectDB();
  return Student.findOne({ clerkId });
}

export async function updateStudentProgress(
  studentId: string,
  sessionData: {
    vocabulary: IVocabulary[];
    grammarFixes: IGrammarFix[];
    performance: { fluency: number; grammar: number; comprehension: number };
  }
): Promise<IStudent> {
  await connectDB();
  
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  // Update stats
  student.stats.totalClasses += 1;
  student.stats.vocabularyCount += sessionData.vocabulary.length;
  student.stats.lastEvaluation = new Date();

  // Add new vocabulary to pending
  const newWords = sessionData.vocabulary.map(v => v.word);
  student.pendingTopics.push(...newWords);

  // Calculate weekly progress
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const lastProgress = student.weeklyProgress[student.weeklyProgress.length - 1];
  const fluencyChange = lastProgress 
    ? sessionData.performance.fluency - (lastProgress.fluencyChange || 5)
    : sessionData.performance.fluency - 5;
  const grammarChange = lastProgress
    ? sessionData.performance.grammar - (lastProgress.grammarChange || 5)
    : sessionData.performance.grammar - 5;
  const comprehensionChange = lastProgress
    ? sessionData.performance.comprehension - (lastProgress.comprehensionChange || 5)
    : sessionData.performance.comprehension - 5;

  student.weeklyProgress.push({
    weekStart,
    fluencyChange,
    grammarChange,
    comprehensionChange,
  });

  // Keep only last 12 weeks
  if (student.weeklyProgress.length > 12) {
    student.weeklyProgress = student.weeklyProgress.slice(-12);
  }

  return student.save();
}

// ==================== TEACHER SERVICES ====================

export interface CreateTeacherData {
  teacherId: string;
  name: string;
  style: string;
  systemPrompt: string;
  commonCorrections?: string[];
  specialty?: string[];
}

export async function createTeacher(data: CreateTeacherData): Promise<ITeacher> {
  await connectDB();
  
  const teacher = new Teacher({
    ...data,
    commonCorrections: data.commonCorrections || [],
    specialty: data.specialty || [],
  });

  return teacher.save();
}

export async function getTeacherById(teacherId: string): Promise<ITeacher | null> {
  await connectDB();
  return Teacher.findOne({ teacherId });
}

export async function getAvailableTeachers(): Promise<ITeacher[]> {
  await connectDB();
  return Teacher.find({ available: true });
}

// ==================== CLASS SESSION SERVICES ====================

export interface CreateClassSessionData {
  studentId: string;
  teacherId: string;
  topic: string;
  summary: string;
  content: {
    newVocabulary: IVocabulary[];
    grammarFixes: IGrammarFix[];
    culturalNotes?: { note: string; context?: string }[];
  };
  performance: {
    fluency: number;
    grammar: number;
    comprehension: number;
  };
  transcript?: string;
  duration?: number;
}

export async function createClassSession(data: CreateClassSessionData): Promise<IClassSession> {
  await connectDB();
  
  const session = new ClassSession({
    ...data,
    date: new Date(),
    content: {
      ...data.content,
      culturalNotes: data.content.culturalNotes || [],
    },
  });

  const savedSession = await session.save();

  // Update student progress
  const student = await Student.findOne({ clerkId: data.studentId });
  if (student) {
    await updateStudentProgress(student._id.toString(), {
      vocabulary: data.content.newVocabulary,
      grammarFixes: data.content.grammarFixes,
      performance: data.performance,
    });
  }

  return savedSession;
}

export async function getStudentSessions(studentId: string, limit = 10): Promise<IClassSession[]> {
  await connectDB();
  return ClassSession.find({ studentId })
    .sort({ date: -1 })
    .limit(limit);
}

export async function getSessionById(sessionId: string): Promise<IClassSession | null> {
  await connectDB();
  return ClassSession.findById(sessionId);
}

// ==================== PROGRESS ANALYTICS ====================

export interface ProgressAnalysis {
  stagnationTopics: string[];
  masteredVocab: string[];
  weeklySummary: {
    fluency: number;
    grammar: number;
    comprehension: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  vocabularyCurve: {
    mastered: number;
    learning: number;
    total: number;
  };
}

export async function analyzeStudentProgress(studentId: string): Promise<ProgressAnalysis> {
  await connectDB();
  
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  // Get recent sessions (last 3)
  const recentSessions = await ClassSession.find({ studentId })
    .sort({ date: -1 })
    .limit(3);

  // Detect stagnation (grammar errors appearing in 3+ sessions)
  const grammarErrorCounts: Record<string, number> = {};
  recentSessions.forEach((session) => {
    session.content.grammarFixes.forEach((fix: IGrammarFix) => {
      const key = fix.error.toLowerCase();
      grammarErrorCounts[key] = (grammarErrorCounts[key] || 0) + 1;
    });
  });

  const stagnationTopics = Object.entries(grammarErrorCounts)
    .filter(([_, count]) => count >= 3)
    .map(([error]) => error);

  // Get all sessions for vocabulary analysis
  const allSessions = await ClassSession.find({ studentId });
  
  const vocabularyCounts = {
    mastered: 0,
    learning: 0,
    total: 0,
  };

  allSessions.forEach((session) => {
    session.content.newVocabulary.forEach((vocab: IVocabulary) => {
      vocabularyCounts.total++;
      if (vocab.mastered) {
        vocabularyCounts.mastered++;
      } else if (vocab.timesUsed && vocab.timesUsed >= 3) {
        vocabularyCounts.learning++;
      }
    });
  });

  // Calculate weekly averages
  const recentPerformances = recentSessions.map(s => s.performance);
  const avgFluency = recentPerformances.reduce((sum, p) => sum + p.fluency, 0) / recentPerformances.length;
  const avgGrammar = recentPerformances.reduce((sum, p) => sum + p.grammar, 0) / recentPerformances.length;
  const avgComprehension = recentPerformances.reduce((sum, p) => sum + p.comprehension, 0) / recentPerformances.length;

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentPerformances.length >= 2) {
    const first = recentPerformances[recentPerformances.length - 1];
    const last = recentPerformances[0];
    const avgDiff = (
      (last.fluency - first.fluency) +
      (last.grammar - first.grammar) +
      (last.comprehension - first.comprehension)
    ) / 3;
    
    if (avgDiff > 0.5) trend = 'improving';
    else if (avgDiff < -0.5) trend = 'declining';
  }

  return {
    stagnationTopics,
    masteredVocab: student.masteredTopics,
    weeklySummary: {
      fluency: Math.round(avgFluency * 10) / 10,
      grammar: Math.round(avgGrammar * 10) / 10,
      comprehension: Math.round(avgComprehension * 10) / 10,
      trend,
    },
    vocabularyCurve: vocabularyCounts,
  };
}

// ==================== WEEKLY SUMMARY ====================

export interface WeeklySummaryResult {
  message: string;
  stats: {
    classesCount: number;
    performance: { fluency: number; grammar: number; comprehension: number };
    newWords: number;
    grammarFixes: number;
    improvement: number | null;
  } | null;
}

export async function generateWeeklySummary(studentId: string): Promise<WeeklySummaryResult> {
  await connectDB();
  
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const sessionsThisWeek = await ClassSession.find({
    studentId,
    date: { $gte: weekStart },
  });

  if (sessionsThisWeek.length === 0) {
    return {
      message: 'No classes this week. Schedule a session to start learning!',
      stats: null,
    };
  }

  const avgPerformance = {
    fluency: sessionsThisWeek.reduce((sum, s) => sum + s.performance.fluency, 0) / sessionsThisWeek.length,
    grammar: sessionsThisWeek.reduce((sum, s) => sum + s.performance.grammar, 0) / sessionsThisWeek.length,
    comprehension: sessionsThisWeek.reduce((sum, s) => sum + s.performance.comprehension, 0) / sessionsThisWeek.length,
  };

  const allVocab = sessionsThisWeek.flatMap(s => s.content.newVocabulary);
  const allGrammarFixes = sessionsThisWeek.flatMap(s => s.content.grammarFixes);

  // Compare with previous average
  const previousSessions = await ClassSession.find({
    studentId,
    date: { $lt: weekStart },
  }).sort({ date: -1 }).limit(10);

  let improvement: number | null = null;
  if (previousSessions.length > 0) {
    const prevAvg = previousSessions.reduce(
      (sum, s) => sum + (s.performance.fluency + s.performance.grammar + s.performance.comprehension) / 3,
      0
    ) / previousSessions.length;
    
    const currentAvg = (avgPerformance.fluency + avgPerformance.grammar + avgPerformance.comprehension) / 3;
    improvement = ((currentAvg - prevAvg) / prevAvg) * 100;
  }

  const message = improvement !== null
    ? improvement > 0
      ? `Esta semana mejoraste un ${Math.round(improvement)}% en comprensión general! 🎉`
      : improvement < 0
        ? `Tu comprensión bajo un ${Math.round(Math.abs(improvement))}%. Sigue practicando! 💪`
        : 'Tu nivel se mantiene estable. Sigue así!'
    : 'Primera semana registrada!';

  return {
    message,
    stats: {
      classesCount: sessionsThisWeek.length,
      performance: avgPerformance,
      newWords: allVocab.length,
      grammarFixes: allGrammarFixes.length,
      improvement,
    },
  };
}
