import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/UI/Footer';
import UserAvatar, { getUserDisplayName } from '../components/Common/UserAvatar';
import { User, IndianRupee, Calendar, Save, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw, Database, Mail, Shield, Pencil, X, Phone, MapPin, Briefcase } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Full SQL migration content embedded for easy copy
const MIGRATION_SQL = `-- Smart Expense Behavior Analyzer - COMPLETE Setup (All-in-One)
-- Run this ENTIRE script in your Supabase SQL Editor

DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  monthly_budget DECIMAL(10, 2) DEFAULT 10000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  expense_type TEXT DEFAULT 'necessary',
  expense_date DATE NOT NULL,
  expense_time TIME NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  predicted_amount DECIMAL(10, 2) NOT NULL,
  prediction_month DATE NOT NULL,
  confidence DECIMAL(5, 2),
  predicted_necessary DECIMAL(10, 2),
  predicted_luxury DECIMAL(10, 2),
  financial_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.alerts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own predictions" ON public.predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON public.expenses(user_id, expense_type);
CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON public.alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_insights_user ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON public.predictions(user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, monthly_budget)
  VALUES (NEW.id, NEW.email, 10000.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, monthly_budget)
SELECT id, email, 10000.00
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);
`;

const Profile = () => {
  const { user, profile, updateProfile, updateUserMetadata } = useAuth();
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', location: '', occupation: '', bio: '' });

  useEffect(() => { if (profile?.monthly_budget) setMonthlyBudget(String(profile.monthly_budget)); }, [profile]);
  useEffect(() => {
    if (editOpen && user) {
      const meta = user.user_metadata || {};
      setEditForm({ full_name: meta.full_name || meta.name || '', phone: meta.phone || '', location: meta.location || '', occupation: meta.occupation || '', bio: meta.bio || '' });
    }
  }, [editOpen, user]);

  const handleEditSave = async () => {
    setEditLoading(true); setEditError('');
    try {
      await updateUserMetadata({ full_name: editForm.full_name.trim() || null, phone: editForm.phone.trim() || null, location: editForm.location.trim() || null, occupation: editForm.occupation.trim() || null, bio: editForm.bio.trim() || null });
      setEditSuccess(true); setTimeout(() => { setEditOpen(false); setEditSuccess(false); }, 1200);
    } catch (err) { setEditError(err.message || 'Failed to update profile'); } finally { setEditLoading(false); }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(false);
    const amount = parseFloat(monthlyBudget);
    if (isNaN(amount) || amount <= 0) { setError('Please enter a valid amount greater than 0'); setLoading(false); return; }
    try { await updateProfile({ monthly_budget: amount }); setSuccess(true); setTimeout(() => setSuccess(false), 3000); } catch (err) { setError(err.message || 'Failed to update budget.'); } finally { setLoading(false); }
  };

  if (!user) {
    return (<div className="min-h-screen bg-slate-100 dark:bg-fintech-bg flex items-center justify-center"><p className="text-slate-600 dark:text-txt-secondary text-lg">Please log in to view your profile</p></div>);
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="card bg-accent-warning/5 border-l-4 border-accent-warning">
            <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary mb-4 flex items-center"><Database size={24} className="mr-2 text-accent-warning" /> Database Setup Required</h3>
            <p className="text-slate-600 dark:text-txt-secondary mb-4">Your profile could not be loaded. This usually means the database tables haven't been created yet.</p>
            <div className="bg-slate-200 dark:bg-fintech-secondary p-4 rounded-xl mb-4 border border-slate-200 dark:border-white/10">
              <p className="font-semibold text-slate-800 dark:text-txt-primary mb-3">Step 1: Copy the SQL below</p>
              <pre className="bg-slate-100 dark:bg-fintech-bg text-accent-success text-xs p-4 rounded-lg overflow-auto max-h-40 font-mono">{MIGRATION_SQL.substring(0, 500) + '\n... (click Copy to get full SQL)'}</pre>
              <button onClick={() => { navigator.clipboard.writeText(MIGRATION_SQL); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
                className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${copied ? 'bg-accent-success text-white' : 'bg-accent-primary text-white hover:bg-accent-primary/80'}`}>
                {copied ? <><CheckCircle size={18} /> Copied!</> : <><Copy size={18} /> Copy Full SQL</>}
              </button>
            </div>
            <div className="bg-slate-200 dark:bg-fintech-secondary p-4 rounded-xl mb-4 border border-slate-200 dark:border-white/10">
              <p className="font-semibold text-slate-800 dark:text-txt-primary mb-3">Step 2: Run it in Supabase</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-txt-secondary mb-3">
                <li>Go to your Supabase Dashboard</li><li>Open <strong>SQL Editor</strong></li><li>Click <strong>New Query</strong></li><li>Paste the SQL and click <strong>Run</strong></li>
              </ol>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-success text-white rounded-xl font-semibold text-sm hover:bg-accent-success/80 transition-all">
                <ExternalLink size={16} /> Open Supabase Dashboard
              </a>
            </div>
            <div className="bg-slate-200 dark:bg-fintech-secondary p-4 rounded-xl mb-4 border border-slate-200 dark:border-white/10">
              <p className="font-semibold text-slate-800 dark:text-txt-primary mb-3">Step 3: Refresh this page</p>
              <button onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-xl font-semibold text-sm hover:bg-accent-primary/80 transition-all">
                <RefreshCw size={16} /> Refresh Page
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="p-4 md:p-6 lg:p-8 animate-fade-in flex-1">
            <div className="flex items-center gap-3 mb-6 animate-slide-in-up">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <User size={24} className="text-accent-primary" />
              </div>
              <h2 className="text-h1 font-heading text-slate-800 dark:text-txt-primary">Profile Settings</h2>
            </div>

            {/* Profile Card */}
            <div className="card mb-6 animate-slide-in-up overflow-hidden" style={{ animationDelay: '0.05s' }}>
              <div className="h-24 bg-gradient-to-r from-accent-primary via-accent-insights to-accent-primary relative">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
              </div>
              <div className="flex flex-col items-center -mt-14 pb-6 px-6">
                <div className="relative inline-block">
                  <UserAvatar user={user} profile={profile} size="xl" ringColor="ring-4 ring-fintech-card" className="!shadow-2xl" />
                  <button onClick={() => setEditOpen(true)}
                    className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 bg-accent-primary hover:bg-accent-primary/80 text-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-fintech-card transition-all duration-200 hover:scale-110 group"
                    title="Edit Profile">
                    <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
                <h3 className="mt-4 text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary text-center">{getUserDisplayName(user, profile)}</h3>
                <div className="flex items-center gap-2 mt-1 text-slate-400 dark:text-txt-muted"><Mail size={14} /><span className="text-sm">{user?.email}</span></div>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400 dark:text-txt-muted"><Calendar size={14} /><span>Member Since: {profile.created_at ? format(parseISO(profile.created_at), 'MMMM yyyy') : 'Recently joined'}</span></div>
              </div>
              <div className="grid grid-cols-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex flex-col items-center py-4">
                  <IndianRupee size={18} className="text-accent-primary mb-1" />
                  <span className="text-xs text-slate-400 dark:text-txt-muted">Budget</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-txt-primary">₹{profile.monthly_budget ? profile.monthly_budget.toLocaleString() : '10,000'}</span>
                </div>
                <div className="flex flex-col items-center py-4 border-l border-slate-200 dark:border-white/5">
                  <Shield size={18} className="text-accent-success mb-1" />
                  <span className="text-xs text-slate-400 dark:text-txt-muted">Status</span>
                  <span className="text-sm font-bold text-accent-success">Active</span>
                </div>
              </div>
            </div>

            {/* Budget Settings */}
            <div className="card mb-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary mb-4">Monthly Budget</h3>
              {success && (<div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm"><CheckCircle size={20} /> <span className="font-medium">Budget updated successfully!</span></div>)}
              {error && (<div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm"><AlertCircle size={20} /> <span className="font-medium">{error}</span></div>)}
              <form onSubmit={handleUpdateBudget} className="space-y-4">
                <div>
                  <label htmlFor="monthlyBudget" className="block text-sm font-medium text-slate-600 dark:text-txt-secondary mb-2">Enter Your Monthly Budget (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-txt-muted text-lg font-medium">₹</span>
                    <input type="number" id="monthlyBudget" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)}
                      className="input-field pl-10 text-lg font-semibold" placeholder="15000" step="100" min="0" required />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-txt-muted mt-2">Type your desired monthly spending limit.</p>
                </div>
                <button type="submit" disabled={loading} className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto">
                  {loading ? <span>Saving...</span> : <><Save size={18} className="mr-2" /><span>Save Budget</span></>}
                </button>
              </form>
            </div>

            {/* Statistics */}
            <div className="card animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary mb-4">Account Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-accent-primary/5 rounded-xl p-4 border border-accent-primary/20 transition-all hover:scale-105">
                  <p className="text-sm text-slate-400 dark:text-txt-muted">Current Budget</p>
                  <p className="text-2xl font-bold text-accent-primary mt-1">₹{profile.monthly_budget ? profile.monthly_budget.toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-accent-success/5 rounded-xl p-4 border border-accent-success/20 transition-all hover:scale-105">
                  <p className="text-sm text-slate-400 dark:text-txt-muted">Account Status</p>
                  <p className="text-2xl font-bold text-accent-success mt-1">Active</p>
                </div>
              </div>
            </div>

            {/* Edit Profile Modal */}
            {editOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-fintech-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5">
                    <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary">Edit Profile</h3>
                    <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-txt-muted transition-colors"><X size={20} /></button>
                  </div>
                  <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {editSuccess && (<div className="flex items-center gap-2 px-3 py-2 bg-accent-success/10 text-accent-success rounded-lg text-sm border border-accent-success/20"><CheckCircle size={16} /> Profile updated!</div>)}
                    {editError && (<div className="flex items-center gap-2 px-3 py-2 bg-accent-danger/10 text-accent-danger rounded-lg text-sm border border-accent-danger/20"><AlertCircle size={16} /> {editError}</div>)}
                    {[
                      { icon: User, label: 'Full Name', key: 'full_name', type: 'text', placeholder: getUserDisplayName(user, profile), max: 60, hint: 'Leave blank to use email-derived name' },
                      { icon: Phone, label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210', max: 20 },
                      { icon: MapPin, label: 'Location', key: 'location', type: 'text', placeholder: 'Chennai, India', max: 80 },
                      { icon: Briefcase, label: 'Occupation', key: 'occupation', type: 'text', placeholder: 'Software Engineer', max: 60 },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-txt-secondary mb-1.5"><field.icon size={14} /> {field.label}</label>
                        <input type={field.type} value={editForm[field.key]} onChange={(e) => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder} maxLength={field.max}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-fintech-secondary border border-slate-200 dark:border-white/10 text-slate-800 dark:text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all text-sm placeholder-slate-400 dark:placeholder-txt-muted" />
                        {field.hint && <p className="text-xs text-slate-400 dark:text-txt-muted mt-1">{field.hint}</p>}
                      </div>
                    ))}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-txt-secondary mb-1.5"><User size={14} /> Bio</label>
                      <textarea value={editForm.bio} onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-fintech-secondary border border-slate-200 dark:border-white/10 text-slate-800 dark:text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all text-sm resize-none placeholder-slate-400 dark:placeholder-txt-muted" maxLength={200} />
                      <p className="text-xs text-slate-400 dark:text-txt-muted mt-1 text-right">{editForm.bio.length}/200</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-txt-secondary mb-1.5"><Mail size={14} /> Email</label>
                      <input type="text" value={user?.email || ''} readOnly
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-fintech-bg border border-slate-200 dark:border-white/5 text-slate-400 dark:text-txt-muted cursor-not-allowed text-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/5">
                    <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-txt-secondary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleEditSave} disabled={editLoading}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-accent-primary hover:bg-accent-primary/80 disabled:bg-accent-primary/40 text-white transition-all">
                      {editLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</span> : <><Save size={16} /> Save Changes</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
