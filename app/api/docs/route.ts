import { NextResponse } from 'next/server';
import { generateOpenApiSpec } from '@/lib/api-docs';

export async function GET() {
  const spec = generateOpenApiSpec();
  return NextResponse.json(spec);
}
