'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { parseFile, toLogisticsRecords, ParsedData, LogisticsRecord } from '@/lib/file-parsers';
import { exportToCSV, exportToExcel, exportToXML } from '@/lib/file-parsers';
import './dashboard.css';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  data?: ParsedData;
  records?: LogisticsRecord[];
  error?: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

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

        // Parse file
        const data = await parseFile(file);
        const records = toLogisticsRecords(data);

        // Update with completed status
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'completed', data, records, progress: 100 }
              : f
          )
        );
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleExport = (format: 'csv' | 'excel' | 'xml') => {
    if (!selectedFile?.records) return;

    const filename = selectedFile.name.replace(/\.[^/.]+$/, '');

    switch (format) {
      case 'csv':
        exportToCSV(selectedFile.records, filename);
        break;
      case 'excel':
        exportToExcel(selectedFile.records, filename);
        break;
      case 'xml':
        exportToXML(selectedFile.records, filename);
        break;
    }
  };

  const stats = [
    {
      title: 'Total Shipments',
      value: uploadedFiles.reduce((acc, f) => acc + (f.records?.length || 0), 0),
      icon: '🚚',
      color: '#3b82f6',
    },
    {
      title: 'Files Processed',
      value: uploadedFiles.filter((f) => f.status === 'completed').length,
      icon: '📄',
      color: '#22c55e',
    },
    {
      title: 'Active Tracking',
      value: uploadedFiles.reduce(
        (acc, f) =>
          acc +
          (f.records?.filter((r) => r.status?.toLowerCase().includes('transit')).length || 0),
        0
      ),
      icon: '📊',
      color: '#f59e0b',
    },
    {
      title: 'Inventory Items',
      value: uploadedFiles.reduce(
        (acc, f) =>
          acc +
          (f.records?.filter((r) => r.status?.toLowerCase().includes('inventory')).length || 0),
        0
      ),
      icon: '📦',
      color: '#06b6d4',
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-box">
              <span className="logo-icon">🚚</span>
            </div>
            <h1 className="logo-text">LogisticBot</h1>
          </div>
          <div className="header-right">
            <span className="welcome-text">Welcome, {user?.firstName || 'User'}</span>
            <div className="user-avatar">
              {user?.firstName?.[0] || 'U'}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.title} className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <span className="stat-title">{stat.title}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="main-grid">
          {/* File Upload Section */}
          <div className="upload-section">
            <div className="section-card">
              <h2 className="section-title">Upload Files</h2>
              <p className="section-description">
                Upload XML, Excel, CSV, or CASL files to process logistics data
              </p>

              {/* Drop Zone */}
              <div
                className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".xml,.xlsx,.xls,.csv,.casl"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  style={{ display: 'none' }}
                />
                <span className="drop-zone-icon">☁️</span>
                <h3 className="drop-zone-title">Drag & drop files here</h3>
                <p className="drop-zone-text">or click to browse</p>
                <div className="file-types">
                  {['XML', 'XLSX', 'CSV', 'CASL'].map((type) => (
                    <span key={type} className="file-type-badge">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h3 className="uploaded-files-title">Uploaded Files</h3>
                  <div className="files-list">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`file-item ${selectedFile?.id === file.id ? 'file-item-selected' : ''}`}
                        onClick={() => file.status === 'completed' && setSelectedFile(file)}
                      >
                        <div className="file-item-header">
                          <div className="file-item-left">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{file.name}</span>
                          </div>
                          <div className="file-item-right">
                            {file.status === 'completed' && (
                              <span className="status-icon status-success">✓</span>
                            )}
                            {file.status === 'error' && (
                              <span className="status-icon status-error">✗</span>
                            )}
                            <span className="file-type">{file.type}</span>
                          </div>
                        </div>
                        {file.status === 'uploading' && (
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${file.progress}%` }} />
                          </div>
                        )}
                        {file.status === 'processing' && (
                          <div className="progress-bar">
                            <div className="progress-fill progress-indeterminate" />
                          </div>
                        )}
                        {file.status === 'completed' && file.records && (
                          <span className="file-records">{file.records.length} records processed</span>
                        )}
                        {file.status === 'error' && (
                          <span className="file-error">{file.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Preview Section */}
          <div className="preview-section">
            <div className="section-card">
              <div className="preview-header">
                <div>
                  <h2 className="section-title">Data Preview</h2>
                  <p className="section-description">
                    {selectedFile ? `${selectedFile.name} - ${selectedFile.records?.length || 0} records` : 'Select a file to preview'}
                  </p>
                </div>
                {selectedFile && (
                  <div className="export-buttons">
                    <button className="export-btn" onClick={() => handleExport('csv')}>
                      CSV
                    </button>
                    <button className="export-btn" onClick={() => handleExport('excel')}>
                      Excel
                    </button>
                    <button className="export-btn" onClick={() => handleExport('xml')}>
                      XML
                    </button>
                  </div>
                )}
              </div>

              {selectedFile?.records ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {selectedFile.data?.headers.slice(0, 6).map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFile.records.slice(0, 10).map((record, index) => (
                        <tr key={index}>
                          {selectedFile.data?.headers.slice(0, 6).map((header) => (
                            <td key={header}>
                              {String(record[header] || '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedFile.records.length > 10 && (
                    <p className="table-footer">
                      Showing 10 of {selectedFile.records.length} records
                    </p>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <h3 className="empty-title">No data to display</h3>
                  <p className="empty-text">Upload a file to see the preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            {[
              { title: 'Track Shipment', icon: '🚚', color: '#3b82f6' },
              { title: 'View Inventory', icon: '📦', color: '#22c55e' },
              { title: 'Generate Report', icon: '📊', color: '#f59e0b' },
            ].map((action) => (
              <div key={action.title} className="action-card">
                <div className="action-content">
                  <div className="action-icon" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                    {action.icon}
                  </div>
                  <span className="action-title">{action.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
