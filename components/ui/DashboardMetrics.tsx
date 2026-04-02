'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useI18n } from '@/lib/i18n/useI18n';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  Legend, AreaChart, Area,
} from 'recharts';

interface MetricsSummary {
  totalDeliveries: number;
  totalBroadcasts: number;
  totalLogistics: number;
  sentBroadcasts: number;
  errorBroadcasts: number;
  successRate: number;
}

interface DayData {
  date: string;
  totalRows: number;
  uploads: number;
}

interface BroadcastDayData {
  date: string;
  total: number;
  sent: number;
  error: number;
}

interface ShiftData {
  shift: string;
  count: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface DeliveryPersonData {
  name: string;
  totalBroadcasts: number;
  totalClients: number;
}

interface MetricsData {
  success: boolean;
  summary: MetricsSummary;
  deliveriesByDay: DayData[];
  broadcastStats: StatusData[];
  broadcastByShift: ShiftData[];
  broadcastsByDay: BroadcastDayData[];
  deliveryPersonStats: DeliveryPersonData[];
  logisticsStats: StatusData[];
}

const COLORS = ['#0078d4', '#107c10', '#f59e0b', '#d32f2f', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS: Record<string, string> = {
  sent: '#107c10',
  error: '#d32f2f',
  pending: '#f59e0b',
};

export default function DashboardMetrics() {
  const { user } = useUser();
  const { t } = useI18n();
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/metrics');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch metrics');
      }

      setData(result);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="metrics-container">
        <div className="metrics-loading">
          <div className="profile-spinner" />
          <span>{t('metrics.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-container">
        <div className="metrics-error">
          <span className="metrics-error-icon">⚠️</span>
          <h3>{t('metrics.failed')}</h3>
          <p>{error}</p>
          <button className="metrics-retry-btn" onClick={fetchMetrics}>
            {t('metrics.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="metrics-container">
        <div className="metrics-empty">
          <span className="metrics-empty-icon">📊</span>
          <h3>{t('metrics.no_data')}</h3>
          <p>{t('metrics.start_using')}</p>
        </div>
      </div>
    );
  }

  const hasAnyData =
    data.summary.totalBroadcasts > 0 ||
    data.summary.totalDeliveries > 0 ||
    data.summary.totalLogistics > 0;

  if (!hasAnyData) {
    return (
      <div className="metrics-container">
        <div className="metrics-empty">
          <span className="metrics-empty-icon">📊</span>
          <h3>{t('metrics.no_data')}</h3>
          <p>{t('metrics.start_using')}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <h2 className="metrics-title">{t('metrics.title')}</h2>
        <button className="metrics-retry-btn" onClick={fetchMetrics}>
          {t('metrics.refresh')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics-summary-grid">
        <div className="metrics-summary-card">
          <span className="metrics-summary-label">{t('metrics.total_broadcasts')}</span>
          <span className="metrics-summary-value">{data.summary.totalBroadcasts}</span>
        </div>
        <div className="metrics-summary-card">
          <span className="metrics-summary-label">{t('metrics.sent')}</span>
          <span className="metrics-summary-value metrics-value-green">{data.summary.sentBroadcasts}</span>
        </div>
        <div className="metrics-summary-card">
          <span className="metrics-summary-label">{t('metrics.error')}</span>
          <span className="metrics-summary-value metrics-value-red">{data.summary.errorBroadcasts}</span>
        </div>
        <div className="metrics-summary-card">
          <span className="metrics-summary-label">{t('metrics.success_rate')}</span>
          <span className="metrics-summary-value metrics-value-blue">{data.summary.successRate}%</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="metrics-charts-grid">
        {data.deliveriesByDay.length > 0 && (
          <div className="metrics-chart-card">
            <h3 className="metrics-chart-title">{t('metrics.deliveries_by_day')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.deliveriesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ border: 'none', boxShadow: 'var(--shadow-md)', borderRadius: 0, background: 'var(--color-bg-secondary)' }} />
                <Area type="monotone" dataKey="totalRows" stroke="#0078d4" fill="#0078d4" fillOpacity={0.15} name="Rows" />
                <Area type="monotone" dataKey="uploads" stroke="#107c10" fill="#107c10" fillOpacity={0.1} name="Uploads" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.broadcastStats.length > 0 && (
          <div className="metrics-chart-card">
            <h3 className="metrics-chart-title">{t('metrics.broadcast_status')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.broadcastStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${t('metrics.' + (status || '')) || status}: ${count}`}
                >
                  {data.broadcastStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.broadcastsByDay.length > 0 && (
          <div className="metrics-chart-card">
            <h3 className="metrics-chart-title">{t('metrics.broadcast_status')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.broadcastsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ border: 'none', boxShadow: 'var(--shadow-md)', borderRadius: 0, background: 'var(--color-bg-secondary)' }} />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#107c10" strokeWidth={2} name={t('metrics.sent')} />
                <Line type="monotone" dataKey="error" stroke="#d32f2f" strokeWidth={2} name={t('metrics.error')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.broadcastByShift.length > 0 && (
          <div className="metrics-chart-card">
            <h3 className="metrics-chart-title">{t('metrics.shift_distribution')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.broadcastByShift.map(s => ({
                ...s,
                name: s.shift === 'morning' ? t('metrics.morning') : t('metrics.afternoon'),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ border: 'none', boxShadow: 'var(--shadow-md)', borderRadius: 0, background: 'var(--color-bg-secondary)' }} />
                <Bar dataKey="count" name={t('metrics.total_broadcasts')}>
                  <Cell fill="#f59e0b" />
                  <Cell fill="#8b5cf6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.deliveryPersonStats.length > 0 && (
          <div className="metrics-chart-card metrics-chart-wide">
            <h3 className="metrics-chart-title">{t('metrics.delivery_performance')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.deliveryPersonStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ border: 'none', boxShadow: 'var(--shadow-md)', borderRadius: 0, background: 'var(--color-bg-secondary)' }} />
                <Legend />
                <Bar dataKey="totalClients" name={t('metrics.total_clients')} fill="#0078d4" />
                <Bar dataKey="totalBroadcasts" name={t('metrics.total_broadcasts')} fill="#107c10" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
