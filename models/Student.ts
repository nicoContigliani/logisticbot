import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  clerkId: string;
  name: string;
  email: string;
  currentLevel: string;
  focusAreas: string[];
  stats: {
    totalClasses: number;
    vocabularyCount: number;
    lastEvaluation: Date | null;
  };
  masteredTopics: string[];
  pendingTopics: string[];
  weeklyProgress: {
    weekStart: Date;
    fluencyChange: number;
    grammarChange: number;
    comprehensionChange: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentStatsSchema = new Schema({
  totalClasses: { type: Number, default: 0 },
  vocabularyCount: { type: Number, default: 0 },
  lastEvaluation: { type: Date, default: null },
}, { _id: false });

const WeeklyProgressSchema = new Schema({
  weekStart: { type: Date, required: true },
  fluencyChange: { type: Number, default: 0 },
  grammarChange: { type: Number, default: 0 },
  comprehensionChange: { type: Number, default: 0 },
}, { _id: false });

const StudentSchema = new Schema<IStudent>(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    currentLevel: { type: String, default: 'A1' },
    focusAreas: [{ type: String }],
    stats: { type: StudentStatsSchema, default: () => ({}) },
    masteredTopics: [{ type: String }],
    pendingTopics: [{ type: String }],
    weeklyProgress: [{ type: WeeklyProgressSchema }],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
StudentSchema.index({ clerkId: 1 });
StudentSchema.index({ currentLevel: 1 });

const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
