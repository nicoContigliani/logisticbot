'use client';

import { useState, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { readExcelFile, ExcelSheet } from '@/lib/excel-utils';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import type { BroadcastRecord } from '@/store/useDeliveryStore';
import '../dashboard.css';
import './delivery.css';

const MESSAGE_TEMPLATES: Record<string, string> = {
  entrega: `📦 *SHINE - Pedido en camino*

¡Hola {{clientName}}!

Tu pedido está en camino.

🚚 *Repartidor:* {{deliveryPersonName}}
⏰ *Horario:* {{shift}}

¡Gracias por tu compra! 🙏`,

  cercania: `🚚 *SHINE - Tu pedido está por llegar*

¡Hola {{clientName}}!

Tu repartidor {{deliveryPersonName}} está por llegar a tu zona.

📄 Tené a mano tu *DNI* para confirmar la entrega.

📱 Ante cualquier duda: {{deliveryPersonPhone}}

¡Te esperamos! 🙏`,
};

type MessageType = 'entrega' | 'cercania';

export default function DeliveryPage() {
  const { user } = useUser();
  const store = useDeliveryStore();
  const {
    activeTab, setActiveTab,
    uploadedFiles, setUploadedFiles,
    selectedFileId, setSelectedFileId,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    rowsPerPage, setRowsPerPage,
    deliveryPersonName, setDeliveryPersonName,
    deliveryPersonPhone, setDeliveryPersonPhone,
    shift, setShift,
    sentPhones, addSentPhones, clearSentPhones,
  } = store;

  const [activeSheetLocal, setActiveSheetLocal] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>('entrega');

  // Historial state
  const [historyDate, setHistoryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyBroadcasts, setHistoryBroadcasts] = useState<BroadcastRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mensajes state
  const [msgSearch, setMsgSearch] = useState('');
  const [msgBroadcasts, setMsgBroadcasts] = useState<BroadcastRecord[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotalPages, setMsgTotalPages] = useState(1);
  const [msgExpandedId, setMsgExpandedId] = useState<string | null>(null);

  const selectedFile = useMemo(
    () => uploadedFiles.find((f) => f.id === selectedFileId) || null,
    [uploadedFiles, selectedFileId]
  );
  const completedFiles = useMemo(
    () => uploadedFiles.filter((f) => f.status === 'completed'),
    [uploadedFiles]
  );
  const currentSheet: ExcelSheet | undefined = selectedFile?.data?.sheets[activeSheetLocal];

  const userAvatarUrl = user?.imageUrl || '';

  // Sent phones for CURRENT message type only
  const sentPhonesForType = useMemo(
    () => sentPhones[messageType] || [],
    [sentPhones, messageType]
  );

  const handleFileSwitch = useCallback((fileId: string | null) => {
    setSelectedFileId(fileId);
    setActiveSheetLocal(0);
    setSearchTerm('');
    setCurrentPage(1);
  }, [setSelectedFileId, setSearchTerm, setCurrentPage]);

  const handleSheetSwitch = useCallback((index: number) => {
    setActiveSheetLocal(index);
    setSearchTerm('');
    setCurrentPage(1);
  }, [setSearchTerm, setCurrentPage]);

  // ---- Fetch helpers ----
  const fetchHistoryBroadcasts = useCallback(async (date: string, page: number) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', date });
      const res = await fetch(`/api/broadcasts/history?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Error fetching history:', err.error || res.statusText);
        setHistoryBroadcasts([]);
        return;
      }
      const data = await res.json();
      setHistoryBroadcasts(data.records || []);
      setHistoryTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error('Network error fetching history:', e);
      setHistoryBroadcasts([]);
    } finally { setHistoryLoading(false); }
  }, []);

  const fetchMsgBroadcasts = useCallback(async (page: number) => {
    setMsgLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      const res = await fetch(`/api/broadcasts/history?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Error fetching messages:', err.error || res.statusText);
        setMsgBroadcasts([]);
        return;
      }
      const data = await res.json();
      setMsgBroadcasts(data.records || []);
      setMsgTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error('Network error fetching messages:', e);
      setMsgBroadcasts([]);
    } finally { setMsgLoading(false); }
  }, []);

  const handleTabSwitch = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'historial') fetchHistoryBroadcasts(historyDate, 1);
    if (tab === 'mensajes') fetchMsgBroadcasts(1);
  }, [setActiveTab, fetchHistoryBroadcasts, historyDate, fetchMsgBroadcasts]);

  // ---- File upload ----
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const newFiles = Array.from(files).map((file) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: file.size,
      status: 'uploading' as const,
      progress: 0,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fid = newFiles[i].id;
      try {
        for (let p = 0; p <= 100; p += 10) {
          await new Promise((r) => setTimeout(r, 40));
          setUploadedFiles((prev) => prev.map((f) => f.id === fid ? { ...f, progress: p } : f));
        }
        setUploadedFiles((prev) => prev.map((f) => f.id === fid ? { ...f, status: 'processing' } : f));
        const data = await readExcelFile(file);
        setUploadedFiles((prev) => prev.map((f) => f.id === fid ? { ...f, status: 'completed', data, progress: 100 } : f));
        handleFileSwitch(fid);
      } catch (error) {
        setUploadedFiles((prev) => prev.map((f) => f.id === fid ? { ...f, status: 'error', error: (error as Error).message } : f));
      }
    }
  }, [setUploadedFiles, handleFileSwitch]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // ---- Extract clients ----
  const extractClients = useCallback(() => {
    if (!currentSheet?.data) return { clients: [], deliveryPerson: { name: '', phone: '' } };
    const clients: { name?: string; phone: string; address?: string }[] = [];
    let dpName = '', dpPhone = '';

    for (const row of currentSheet.data) {
      const keys = Object.keys(row);
      let phone: string | undefined;

      for (const k of keys) {
        if (['telefono', 'phone', 'tel', 'celular', 'mobile', 'whatsapp', 'numero'].some(pk => k.toLowerCase().includes(pk))) {
          phone = String(row[k] || '').trim();
          break;
        }
      }
      if (!phone) {
        for (const v of Object.values(row)) {
          const s = String(v || '').trim();
          if (/^\+?[1-9]\d{1,14}$/.test(s.replace(/[\s\-()]/g, ''))) { phone = s; break; }
        }
      }

      if (phone) {
        let name: string | undefined;
        for (const k of keys) {
          if (['nombre', 'name', 'cliente', 'client'].some(nk => k.toLowerCase().includes(nk))) {
            name = String(row[k] || '').trim();
            break;
          }
        }
        let address: string | undefined;
        for (const k of keys) {
          if (['direccion', 'address', 'domicilio', 'ubicacion'].some(ak => k.toLowerCase().includes(ak))) {
            address = String(row[k] || '').trim();
            break;
          }
        }
        clients.push({ name, phone, address });
      }

      for (const k of keys) {
        if (['delivery', 'repartidor', 'reparto'].some(dk => k.toLowerCase().includes(dk))) {
          const val = String(row[k] || '').trim();
          if (val) {
            if (/^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s\-()]/g, ''))) dpPhone = val;
            else dpName = val;
          }
          break;
        }
      }
    }
    return { clients, deliveryPerson: { name: dpName, phone: dpPhone } };
  }, [currentSheet?.data]);

  const detectedClients = useMemo(() => extractClients().clients, [extractClients]);

  // Pending = clients not yet sent for THIS message type
  const pendingClients = useMemo(
    () => detectedClients.filter((c) => !sentPhonesForType.includes(c.phone)),
    [detectedClients, sentPhonesForType]
  );

  const formatPhone = (phone: string) => {
    const c = phone.replace(/[\s\-()]/g, '');
    if (c.startsWith('+549')) return c;
    if (c.startsWith('26')) return '+549' + c;
    if (c.startsWith('549')) return '+' + c;
    if (c.startsWith('54')) return '+' + c;
    return '+549' + c;
  };

  // Build preview message
  const buildPreviewMessage = useCallback((clientName: string) => {
    const { deliveryPerson } = extractClients();
    const dpName = deliveryPerson.name || deliveryPersonName;
    const dpPhone = deliveryPerson.phone || deliveryPersonPhone;
    const fmtPhone = dpPhone ? formatPhone(dpPhone) : '+5491112345678';
    const shiftText = shift === 'morning' ? 'Mañana' : 'Tarde';
    const template = MESSAGE_TEMPLATES[messageType] || MESSAGE_TEMPLATES.entrega;
    return template
      .replace('{{clientName}}', clientName || 'Cliente')
      .replace('{{deliveryPersonName}}', dpName || 'Repartidor')
      .replace('{{deliveryPersonPhone}}', fmtPhone)
      .replace('{{shift}}', shiftText);
  }, [extractClients, deliveryPersonName, deliveryPersonPhone, shift, messageType]);

  // ---- Confirm dialog ----
  const handleShowConfirm = useCallback(() => {
    const { clients, deliveryPerson } = extractClients();
    const dpName = deliveryPerson.name || deliveryPersonName;
    const dpPhone = deliveryPerson.phone || deliveryPersonPhone;

    if (!dpName || !dpPhone) { setSendStatus({ type: 'error', message: 'Completá nombre y teléfono del repartidor' }); return; }
    if (!/^\+?[1-9]\d{1,14}$/.test(formatPhone(dpPhone).replace(/[\s\-()]/g, ''))) { setSendStatus({ type: 'error', message: 'Teléfono del repartidor inválido' }); return; }
    if (!clients.length) { setSendStatus({ type: 'error', message: 'No se encontraron teléfonos en el Excel' }); return; }

    const toSend = clients.filter((c) => !sentPhonesForType.includes(c.phone));
    if (!toSend.length) { setSendStatus({ type: 'error', message: `Todos los clientes ya recibieron "${messageType === 'entrega' ? 'entrega' : 'cercanía'}"` }); return; }

    setSendStatus(null);
    setShowConfirm(true);
  }, [extractClients, deliveryPersonName, deliveryPersonPhone, sentPhonesForType, messageType]);

  // ---- Send confirmed ----
  const handleSendConfirmed = async () => {
    const { clients, deliveryPerson } = extractClients();
    const dpName = deliveryPerson.name || deliveryPersonName;
    const dpPhone = deliveryPerson.phone || deliveryPersonPhone;
    const fmtPhone = formatPhone(dpPhone);

    const toSend = clients.filter((c) => !sentPhonesForType.includes(c.phone));
    if (!toSend.length) { setShowConfirm(false); return; }

    setIsSending(true);
    setSendStatus(null);
    setShowConfirm(false);

    const shiftText = shift === 'morning' ? 'Mañana' : 'Tarde';
    const template = MESSAGE_TEMPLATES[messageType] || MESSAGE_TEMPLATES.entrega;
    const baseMessage = template
      .replace('{{deliveryPersonName}}', dpName)
      .replace('{{deliveryPersonPhone}}', fmtPhone)
      .replace('{{shift}}', shiftText);

    const results = await Promise.allSettled(
      toSend.map(async (client) => {
        const personalizedMsg = baseMessage.replace('{{clientName}}', client.name || 'Cliente');
        const body: Record<string, unknown> = {
          companyName: 'Delivery',
          message: personalizedMsg,
          shift,
          deliveryPerson: { name: dpName, phone: fmtPhone },
          clients: [client],
        };
        // Include repartidor photo for cercania type
        if (userAvatarUrl && messageType === 'cercania') {
          body.imageUrl = userAvatarUrl;
        }
        const res = await fetch('/api/broadcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('send failed');
        return client.phone;
      })
    );

    const sentList = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map((r) => r.value);
    const failCount = results.filter((r) => r.status === 'rejected').length;

    // Save sent phones for THIS message type only
    if (sentList.length > 0) addSentPhones(messageType, sentList);

    if (failCount === 0) {
      setSendStatus({ type: 'success', message: `"${messageType === 'entrega' ? '📦 Entrega' : '🚚 Cercanía'}" enviado a ${sentList.length} clientes` });
    } else if (sentList.length > 0) {
      setSendStatus({ type: 'error', message: `Enviados ${sentList.length}, fallaron ${failCount}` });
    } else {
      setSendStatus({ type: 'error', message: 'Error al enviar' });
    }

    setIsSending(false);
  };

  const handleClearAll = useCallback(() => {
    clearSentPhones();
    setSendStatus(null);
    setDeliveryPersonName('');
    setDeliveryPersonPhone('');
    setShowConfirm(false);
    setMessageType('entrega');
  }, [clearSentPhones, setDeliveryPersonName, setDeliveryPersonPhone]);

  // ---- Table data ----
  const filteredData = useMemo(() => {
    if (!currentSheet?.data) return [];
    if (!searchTerm) return currentSheet.data;
    const t = searchTerm.toLowerCase();
    return currentSheet.data.filter((row) => Object.values(row).some((v) => v != null && String(v).toLowerCase().includes(t)));
  }, [currentSheet?.data, searchTerm]);

  const paginatedData = useMemo(() => filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredData, currentPage, rowsPerPage]);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  const tableHeaders = useMemo(() => {
    if (!currentSheet?.data?.length) return [];
    return Object.keys(currentSheet.data[0]);
  }, [currentSheet?.data]);

  // Status per row for current message type
  const getRowStatus = (row: Record<string, unknown>) => {
    const phone = getPhone(row);
    if (!phone) return 'none';
    const sentEntrega = sentPhones['entrega']?.includes(phone);
    const sentCercania = sentPhones['cercania']?.includes(phone);
    if (sentEntrega && sentCercania) return 'both';
    if (sentEntrega) return 'entrega';
    if (sentCercania) return 'cercania';
    return 'pending';
  };

  // ---- History grouping ----
  const filteredHistory = useMemo(() => {
    if (!historySearch) return historyBroadcasts;
    const t = historySearch.toLowerCase();
    return historyBroadcasts.filter((b) =>
      b.deliveryPerson?.name?.toLowerCase().includes(t) ||
      b.deliveryPerson?.phone?.includes(t) ||
      b.clients?.some((c) => c.name?.toLowerCase().includes(t) || c.phone?.includes(t) || c.address?.toLowerCase().includes(t))
    );
  }, [historyBroadcasts, historySearch]);

  // ---- Helpers (must be before groupedHistory) ----
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const groupedHistory = useMemo(() => {
    const groups: { key: string; broadcasts: BroadcastRecord[]; dpName: string; dpPhone: string; shift: string; time: string; status: string; totalClients: number }[] = [];
    const seen = new Map<string, number>();

    for (const b of filteredHistory) {
      const minute = b.createdAt?.slice(0, 16) || '';
      const groupKey = `${b.deliveryPerson?.name || ''}_${b.deliveryPerson?.phone || ''}_${b.shift}_${minute}`;

      if (seen.has(groupKey)) {
        const idx = seen.get(groupKey)!;
        groups[idx].broadcasts.push(b);
        groups[idx].totalClients += b.clients?.length || 0;
        if (b.status === 'error' && groups[idx].status === 'sent') groups[idx].status = 'mixed';
      } else {
        seen.set(groupKey, groups.length);
        groups.push({
          key: groupKey,
          broadcasts: [b],
          dpName: b.deliveryPerson?.name || 'N/A',
          dpPhone: b.deliveryPerson?.phone || 'N/A',
          shift: b.shift,
          time: fmtTime(b.createdAt),
          status: b.status,
          totalClients: b.clients?.length || 0,
        });
      }
    }
    return groups;
  }, [filteredHistory]);

  const filteredMsgs = useMemo(() => {
    if (!msgSearch) return msgBroadcasts;
    const t = msgSearch.toLowerCase();
    return msgBroadcasts.filter((b) =>
      b.deliveryPerson?.name?.toLowerCase().includes(t) ||
      b.deliveryPerson?.phone?.includes(t) ||
      b.clients?.some((c) => c.name?.toLowerCase().includes(t) || c.phone?.includes(t))
    );
  }, [msgBroadcasts, msgSearch]);

  const getPhone = (row: Record<string, unknown>) => {
    for (const k of Object.keys(row)) {
      if (['telefono', 'phone', 'tel', 'celular', 'mobile', 'whatsapp', 'numero'].some(pk => k.toLowerCase().includes(pk))) {
        return String(row[k] || '').trim();
      }
    }
    return undefined;
  };

  // Count sent for each type
  const sentEntregaCount = (sentPhones['entrega'] || []).length;
  const sentCercaniaCount = (sentPhones['cercania'] || []).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-box"><span className="logo-icon">📦</span></div>
            <h1 className="logo-text">Delivery</h1>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Tabs */}
        <div className="delivery-tabs">
          {(['registros', 'historial', 'mensajes'] as const).map((tab) => (
            <button
              key={tab}
              className={`delivery-tab ${activeTab === tab ? 'delivery-tab-active' : ''}`}
              onClick={() => handleTabSwitch(tab)}
            >
              {tab === 'registros' ? '📋 Registros' : tab === 'historial' ? '📅 Historial' : '💬 Mensajes'}
            </button>
          ))}
        </div>

        {/* ======== REGISTROS ======== */}
        {activeTab === 'registros' && (
          <>
            {/* Upload */}
            <div className="section-card dv-upload-bar">
              <div className="dv-upload-row">
                <label className="dv-upload-btn">
                  ☁️ Subir Excel
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e.target.files)} style={{ display: 'none' }} />
                </label>
                {completedFiles.length > 0 && (
                  <select className="dv-file-select" value={selectedFileId || ''} onChange={(e) => handleFileSwitch(e.target.value || null)}>
                    <option value="">Archivo...</option>
                    {completedFiles.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                )}
              </div>
              {uploadedFiles.some((f) => f.status === 'uploading' || f.status === 'processing') && (
                <div className="dv-upload-progress">
                  {uploadedFiles.filter((f) => f.status === 'uploading' || f.status === 'processing').map((f) => (
                    <div key={f.id}>
                      <div className="dv-progress-info"><span>{f.name}</span><span>{f.progress}%</span></div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${f.progress}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Table */}
            {currentSheet ? (
              <div className="section-card dv-table-card">
                {/* Sheet tabs */}
                {selectedFile?.data && selectedFile.data.sheets.length > 1 && (
                  <div className="dv-sheet-tabs">
                    {selectedFile.data.sheets.map((sheet, i) => (
                      <button
                        key={sheet.name}
                        onClick={() => handleSheetSwitch(i)}
                        className={`sheet-tab ${activeSheetLocal === i ? 'sheet-tab-active' : ''}`}
                      >
                        {sheet.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="dv-table-header">
                  <h2>{filteredData.length} registros</h2>
                  <div className="dv-table-controls">
                    <input type="text" className="dv-search" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar..." />
                    <select className="dv-rows-select" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                      <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {tableHeaders.map((h) => <th key={h}>{h}</th>)}
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, i) => {
                        const status = getRowStatus(row);
                        return (
                          <tr key={`${activeSheetLocal}-${i}`}>
                            {tableHeaders.map((h) => <td key={h}>{String(row[h] || '-')}</td>)}
                            <td>
                              {status === 'both' && <span className="dv-status-sent">✓✓</span>}
                              {status === 'entrega' && <span className="dv-status-partial">✓📦</span>}
                              {status === 'cercania' && <span className="dv-status-partial">✓🚚</span>}
                              {status === 'pending' && <span className="dv-status-pending">⏳</span>}
                              {status === 'none' && <span className="dv-status-pending">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="dv-pagination">
                    <span>{((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, filteredData.length)} de {filteredData.length}</span>
                    <div className="dv-pagination-btns">
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="pagination-button">«</button>
                      <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">‹</button>
                      <span>{currentPage}/{totalPages}</span>
                      <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">›</button>
                      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="pagination-button">»</button>
                    </div>
                  </div>
                )}

                {/* Send section */}
                <div className="dv-send-section">
                  <h3>💬 Enviar WhatsApp</h3>

                  {/* Message type - 2 buttons */}
                  <div className="dv-msg-types">
                    <button
                      className={`dv-msg-type ${messageType === 'entrega' ? 'dv-msg-type-active' : ''}`}
                      onClick={() => setMessageType('entrega')}
                    >
                      📦 Entrega {sentEntregaCount > 0 && `(${sentEntregaCount})`}
                    </button>
                    <button
                      className={`dv-msg-type ${messageType === 'cercania' ? 'dv-msg-type-active' : ''}`}
                      onClick={() => setMessageType('cercania')}
                    >
                      🚚 Cercanía+DNI {sentCercaniaCount > 0 && `(${sentCercaniaCount})`}
                    </button>
                  </div>

                  {/* Repartidor fields */}
                  <div className="dv-send-grid">
                    <input type="text" value={deliveryPersonName} onChange={(e) => setDeliveryPersonName(e.target.value)} placeholder="Nombre repartidor *" className="dv-input" />
                    <input type="tel" value={deliveryPersonPhone} onChange={(e) => setDeliveryPersonPhone(e.target.value)} placeholder="Teléfono repartidor *" className="dv-input" />
                    <select value={shift} onChange={(e) => setShift(e.target.value as 'morning' | 'afternoon')} className="dv-input">
                      <option value="morning">🌅 Mañana</option>
                      <option value="afternoon">🌇 Tarde</option>
                    </select>
                  </div>

                  {/* Photo preview for cercania */}
                  {userAvatarUrl && messageType === 'cercania' && (
                    <div className="dv-avatar-preview">
                      <img src={userAvatarUrl} alt="Repartidor" className="dv-avatar-img" />
                      <span className="dv-avatar-label">Foto del repartidor (se incluye)</span>
                    </div>
                  )}

                  {/* Message preview */}
                  <div className="dv-msg-preview">
                    <div className="dv-msg-preview-label">Vista previa:</div>
                    <div className="dv-msg-preview-text">
                      {buildPreviewMessage('Juan Pérez')}
                    </div>
                  </div>

                  <div className="dv-send-info">
                    <span>Total: <strong>{detectedClients.length}</strong></span>
                    <span>📦 Enviados: <strong>{sentEntregaCount}</strong></span>
                    <span>🚚 Enviados: <strong>{sentCercaniaCount}</strong></span>
                    <span>Pendientes: <strong>{pendingClients.length}</strong></span>
                  </div>

                  {sendStatus && <div className={`dv-send-status dv-send-status-${sendStatus.type}`}>{sendStatus.message}</div>}

                  <div className="dv-send-actions">
                    <button onClick={handleShowConfirm} disabled={isSending || !deliveryPersonName || !deliveryPersonPhone || pendingClients.length === 0} className="btn-send-messages">
                      {isSending ? 'Enviando...' : `📤 Enviar "${messageType === 'entrega' ? 'Entrega' : 'Cercanía'}" a ${pendingClients.length}`}
                    </button>
                    {(sentEntregaCount > 0 || sentCercaniaCount > 0 || sendStatus || deliveryPersonName) && (
                      <button onClick={handleClearAll} className="btn-clear-status">🔄 Limpiar</button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="section-card">
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <h3 className="empty-title">Subí un Excel para empezar</h3>
                  <p className="empty-text">Tocá &quot;Subir Excel&quot; arriba</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ======== HISTORIAL ======== */}
        {activeTab === 'historial' && (
          <div className="section-card dv-history-card">
            <div className="dv-history-filters">
              <input type="date" value={historyDate} onChange={(e) => { setHistoryDate(e.target.value); setHistoryPage(1); fetchHistoryBroadcasts(e.target.value, 1); }} className="dv-input dv-date-input" />
              <input type="text" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} placeholder="Buscar cliente, teléfono..." className="dv-input dv-history-search" />
              <button onClick={() => fetchHistoryBroadcasts(historyDate, historyPage)} className="dv-refresh-btn">🔄</button>
            </div>

            {historyLoading ? (
              <div className="dv-loading">{[1, 2, 3].map((i) => <div key={i} className="dv-skeleton-card"><div className="skeleton skeleton-line" style={{ width: '50%' }} /><div className="skeleton skeleton-line" /></div>)}</div>
            ) : groupedHistory.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <h3 className="empty-title">{historyBroadcasts.length === 0 ? 'Sin registros' : 'Sin resultados'}</h3>
              </div>
            ) : (
              <>
                {groupedHistory.map((group) => {
                  const isOpen = expandedId === group.key;
                  return (
                    <div key={group.key} className="dv-broadcast">
                      <button className="dv-broadcast-header" onClick={() => setExpandedId(isOpen ? null : group.key)}>
                        <div className="dv-broadcast-left">
                          <span className={`broadcast-status broadcast-status-${group.status === 'sent' ? 'sent' : 'error'}`}>
                            {group.status === 'sent' ? '✓' : '✕'}
                          </span>
                          <div className="dv-broadcast-meta">
                            <span className="dv-broadcast-time">{group.time}</span>
                            <span className="dv-broadcast-shift">{group.shift === 'morning' ? '🌅 Mañana' : '🌇 Tarde'}</span>
                          </div>
                        </div>
                        <div className="dv-broadcast-right">
                          <span className="dv-broadcast-count">{group.totalClients}</span>
                          <span className="dv-broadcast-arrow">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      <div className="dv-broadcast-delivery">🚚 {group.dpName} — 📱 {group.dpPhone}</div>
                      {isOpen && (
                        <div className="dv-broadcast-clients">
                          {group.broadcasts.flatMap((b) => b.clients || []).map((c, i) => (
                            <div key={i} className="dv-client-row">
                              <span className="dv-client-name">{c.name || '—'}</span>
                              <span className="dv-client-phone">{c.phone}</span>
                              {c.address && <span className="dv-client-addr">{c.address}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {historyTotalPages > 1 && (
                  <div className="dv-pagination" style={{ borderTop: 'none', marginTop: '12px' }}>
                    <div className="dv-pagination-btns">
                      <button onClick={() => { const p = Math.max(1, historyPage - 1); setHistoryPage(p); fetchHistoryBroadcasts(historyDate, p); }} disabled={historyPage === 1} className="pagination-button">‹</button>
                      <span>{historyPage}/{historyTotalPages}</span>
                      <button onClick={() => { const p = Math.min(historyTotalPages, historyPage + 1); setHistoryPage(p); fetchHistoryBroadcasts(historyDate, p); }} disabled={historyPage === historyTotalPages} className="pagination-button">›</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======== MENSAJES ======== */}
        {activeTab === 'mensajes' && (
          <div className="section-card dv-history-card">
            <div className="dv-history-filters">
              <input type="text" value={msgSearch} onChange={(e) => setMsgSearch(e.target.value)} placeholder="Buscar por cliente, repartidor..." className="dv-input dv-history-search" style={{ flex: 1 }} />
              <button onClick={() => fetchMsgBroadcasts(msgPage)} className="dv-refresh-btn">🔄</button>
            </div>

            {msgLoading ? (
              <div className="dv-loading">{[1, 2, 3].map((i) => <div key={i} className="dv-skeleton-card"><div className="skeleton skeleton-line" style={{ width: '50%' }} /><div className="skeleton skeleton-line" /></div>)}</div>
            ) : filteredMsgs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <h3 className="empty-title">{msgBroadcasts.length === 0 ? 'Sin mensajes' : 'Sin resultados'}</h3>
              </div>
            ) : (
              <>
                {filteredMsgs.map((b) => {
                  const isOpen = msgExpandedId === b.id;
                  return (
                    <div key={b.id} className="dv-broadcast">
                      <button className="dv-broadcast-header" onClick={() => setMsgExpandedId(isOpen ? null : b.id)}>
                        <div className="dv-broadcast-left">
                          <span className={`broadcast-status broadcast-status-${b.status}`}>{b.status === 'sent' ? '✓' : '✕'}</span>
                          <div className="dv-broadcast-meta">
                            <span className="dv-broadcast-time">{fmtDate(b.createdAt)}</span>
                            <span className="dv-broadcast-shift">{b.shift === 'morning' ? '🌅' : '🌇'}</span>
                          </div>
                        </div>
                        <div className="dv-broadcast-right">
                          <span className="dv-broadcast-count">{b.clients?.length || 0}</span>
                          <span className="dv-broadcast-arrow">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      <div className="dv-broadcast-delivery">🚚 {b.deliveryPerson?.name} — 📱 {b.deliveryPerson?.phone}</div>
                      {isOpen && (
                        <div className="dv-broadcast-clients">
                          {b.clients?.map((c, i) => (
                            <div key={i} className="dv-client-row">
                              <span className="dv-client-name">{c.name || '—'}</span>
                              <span className="dv-client-phone">{c.phone}</span>
                            </div>
                          ))}
                          {b.message && <div className="dv-broadcast-msg">{b.message}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {msgTotalPages > 1 && (
                  <div className="dv-pagination" style={{ borderTop: 'none', marginTop: '12px' }}>
                    <div className="dv-pagination-btns">
                      <button onClick={() => { const p = Math.max(1, msgPage - 1); setMsgPage(p); fetchMsgBroadcasts(p); }} disabled={msgPage === 1} className="pagination-button">‹</button>
                      <span>{msgPage}/{msgTotalPages}</span>
                      <button onClick={() => { const p = Math.min(msgTotalPages, msgPage + 1); setMsgPage(p); fetchMsgBroadcasts(p); }} disabled={msgPage === msgTotalPages} className="pagination-button">›</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======== CONFIRM DIALOG ======== */}
        {showConfirm && (
          <div className="dv-confirm-overlay" onClick={() => setShowConfirm(false)}>
            <div className="dv-confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>
                {messageType === 'entrega' ? '📦 Confirmar envío de entrega' : '🚚 Confirmar envío de cercanía + DNI'}
              </h3>

              {/* Repartidor info */}
              <div className="dv-confirm-repartidor">
                {userAvatarUrl && messageType === 'cercania' && (
                  <img src={userAvatarUrl} alt="" className="dv-confirm-avatar" />
                )}
                <div>
                  <div className="dv-confirm-dp-name">{deliveryPersonName || extractClients().deliveryPerson.name || 'Repartidor'}</div>
                  <div className="dv-confirm-dp-phone">{deliveryPersonPhone || extractClients().deliveryPerson.phone || ''}</div>
                </div>
              </div>

              {/* Message preview */}
              <div className="dv-confirm-preview">
                {buildPreviewMessage(pendingClients[0]?.name || 'Cliente')}
              </div>

              {/* Client list */}
              <div className="dv-confirm-count">
                Se enviará a <strong>{pendingClients.length} clientes</strong>:
              </div>
              <div className="dv-confirm-list">
                {pendingClients.slice(0, 8).map((c, i) => (
                  <div key={i} className="dv-confirm-client">
                    <span>{c.name || '—'}</span>
                    <span className="dv-client-phone">{c.phone}</span>
                  </div>
                ))}
                {pendingClients.length > 8 && (
                  <div className="dv-confirm-more">...y {pendingClients.length - 8} más</div>
                )}
              </div>

              <div className="dv-confirm-actions">
                <button onClick={() => setShowConfirm(false)} className="btn-clear-status">Cancelar</button>
                <button onClick={handleSendConfirmed} className="btn-send-messages">📤 Confirmar envío</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
