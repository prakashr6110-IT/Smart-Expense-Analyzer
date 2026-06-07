import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import {
  Bell, AlertTriangle, Info, AlertCircle, Check, Trash2, Copy, ExternalLink,
  CheckCircle, Filter, Brain, TrendingUp, Shield, X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ALERT_CATEGORIES = {
  warning: { label: 'Warning', color: 'yellow', icon: AlertTriangle },
  danger: { label: 'Critical', color: 'red', icon: AlertCircle },
  info: { label: 'Info', color: 'blue', icon: Info },
  success: { label: 'Success', color: 'green', icon: CheckCircle },
  prediction: { label: 'Prediction', color: 'purple', icon: TrendingUp },
  behavior: { label: 'Behavior', color: 'indigo', icon: Brain },
};

const Alerts = () => {
  const { alerts, markAlertAsRead, markAllAlertsAsRead, deleteAlert, deleteReadAlerts, loading } = useExpenses();
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSingle, setShowDeleteSingle] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);

  const DELETE_POLICY_SQL = `CREATE POLICY "Users can delete own alerts" ON public.alerts FOR DELETE USING (auth.uid() = user_id);`;

  const unreadAlertsCount = alerts.filter(a => !a.is_read).length;
  const readAlertsCount = alerts.filter(a => a.is_read).length;

  const handleDeleteRead = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteReadAlerts();
      setShowDeleteConfirm(false);
    } catch (error) {
      setDeleteError('RLS_MISSING');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (alertId) => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAlert(alertId);
      setShowDeleteSingle(null);
    } catch (error) {
      setDeleteError('RLS_MISSING');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkAllRead = async () => {
    try { await markAllAlertsAsRead(); } catch (error) { console.error('Error marking all as read:', error); }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'danger': return { bg: 'bg-accent-danger/5', border: 'border-accent-danger/20 hover:border-accent-danger/40', iconBg: 'bg-accent-danger/20', iconColor: 'text-accent-danger', badge: 'bg-accent-danger text-white', badgeLabel: 'CRITICAL' };
      case 'warning': return { bg: 'bg-accent-warning/5', border: 'border-accent-warning/20 hover:border-accent-warning/40', iconBg: 'bg-accent-warning/20', iconColor: 'text-accent-warning', badge: 'bg-accent-warning text-white', badgeLabel: 'WARNING' };
      case 'info': return { bg: 'bg-accent-primary/5', border: 'border-accent-primary/20 hover:border-accent-primary/40', iconBg: 'bg-accent-primary/20', iconColor: 'text-accent-primary', badge: 'bg-accent-primary text-white', badgeLabel: 'INFO' };
      case 'success': return { bg: 'bg-accent-success/5', border: 'border-accent-success/20 hover:border-accent-success/40', iconBg: 'bg-accent-success/20', iconColor: 'text-accent-success', badge: 'bg-accent-success text-white', badgeLabel: 'SUCCESS' };
      case 'prediction': return { bg: 'bg-accent-insights/5', border: 'border-accent-insights/20 hover:border-accent-insights/40', iconBg: 'bg-accent-insights/20', iconColor: 'text-accent-insights', badge: 'bg-accent-insights text-white', badgeLabel: 'PREDICTION' };
      case 'behavior': return { bg: 'bg-accent-primary/5', border: 'border-accent-primary/20 hover:border-accent-primary/40', iconBg: 'bg-accent-primary/20', iconColor: 'text-accent-primary', badge: 'bg-accent-primary text-white', badgeLabel: 'BEHAVIOR' };
      default: return { bg: 'bg-fintech-secondary', border: 'border-white/10 hover:border-white/20', iconBg: 'bg-white/10', iconColor: 'text-txt-muted', badge: 'bg-txt-muted text-white', badgeLabel: 'NOTICE' };
    }
  };

  const classifyAlert = (alert) => {
    const msg = (alert.message || '').toLowerCase();
    if (msg.includes('predict') || msg.includes('forecast') || msg.includes('may') || msg.includes('trend')) return 'prediction';
    if (msg.includes('usually') || msg.includes('pattern') || msg.includes('habit') || msg.includes('spend most')) return 'behavior';
    return alert.alert_type || 'info';
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.is_read;
    if (filter === 'read') return alert.is_read;
    return true;
  }).filter(alert => {
    if (typeFilter === 'all') return true;
    const category = classifyAlert(alert);
    return category === typeFilter;
  });

  const typeCounts = {};
  alerts.forEach(alert => {
    const cat = classifyAlert(alert);
    typeCounts[cat] = (typeCounts[cat] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-fintech-bg flex items-center justify-center">
        <p className="text-txt-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fintech-bg transition-colors duration-300">
      <Sidebar />
      <div className="lg:ml-64">
        <TopBar />
        <main className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <Bell size={24} className="text-accent-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-txt-primary">Alerts</h2>
                <p className="text-sm text-txt-muted">
                  {unreadAlertsCount > 0 ? `${unreadAlertsCount} unread alert${unreadAlertsCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {unreadAlertsCount > 0 && (
                <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-3 py-2 bg-accent-success hover:bg-accent-success/80 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-accent-success/20">
                  <Check size={16} /> Mark All Read
                </button>
              )}
              {readAlertsCount > 0 && (
                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-3 py-2 bg-accent-danger hover:bg-accent-danger/80 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-accent-danger/20">
                  <Trash2 size={16} /> Delete Read ({readAlertsCount})
                </button>
              )}
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-txt-muted mb-2">Status</label>
                <div className="flex items-center space-x-1 bg-fintech-secondary rounded-xl p-1 border border-white/5">
                  {['all', 'unread', 'read'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filter === f ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30' : 'text-txt-secondary hover:bg-white/5'
                      }`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                      {f === 'unread' && unreadAlertsCount > 0 && <span className="ml-1 text-xs">({unreadAlertsCount})</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-txt-muted mb-2">Alert Type</label>
                <div className="flex items-center gap-1 flex-wrap">
                  <button onClick={() => setTypeFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      typeFilter === 'all' ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30' : 'bg-fintech-secondary text-txt-secondary hover:bg-white/5 border border-white/5'
                    }`}>
                    All
                  </button>
                  {Object.entries(ALERT_CATEGORIES).map(([key, cat]) => {
                    const count = typeCounts[key] || 0;
                    if (count === 0) return null;
                    const Icon = cat.icon;
                    return (
                      <button key={key} onClick={() => setTypeFilter(key)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          typeFilter === key ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30' : 'bg-fintech-secondary text-txt-secondary hover:bg-white/5 border border-white/5'
                        }`}>
                        <Icon size={14} /> {cat.label} <span className="text-xs opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Read Confirmation Modal */}
          {showDeleteConfirm && (
            <ConfirmModal title="Delete Read Alerts"
              message={<>Are you sure you want to delete <span className="font-semibold text-accent-danger">{readAlertsCount}</span> read alert{readAlertsCount !== 1 ? 's' : ''}? This action cannot be undone.</>}
              deleteError={deleteError} deleting={deleting} sqlCopied={sqlCopied} setSqlCopied={setSqlCopied}
              DELETE_POLICY_SQL={DELETE_POLICY_SQL}
              onCancel={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
              onConfirm={handleDeleteRead} />
          )}

          {/* Delete Single Confirmation Modal */}
          {showDeleteSingle && (
            <ConfirmModal title="Delete Alert"
              message="Are you sure you want to delete this alert? This action cannot be undone."
              deleteError={deleteError} deleting={deleting} sqlCopied={sqlCopied} setSqlCopied={setSqlCopied}
              DELETE_POLICY_SQL={DELETE_POLICY_SQL}
              onCancel={() => { setShowDeleteSingle(null); setDeleteError(''); }}
              onConfirm={() => handleDeleteSingle(showDeleteSingle)} />
          )}

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <div className="card text-center py-12">
              <Bell size={48} className="mx-auto text-txt-muted mb-4" />
              <p className="text-txt-secondary text-lg">No alerts to display</p>
              <p className="text-sm text-txt-muted mt-2">
                {filter === 'all' && typeFilter === 'all' ? 'Alerts will appear here when detected' : `No ${filter !== 'all' ? filter : ''} ${typeFilter !== 'all' ? typeFilter : ''} alerts`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const category = classifyAlert(alert);
                const styles = getAlertStyles(category);
                const Icon = ALERT_CATEGORIES[category]?.icon || Info;

                return (
                  <div key={alert.id}
                    className={`card border-l-4 ${styles.bg} ${styles.border} ${alert.is_read ? 'opacity-60' : ''} transition-all duration-300 hover:shadow-lg`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start flex-1 gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
                          <Icon size={20} className={styles.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${styles.badge}`}>
                              {ALERT_CATEGORIES[category]?.label || 'NOTICE'}
                            </span>
                            {alert.is_read && <span className="text-xs text-txt-muted italic">Read</span>}
                          </div>
                          <p className="text-txt-secondary font-medium">{alert.message}</p>
                          <p className="text-xs text-txt-muted mt-2">
                            {format(parseISO(alert.created_at), 'MMM dd, yyyy • hh:mm a')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alert.is_read && (
                          <button onClick={() => markAlertAsRead(alert.id)}
                            className="p-2 bg-accent-success/10 text-accent-success rounded-lg hover:bg-accent-success/20 transition-colors border border-accent-success/20"
                            title="Mark as read">
                            <Check size={16} />
                          </button>
                        )}
                        <button onClick={() => setShowDeleteSingle(alert.id)}
                          className="p-2 bg-accent-danger/10 text-accent-danger rounded-lg hover:bg-accent-danger/20 transition-colors border border-accent-danger/20"
                          title="Delete alert">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const ConfirmModal = ({
  title, message, deleteError, deleting, sqlCopied, setSqlCopied,
  DELETE_POLICY_SQL, onCancel, onConfirm
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className={`bg-fintech-card rounded-2xl shadow-2xl p-6 mx-4 w-full border border-white/10 ${deleteError ? 'max-w-md' : 'max-w-sm'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-danger/20">
          <Trash2 size={20} className="text-accent-danger" />
        </div>
        <h3 className="text-lg font-heading font-bold text-txt-primary">{title}</h3>
      </div>
      <p className="text-txt-secondary mb-6">{message}</p>

      {deleteError && (
        <div className="mb-4 p-4 bg-accent-warning/10 border border-accent-warning/20 rounded-xl">
          <p className="text-sm font-semibold text-accent-warning mb-3">
            Database fix needed — a DELETE policy is missing. Do this once:
          </p>
          <div className="bg-fintech-bg rounded-lg p-3 mb-3">
            <code className="text-accent-success text-xs font-mono break-all">{DELETE_POLICY_SQL}</code>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(DELETE_POLICY_SQL); setSqlCopied(true); setTimeout(() => setSqlCopied(false), 3000); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sqlCopied ? 'bg-accent-success text-white' : 'bg-accent-primary text-white hover:bg-accent-primary/80'
              }`}>
              {sqlCopied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy SQL</>}
            </button>
            <a href="https://supabase.com/dashboard/project/_/sql/new" target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent-success hover:bg-accent-success/80 text-white rounded-lg text-sm font-medium transition-all">
              <ExternalLink size={14} /> Open Supabase
            </a>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 px-4 py-2 border border-white/10 text-txt-secondary rounded-xl font-medium hover:bg-white/5 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 px-4 py-2 bg-accent-danger hover:bg-accent-danger/80 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
          {deleting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
          ) : (
            <><Trash2 size={16} /> Delete</>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default Alerts;
