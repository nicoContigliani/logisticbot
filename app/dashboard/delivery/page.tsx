'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { readExcelFile, ExcelSheet } from '@/lib/excel-utils';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import type { BroadcastRecord, DateGroup, UploadHistoryItem } from '@/store/useDeliveryStore';
import '../dashboard.css';
import './delivery.css';

const DEFAULT_MESSAGE = `********************************************************************************
📦 *Notificación de Entrega SHINE*

Hola {{clientName}}! Tu pedido está en camino.

🚚 *Repartidor:* {{deliveryPersonName}}
📱 *Contacto:* {{deliveryPersonPhone}}
⏰ *Horario:* {{shift}}

¡Gracias por tu compra! 🙏

********************************************************************************************************
Bot Desarrollado por Nicolás Contigliani - https://www.linkedin.com/in/nicolas-contigliani
********************************************************************************************************`;

export default function DeliveryPage() {
  const { user } = useUser();
  const store = useDeliveryStore();
  const {
    activeTab, setActiveTab,
    uploadedFiles, setUploadedFiles,
    selectedFileId, setSelectedFileId,
    activeSheet, setActiveSheet,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    rowsPerPage, setRowsPerPage,
    deliveryPersonName, setDeliveryPersonName,
    deliveryPersonPhone, setDeliveryPersonPhone,
    shift, setShift,
    sentPhones, addSentPhones, clearSentPhones,
    resetView,
  } = store;

  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Broadcast history state
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(false);
  const [broadcastsPage, setBroadcastsPage] = useState(1);
  const [broadcastsTotalPages, setBroadcastsTotalPages] = useState(1);

  // Upload history state
  const [uploadHistory, setUploadHistory] = useState<DateGroup[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const fetchInProgress = useRef(false);

  const selectedFile = useMemo(
    () => uploadedFiles.find((f) => f.id === selectedFileId) || null,
    [uploadedFiles, selectedFileId]
  );

  const completedFiles = useMemo(
    () => uploadedFiles.filter((f) => f.status === 'completed'),
    [uploadedFiles]
  );

  const currentSheet: ExcelSheet | undefined = selectedFile?.data?.sheets[activeSheet];

  // Fetch broadcast history
  const fetchBroadcasts = useCallback(async (page: number) => {
    if (!user?.id || fetchInProgress.current) return;
    fetchInProgress.current = true;
    setBroadcastsLoading(true);
    try {
      const res = await fetch(`/api/broadcasts/history?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.records || []);
        setBroadcastsTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      // silent fail
    } finally {
      setBroadcastsLoading(false);
      fetchInProgress.current = false;
    }
  }, [user?.id]);

  // Fetch upload history
  const fetchUploadHistory = useCallback(async (page: number) => {
    if (!user?.id) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/delivery/excel?mode=dates&page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setUploadHistory(data.dates || []);
        setHistoryTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      // silent fail
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'mensajes') {
      fetchBroadcasts(broadcastsPage);
    } else if (activeTab === 'modificaciones') {
      fetchUploadHistory(historyPage);
    }
  }, [activeTab, broadcastsPage, historyPage, fetchBroadcasts, fetchUploadHistory]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: file.size,
      status: 'uploading' as const,
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = newFiles[i].id;

      try {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
          );
        }

        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'processing' } : f))
        );

        const data = await readExcelFile(file);

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'completed', data, progress: 100 } : f
          )
        );

        setSelectedFileId(fileId);
        resetView();
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'error', error: (error as Error).message } : f
          )
        );
      }
    }
  }, [setUploadedFiles, setSelectedFileId, resetView]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter and paginate table data
  const filteredData = useMemo(() => {
    if (!currentSheet?.data) return [];
    if (!searchTerm) return currentSheet.data;
    const term = searchTerm.toLowerCase();
    return currentSheet.data.filter((row) =>
      Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      })
    );
  }, [currentSheet?.data, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Extract clients from Excel data
  const extractClientsFromExcel = useCallback(() => {
    if (!currentSheet?.data) return { clients: [], deliveryPerson: { name: '', phone: '' } };

    const clients: { name?: string; phone: string; address?: string }[] = [];
    let extractedName = '';
    let extractedPhone = '';

    currentSheet.data.forEach((row) => {
      const phoneKeys = ['telefono', 'phone', 'tel', 'celular', 'mobile', 'whatsapp', 'numero'];
      let phone: string | undefined;

      for (const key of Object.keys(row)) {
        const lowerKey = key.toLowerCase();
        if (phoneKeys.some(pk => lowerKey.includes(pk))) {
          phone = String(row[key] || '').trim();
          break;
        }
      }

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
        const nameKeys = ['nombre', 'name', 'cliente', 'client'];
        let name: string | undefined;
        for (const key of Object.keys(row)) {
          if (nameKeys.some(nk => key.toLowerCase().includes(nk))) {
            name = String(row[key] || '').trim();
            break;
          }
        }

        const addressKeys = ['direccion', 'address', 'domicilio', 'ubicacion'];
        let address: string | undefined;
        for (const key of Object.keys(row)) {
          if (addressKeys.some(ak => key.toLowerCase().includes(ak))) {
            address = String(row[key] || '').trim();
            break;
          }
        }

        clients.push({ name, phone, address });
      }

      const deliveryKeys = ['delivery', 'repartidor', 'reparto'];
      for (const key of Object.keys(row)) {
        if (deliveryKeys.some(dk => key.toLowerCase().includes(dk))) {
          const val = String(row[key] || '').trim();
          if (val) {
            if (/^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s\-()]/g, ''))) {
              extractedPhone = val;
            } else {
              extractedName = val;
            }
          }
          break;
        }
      }
    });

    return { clients, deliveryPerson: { name: extractedName, phone: extractedPhone } };
  }, [currentSheet?.data]);

  const detectedClients = useMemo(
    () => extractClientsFromExcel().clients,
    [extractClientsFromExcel]
  );

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+549')) return cleaned;
    if (cleaned.startsWith('26')) return '+549' + cleaned;
    if (cleaned.startsWith('549')) return '+' + cleaned;
    if (cleaned.startsWith('54')) return '+' + cleaned;
    return '+549' + cleaned;
  };

  const handleSendWhatsAppBroadcast = async () => {
    const { clients, deliveryPerson } = extractClientsFromExcel();
    const finalName = deliveryPerson.name || deliveryPersonName;
    const finalPhone = deliveryPerson.phone || deliveryPersonPhone;

    if (!finalName || !finalPhone) {
      setSendStatus({ type: 'error', message: 'Por favor completa el nombre y teléfono del repartidor' });
      return;
    }

    const formattedPhone = formatPhoneNumber(finalPhone);
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
      const shiftText = shift === 'morning' ? 'Mañana' : 'Tarde';
      const message = DEFAULT_MESSAGE
        .replace('{{deliveryPersonName}}', finalName)
        .replace('{{deliveryPersonPhone}}', formattedPhone)
        .replace('{{shift}}', shiftText);

      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          companyName: 'Delivery',
          message,
          shift,
          deliveryPerson: { name: finalName, phone: formattedPhone },
          clients,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.failed > 0) {
          setSendStatus({
            type: 'error',
            message: `Se enviaron ${result.data.sent} mensajes, pero ${result.data.failed} fallaron.`,
          });
        } else {
          setSendStatus({
            type: 'success',
            message: `Mensaje enviado exitosamente a ${clients.length} clientes`,
          });
          addSentPhones(clients.map(c => c.phone));
          setDeliveryPersonName('');
          setDeliveryPersonPhone('');
        }
      } else {
        const error = await response.json();
        if (error.error?.includes('WhatsApp bot is not connected')) {
          setSendStatus({
            type: 'error',
            message: 'El bot de WhatsApp no está conectado. Verifica que esté ejecutándose.',
          });
        } else {
          setSendStatus({ type: 'error', message: error.error || 'Error al enviar mensajes' });
        }
      }
    } catch {
      setSendStatus({ type: 'error', message: 'Error al enviar mensajes' });
    } finally {
      setIsSending(false);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
  };

  const handleDeleteFile = useCallback(async (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) {
      const remaining = uploadedFiles.filter((f) => f.id !== fileId && f.status === 'completed');
      setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
      resetView();
    }
  }, [selectedFileId, uploadedFiles, setUploadedFiles, setSelectedFileId, resetView]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getFileStatus = (phone: string) => sentPhones.includes(phone);

  return (
    <div className="dashboard-page">
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
        {/* Tab navigation */}
        <div className="delivery-tabs">
          <button
            className={`delivery-tab ${activeTab === 'registros' ? 'delivery-tab-active' : ''}`}
            onClick={() => setActiveTab('registros')}
          >
            📋 Registros
            {completedFiles.length > 0 && (
              <span className="tab-badge">{completedFiles.length}</span>
            )}
          </button>
          <button
            className={`delivery-tab ${activeTab === 'modificaciones' ? 'delivery-tab-active' : ''}`}
            onClick={() => setActiveTab('modificaciones')}
          >
            🕐 Historial
          </button>
          <button
            className={`delivery-tab ${activeTab === 'mensajes' ? 'delivery-tab-active' : ''}`}
            onClick={() => setActiveTab('mensajes')}
          >
            💬 Mensajes
            {broadcasts.length > 0 && (
              <span className="tab-badge">{broadcasts.length}</span>
            )}
          </button>
        </div>

        {/* TAB: Registros */}
        {activeTab === 'registros' && (
          <>
            {/* Upload section */}
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

                {completedFiles.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>File:</span>
                    <select
                      value={selectedFileId || ''}
                      onChange={(e) => {
                        setSelectedFileId(e.target.value || null);
                        resetView();
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
                    {selectedFileId && (
                      <button
                        onClick={() => handleDeleteFile(selectedFileId)}
                        style={{
                          padding: '6px 10px',
                          background: 'none',
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#dc2626',
                        }}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

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

            {/* WhatsApp Broadcast */}
            {currentSheet && (
              <div className="section-card" style={{ marginBottom: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '20px' }}>💬</span>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Enviar Mensajes por WhatsApp</h2>
                </div>

                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Envía mensajes a todos los clientes del Excel. Los teléfonos se detectan automáticamente.
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
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '0', fontSize: '14px', boxSizing: 'border-box' }}
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
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '0', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                      Turno *
                    </label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as 'morning' | 'afternoon')}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '0', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
                    >
                      <option value="morning">Mañana</option>
                      <option value="afternoon">Tarde</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', border: '1px solid #ddd' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Vista previa del mensaje:</div>
                  <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>
                    {deliveryPersonName
                      ? DEFAULT_MESSAGE
                          .replace('{{clientName}}', '[Nombre del Cliente]')
                          .replace('{{deliveryPersonName}}', deliveryPersonName)
                          .replace('{{deliveryPersonPhone}}', deliveryPersonPhone || '+5491112345678')
                          .replace('{{shift}}', shift === 'morning' ? 'Mañana' : 'Tarde')
                      : 'Completa el nombre del repartidor para ver el mensaje'}
                  </div>
                </div>

                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  <strong>Clientes detectados:</strong> {detectedClients.length}
                </div>

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
                  <button
                    onClick={handleSendWhatsAppBroadcast}
                    disabled={isSending || !deliveryPersonName || !deliveryPersonPhone || detectedClients.length === 0}
                    className="btn-send-messages"
                  >
                    <span>💬</span>
                    {isSending ? 'Enviando...' : 'Enviar Mensajes'}
                  </button>
                  <button onClick={clearSentPhones} className="btn-clear-status">
                    <span>🔄</span>
                    Limpiar Estado
                  </button>
                </div>
              </div>
            )}

            {/* Data table */}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>Search:</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search in all columns..."
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '0', fontSize: '14px', width: '250px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>Rows per page:</span>
                      <select
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '0', fontSize: '14px', background: 'white' }}
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
                          const phoneKeys = ['telefono', 'phone', 'tel', 'celular', 'mobile', 'whatsapp', 'numero'];
                          let phone: string | undefined;
                          for (const key of Object.keys(row)) {
                            if (phoneKeys.some(pk => key.toLowerCase().includes(pk))) {
                              phone = String(row[key] || '').trim();
                              break;
                            }
                          }
                          const isSent = phone && getFileStatus(phone);

                          return (
                            <tr key={index}>
                              {Object.keys(currentSheet.data[0] || {}).map((header) => (
                                <td key={header}>{String(row[header] || '-')}</td>
                              ))}
                              <td>
                                {isSent ? (
                                  <span style={{ color: '#107c10', fontWeight: 600, fontSize: '12px' }}>✓ Enviado</span>
                                ) : (
                                  <span style={{ color: '#666', fontSize: '12px' }}>Pendiente</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ccc' }}>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} rows
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="pagination-button">First</button>
                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Previous</button>
                        <span style={{ padding: '8px 12px', fontSize: '14px', color: '#333' }}>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">Next</button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="pagination-button">Last</button>
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
          </>
        )}

        {/* TAB: Historial (Modificaciones) */}
        {activeTab === 'modificaciones' && (
          <div className="section-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>🕐</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Historial de Archivos</h2>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              Registro de archivos subidos y modificaciones. Solo se muestran tus archivos.
            </p>

            {historyLoading ? (
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <div className="skeleton skeleton-line" style={{ width: '30%', height: '20px' }} />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line skeleton-line-short" />
                  </div>
                ))}
              </div>
            ) : uploadHistory.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <h3 className="empty-title">Sin historial</h3>
                <p className="empty-text">Aquí aparecerán los archivos que subas</p>
              </div>
            ) : (
              <>
                {uploadHistory.map((group) => (
                  <div key={group.date} className="history-date-group">
                    <div className="history-date-header">
                      <span>📅 {group.date}</span>
                      <div className="date-stats">
                        <span>{group.totalUploads} archivo{group.totalUploads !== 1 ? 's' : ''}</span>
                        <span>{group.totalRows} registros</span>
                      </div>
                    </div>
                    {group.uploads.map((upload: UploadHistoryItem) => (
                      <div key={upload.id} className="history-item">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{upload.fileName}</span>
                        <div className="file-meta">
                          <span>{upload.rowCount} filas</span>
                          {upload.mergeCount > 0 && <span>{upload.mergeCount} merge{upload.mergeCount > 1 ? 's' : ''}</span>}
                          {upload.wasUpdated && <span className="updated-badge">Modificado</span>}
                          <span>{formatDate(upload.uploadedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {historyTotalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ccc' }}>
                    <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} className="pagination-button">Previous</button>
                    <span style={{ padding: '8px 12px', fontSize: '14px', color: '#333' }}>Page {historyPage} of {historyTotalPages}</span>
                    <button onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))} disabled={historyPage === historyTotalPages} className="pagination-button">Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB: Mensajes (Broadcast History) */}
        {activeTab === 'mensajes' && (
          <div className="section-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Mensajes Enviados</h2>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              Historial de broadcasts de WhatsApp enviados. Solo tus envíos.
            </p>

            {broadcastsLoading ? (
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="broadcast-card">
                    <div className="skeleton skeleton-line" style={{ width: '40%', height: '18px' }} />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line skeleton-line-short" />
                  </div>
                ))}
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📨</span>
                <h3 className="empty-title">Sin mensajes enviados</h3>
                <p className="empty-text">Aquí aparecerán los broadcasts que envíes desde la pestaña Registros</p>
              </div>
            ) : (
              <>
                {broadcasts.map((b) => (
                  <div key={b.id} className="broadcast-card">
                    <div className="broadcast-header">
                      <span className={`broadcast-status broadcast-status-${b.status}`}>
                        {b.status === 'sent' ? '✓ Enviado' : b.status === 'error' ? '✕ Error' : '⏳ Pendiente'}
                      </span>
                      <span className="broadcast-shift">
                        {b.shift === 'morning' ? '🌅 Mañana' : '🌇 Tarde'}
                      </span>
                      <span className="broadcast-time">{formatDate(b.createdAt)}</span>
                    </div>
                    <div className="broadcast-delivery-info">
                      <span>🚚 {b.deliveryPerson?.name || 'N/A'}</span>
                      <span>📱 {b.deliveryPerson?.phone || 'N/A'}</span>
                    </div>
                    <div className="broadcast-clients-count">
                      {b.clients?.length || 0} cliente{(b.clients?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    {b.message && (
                      <div className="broadcast-message-preview">
                        {b.message}
                      </div>
                    )}
                  </div>
                ))}

                {broadcastsTotalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ccc' }}>
                    <button onClick={() => setBroadcastsPage(p => Math.max(1, p - 1))} disabled={broadcastsPage === 1} className="pagination-button">Previous</button>
                    <span style={{ padding: '8px 12px', fontSize: '14px', color: '#333' }}>Page {broadcastsPage} of {broadcastsTotalPages}</span>
                    <button onClick={() => setBroadcastsPage(p => Math.min(broadcastsTotalPages, p + 1))} disabled={broadcastsPage === broadcastsTotalPages} className="pagination-button">Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
