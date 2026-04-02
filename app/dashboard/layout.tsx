'use client';

import { ReactNode, useState } from 'react';
import { UserButton, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/useI18n';
import './dashboard.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  textKey: string;
  defaultText: string;
  href?: string;
  subItems?: { textKey: string; defaultText: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { textKey: 'nav.dashboard', defaultText: 'Dashboard', href: '/dashboard' },
  {
    textKey: 'nav.bot',
    defaultText: 'Bot',
    subItems: [
      { textKey: 'nav.whatsapp', defaultText: 'WhatsApp', href: '/dashboard/bot/whatsapp' },
      { textKey: 'nav.email', defaultText: 'Email', href: '/dashboard/bot/email' },
    ],
  },
  { textKey: 'nav.delivery', defaultText: 'Delivery', href: '/dashboard/delivery' },
  { textKey: 'nav.profile', defaultText: 'Profile', href: '/dashboard/profile' },
  { textKey: 'nav.settings', defaultText: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('nav.bot');

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const isActive = (href?: string) => href ? pathname === href : false;

  const translate = (key: string, fallback: string) => {
    const result = t(key);
    return result === key ? fallback : result;
  };

  const drawer = (
    <div className="drawer-container">
      <div className="drawer-header">
        <div className="logo-icon">🚚</div>
        <h1 className="logo-text">LogisticBot</h1>
      </div>

      <nav className="drawer-nav">
        {menuItems.map((item) => (
          <div key={item.textKey} className="nav-item-container">
            {item.subItems ? (
              <>
                <button
                  className={`nav-item nav-item-button ${expandedMenu === item.textKey ? 'expanded' : ''}`}
                  onClick={() => setExpandedMenu(expandedMenu === item.textKey ? null : item.textKey)}
                >
                  {translate(item.textKey, item.defaultText)}
                  <span className="nav-item-arrow">{expandedMenu === item.textKey ? '▼' : '▶'}</span>
                </button>
                {expandedMenu === item.textKey && (
                  <div className="nav-submenu">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.textKey}
                        href={subItem.href}
                        className={`nav-subitem ${isActive(subItem.href) ? 'nav-subitem-active' : ''}`}
                      >
                        {translate(subItem.textKey, subItem.defaultText)}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href!}
                className={`nav-item ${isActive(item.href) ? 'nav-item-active' : ''}`}
              >
                {translate(item.textKey, item.defaultText)}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="drawer-footer">
        <SignOutButton>
          <button className="logout-button">
            {translate('common.logout', 'Logout')}
          </button>
        </SignOutButton>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {mobileOpen && (
        <div className="drawer-backdrop" onClick={handleDrawerToggle} />
      )}

      <div className={`drawer-mobile ${mobileOpen ? 'drawer-open' : ''}`}>
        {drawer}
      </div>

      <div className="drawer-desktop">
        {drawer}
      </div>

      <div className="main-content">
        <header className="app-bar">
          <button className="menu-button" onClick={handleDrawerToggle}>
            ☰
          </button>
          <div className="app-bar-title">{translate('common.dashboard', 'Dashboard')}</div>
          <div className="app-bar-actions">
            <button
              className="lang-switch"
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
              title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              {locale === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
            </button>
            <div className="user-button">
              <UserButton />
            </div>
          </div>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
