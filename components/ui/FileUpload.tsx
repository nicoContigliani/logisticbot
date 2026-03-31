'use client';

import React, { useState, useCallback } from 'react';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onUpload: (files: FileList) => void;
  title?: string;
  description?: string;
  icon?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
  disabled?: boolean;
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUpload({
  accept = '*',
  multiple = true,
  onUpload,
  title = 'Upload Files',
  description = 'Drag & drop files here or click to browse',
  icon = '☁️',
  isOpen = true,
  onToggle,
  showToggle = false,
  disabled = false,
  maxSize,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = useCallback((files: FileList): boolean => {
    if (maxSize) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
          setError(`File ${files[i].name} exceeds maximum size of ${formatFileSize(maxSize)}`);
          return false;
        }
      }
    }
    setError(null);
    return true;
  }, [maxSize]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && validateFiles(e.dataTransfer.files)) {
        onUpload(e.dataTransfer.files);
      }
    },
    [disabled, onUpload, validateFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && !disabled && validateFiles(e.target.files)) {
        onUpload(e.target.files);
      }
    },
    [disabled, onUpload, validateFiles]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptTypes = (): string[] => {
    if (accept === '*') return [];
    return accept.split(',').map((t) => t.trim().toUpperCase());
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {showToggle && (
        <div 
          className="file-upload-header"
          onClick={onToggle}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: isOpen ? '16px' : '0',
          }}
        >
          <div>
            <h3 className="file-upload-title">{title}</h3>
            <p className="file-upload-description">{description}</p>
          </div>
          <span 
            style={{ 
              fontSize: '24px', 
              transition: 'transform 0.3s', 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </span>
        </div>
      )}

      {(!showToggle || isOpen) && (
        <>
          <div
            className={`drop-zone ${isDragging ? 'drop-zone-active' : ''} ${disabled ? 'drop-zone-disabled' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById(`file-input-${title.replace(/\s+/g, '-')}`)?.click()}
          >
            <input
              id={`file-input-${title.replace(/\s+/g, '-')}`}
              type="file"
              multiple={multiple}
              accept={accept}
              onChange={handleFileInput}
              style={{ display: 'none' }}
              disabled={disabled}
            />
            <span className="drop-zone-icon">{icon}</span>
            <h3 className="drop-zone-title">
              {showToggle ? 'Drag & drop files here' : title}
            </h3>
            <p className="drop-zone-text">or click to browse</p>
            {accept !== '*' && (
              <div className="file-types">
                {getAcceptTypes().map((type) => (
                  <span key={type} className="file-type-badge">
                    {type}
                  </span>
                ))}
              </div>
            )}
            {maxSize && (
              <p className="file-upload-max-size">
                Max file size: {formatFileSize(maxSize)}
              </p>
            )}
          </div>

          {error && (
            <div className="file-upload-error">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileUpload;
