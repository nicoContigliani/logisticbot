'use client';

import { ReactNode, useState } from 'react';
import { useAuth, UserButton, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import './dashboard.css';

const DRAWER_WIDTH = 260;

interface DashboardLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  text: string;
  href?: string;
  subItems?: { text: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', href: '/dashboard' },
  {
    text: 'Bot',
    subItems: [
      { text: 'WhatsApp', href: '/dashboard/bot/whatsapp' },
      { text: 'Email', href: '/dashboard/bot/email' },
    ],
  },
  { text: 'Delivery', href: '/dashboard/delivery' },
  { text: 'Profile', href: '/dashboard/profile' },
  { text: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { userId } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div className="drawer-container">
      <div className="drawer-header">
        <div className="logo-icon">🚚</div>
        <h1 className="logo-text">LogisticBot</h1>
      </div>

      <nav className="drawer-nav">
        {menuItems.map((item) => (
          <div key={item.text} className="nav-item-container">
            {item.subItems ? (
              <>
                <button
                  className={`nav-item nav-item-button ${expandedMenu === item.text ? 'expanded' : ''}`}
                  onClick={() => setExpandedMenu(expandedMenu === item.text ? null : item.text)}
                >
                  {item.text}
                  <span className="nav-item-arrow">{expandedMenu === item.text ? '▼' : '▶'}</span>
                </button>
                {expandedMenu === item.text && (
                  <div className="nav-submenu">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.text}
                        href={subItem.href}
                        className="nav-subitem"
                      >
                        {subItem.text}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href!}
                className="nav-item"
              >
                {item.text}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="drawer-footer">
        <SignOutButton>
          <button className="logout-button">
            Logout
          </button>
        </SignOutButton>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div 
          className="drawer-backdrop"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Mobile drawer */}
      <div className={`drawer-mobile ${mobileOpen ? 'drawer-open' : ''}`}>
        {drawer}
      </div>

      {/* Desktop drawer */}
      <div className="drawer-desktop">
        {drawer}
      </div>

      {/* Main content */}
      <div className="main-content">
        <header className="app-bar">
          <button
            className="menu-button"
            onClick={handleDrawerToggle}
          >
            ☰
          </button>
          <div className="app-bar-title">Dashboard</div>
          <div className="user-button">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
