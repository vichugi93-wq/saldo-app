import { Sparkles, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onGoToPlans: () => void;
  reason?: string;
}

export function UpgradeModal({ onClose, onGoToPlans, reason }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-pro/20 rounded-2xl w-full max-w-sm p-6 tab-enter text-center space-y-4 shadow-glow-pro relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-border"
        >
          <X size={16} />
        </button>
        <div className="w-12 h-12 bg-pro/10 rounded-full flex items-center justify-center mx-auto">
          <Sparkles size={22} className="text-pro" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Activá Plan Pro</h2>
          <p className="text-muted text-sm mt-1">
            {reason ?? 'Esta función está disponible en el Plan Pro y Familiar.'}
          </p>
        </div>
        <div className="space-y-2">
          <button onClick={onGoToPlans} className="btn-pro w-full flex items-center justify-center gap-2">
            <Sparkles size={15} />
            Ver planes
          </button>
          <button onClick={onClose} className="btn-secondary w-full text-sm">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
