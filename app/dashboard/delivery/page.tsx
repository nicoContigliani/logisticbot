'use client';

import { useState, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { readExcelFile, ExcelData, ExcelSheet } from '@/lib/excel-utils';
import '../dashboard.css';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  data?: ExcelData;
  error?: string;
}

const DEFAULT_MESSAGE = `📦 *Notificación de Entrega*

Hola! Tu pedido está en camino.

🚚 *Repartidor:* {{deliveryPersonName}}
📱 *Contacto:* {{deliveryPersonPhone}}

¡Gracias por tu compra! 🙏`;

export default function DeliveryPage() {
  const { user } = useUser();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // WhatsApp broadcast state
  const [deliveryPersonName, setDeliveryPersonName] = useState('');
  const [deliveryPersonPhone, setDeliveryPersonPhone] = useState('');
  const [shift, setShift] = useState<'morning' | 'afternoon'>('morning');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set());

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: file.size,
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = newFiles[i].id;

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
          );
        }

        // Update status to processing
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'processing' } : f))
        );

        // Parse Excel file with all sheets
        const data = await readExcelFile(file);

        // Update with completed status
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'completed', data, progress: 100 }
              : f
          )
        );

        // Auto-select the file
        setSelectedFile({
          id: fileId,
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          size: file.size,
          status: 'completed',
          progress: 100,
          data,
        });
        setActiveSheet(0);
        setCurrentPage(1);
        setSearchTerm('');
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'error', error: (error as Error).message }
              : f
          )
        );
      }
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const completedFiles = uploadedFiles.filter((f) => f.status === 'completed');
  const currentSheet: ExcelSheet | undefined = selectedFile?.data?.sheets[activeSheet];

  // Filter and paginate data
  const filteredData = useMemo(() => {
    if (!currentSheet?.data) return [];
    
    if (!searchTerm) return currentSheet.data;
    
    const term = searchTerm.toLowerCase();
    return currentSheet.data.filter((row) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }, [currentSheet?.data, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Extract clients and delivery person from Excel data
  const extractClientsFromExcel = useCallback(() => {
    if (!currentSheet?.data) return { clients: [], deliveryPerson: { name: '', phone: '' } };
    
    const clients: { name?: string; phone: string; address?: string }[] = [];
    let deliveryPersonName = '';
    let deliveryPersonPhone = '';
    
    currentSheet.data.forEach((row) => {
      // Try to find phone column (common names: telefono, phone, tel, celular, mobile)
      const phoneKeys = ['telefono', 'phone', 'tel', 'celular', 'mobile', 'whatsapp', 'numero'];
      let phone: string | undefined;
      
      for (const key of Object.keys(row)) {
        const lowerKey = key.toLowerCase();
        if (phoneKeys.some(pk => lowerKey.includes(pk))) {
          phone = String(row[key] || '').trim();
          break;
        }
      }
      
      // If no phone found, try first column that looks like a phone number
      if (!phone) {
        for (const value of Object.values(row)) {
          const strValue = String(value || '').trim();
          if (/^\+?[1-9]\d{1,14}$/.test(strValue.replace(/[\s\-()]/g, ''))) {
            phone = strValue;
            break;
          }
        }
      }
      
      if (phone) {
        // Try to find name column
        const nameKeys = ['nombre', 'name', 'cliente', 'client'];
        let name: string | undefined;
        
        for (const key of Object.keys(row)) {
          const lowerKey = key.toLowerCase();
          if (nameKeys.some(nk => lowerKey.includes(nk))) {
            name = String(row[key] || '').trim();
            break;
          }
        }
        
        // Try to find address column
        const addressKeys = ['direccion', 'address', 'domicilio', 'ubicacion'];
        let address: string | undefined;
        
        for (const key of Object.keys(row)) {
          const lowerKey = key.toLowerCase();
          if (addressKeys.some(ak => lowerKey.includes(ak))) {
            address = String(row[key] || '').trim();
            break;
          }
        }
        
        clients.push({ name, phone, address });
      }
      
      // Try to find delivery person column
      const deliveryKeys = ['delivery', 'repartidor', 'reparto'];
      for (const key of Object.keys(row)) {
        const lowerKey = key.toLowerCase();
        if (deliveryKeys.some(dk => lowerKey.includes(dk))) {
          const deliveryValue = String(row[key] || '').trim();
          if (deliveryValue) {
            // Check if it looks like a phone number
            if (/^\+?[1-9]\d{1,14}$/.test(deliveryValue.replace(/[\s\-()]/g, ''))) {
              deliveryPersonPhone = deliveryValue;
            } else {
              deliveryPersonName = deliveryValue;
            }
          }
          break;
        }
      }
    });
    
    return { clients, deliveryPerson: { name: deliveryPersonName, phone: deliveryPersonPhone } };
  }, [currentSheet?.data]);

  // Format phone number with +549 prefix
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+549')) {
      return cleaned;
    }
    if (cleaned.startsWith('26')) {
      return '+549' + cleaned;
    }
    if (cleaned.startsWith('549')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('54')) {
      return '+' + cleaned;
    }
    return '+549' + cleaned;
  };

  // Handle WhatsApp broadcast send
  const handleSendWhatsAppBroadcast = async () => {
    const { clients, deliveryPerson } = extractClientsFromExcel();
    
    // Use extracted delivery person info or manual input
    const finalDeliveryPersonName = deliveryPerson.name || deliveryPersonName;
    const finalDeliveryPersonPhone = deliveryPerson.phone || deliveryPersonPhone;
    
    if (!finalDeliveryPersonName || !finalDeliveryPersonPhone) {
      setSendStatus({ type: 'error', message: 'Por favor completa el nombre y teléfono del repartidor' });
      return;
    }

    const formattedPhone = formatPhoneNumber(finalDeliveryPersonPhone);
    
    if (!/^\+?[1-9]\d{1,14}$/.test(formattedPhone.replace(/[\s\-()]/g, ''))) {
      setSendStatus({ type: 'error', message: 'Número de teléfono del repartidor inválido' });
      return;
    }

    if (clients.length === 0) {
      setSendStatus({ type: 'error', message: 'No se encontraron números de teléfono en el Excel' });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      // Format message with placeholders
      const message = DEFAULT_MESSAGE
        .replace('{{deliveryPersonName}}', finalDeliveryPersonName)
        .replace('{{deliveryPersonPhone}}', formattedPhone);

      console.log('🔍 [DELIVERY] Sending WhatsApp broadcast:', {
        userId: user?.id,
        clientsCount: clients.length,
        deliveryPersonName: finalDeliveryPersonName,
        deliveryPersonPhone: formattedPhone,
        shift,
        clients: clients.slice(0, 3) // Log first 3 clients for debugging
      });

      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          companyName: 'Delivery',
          message,
          shift,
          deliveryPerson: {
            name: finalDeliveryPersonName,
            phone: formattedPhone,
          },
          clients,
        }),
      });
      
      console.log('🔍 [DELIVERY] Response from API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 [DELIVERY] Broadcast result:', result);
        
        // Check if there were any errors in the broadcast
        if (result.data && result.data.failed > 0) {
          setSendStatus({ 
            type: 'error', 
            message: `Se enviaron ${result.data.sent} mensajes, pero ${result.data.failed} fallaron. Revisa los logs del bot.` 
          });
        } else {
          setSendStatus({ 
            type: 'success', 
            message: `Mensaje enviado exitosamente a ${clients.length} clientes` 
          });
          // Mark messages as sent
          const newSentMessages = new Set(sentMessages);
          clients.forEach(client => {
            newSentMessages.add(client.phone);
          });
          setSentMessages(newSentMessages);
          // Clear form
          setDeliveryPersonName('');
          setDeliveryPersonPhone('');
        }
      } else {
        const error = await response.json();
        console.error('❌ [DELIVERY] Error from API:', error);
        
        // Show specific error message for bot connection issues
        if (error.error && error.error.includes('WhatsApp bot is not connected')) {
          setSendStatus({ 
            type: 'error', 
            message: 'El bot de WhatsApp no está conectado. Por favor, verifica que el bot esté ejecutándose y conectado.' 
          });
        } else {
          setSendStatus({ type: 'error', message: error.error || 'Error al enviar mensajes' });
        }
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      setSendStatus({ type: 'error', message: 'Error al enviar mensajes' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-box">
              <span className="logo-icon">📦</span>
            </div>
            <h1 className="logo-text">Delivery Management</h1>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Compact Upload Section */}
        <div className="section-card" style={{ marginBottom: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>☁️</span>
              <span style={{ fontWeight: 500, color: '#333' }}>Upload Excel:</span>
            </div>
            <label 
              style={{ 
                padding: '8px 16px', 
                background: '#0078d4', 
                color: 'white', 
                borderRadius: '0', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
              }}
            >
              Choose File
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e.target.files)}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: '12px', color: '#666' }}>.xlsx, .xls</span>
            
            {/* File selector */}
            {completedFiles.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>File:</span>
                <select
                  value={selectedFile?.id || ''}
                  onChange={(e) => {
                    const file = completedFiles.find((f) => f.id === e.target.value);
                    setSelectedFile(file || null);
                    setActiveSheet(0);
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '0',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  <option value="">Select file...</option>
                  {completedFiles.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Upload progress */}
          {uploadedFiles.some((f) => f.status === 'uploading' || f.status === 'processing') && (
            <div style={{ marginTop: '12px' }}>
              {uploadedFiles
                .filter((f) => f.status === 'uploading' || f.status === 'processing')
                .map((file) => (
                  <div key={file.id} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>{file.name}</span>
                      <span style={{ fontSize: '12px', color: '#666' }}>{file.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${file.progress}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Error display */}
          {uploadedFiles.some((f) => f.status === 'error') && (
            <div style={{ marginTop: '12px', padding: '8px', background: '#fef2f2', border: '1px solid #fecaca' }}>
              {uploadedFiles
                .filter((f) => f.status === 'error')
                .map((file) => (
                  <div key={file.id} style={{ fontSize: '12px', color: '#dc2626' }}>
                    {file.name}: {file.error}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* WhatsApp Broadcast Section */}
        {currentSheet && (
          <div className="section-card" style={{ marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Enviar Mensajes por WhatsApp</h2>
            </div>
            
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              Envía mensajes profesionales a todos los clientes del Excel. Se detectarán automáticamente los números de teléfono.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                  Nombre del Repartidor *
                </label>
                <input
                  type="text"
                  value={deliveryPersonName}
                  onChange={(e) => setDeliveryPersonName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                  Teléfono del Repartidor *
                </label>
                <input
                  type="tel"
                  value={deliveryPersonPhone}
                  onChange={(e) => setDeliveryPersonPhone(e.target.value)}
                  placeholder="+5491112345678"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                  Turno *
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as 'morning' | 'afternoon')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '0',
                    fontSize: '14px',
                    background: 'white',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="morning">Mañana</option>
                  <option value="afternoon">Tarde</option>
                </select>
              </div>
            </div>

            {/* Preview message */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', border: '1px solid #ddd' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Vista previa del mensaje:</div>
              <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>
                {deliveryPersonName 
                  ? DEFAULT_MESSAGE
                      .replace('{{deliveryPersonName}}', deliveryPersonName)
                      .replace('{{deliveryPersonPhone}}', deliveryPersonPhone || '+5491112345678')
                  : 'Completa el nombre del repartidor para ver el mensaje'}
              </div>
            </div>

            {/* Client count */}
            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
              <strong>Clientes detectados:</strong> {extractClientsFromExcel().clients.length}
            </div>

            {/* Status message */}
            {sendStatus && (
              <div 
                style={{ 
                  marginBottom: '16px', 
                  padding: '12px', 
                  background: sendStatus.type === 'success' ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${sendStatus.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  color: sendStatus.type === 'success' ? '#155724' : '#721c24',
                  fontSize: '14px',
                }}
              >
                {sendStatus.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Send button */}
              <button
                onClick={handleSendWhatsAppBroadcast}
                disabled={isSending || !deliveryPersonName || !deliveryPersonPhone || extractClientsFromExcel().clients.length === 0}
                className="btn-send-messages"
              >
                <span>💬</span>
                {isSending ? 'Enviando...' : 'Enviar Mensajes'}
              </button>
              
              {/* Clear sent status button */}
              <button
                onClick={() => setSentMessages(new Set())}
                className="btn-clear-status"
              >
                <span>🔄</span>
                Limpiar Estado
              </button>
            </div>
          </div>
        )}

        {/* Data Table Section */}
        <div className="section-card">
          <div className="preview-header">
            <div>
              <h2 className="section-title">Delivery Data</h2>
              <p className="section-description">
                {selectedFile 
                  ? `${selectedFile.name} - ${filteredData.length} rows` 
                  : 'Select a file to view data'}
              </p>
            </div>
          </div>

          {currentSheet ? (
            <>
              {/* Sheet tabs */}
              {selectedFile?.data && selectedFile.data.sheets.length > 1 && (
                <div style={{ marginBottom: '16px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedFile.data.sheets.map((sheet, index) => (
                      <button
                        key={sheet.name}
                        onClick={() => {
                          setActiveSheet(index);
                          setCurrentPage(1);
                          setSearchTerm('');
                        }}
                        className={`sheet-tab ${activeSheet === index ? 'sheet-tab-active' : ''}`}
                      >
                        {sheet.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and pagination controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search in all columns..."
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '0',
                      fontSize: '14px',
                      width: '250px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '0',
                      fontSize: '14px',
                      background: 'white',
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {currentSheet.data.length > 0 &&
                        Object.keys(currentSheet.data[0]).map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, index) => {
                      // Find phone number in row
                      const phoneKeys = ['telefono', 'phone', 'tel', 'celular', 'mobile', 'whatsapp', 'numero'];
                      let phone: string | undefined;
                      for (const key of Object.keys(row)) {
                        const lowerKey = key.toLowerCase();
                        if (phoneKeys.some(pk => lowerKey.includes(pk))) {
                          phone = String(row[key] || '').trim();
                          break;
                        }
                      }
                      const isSent = phone && sentMessages.has(phone);
                      
                      return (
                        <tr key={index}>
                          {Object.keys(currentSheet.data[0] || {}).map((header) => (
                            <td key={header}>
                              {String(row[header] || '-')}
                            </td>
                          ))}
                          <td>
                            {isSent ? (
                              <span style={{ 
                                color: '#107c10', 
                                fontWeight: 600,
                                fontSize: '12px'
                              }}>
                                ✓ Enviado
                              </span>
                            ) : (
                              <span style={{ 
                                color: '#666',
                                fontSize: '12px'
                              }}>
                                Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ccc' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} rows
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      Previous
                    </button>
                    <span style={{ padding: '8px 12px', fontSize: '14px', color: '#333' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <h3 className="empty-title">No data to display</h3>
              <p className="empty-text">Upload an Excel file and select it to view the delivery data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
