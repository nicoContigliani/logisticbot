import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { AppError, errorHandler } from '@/lib/error-handler';

interface ExternalApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

const apiConfigs: Record<string, ExternalApiConfig> = {
  // Add your external API configurations here
  // example: {
  //   baseUrl: 'https://api.example.com',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.API_KEY}`,
  //   },
  // },
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const apiName = searchParams.get('api');

    if (!endpoint || !apiName) {
      throw new AppError('Missing endpoint or api parameter', 400);
    }

    const config = apiConfigs[apiName];
    
    if (!config) {
      throw new AppError(`API ${apiName} not configured`, 404);
    }

    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new AppError(`External API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorHandler(error);
    }
    return errorHandler(error instanceof Error ? error : new Error('Unknown error'));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const body = await request.json();
    const { endpoint, api: apiName, ...params } = body;

    if (!endpoint || !apiName) {
      throw new AppError('Missing endpoint or api parameter', 400);
    }

    const config = apiConfigs[apiName];
    
    if (!config) {
      throw new AppError(`API ${apiName} not configured`, 404);
    }

    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new AppError(`External API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorHandler(error);
    }
    return errorHandler(error instanceof Error ? error : new Error('Unknown error'));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const body = await request.json();
    const { endpoint, api: apiName, ...params } = body;

    if (!endpoint || !apiName) {
      throw new AppError('Missing endpoint or api parameter', 400);
    }

    const config = apiConfigs[apiName];
    
    if (!config) {
      throw new AppError(`API ${apiName} not configured`, 404);
    }

    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new AppError(`External API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorHandler(error);
    }
    return errorHandler(error instanceof Error ? error : new Error('Unknown error'));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const apiName = searchParams.get('api');

    if (!endpoint || !apiName) {
      throw new AppError('Missing endpoint or api parameter', 400);
    }

    const config = apiConfigs[apiName];
    
    if (!config) {
      throw new AppError(`API ${apiName} not configured`, 404);
    }

    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new AppError(`External API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorHandler(error);
    }
    return errorHandler(error instanceof Error ? error : new Error('Unknown error'));
  }
}
