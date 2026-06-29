import { Link } from 'react-router-dom';
import { AlertTriangle, Info, AlertCircle, ArrowRight, Bell } from 'lucide-react';

const AlertsSection = ({ alerts }) => {
  const recentAlerts = alerts.filter(a => !a.is_read).slice(0, 3);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={20} className="text-accent-danger" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-accent-warning" />;
      case 'info':
        return <Info size={20} className="text-accent-primary" />;
      default:
        return <Info size={20} className="text-txt-muted" />;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-accent-danger/5 border-accent-danger/20 hover:border-accent-danger/40';
      case 'warning':
        return 'bg-accent-warning/5 border-accent-warning/20 hover:border-accent-warning/40';
      case 'info':
        return 'bg-accent-primary/5 border-accent-primary/20 hover:border-accent-primary/40';
      default:
        return 'bg-fintech-secondary border-white/10 hover:border-white/20';
    }
  };

  const getAlertIconBg = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-accent-danger/20';
      case 'warning':
        return 'bg-accent-warning/20';
      case 'info':
        return 'bg-accent-primary/20';
      default:
        return 'bg-white/10';
    }
  };

  const getSeverityBadge = (type) => {
    switch (type) {
      case 'danger':
        return <span className="text-[10px] font-semibold text-accent-danger bg-accent-danger/10 px-2 py-0.5 rounded-full border border-accent-danger/20">Critical</span>;
      case 'warning':
        return <span className="text-[10px] font-semibold text-accent-warning bg-accent-warning/10 px-2 py-0.5 rounded-full border border-accent-warning/20">Warning</span>;
      case 'info':
        return <span className="text-[10px] font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full border border-accent-primary/20">Info</span>;
      default:
        return null;
    }
  };

  if (recentAlerts.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Bell size={20} className="text-accent-primary" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary">Active Alerts</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-slate-600 dark:text-txt-secondary">No active alerts</p>
          <p className="text-sm text-slate-400 dark:text-txt-muted mt-1">You're doing great!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Bell size={20} className="text-accent-primary" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary">Active Alerts</h3>
        </div>
        <Link
          to="/alerts"
          className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium flex items-center gap-1.5 bg-accent-primary/10 px-3 py-1.5 rounded-lg border border-accent-primary/20 transition-all"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {recentAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${getAlertStyles(alert.alert_type)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${getAlertIconBg(alert.alert_type)}`}>
                {getAlertIcon(alert.alert_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getSeverityBadge(alert.alert_type)}
                </div>
                <p className="text-sm text-slate-600 dark:text-txt-secondary">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsSection;
