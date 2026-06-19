import { useState, useEffect } from 'react';
import { LayoutDashboard, CreditCard, Target, Bot, User, Settings, Lock, LucideIcon, Download, FileText } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useSavingsGoals } from './hooks/useSavingsGoals';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import { usePlan } from './hooks/usePlan';
import { useFamilyGroup } from './hooks/useFamilyGroup';
import { usePaymentRequests } from './hooks/usePaymentRequests';
import { useBudgets } from './hooks/useBudgets';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { WelcomeModal } from './components/WelcomeModal';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { SavingsGoals } from './components/SavingsGoals';
import { AIAnalysis } from './components/AIAnalysis';
import { Plans } from './components/Plans';
import { FamilyProfiles } from './components/FamilyProfiles';
import { UpgradeModal } from './components/UpgradeModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { CurrencySelector } from './components/CurrencySelector';
import { formatCurrency } from './utils/formatters';
import { exportTransactionsCSV, currentMonthTransactions } from './utils/exportCSV';
import { PLAN_LABELS } from './types/plan';
import { CurrencyCode } from './types/currency';

type Tab = 'dashboard' | 'transactions' | 'goals' | 'ai' | 'profile' | 'plans' | 'admin' | 'family';
type AuthView = 'login' | 'register' | 'forgot';

function Skeleton() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="Saldo" className="w-16 h-16 rounded-2xl animate-pulse" />
        <div className="flex gap-1">
          {[0,1,2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-income/40 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const { user, profile, loading, signIn, signUp, signOut, updateProfile, refreshProfile } = auth;
  const planInfo = usePlan(profile);

  const txs = useTransactions(user?.id);
  const goals = useSavingsGoals(user?.id);
  const aiAnalysis = useAIAnalysis(user?.id);
  const familyGroup = useFamilyGroup(user?.id);
  const paymentRequests = usePaymentRequests(user?.id);
  const budgets = useBudgets(user?.id);

  // Token de invitación desde la URL (?invite=TOKEN)
  const [pendingInviteToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  });
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    if (!user || !pendingInviteToken || inviteStatus !== 'idle') return;
    familyGroup.acceptInvitation(pendingInviteToken)
      .then(() => {
        setInviteStatus('success');
        window.history.replaceState({}, '', window.location.pathname);
        refreshProfile();
        familyGroup.refetch();
      })
      .catch((err: Error) => {
        setInviteStatus('error');
        setInviteError(err.message);
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, [user, pendingInviteToken]);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [showTxForm, setShowTxForm] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  useEffect(() => {
    if (profile && planInfo.isExpired && profile.plan !== 'basic') {
      updateProfile({}).catch(() => null);
    }
  }, [planInfo.isExpired, profile]);

  const openUpgrade = (reason?: string) => {
    setUpgradeReason(reason ?? '');
    setShowUpgrade(true);
  };

  const currency = auth.currency;
  const fmt = (n: number) => formatCurrency(n, currency);
  const monthlyTotals = txs.monthlyTotals();
  const netBalance = monthlyTotals.income - monthlyTotals.expense;

  const needsOnboarding = user && profile && !profile.name;

  if (loading) return <Skeleton />;

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center flex flex-col items-center gap-3">
            <img src="/logo.svg" alt="Saldo" className="w-20 h-20 rounded-2xl shadow-glow-income" />
            <div>
              <h1 className="font-display text-4xl font-bold text-income">Saldo</h1>
              <p className="text-muted text-sm mt-1">Tus finanzas, bajo control</p>
            </div>
          </div>

          {authView === 'forgot' ? (
            <ForgotPassword onBack={() => setAuthView('login')} />
          ) : (
            <>
              <div className="flex border-b border-border">
                {(['login', 'register'] as AuthView[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setAuthView(v)}
                    className={`flex-1 pb-2.5 text-sm font-medium transition-colors ${
                      authView === v
                        ? 'text-white border-b-2 border-income -mb-px'
                        : 'text-muted hover:text-white'
                    }`}
                  >
                    {v === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </button>
                ))}
              </div>
              {authView === 'login' ? (
                <LoginForm onSignIn={signIn} onForgotPassword={() => setAuthView('forgot')} />
              ) : (
                <RegisterForm onSignUp={signUp} />
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <WelcomeModal
        defaultName={user.email?.split('@')[0] ?? ''}
        onComplete={async (name, cur) => {
          await updateProfile({ name, currency: cur });
          refreshProfile();
        }}
      />
    );
  }

  const isAdmin = profile?.is_admin ?? false;

  const NAV_TABS: { id: Tab; label: string; Icon: LucideIcon; locked?: boolean }[] = [
    { id: 'dashboard',     label: 'Inicio',       Icon: LayoutDashboard },
    { id: 'transactions',  label: 'Movimientos',  Icon: CreditCard },
    { id: 'goals',         label: 'Metas',        Icon: Target },
    { id: 'ai',            label: 'IA',            Icon: Bot, locked: !planInfo.isPro },
    { id: 'profile',       label: 'Perfil',       Icon: User },
    ...(isAdmin ? [{ id: 'admin' as Tab, label: 'Admin', Icon: Settings }] : []),
  ];

  const planBadgeClass =
    planInfo.plan === 'pro'    ? 'badge-pro' :
    planInfo.plan === 'family' ? 'badge-family' :
                                  'badge-basic';

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Banner resultado de invitación */}
      {inviteStatus === 'success' && (
        <div className="bg-income/10 border-b border-income/30 text-income text-xs text-center py-2 px-4">
          ¡Te uniste al grupo familiar! Ya tenés acceso Pro activo.
        </div>
      )}
      {inviteStatus === 'error' && (
        <div className="bg-expense/10 border-b border-expense/30 text-expense text-xs text-center py-2 px-4">
          {inviteError || 'La invitación no es válida o ya expiró.'}
        </div>
      )}

      {/* Banners de estado */}
      {planInfo.isExpired && profile?.plan !== 'basic' && (
        <button
          onClick={() => setTab('plans')}
          className="w-full bg-expense/10 border-b border-expense/30 text-expense text-xs text-center py-2 px-4"
        >
          Tu plan venció. Estás en Plan Básico. Renovalo para recuperar el acceso →
        </button>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm border-b border-border px-4 py-2.5 flex justify-between items-center">
        <button onClick={() => setTab('dashboard')} className="flex items-center gap-2">
          <img src="/logo.svg" alt="Saldo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-bold text-income text-xl tracking-tight">Saldo</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={planBadgeClass}>{PLAN_LABELS[planInfo.plan]}</span>
          <span className={`amount text-sm font-semibold ${netBalance >= 0 ? 'text-income' : 'text-expense'}`}>
            {fmt(netBalance)}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-28">
        {tab === 'dashboard' && (
          <Dashboard
            transactions={txs.transactions}
            monthlyTransactions={txs.monthlyTransactions()}
            currency={currency}
            planInfo={{
              ...planInfo,
              expiresSOon: planInfo.expiresSOon,
              daysUntilExpiry: planInfo.daysUntilExpiry,
            }}
            onUpgrade={() => setTab('plans')}
            budgets={budgets.budgets}
            onUpsertBudget={budgets.upsertBudget}
            onDeleteBudget={budgets.deleteBudget}
          />
        )}

        {tab === 'transactions' && (
          <>
            <TransactionList
              transactions={txs.transactions}
              currency={currency}
              isPro={planInfo.isPro}
              monthlyCount={txs.monthlyCount()}
              maxMonthlyTransactions={planInfo.maxMonthlyTransactions}
              onUpdate={txs.updateTransaction}
              onDelete={txs.deleteTransaction}
              onAdd={() => setShowTxForm(true)}
              onUpgrade={() => openUpgrade('Necesitás Plan Pro para transacciones ilimitadas.')}
            />
            {showTxForm && (
              <TransactionForm
                currency={currency}
                isPro={planInfo.isPro}
                onSubmit={async (data) => { await txs.createTransaction(data); }}
                onInterpret={async (text) => aiAnalysis.interpretTransaction(text, currency)}
                onClose={() => setShowTxForm(false)}
              />
            )}
          </>
        )}

        {tab === 'goals' && (
          <SavingsGoals
            goals={goals.goals}
            currency={currency}
            isPro={planInfo.isPro}
            maxGoals={planInfo.maxGoals}
            netBalance={netBalance}
            onCreateGoal={goals.createGoal}
            onDeleteGoal={goals.deleteGoal}
            onAddToGoal={goals.addToGoal}
            onUpgrade={() => openUpgrade('Necesitás Plan Pro para metas ilimitadas.')}
          />
        )}

        {tab === 'ai' && (
          <AIAnalysis
            transactions={txs.transactions}
            goals={goals.goals}
            currency={currency}
            userName={profile?.name ?? 'Usuario'}
            isPro={planInfo.isPro}
            analyses={aiAnalysis.analyses}
            analyzing={aiAnalysis.analyzing}
            onAnalyze={aiAnalysis.analyzeFinances}
            onDeleteAnalysis={aiAnalysis.deleteAnalysis}
            onUpgrade={() => { setTab('plans'); }}
          />
        )}

        {tab === 'plans' && (
          <Plans
            currentPlan={planInfo.plan}
            onCreateRequest={async (plan, file, note) => { await paymentRequests.createRequest(plan, file, note); }}
            pendingRequest={paymentRequests.pendingRequest}
          />
        )}

        {tab === 'family' && (
          <FamilyProfiles
            ownedGroup={familyGroup.ownedGroup}
            invitations={familyGroup.invitations}
            memberOfGroup={familyGroup.memberOfGroup}
            ownerName={familyGroup.ownerName}
            usedSlots={familyGroup.usedSlots}
            maxGuests={familyGroup.maxGuests}
            freeSlots={familyGroup.freeSlots}
            isFamily={planInfo.isFamily}
            onInvite={familyGroup.inviteMember}
            onCancel={familyGroup.cancelInvitation}
            onRemove={familyGroup.removeMember}
            onLeave={familyGroup.leaveGroup}
            onUpgrade={() => openUpgrade('Los perfiles familiares requieren Plan Familiar.')}
          />
        )}

        {tab === 'admin' && isAdmin && (
          <AdminPanel adminId={user.id} />
        )}

        {tab === 'profile' && (
          <div className="space-y-4 tab-enter">
            <h2 className="text-white font-bold text-lg">Mi perfil</h2>

            <div className="card space-y-4">
              <div>
                <label className="label">Nombre</label>
                <p className="text-white font-medium">{profile?.name ?? user.email?.split('@')[0] ?? '—'}</p>
              </div>
              <div>
                <label className="label">Email</label>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <label className="label">Plan activo</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={planBadgeClass}>{PLAN_LABELS[planInfo.plan]}</span>
                  {profile?.plan_expires_at && profile.plan !== 'basic' && (
                    <span className="text-muted text-xs">
                      vence {new Date(profile.plan_expires_at).toLocaleDateString('es-PY')}
                    </span>
                  )}
                </div>
              </div>
              {paymentRequests.pendingRequest && (
                <div className="bg-goal/10 border border-goal/30 rounded-lg p-2.5">
                  <p className="text-goal text-xs font-medium">Pago pendiente de aprobación</p>
                </div>
              )}
            </div>

            <div className="card space-y-3">
              <h3 className="text-white font-semibold text-sm">Moneda preferida</h3>
              <CurrencySelector
                value={currency}
                onChange={async (c) => { await updateProfile({ currency: c as CurrencyCode }); }}
              />
            </div>

            <button onClick={() => setTab('plans')} className="btn-secondary w-full text-sm">
              Ver planes
            </button>

            {planInfo.isFamily && (
              <button onClick={() => setTab('family')} className="btn-secondary w-full text-sm">
                Grupo familiar
              </button>
            )}

            {/* Exportar reportes */}
            <div className="card space-y-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <FileText size={14} className="text-income" />
                Exportar reportes
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => exportTransactionsCSV(
                    currentMonthTransactions(txs.transactions),
                    currency,
                    'mes-actual',
                  )}
                  className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Mes actual (CSV)
                </button>
                {planInfo.isPro ? (
                  <button
                    onClick={() => exportTransactionsCSV(txs.transactions, currency, 'historial')}
                    className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    Todo el historial (CSV)
                  </button>
                ) : (
                  <button
                    onClick={() => openUpgrade('El historial completo requiere Plan Pro.')}
                    className="btn-secondary w-full text-sm flex items-center justify-center gap-2 opacity-60"
                  >
                    <Lock size={13} />
                    Todo el historial — Pro
                  </button>
                )}
              </div>
              <p className="text-muted text-xs">Compatible con Excel, Google Sheets y Numbers.</p>
            </div>

            <div className="text-center pt-2">
              <p className="text-muted text-xs">Saldo — © 2026</p>
            </div>

            <button onClick={signOut} className="btn-danger w-full">
              Cerrar sesión
            </button>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border z-40">
        <div className="max-w-2xl mx-auto flex">
          {NAV_TABS.map(({ id, label, Icon, locked }) => (
            <button
              key={id}
              onClick={() => locked ? openUpgrade() : setTab(id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors relative ${
                tab === id ? 'text-income' : 'text-muted hover:text-white'
              }`}
            >
              <span className="relative">
                <Icon size={20} />
                {locked && (
                  <Lock
                    size={9}
                    className="absolute -top-1 -right-1 text-pro bg-surface rounded-full"
                    strokeWidth={2.5}
                  />
                )}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onGoToPlans={() => { setShowUpgrade(false); setTab('plans'); }}
          reason={upgradeReason}
        />
      )}
    </div>
  );
}
