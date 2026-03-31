'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { config } from '@/lib/config';

interface BotConnection {
  id: string;
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

export const WhatsAppConnectionTile: React.FC = () => {
  const { user } = useUser();
  const [connection, setConnection] = useState<BotConnection | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Performance: Memoized connection check function
  const checkConnection = useCallback(async () => {
    if (!user?.id) return;

    setIsChecking(true);
    setError(null);

    try {
      const getResponse = await fetch(`/api/bot/connection?userId=${user.id}&botType=whatsapp`);

      if (getResponse.ok) {
        const connections = await getResponse.json();

        if (connections.length > 0) {
          const existingConnection = connections[0];
          setConnection(existingConnection);

          // If connected, stop polling
          if (existingConnection.status === 'connected') {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }

          // If disconnected, start polling
          if (existingConnection.status === 'disconnected' && !pollingRef.current) {
            pollingRef.current = setInterval(() => {
              checkConnection();
            }, config.timeouts.polling);
          }
        } else {
          // No connection exists, create one
          const createResponse = await fetch('/api/bot/connection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              botType: 'whatsapp',
              config: {},
            }),
          });

          if (createResponse.ok) {
            const newConnection = await createResponse.json();
            setConnection(newConnection);

            // Start polling for status
            if (!pollingRef.current) {
              pollingRef.current = setInterval(() => {
                checkConnection();
              }, 5000);
            }
          } else {
            setError('Failed to create connection');
          }
        }
      } else {
        setError('Failed to fetch connection status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection check failed';
      setError(errorMessage);
      console.error('Error checking WhatsApp connection:', err);
    } finally {
      setIsChecking(false);
    }
  }, [user?.id]);

  // Performance: Memoized reconnect function
  const handleReconnect = useCallback(async () => {
    if (!user?.id || !connection) return;

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/bot/connection', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: connection.id,
          userId: user.id,
          config: connection.config,
        }),
      });

      if (response.ok) {
        const updatedConnection = await response.json();
        setConnection(updatedConnection);

        // Start polling if disconnected
        if (updatedConnection.status === 'disconnected' && !pollingRef.current) {
          pollingRef.current = setInterval(() => {
            checkConnection();
          }, 5000);
        }
      } else {
        setError('Failed to reconnect');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Reconnection failed';
      setError(errorMessage);
      console.error('Error reconnecting WhatsApp:', err);
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, connection, checkConnection]);

  // Initial connection check
  useEffect(() => {
    checkConnection();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [checkConnection]);

  // Performance: Memoized status color
  const getStatusColor = useCallback(() => {
    if (!connection) return '#666666';
    switch (connection.status) {
      case 'connected':
        return '#107c10'; // Metro green
      case 'disconnected':
        return '#d32f2f'; // Metro red
      case 'checking':
        return '#ffb900'; // Metro yellow
      default:
        return '#666666';
    }
  }, [connection]);

  // Performance: Memoized status text
  const getStatusText = useCallback(() => {
    if (!connection) return 'Not configured';
    switch (connection.status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  }, [connection]);

  // Performance: Memoized status icon
  const getStatusIcon = useCallback(() => {
    if (!connection) return '○';
    switch (connection.status) {
      case 'connected':
        return '✓';
      case 'disconnected':
        return '✗';
      case 'checking':
        return '⟳';
      default:
        return '?';
    }
  }, [connection]);

  return (
    <div className="whatsapp-connection-card">
      <div className="connection-info">
        <div className="connection-icon">
          <span>💬</span>
        </div>
        <div className="connection-details">
          <span className="connection-label">WhatsApp</span>
          <span 
            className="connection-status"
            style={{ color: getStatusColor() }}
          >
            {isChecking ? (
              <span className="status-spinner">⟳</span>
            ) : (
              <span>{getStatusIcon()}</span>
            )}
            {getStatusText()}
          </span>
        </div>
      </div>
      
      <div className="connection-actions">
        {error && (
          <span className="connection-error" title={error}>
            ⚠
          </span>
        )}
        <button
          className="btn-refresh-connection"
          onClick={handleReconnect}
          disabled={isChecking || connection?.status === 'connected'}
          title="Refresh connection"
        >
          {isChecking ? '⟳' : '↻'}
        </button>
      </div>
    </div>
  );
};

export default WhatsAppConnectionTile;
