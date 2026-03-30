import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import Program from '@/models/Program';
import connectDB from '@/lib/mongodb';

// ============================================
// PROGRAM IMPORT API
// Handles validation and storage of imported programs
// ============================================

// JSON Schema for program validation
const PROGRAM_SCHEMA = {
  type: 'object',
  required: ['title', 'description', 'modules'],
  properties: {
    title: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    modules: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['name', 'lessons'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          lessons: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['name', 'description'],
              properties: {
                name: { type: 'string', minLength: 1 },
                description: { type: 'string' },
                duration: { type: 'string' },
                objectives: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    }
  }
};

// Validate program structure
function validateProgramStructure(content: string): { valid: boolean; error?: string; data?: any } {
  try {
    const data = JSON.parse(content);
    
    // Check required fields
    if (!data.title || typeof data.title !== 'string') {
      return { valid: false, error: 'El campo "title" es requerido y debe ser string' };
    }
    if (!data.modules || !Array.isArray(data.modules) || data.modules.length === 0) {
      return { valid: false, error: 'El campo "modules" es requerido y debe ser un array no vacío' };
    }
    
    // Validate each module
    for (let i = 0; i < data.modules.length; i++) {
      const module = data.modules[i];
      if (!module.name || typeof module.name !== 'string') {
        return { valid: false, error: `Módulo ${i + 1}: "name" es requerido` };
      }
      if (!module.lessons || !Array.isArray(module.lessons) || module.lessons.length === 0) {
        return { valid: false, error: `Módulo "${module.name}": "lessons" es requerido y debe ser un array no vacío` };
      }
      
      // Validate each lesson
      for (let j = 0; j < module.lessons.length; j++) {
        const lesson = module.lessons[j];
        if (!lesson.name || typeof lesson.name !== 'string') {
          return { valid: false, error: `Lección ${j + 1} en "${module.name}": "name" es requerido` };
        }
      }
    }
    
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: 'El contenido debe ser JSON válido' };
  }
}

// GET - Fetch user's programs
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    
    const query: any = { clerkId: userId, isActive: true };
    if (subjectId) {
      query.subjectId = subjectId;
    }
    
    const programs = await Program.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Error al obtener programas' }, { status: 500 });
  }
}

// POST - Create or update a program
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { subjectId, subjectName, title, description, content, source } = body;
    
    // Validate required fields
    if (!subjectId || !subjectName || !title || !content) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos: subjectId, subjectName, title, content' 
      }, { status: 400 });
    }
    
    // Validate program structure
    const validation = validateProgramStructure(content);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: `Formato inválido: ${validation.error}`,
        valid: false 
      }, { status: 400 });
    }
    
    // Create program
    const program = await Program.create({
      clerkId: userId,
      subjectId,
      subjectName,
      title,
      description: description || '',
      content,
      source: source || 'manual'
    });
    
    return NextResponse.json({ 
      success: true, 
      program,
      message: 'Programa guardado correctamente'
    });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Error al guardar programa' }, { status: 500 });
  }
}

// PUT - Update a program
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { programId, title, description, content, isActive } = body;
    
    if (!programId) {
      return NextResponse.json({ error: 'programId es requerido' }, { status: 400 });
    }
    
    // Validate content if provided
    if (content) {
      const validation = validateProgramStructure(content);
      if (!validation.valid) {
        return NextResponse.json({ 
          error: `Formato inválido: ${validation.error}`,
          valid: false 
        }, { status: 400 });
      }
    }
    
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content) updateData.content = content;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const program = await Program.findOneAndUpdate(
      { _id: programId, clerkId: userId },
      updateData,
      { new: true }
    );
    
    if (!program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      program,
      message: 'Programa actualizado correctamente'
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ error: 'Error al actualizar programa' }, { status: 500 });
  }
}

// DELETE - Soft delete a program
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    
    if (!programId) {
      return NextResponse.json({ error: 'programId es requerido' }, { status: 400 });
    }
    
    const program = await Program.findOneAndUpdate(
      { _id: programId, clerkId: userId },
      { isActive: false },
      { new: true }
    );
    
    if (!program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Programa eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ error: 'Error al eliminar programa' }, { status: 500 });
  }
}