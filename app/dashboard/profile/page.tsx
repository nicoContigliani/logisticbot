'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/useI18n';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');

  if (!isLoaded) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <span className="profile-error-icon">⚠️</span>
          <h2>User not found</h2>
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const dateLocale = locale === 'es' ? 'es-AR' : 'en-US';

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  const lastSignIn = user.lastSignInAt
    ? new Date(user.lastSignInAt).toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown';

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
  const email = user.emailAddresses[0]?.emailAddress || 'No email';
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={fullName} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">{initials}</div>
            )}
            <div className="profile-user-info">
              <h1 className="profile-name">{fullName}</h1>
              <p className="profile-email">{email}</p>
              <span className="profile-badge">Active</span>
            </div>
          </div>
          <button className="profile-edit-btn" onClick={() => openUserProfile()}>
            {t('profile.edit_profile')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'overview' ? 'profile-tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {t('profile.account_info')}
        </button>
        <button
          className={`profile-tab ${activeTab === 'activity' ? 'profile-tab-active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          {t('profile.recent_activity')}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="profile-content-grid">
          <div className="profile-card">
            <h3 className="profile-card-title">{t('profile.account_info')}</h3>
            <div className="profile-info-list">
              <div className="profile-info-item">
                <span className="profile-info-label">{t('profile.full_name')}</span>
                <span className="profile-info-value">{fullName}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">{t('profile.email')}</span>
                <span className="profile-info-value">{email}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">{t('profile.user_id')}</span>
                <span className="profile-info-value profile-info-mono">{user.id}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">{t('profile.member_since')}</span>
                <span className="profile-info-value">{memberSince}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">{t('profile.last_sign_in')}</span>
                <span className="profile-info-value">{lastSignIn}</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">{t('profile.connected_accounts')}</h3>
            <div className="profile-info-list">
              {user.externalAccounts.length > 0 ? (
                user.externalAccounts.map((account) => (
                  <div key={account.id} className="profile-info-item">
                    <span className="profile-info-label">
                      {account.provider === 'google' && '🔵 Google'}
                      {account.provider === 'github' && '⚫ GitHub'}
                      {!['google', 'github'].includes(account.provider) && `🔗 ${account.provider}`}
                    </span>
                    <span className="profile-info-value">
                      {account.emailAddress || account.username || 'Connected'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="profile-info-empty">
                  <p>{t('profile.no_accounts')}</p>
                  <button className="profile-edit-btn" onClick={() => openUserProfile()}>
                    {t('profile.connect_account')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="profile-content-grid">
          <div className="profile-card">
            <h3 className="profile-card-title">{t('profile.recent_activity')}</h3>
            <div className="profile-activity-list">
              <div className="profile-activity-item">
                <div className="profile-activity-dot profile-activity-dot-green" />
                <div className="profile-activity-content">
                  <span className="profile-activity-text">{t('profile.signed_in')}</span>
                  <span className="profile-activity-time">{lastSignIn}</span>
                </div>
              </div>
              <div className="profile-activity-item">
                <div className="profile-activity-dot profile-activity-dot-blue" />
                <div className="profile-activity-content">
                  <span className="profile-activity-text">{t('profile.account_created')}</span>
                  <span className="profile-activity-time">{memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">{t('profile.session_info')}</h3>
            <div className="profile-info-list">
              <div className="profile-info-item">
                <span className="profile-info-label">{t('profile.two_factor')}</span>
                <span className="profile-info-value">
                  {user.twoFactorEnabled ? `✅ ${t('profile.enabled')}` : `❌ ${t('profile.disabled')}`}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">{t('profile.email_verified')}</span>
                <span className="profile-info-value">
                  {user.emailAddresses[0]?.verification?.status === 'verified'
                    ? `✅ ${t('profile.verified')}`
                    : `⚠️ ${t('profile.not_verified')}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
