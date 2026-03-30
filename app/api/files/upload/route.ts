import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['text/xml', 'application/xml', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['xml', 'csv', 'xlsx', 'xls', 'casl'];

    if (!allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: XML, CSV, XLSX, XLS, CASL' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const content = Buffer.from(buffer).toString('base64');

    // Store file metadata in MongoDB
    const filesCollection = await getCollection('uploaded_files');
    const fileRecord = {
      userId,
      fileName: file.name,
      fileType: fileExtension,
      fileSize: file.size,
      content,
      status: 'uploaded',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await filesCollection.insertOne(fileRecord);

    return NextResponse.json({
      success: true,
      fileId: result.insertedId,
      fileName: file.name,
      fileType: fileExtension,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const filesCollection = await getCollection('uploaded_files');
    const files = await filesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      files: files.map((file) => ({
        id: file._id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        status: file.status,
        createdAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Failed to get files' },
      { status: 500 }
    );
  }
}
