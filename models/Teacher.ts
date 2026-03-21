import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  teacherId: string;
  name: string;
  style: string;
  commonCorrections: string[];
  systemPrompt: string;
  specialty: string[];
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    teacherId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    style: { type: String, required: true },
    commonCorrections: [{ type: String }],
    systemPrompt: { type: String, required: true },
    specialty: [{ type: String }],
    available: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TeacherSchema.index({ teacherId: 1 });
TeacherSchema.index({ available: 1 });

const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;
