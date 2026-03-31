import { NextRequest, NextResponse } from 'next/server';
import { config, getApiUrl } from '@/lib/config';

interface BotConnection {
  id: string;
  userId: string;
  botType: 'whatsapp' | 'email';
  status: 'connected' | 'disconnected' | 'checking';
  lastChecked: string;
  lastConnected?: string;
  errorMessage?: string;
  config: {
    apiUrl?: string;
    apiKey?: string;
    webhookUrl?: string;
  };
}

// In-memory storage for demo purposes
const connections: BotConnection[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, botType, config: connectionConfig } = body;

    if (!userId || !botType) {
      return NextResponse.json({ error: 'User ID and bot type are required' }, { status: 400 });
    }

    // Check if connection already exists
    const existingIndex = connections.findIndex(
      c => c.userId === userId && c.botType === botType
    );

    const connection: BotConnection = {
      id: existingIndex >= 0 ? connections[existingIndex].id : `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      botType,
      status: 'checking',
      lastChecked: new Date().toISOString(),
      config: connectionConfig || {},
    };

    if (existingIndex >= 0) {
      connections[existingIndex] = connection;
    } else {
      connections.push(connection);
    }

    // Check connection to PeronBot backend
    const checkConnection = async () => {
      try {
        const backendUrl = config.backend.domain;
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(config.timeouts.api),
        });

        const index = connections.findIndex(c => c.id === connection.id);
        if (index !== -1) {
          if (response.ok) {
            connections[index].status = 'connected';
            connections[index].lastConnected = new Date().toISOString();
            connections[index].errorMessage = undefined;
          } else {
            connections[index].status = 'disconnected';
            connections[index].errorMessage = `Backend returned ${response.status}`;
          }
          connections[index].lastChecked = new Date().toISOString();
        }
      } catch (error) {
        const index = connections.findIndex(c => c.id === connection.id);
        if (index !== -1) {
          connections[index].status = 'disconnected';
          connections[index].lastChecked = new Date().toISOString();
          connections[index].errorMessage = error instanceof Error ? error.message : 'Connection failed';
        }
      }
    };

    // Execute connection check
    checkConnection();

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const botType = searchParams.get('botType');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let userConnections = connections.filter(c => c.userId === userId);
    
    if (botType) {
      userConnections = userConnections.filter(c => c.botType === botType);
    }

    return NextResponse.json(userConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, config: connectionConfig } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'Connection ID and User ID are required' }, { status: 400 });
    }

    const index = connections.findIndex(c => c.id === id && c.userId === userId);
    if (index === -1) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Update config
    if (connectionConfig) {
      connections[index].config = { ...connections[index].config, ...connectionConfig };
    }

    // Re-check connection
    connections[index].status = 'checking';
    connections[index].lastChecked = new Date().toISOString();

    // Check connection to PeronBot backend
    const checkConnection = async () => {
      try {
        const backendUrl = config.backend.domain;
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(config.timeouts.api),
        });

        const idx = connections.findIndex(c => c.id === id);
        if (idx !== -1) {
          if (response.ok) {
            connections[idx].status = 'connected';
            connections[idx].lastConnected = new Date().toISOString();
            connections[idx].errorMessage = undefined;
          } else {
            connections[idx].status = 'disconnected';
            connections[idx].errorMessage = `Backend returned ${response.status}`;
          }
          connections[idx].lastChecked = new Date().toISOString();
        }
      } catch (error) {
        const idx = connections.findIndex(c => c.id === id);
        if (idx !== -1) {
          connections[idx].status = 'disconnected';
          connections[idx].lastChecked = new Date().toISOString();
          connections[idx].errorMessage = error instanceof Error ? error.message : 'Connection failed';
        }
      }
    };

    // Execute connection check
    checkConnection();

    return NextResponse.json(connections[index]);
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'Connection ID and User ID are required' }, { status: 400 });
    }

    const index = connections.findIndex(c => c.id === id && c.userId === userId);
    if (index === -1) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    connections.splice(index, 1);

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
