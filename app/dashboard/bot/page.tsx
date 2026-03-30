'use client';

import { useUser } from '@clerk/nextjs';
import './bot.css';

export default function BotPage() {
  const { user } = useUser();

  return (
    <div className="bot-page">
      {/* Header */}
      <div className="bot-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-box">
              <span className="logo-icon">🤖</span>
            </div>
            <h1 className="logo-text">Bot Communications</h1>
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
          Manage automated communications and bot configurations
        </p>
        <div className="bot-grid">
          {/* WhatsApp Communications */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon whatsapp">
                <span>💬</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">WhatsApp</h3>
                <p className="bot-card-subtitle">Messaging Automation</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Messages Sent</span>
                <span className="bot-stat-value">1,247</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Active Chats</span>
                <span className="bot-stat-value">89</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Response Rate</span>
                <span className="bot-stat-value">98%</span>
              </div>
            </div>
            <button className="bot-btn">Configure WhatsApp</button>
          </div>

          {/* Email Communications */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon email">
                <span>📧</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Email</h3>
                <p className="bot-card-subtitle">Email Automation</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Emails Sent</span>
                <span className="bot-stat-value">3,891</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Open Rate</span>
                <span className="bot-stat-value">67%</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Click Rate</span>
                <span className="bot-stat-value">23%</span>
              </div>
            </div>
            <button className="bot-btn">Configure Email</button>
          </div>

          {/* Configuration */}
          <div className="bot-card">
            <div className="bot-card-header">
              <div className="bot-icon config">
                <span>⚙️</span>
              </div>
              <div className="bot-card-info">
                <h3 className="bot-card-title">Configuration</h3>
                <p className="bot-card-subtitle">Bot Settings</p>
              </div>
            </div>
            <div className="bot-card-content">
              <div className="bot-stat">
                <span className="bot-stat-label">Bot Status</span>
                <span className="bot-stat-value online">Online</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Uptime</span>
                <span className="bot-stat-value">99.9%</span>
              </div>
              <div className="bot-stat">
                <span className="bot-stat-label">Last Update</span>
                <span className="bot-stat-value">2h ago</span>
              </div>
            </div>
            <button className="bot-btn">Bot Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
