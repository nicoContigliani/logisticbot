'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';

const features = [
  {
    icon: '🚚',
    title: 'Fleet Management',
    description: 'Real-time tracking of trucks and drones with route optimization',
    color: '#4a5568',
  },
  {
    icon: '📦',
    title: 'Inventory Control',
    description: 'AI-powered inventory management with predictive restocking',
    color: '#2d3748',
  },
  {
    icon: '🔄',
    title: 'Supply Chain',
    description: 'End-to-end visibility with disruption alerts and mitigation',
    color: '#718096',
  },
  {
    icon: '📊',
    title: 'Analytics Engine',
    description: 'Advanced analytics with machine learning insights',
    color: '#1a202c',
  },
];

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const handleGetStarted = () => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        {/* HUD Grid Overlay */}
        <div className="hud-grid" />
        
        {/* Holographic Particles */}
        <div className="holographic-particles">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>

        {/* HUD Corner Elements */}
        <div className="hud-corners">
          <div className="hud-corner top-left" />
          <div className="hud-corner top-right" />
          <div className="hud-corner bottom-left" />
          <div className="hud-corner bottom-right" />
        </div>

        {/* HUD Status Lines */}
        <div className="hud-status-lines">
          <div className="status-line left" />
          <div className="status-line right" />
        </div>

        <div className="hero-content">
          <div className="hero-grid">
            <div className="hero-text">
              <div className="hero-logo">
                <div className="logo-box">
                  <span className="logo-icon">📐</span>
                </div>
                <h1 className="logo-text">LogisticBot</h1>
              </div>
              <div className="hud-badge">
                <span className="badge-text">LOGISTICS COMMAND CENTER</span>
                <span className="badge-version">v3.0</span>
              </div>
              <h2 className="hero-title">
                Precision Logistics,<br />
                <span className="title-accent">Engineered for Efficiency</span>
              </h2>
              <p className="hero-description">
                Advanced warehouse management and logistics optimization platform. 
                Visualize your operations like never before with intelligent floor planning, 
                real-time tracking, and data-driven decision making.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={handleGetStarted}>
                  {isSignedIn ? 'Go to Dashboard' : 'Start Free Trial'}
                </button>
                {!isSignedIn && (
                  <Link href="/sign-in" className="btn-secondary">
                    Sign In
                  </Link>
                )}
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Warehouses</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">99.9%</span>
                  <span className="stat-label">Uptime</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hud-display">
                {/* HUD Display Container */}
                <div className="hud-frame">
                  {/* HUD Header */}
                  <div className="hud-header">
                    <div className="hud-title">LOGISTICS COMMAND CENTER</div>
                    <div className="hud-status online">● SYSTEM ONLINE</div>
                  </div>
                  
                  {/* HUD Main Display */}
                  <div className="hud-main">
                    {/* Global Map with Holographic Effect */}
                    <div className="hud-global-map">
                      <div className="map-glow" />
                      <div className="map-grid">
                        {/* Map Points */}
                        <div className="map-point" style={{ left: '20%', top: '30%' }}>
                          <div className="point-pulse" />
                          <div className="point-label">NYC</div>
                        </div>
                        <div className="map-point" style={{ left: '45%', top: '25%' }}>
                          <div className="point-pulse" />
                          <div className="point-label">LON</div>
                        </div>
                        <div className="map-point" style={{ left: '70%', top: '35%' }}>
                          <div className="point-pulse" />
                          <div className="point-label">TKY</div>
                        </div>
                        <div className="map-point" style={{ left: '30%', top: '60%' }}>
                          <div className="point-pulse" />
                          <div className="point-label">SYD</div>
                        </div>
                        {/* Connection Lines */}
                        <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="20" y1="30" x2="45" y2="25" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.5" />
                          <line x1="45" y1="25" x2="70" y2="35" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.5" />
                          <line x1="20" y1="30" x2="30" y2="60" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.5" />
                          <line x1="70" y1="35" x2="30" y2="60" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.5" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Arched Data Panels */}
                    <div className="hud-panels">
                      {/* Left Panel - Fleet in Route */}
                      <div className="hud-panel left-panel">
                        <div className="panel-arch" />
                        <div className="panel-header">
                          <span className="panel-icon">🚚</span>
                          <span>FLEET IN ROUTE</span>
                        </div>
                        <div className="panel-content">
                          <div className="fleet-item">
                            <span className="fleet-icon">🚛</span>
                            <span className="fleet-count">247</span>
                            <span className="fleet-label">Trucks</span>
                          </div>
                          <div className="fleet-item">
                            <span className="fleet-icon">✈️</span>
                            <span className="fleet-count">89</span>
                            <span className="fleet-label">Drones</span>
                          </div>
                          <div className="fleet-item">
                            <span className="fleet-icon">🚢</span>
                            <span className="fleet-count">34</span>
                            <span className="fleet-label">Ships</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Center Panel - AI Status */}
                      <div className="hud-panel center-panel">
                        <div className="panel-arch" />
                        <div className="panel-header">
                          <span className="panel-icon">🤖</span>
                          <span>LOGISTICS AI</span>
                        </div>
                        <div className="panel-content">
                          <div className="ai-status">
                            <div className="ai-name">LlakaB</div>
                            <div className="ai-status-text">OPERATIONAL</div>
                            <div className="ai-metrics">
                              <div className="metric">
                                <span className="metric-label">Efficiency</span>
                                <span className="metric-value">98.7%</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">Accuracy</span>
                                <span className="metric-value">99.9%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Panel - Route Optimization */}
                      <div className="hud-panel right-panel">
                        <div className="panel-arch" />
                        <div className="panel-header">
                          <span className="panel-icon">⚡</span>
                          <span>ROUTE OPTIMIZATION</span>
                        </div>
                        <div className="panel-content">
                          <div className="optimization-dial">
                            <div className="dial-ring" />
                            <div className="dial-center">
                              <div className="dial-value">94%</div>
                              <div className="dial-label">OPTIMIZED</div>
                            </div>
                          </div>
                          <div className="optimization-stats">
                            <div className="opt-stat">
                              <span className="opt-label">Saved</span>
                              <span className="opt-value">2.4M</span>
                            </div>
                            <div className="opt-stat">
                              <span className="opt-label">Time</span>
                              <span className="opt-value">-18%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Weight/Load Analysis */}
                    <div className="hud-analysis">
                      <div className="analysis-header">
                        <span className="analysis-icon">📊</span>
                        <span>WEIGHT/LOAD ANALYSIS</span>
                      </div>
                      <div className="analysis-chart">
                        <div className="chart-bar" style={{ height: '60%' }}>
                          <span className="bar-label">Mon</span>
                        </div>
                        <div className="chart-bar" style={{ height: '80%' }}>
                          <span className="bar-label">Tue</span>
                        </div>
                        <div className="chart-bar" style={{ height: '45%' }}>
                          <span className="bar-label">Wed</span>
                        </div>
                        <div className="chart-bar" style={{ height: '90%' }}>
                          <span className="bar-label">Thu</span>
                        </div>
                        <div className="chart-bar" style={{ height: '70%' }}>
                          <span className="bar-label">Fri</span>
                        </div>
                        <div className="chart-bar" style={{ height: '55%' }}>
                          <span className="bar-label">Sat</span>
                        </div>
                        <div className="chart-bar" style={{ height: '85%' }}>
                          <span className="bar-label">Sun</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Supply Chain Alert */}
                    <div className="hud-alert">
                      <div className="alert-icon">⚠️</div>
                      <div className="alert-content">
                        <div className="alert-title">SUPPLY CHAIN DISRUPTION</div>
                        <div className="alert-message">Minor delay detected in Route #47. AI rerouting in progress.</div>
                      </div>
                      <div className="alert-status">MITIGATING</div>
                    </div>
                  </div>
                  
                  {/* HUD Footer */}
                  <div className="hud-footer">
                    <div className="footer-item">
                      <span className="footer-label">SCALE:</span>
                      <span className="footer-value">1:100</span>
                    </div>
                    <div className="footer-item">
                      <span className="footer-label">DRAWING:</span>
                      <span className="footer-value">FLOOR PLAN</span>
                    </div>
                    <div className="footer-item">
                      <span className="footer-label">PROJECT:</span>
                      <span className="footer-value">LOGISTICBOT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-content">
          <div className="features-header">
            <div className="section-badge">SYSTEM MODULES</div>
            <h2 className="section-title">
              Integrated Logistics Solutions
            </h2>
            <p className="section-description">
              Comprehensive modules designed to optimize every aspect of your warehouse and logistics operations
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
                <div className="feature-connector" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        {/* HUD Grid */}
        <div className="hud-grid" />
        
        {/* HUD Technical Elements */}
        <div className="cta-hud">
          <div className="hud-readout">
            <span className="readout-label">SYSTEM STATUS:</span>
            <span className="readout-value online">OPERATIONAL</span>
          </div>
          <div className="hud-readout">
            <span className="readout-label">AVAILABILITY:</span>
            <span className="readout-value">99.99%</span>
          </div>
          <div className="hud-readout">
            <span className="readout-label">RESPONSE TIME:</span>
            <span className="readout-value">{'<50ms'}</span>
          </div>
        </div>

        <div className="cta-content">
          <h2 className="cta-title">
            Ready to Optimize Your Operations?
          </h2>
          <p className="cta-description">
            Join leading companies using LogisticBot to transform their logistics infrastructure
          </p>
          <button className="btn-primary btn-large" onClick={handleGetStarted}>
            {isSignedIn ? 'Go to Dashboard' : 'Request Demo'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-icon">📐</span>
            <span className="footer-logo">LogisticBot</span>
          </div>
          <div className="footer-center">
            <span className="footer-tagline">Precision Logistics Engineering</span>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()} LogisticBot. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
