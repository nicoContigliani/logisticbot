import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabulary {
  word: string;
  meaning: string;
  timesUsed?: number;
  mastered?: boolean;
}

export interface IGrammarFix {
  error: string;
  fix: string;
  rule: string;
  occurrences: number;
}

export interface ICulturalNote {
  note: string;
  context?: string;
}

export interface IClassContent {
  newVocabulary: IVocabulary[];
  grammarFixes: IGrammarFix[];
  culturalNotes: ICulturalNote[];
}

export interface IPerformance {
  fluency: number;
  grammar: number;
  comprehension: number;
}

export interface IClassSession extends Document {
  studentId: string;
  teacherId: string;
  date: Date;
  topic: string;
  summary: string;
  content: IClassContent;
  performance: IPerformance;
  transcript?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const VocabularySchema = new Schema<IVocabulary>({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  timesUsed: { type: Number, default: 0 },
  mastered: { type: Boolean, default: false },
}, { _id: false });

const GrammarFixSchema = new Schema<IGrammarFix>({
  error: { type: String, required: true },
  fix: { type: String, required: true },
  rule: { type: String, required: true },
  occurrences: { type: Number, default: 1 },
}, { _id: false });

const CulturalNoteSchema = new Schema<ICulturalNote>({
  note: { type: String, required: true },
  context: { type: String },
}, { _id: false });

const ClassContentSchema = new Schema<IClassContent>({
  newVocabulary: [{ type: VocabularySchema }],
  grammarFixes: [{ type: GrammarFixSchema }],
  culturalNotes: [{ type: CulturalNoteSchema }],
}, { _id: false });

const PerformanceSchema = new Schema<IPerformance>({
  fluency: { type: Number, required: true, min: 1, max: 10 },
  grammar: { type: Number, required: true, min: 1, max: 10 },
  comprehension: { type: Number, required: true, min: 1, max: 10 },
}, { _id: false });

const ClassSessionSchema = new Schema<IClassSession>(
  {
    studentId: { type: String, required: true },
    teacherId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    topic: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: ClassContentSchema, required: true },
    performance: { type: PerformanceSchema, required: true },
    transcript: { type: String },
    duration: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ClassSessionSchema.index({ studentId: 1, date: -1 });
ClassSessionSchema.index({ teacherId: 1 });
ClassSessionSchema.index({ 'content.newVocabulary.word': 1 });
ClassSessionSchema.index({ 'content.grammarFixes.error': 1 });

const ClassSession = mongoose.models.ClassSession || mongoose.model<IClassSession>('ClassSession', ClassSessionSchema);

export default ClassSession;
