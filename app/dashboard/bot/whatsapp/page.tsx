'use client';

import { useUser } from '@clerk/nextjs';
import '../bot.css';

export default function WhatsAppPage() {
  const { user } = useUser();

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
        <p className="section-description">
          Manage WhatsApp messaging automation and configurations
        </p>
        <div className="bot-grid">
          {/* Messages Sent */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon whatsapp">
                <span>📤</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Messages Sent</h3>
                <p className="bot-card-subtitle">Total outbound messages</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Today</span>
                <span className="bot-stat-value">247</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">This Week</span>
                <span className="bot-stat-value">1,247</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">This Month</span>
                <span className="bot-stat-value">4,891</span>
              </div>
            </div>
            <button className="bot-btn">View Details</button>
          </div>

          {/* Active Chats */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon whatsapp">
                <span>💬</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Active Chats</h3>
                <p className="bot-card-subtitle">Current conversations</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Open</span>
                <span className="bot-stat-value">89</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Pending</span>
                <span className="bot-stat-value">23</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Resolved Today</span>
                <span className="bot-stat-value">156</span>
              </div>
            </div>
            <button className="bot-btn">Manage Chats</button>
          </div>

          {/* Response Rate */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon whatsapp">
                <span>📊</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Response Rate</h3>
                <p className="bot-card-subtitle">Performance metrics</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Response Rate</span>
                <span className="bot-stat-value">98%</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Avg Response Time</span>
                <span className="bot-stat-value">2m 30s</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Customer Satisfaction</span>
                <span className="bot-stat-value">4.8/5</span>
              </div>
            </div>
            <button className="bot-btn">View Analytics</button>
          </div>
        </div>
      </div>
    </div>
  );
}
