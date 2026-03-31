'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { config } from '@/lib/config';
import '../bot.css';

interface Client {
  name?: string;
  phone: string;
  address?: string;
}

interface Broadcast {
  id: string;
  companyName: string;
  message: string;
  shift: 'morning' | 'afternoon';
  deliveryPerson: {
    name: string;
    phone: string;
  };
  clients: Client[];
  status: 'pending' | 'sent' | 'error';
  createdAt: string;
  sentAt?: string;
}

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

const DEFAULT_MESSAGE = `📦 *Notificación de Entrega*

Hola! Tu pedido está en camino.

🚚 *Repartidor:* {{deliveryPersonName}}
📱 *Contacto:* {{deliveryPersonPhone}}

¡Gracias por tu compra! 🙏`;

export default function WhatsAppPage() {
  const { user } = useUser();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<BotConnection | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    message: DEFAULT_MESSAGE,
    shift: 'morning' as 'morning' | 'afternoon',
    deliveryPersonName: '',
    deliveryPersonPhone: '',
    imageUrl: '',
    audioUrl: '',
    documentUrl: '',
    documentName: '',
    contactName: '',
    contactPhone: '',
    locationLatitude: '',
    locationLongitude: '',
    stickerUrl: '',
    videoUrl: '',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [messageType, setMessageType] = useState<'text' | 'image' | 'audio' | 'document' | 'contact' | 'location' | 'sticker' | 'video'>('text');

  useEffect(() => {
    fetchBroadcasts();
    checkConnection();
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const response = await fetch(`/api/broadcasts?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data);
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    }
  };

  const checkConnection = async () => {
    if (!user?.id) return;
    
    setIsCheckingConnection(true);
    
    try {
      // First, try to get existing connection
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
            setIsCheckingConnection(false);
            return;
          }
          
          // If disconnected, start polling
          if (existingConnection.status === 'disconnected') {
            if (!pollingRef.current) {
              pollingRef.current = setInterval(() => {
                checkConnection();
              }, config.timeouts.polling);
            }
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
          }
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleReconnect = async () => {
    if (!user?.id || !connection) return;
    
    setIsCheckingConnection(true);
    
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
      }
    } catch (error) {
      console.error('Error reconnecting:', error);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleAddClient = () => {
    if (!newClient.phone) {
      alert('Phone number is required');
      return;
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(newClient.phone)) {
      alert('Invalid phone number format');
      return;
    }

    setClients([...clients, { ...newClient }]);
    setNewClient({ name: '', phone: '', address: '' });
  };

  const handleRemoveClient = (index: number) => {
    setClients(clients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.message || !formData.deliveryPersonName || !formData.deliveryPersonPhone) {
      alert('Please fill in all required fields');
      return;
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(formData.deliveryPersonPhone)) {
      alert('Invalid delivery person phone number');
      return;
    }

    if (clients.length === 0) {
      alert('Please add at least one client');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          companyName: formData.companyName,
          message: formData.message,
          shift: formData.shift,
          deliveryPerson: {
            name: formData.deliveryPersonName,
            phone: formData.deliveryPersonPhone,
          },
          clients,
          imageUrl: formData.imageUrl || undefined,
          audioUrl: formData.audioUrl || undefined,
          documentUrl: formData.documentUrl || undefined,
          documentName: formData.documentName || undefined,
          contactName: formData.contactName || undefined,
          contactPhone: formData.contactPhone || undefined,
          locationLatitude: formData.locationLatitude || undefined,
          locationLongitude: formData.locationLongitude || undefined,
          stickerUrl: formData.stickerUrl || undefined,
          videoUrl: formData.videoUrl || undefined,
        }),
      });

      if (response.ok) {
        alert('Broadcast created successfully!');
        setFormData({
          companyName: '',
          message: DEFAULT_MESSAGE,
          shift: 'morning',
          deliveryPersonName: '',
          deliveryPersonPhone: '',
          imageUrl: '',
          audioUrl: '',
          documentUrl: '',
          documentName: '',
          contactName: '',
          contactPhone: '',
          locationLatitude: '',
          locationLongitude: '',
          stickerUrl: '',
          videoUrl: '',
        });
        setClients([]);
        setMessageType('text');
        fetchBroadcasts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating broadcast:', error);
      alert('Error creating broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) {
      return;
    }

    try {
      const response = await fetch(`/api/broadcasts?id=${id}&userId=${user?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Broadcast deleted successfully!');
        fetchBroadcasts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting broadcast:', error);
      alert('Error deleting broadcast');
    }
  };

  const renderMessageTypeFields = () => {
    switch (messageType) {
      case 'image':
        return (
          <div className="form-group">
            <label className="form-label">Image URL *</label>
            <input
              type="url"
              className="form-input"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              required
            />
            <p className="form-hint">URL de la imagen a enviar</p>
          </div>
        );
      case 'audio':
        return (
          <div className="form-group">
            <label className="form-label">Audio URL *</label>
            <input
              type="url"
              className="form-input"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              placeholder="https://example.com/audio.mp3"
              required
            />
            <p className="form-hint">URL del audio a enviar (MP3, MP4, OGG)</p>
          </div>
        );
      case 'document':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Document URL *</label>
              <input
                type="url"
                className="form-input"
                value={formData.documentUrl}
                onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                placeholder="https://example.com/document.pdf"
                required
              />
              <p className="form-hint">URL del documento a enviar</p>
            </div>
            <div className="form-group">
              <label className="form-label">Document Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.documentName}
                onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                placeholder="documento.pdf"
              />
              <p className="form-hint">Nombre del archivo (opcional)</p>
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                className="form-input"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+5491112345678"
                required
              />
            </div>
          </>
        );
      case 'location':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Latitude *</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.locationLatitude}
                onChange={(e) => setFormData({ ...formData, locationLatitude: e.target.value })}
                placeholder="-34.6037"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude *</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.locationLongitude}
                onChange={(e) => setFormData({ ...formData, locationLongitude: e.target.value })}
                placeholder="-58.3816"
                required
              />
            </div>
          </>
        );
      case 'sticker':
        return (
          <div className="form-group">
            <label className="form-label">Sticker URL *</label>
            <input
              type="url"
              className="form-input"
              value={formData.stickerUrl}
              onChange={(e) => setFormData({ ...formData, stickerUrl: e.target.value })}
              placeholder="https://example.com/sticker.webp"
              required
            />
            <p className="form-hint">URL del sticker a enviar (WebP)</p>
          </div>
        );
      case 'video':
        return (
          <div className="form-group">
            <label className="form-label">Video URL *</label>
            <input
              type="url"
              className="form-input"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://example.com/video.mp4"
              required
            />
            <p className="form-hint">URL del video a enviar (MP4)</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bot-page">
      {/* Header */}
      <div className="bot-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-box whatsapp">
              <span className="logo-icon">💬</span>
            </div>
            <h1 className="logo-text">WhatsApp Bot</h1>
          </div>
          <div className="header-right">
            <span className="welcome-text">Welcome, {user?.firstName || 'User'}</span>
            <div className="user-avatar">
              {user?.firstName?.[0] || 'U'}
            </div>
          </div>
        </div>
      </div>

      <div className="bot-content">
        {/* Connection Status */}
        <div className="connection-status-section">
          <h2 className="section-title">Bot Connection Status</h2>
          <div className="connection-card">
            <div className="connection-header">
              <div className="connection-info">
                <span className="connection-label">WhatsApp Bot</span>
                <span className={`connection-status ${connection?.status || 'disconnected'}`}>
                  {connection?.status === 'connected' && '✓ Connected'}
                  {connection?.status === 'disconnected' && '✗ Disconnected'}
                  {connection?.status === 'checking' && '⟳ Checking...'}
                  {!connection && '○ Not configured'}
                </span>
              </div>
              <button
                className="btn-reconnect"
                onClick={handleReconnect}
                disabled={isCheckingConnection || connection?.status === 'connected'}
              >
                {isCheckingConnection ? 'Checking...' : 'Reconnect'}
              </button>
            </div>
            {connection && (
              <div className="connection-details">
                <div className="connection-meta">
                  <span className="connection-time">
                    Last checked: {new Date(connection.lastChecked).toLocaleTimeString()}
                  </span>
                  {connection.lastConnected && (
                    <span className="connection-time">
                      Last connected: {new Date(connection.lastConnected).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {connection.errorMessage && (
                  <div className="connection-error">
                    <span className="error-icon">⚠</span>
                    <span className="error-message">{connection.errorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Broadcast Form */}
        <div className="broadcast-form-section">
          <h2 className="section-title">Create Broadcast</h2>
          <p className="section-description">
            Send WhatsApp messages to multiple clients with full media support
          </p>

          <form onSubmit={handleSubmit} className="broadcast-form">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Type *</label>
              <select
                className="form-select"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as typeof messageType)}
                required
              >
                <option value="text">📝 Text Message</option>
                <option value="image">🖼️ Image</option>
                <option value="audio">🎵 Audio</option>
                <option value="document">📄 Document</option>
                <option value="contact">👤 Contact</option>
                <option value="location">📍 Location</option>
                <option value="sticker">😀 Sticker</option>
                <option value="video">🎥 Video</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea
                className="form-textarea"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter broadcast message"
                rows={6}
                required
              />
              <p className="form-hint">
                Use {'{{deliveryPersonName}}'} and {'{{deliveryPersonPhone}}'} as placeholders for dynamic values
              </p>
            </div>

            {renderMessageTypeFields()}

            <div className="form-group">
              <label className="form-label">Shift *</label>
              <select
                className="form-select"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'morning' | 'afternoon' })}
                required
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Delivery Person Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.deliveryPersonName}
                  onChange={(e) => setFormData({ ...formData, deliveryPersonName: e.target.value })}
                  placeholder="Enter delivery person name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Person Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.deliveryPersonPhone}
                  onChange={(e) => setFormData({ ...formData, deliveryPersonPhone: e.target.value })}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>

            {/* Add Client Section */}
            <div className="client-section">
              <h3 className="subsection-title">Add Clients</h3>
              <div className="client-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Client Name (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="Enter client name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Client Phone *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
                <button type="button" className="btn-add-client" onClick={handleAddClient}>
                  Add Client
                </button>
              </div>

              {/* Client List */}
              {clients.length > 0 && (
                <div className="client-list">
                  <h4 className="client-list-title">Clients ({clients.length})</h4>
                  {clients.map((client, index) => (
                    <div key={index} className="client-item">
                      <div className="client-info">
                        <span className="client-name">{client.name || 'No name'}</span>
                        <span className="client-phone">{client.phone}</span>
                        {client.address && <span className="client-address">{client.address}</span>}
                      </div>
                      <button
                        type="button"
                        className="btn-remove-client"
                        onClick={() => handleRemoveClient(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading || clients.length === 0}
            >
              {isLoading ? 'Sending...' : 'Send Broadcast'}
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="broadcast-history-section">
          <h2 className="section-title">Broadcast History</h2>
          {broadcasts.length === 0 ? (
            <p className="no-broadcasts">No broadcasts yet</p>
          ) : (
            <div className="broadcast-list">
              {broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="broadcast-item">
                  <div className="broadcast-header">
                    <span className="broadcast-company">{broadcast.companyName}</span>
                    <span className={`broadcast-status ${broadcast.status}`}>
                      {broadcast.status}
                    </span>
                  </div>
                  <div className="broadcast-message">{broadcast.message}</div>
                  <div className="broadcast-meta">
                    <span className="broadcast-shift">
                      {broadcast.shift === 'morning' ? '🌅 Morning' : '🌇 Afternoon'}
                    </span>
                    <span className="broadcast-clients">
                      👥 {broadcast.clients.length} clients
                    </span>
                    <span className="broadcast-date">
                      📅 {new Date(broadcast.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(broadcast.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
