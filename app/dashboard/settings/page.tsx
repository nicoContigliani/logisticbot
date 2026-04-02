'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useI18n } from '@/lib/i18n/useI18n';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const { theme, setTheme } = useAppStore();
  const { t, locale, setLocale } = useI18n();
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedNotif = localStorage.getItem('logisticbot-notifications');
    if (storedNotif !== null) setNotifications(storedNotif === 'true');
    const storedRefresh = localStorage.getItem('logisticbot-auto-refresh');
    if (storedRefresh !== null) setAutoRefresh(storedRefresh === 'true');
  }, []);

  const handleSave = () => {
    localStorage.setItem('logisticbot-notifications', String(notifications));
    localStorage.setItem('logisticbot-auto-refresh', String(autoRefresh));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!isLoaded) {
    return (
      <div className="settings-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">{t('settings.title')}</h1>
        <p className="settings-subtitle">{t('settings.subtitle')}</p>
      </div>

      {saved && (
        <div className="settings-toast">
          ✅ {t('settings.saved')}
        </div>
      )}

      <div className="settings-grid">
        {/* Appearance */}
        <div className="settings-card">
          <h3 className="settings-card-title">{t('settings.appearance')}</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <span className="settings-option-label">{t('settings.theme')}</span>
              <span className="settings-option-desc">{t('settings.theme_desc')}</span>
            </div>
            <div className="settings-theme-buttons">
              <button
                className={`settings-theme-btn ${theme === 'light' ? 'settings-theme-btn-active' : ''}`}
                onClick={() => setTheme('light')}
              >
                ☀️ {t('settings.light')}
              </button>
              <button
                className={`settings-theme-btn ${theme === 'dark' ? 'settings-theme-btn-active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                🌙 {t('settings.dark')}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-card">
          <h3 className="settings-card-title">{t('settings.preferences')}</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <span className="settings-option-label">{t('settings.language')}</span>
              <span className="settings-option-desc">{t('settings.language_desc')}</span>
            </div>
            <select
              className="settings-select"
              value={locale}
              onChange={(e) => setLocale(e.target.value as 'es' | 'en')}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="settings-divider" />
          <div className="settings-option">
            <div className="settings-option-info">
              <span className="settings-option-label">{t('settings.notifications')}</span>
              <span className="settings-option-desc">{t('settings.notifications_desc')}</span>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="settings-toggle-slider" />
            </label>
          </div>
          <div className="settings-divider" />
          <div className="settings-option">
            <div className="settings-option-info">
              <span className="settings-option-label">{t('settings.auto_refresh')}</span>
              <span className="settings-option-desc">{t('settings.auto_refresh_desc')}</span>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span className="settings-toggle-slider" />
            </label>
          </div>
        </div>

        {/* Account */}
        <div className="settings-card">
          <h3 className="settings-card-title">{t('settings.account')}</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <span className="settings-option-label">{t('common.profile')}</span>
              <span className="settings-option-desc">
                {user?.firstName || 'User'} - {user?.emailAddresses[0]?.emailAddress || 'No email'}
              </span>
            </div>
            <button className="settings-action-btn" onClick={() => openUserProfile()}>
              {t('settings.profile_manage')}
            </button>
          </div>
          <div className="settings-divider" />
          <div className="settings-option">
            <div className="settings-option-info">
              <span className="settings-option-label">{t('settings.security')}</span>
              <span className="settings-option-desc">{t('settings.security_desc')}</span>
            </div>
            <button className="settings-action-btn" onClick={() => openUserProfile()}>
              {t('settings.configure')}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-save-section">
          <button className="settings-save-btn" onClick={handleSave}>
            {t('settings.save_changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
