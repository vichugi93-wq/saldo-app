import { useState } from 'react';
import { Bot, Sparkles, Lock, Loader2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { Goal } from '../types/goal';
import { CurrencyCode } from '../types/currency';

interface AIAnalysisRecord {
  id: string;
  content: string;
  created_at: string;
}

interface Props {
  transactions: Transaction[];
  goals: Goal[];
  currency: CurrencyCode;
  userName: string;
  isPro: boolean;
  analyses: AIAnalysisRecord[];
  analyzing: boolean;
  onAnalyze: (transactions: Transaction[], goals: Goal[], currency: CurrencyCode, userName: string) => Promise<string>;
  onUpgrade: () => void;
}

function MarkdownContent({ content }: { content: string }) {
  const html = content
    .replace(/^## (.+)$/gm, '<h2 class="text-white font-bold text-base mt-4 mb-1">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-white font-semibold text-sm mt-3 mb-1">$1</h3>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-muted text-sm ml-4 list-decimal">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="text-muted text-sm ml-4 list-disc">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, '');

  return (
    <div
      className="text-muted text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function extractScore(content: string): string | null {
  const match = content.match(/puntuaci[oó]n[^:]*:\s*(\d+\s*\/\s*\d+)/i);
  return match ? match[1].replace(/\s/g, '') : null;
}

function extractFirstLine(content: string): string {
  const clean = content.replace(/^#+\s*/gm, '').trim();
  const first = clean.split('\n').find((l) => l.trim().length > 10) ?? '';
  return first.length > 70 ? first.slice(0, 70) + '…' : first;
}

function AnalysisCard({ analysis, defaultOpen }: { analysis: { id: string; content: string; created_at: string }; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const score = extractScore(analysis.content);
  const preview = extractFirstLine(analysis.content);

  const fecha = new Date(analysis.created_at).toLocaleDateString('es-PY', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const hora = new Date(analysis.created_at).toLocaleTimeString('es-PY', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`card transition-colors ${open ? 'border-income/20' : 'hover:border-muted/30'}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Clock size={12} className="text-muted flex-shrink-0" />
            <span className="text-muted text-xs">{fecha} · {hora}</span>
            {score && (
              <span className="badge-pro text-xs">
                {score}
              </span>
            )}
          </div>
          {!open && (
            <p className="text-muted text-xs mt-1.5 truncate">{preview}</p>
          )}
        </div>
        <span className="text-muted flex-shrink-0 mt-0.5">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-border tab-enter">
          <MarkdownContent content={analysis.content} />
        </div>
      )}
    </div>
  );
}

export function AIAnalysis({
  transactions, goals, currency, userName, isPro,
  analyses, analyzing, onAnalyze, onUpgrade,
}: Props) {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const handleAnalyze = async () => {
    setError('');
    try {
      const content = await onAnalyze(transactions, goals, currency, userName);
      setResult(content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('no configurada')) {
        setError('El análisis IA aún no está configurado en el servidor. Contactá al administrador.');
      } else {
        setError('No pudimos generar el análisis. Revisá tu conexión e intentá de nuevo.');
      }
    }
  };

  if (!isPro) {
    return (
      <div className="empty-state tab-enter">
        <div className="w-16 h-16 rounded-full bg-pro/10 flex items-center justify-center">
          <Lock size={26} className="text-pro" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Análisis IA — Plan Pro</h2>
          <p className="text-muted text-sm mt-1 max-w-xs">
            Obtené un diagnóstico completo de tus finanzas con recomendaciones personalizadas de Claude.
          </p>
        </div>
        <button onClick={onUpgrade} className="btn-pro flex items-center gap-2 mt-1">
          <Sparkles size={15} />
          Ver planes Pro
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 tab-enter">
      <div className="flex gap-4 border-b border-border pb-3">
        {(['new', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-sm font-medium pb-1 transition-colors ${
              activeTab === t
                ? 'text-white border-b-2 border-income'
                : 'text-muted hover:text-white'
            }`}
          >
            {t === 'new' ? 'Nuevo análisis' : `Historial (${analyses.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'new' && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-muted text-sm">
              Claude analizará tus{' '}
              <strong className="text-white">{transactions.length} transacciones</strong>{' '}
              y tus metas para darte recomendaciones personalizadas.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Analizar mis finanzas
              </>
            )}
          </button>
          {error && (
            <div className="card border-expense/30 bg-expense/5">
              <p className="text-expense text-sm">{error}</p>
            </div>
          )}
          {result && (
            <div className="card tab-enter">
              <MarkdownContent content={result} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {analyses.length === 0 ? (
            <div className="empty-state">
              <div className="w-14 h-14 rounded-full bg-border flex items-center justify-center">
                <Bot size={24} className="text-muted" />
              </div>
              <div>
                <p className="text-white font-semibold">Sin análisis anteriores</p>
                <p className="text-muted text-sm mt-1">
                  Tu historial de análisis aparecerá aquí una vez que generes el primero.
                </p>
              </div>
            </div>
          ) : (
            analyses.map((a, i) => (
              <AnalysisCard key={a.id} analysis={a} defaultOpen={i === 0} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
