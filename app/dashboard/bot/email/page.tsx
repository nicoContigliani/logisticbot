'use client';

import { useUser } from '@clerk/nextjs';
import '../bot.css';

export default function EmailPage() {
  const { user } = useUser();

  return (
    <div className="bot-page">
      {/* Header */}
      <div className="bot-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-box email">
              <span className="logo-icon">📧</span>
            </div>
            <h1 className="logo-text">Email Bot</h1>
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
        <p className="section-description">
          Manage email automation and configurations
        </p>
        <div className="bot-grid">
          {/* Emails Sent */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon email">
                <span>📤</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Emails Sent</h3>
                <p className="bot-card-subtitle">Total outbound emails</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Today</span>
                <span className="bot-stat-value">891</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">This Week</span>
                <span className="bot-stat-value">3,891</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">This Month</span>
                <span className="bot-stat-value">12,456</span>
              </div>
            </div>
            <button className="bot-btn">View Details</button>
          </div>

          {/* Open Rate */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon email">
                <span>👁️</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Open Rate</h3>
                <p className="bot-card-subtitle">Email engagement</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Open Rate</span>
                <span className="bot-stat-value">67%</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Unique Opens</span>
                <span className="bot-stat-value">2,607</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Total Opens</span>
                <span className="bot-stat-value">4,123</span>
              </div>
            </div>
            <button className="bot-btn">View Analytics</button>
          </div>

          {/* Click Rate */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon email">
                <span>🖱️</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Click Rate</h3>
                <p className="bot-card-subtitle">Link engagement</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Click Rate</span>
                <span className="bot-stat-value">23%</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Unique Clicks</span>
                <span className="bot-stat-value">895</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Total Clicks</span>
                <span className="bot-stat-value">1,234</span>
              </div>
            </div>
            <button className="bot-btn">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}
