import { useState } from 'react';
import { Users, Mail, Copy, Check, X, UserMinus, Clock, Sparkles, UserCheck } from 'lucide-react';
import { FamilyGroup, FamilyInvitation } from '../hooks/useFamilyGroup';

const APP_URL = 'https://rankpy-saldo.netlify.app';

interface Props {
  ownedGroup: FamilyGroup | null;
  invitations: FamilyInvitation[];
  memberOfGroup: FamilyGroup | null;
  ownerName: string | null;
  usedSlots: number;
  maxGuests: number;
  freeSlots: number;
  isFamily: boolean;
  onInvite: (email: string) => Promise<FamilyInvitation>;
  onCancel: (id: string) => Promise<void>;
  onRemove: (id: string, userId: string) => Promise<void>;
  onLeave: () => Promise<void>;
  onUpgrade: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-border transition-colors flex-shrink-0"
      title="Copiar link"
    >
      {copied ? <Check size={13} className="text-income" /> : <Copy size={13} />}
    </button>
  );
}

function InviteLink({ token }: { token: string }) {
  const url = `${APP_URL}?invite=${token}`;
  return (
    <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-2.5 py-1.5">
      <span className="text-muted text-xs truncate flex-1 font-mono">{url}</span>
      <CopyButton text={url} />
    </div>
  );
}

function SlotVisual({ used, max }: { used: number; max: number }) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-full bg-income/20 border border-income/40 flex items-center justify-center">
          <UserCheck size={15} className="text-income" />
        </div>
        <span className="text-income text-[9px] font-medium">Vos</span>
      </div>
      {Array.from({ length: max }).map((_, i) => {
        const active = i < used;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${
              active ? 'bg-pro/20 border-pro/40' : 'bg-border/50 border-border'
            }`}>
              <Users size={15} className={active ? 'text-pro' : 'text-muted/30'} />
            </div>
            <span className={`text-[9px] font-medium ${active ? 'text-pro' : 'text-muted/30'}`}>
              {active ? 'Activo' : 'Libre'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function FamilyProfiles({
  invitations, memberOfGroup, ownerName,
  usedSlots, maxGuests, freeSlots,
  isFamily, onInvite, onCancel, onRemove, onLeave, onUpgrade,
}: Props) {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [newInvite, setNewInvite] = useState<FamilyInvitation | null>(null);
  const [leaving, setLeaving]   = useState(false);

  // Usuario es miembro (no titular)
  if (memberOfGroup) {
    return (
      <div className="space-y-4 tab-enter">
        <h2 className="text-white font-bold text-lg">Plan Familiar</h2>
        <div className="card border-pro/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pro/10 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-pro" />
            </div>
            <div>
              <p className="text-white font-semibold">Sos parte de un grupo familiar</p>
              <p className="text-muted text-sm">
                {ownerName ? `Invitado por ${ownerName}` : 'Tenés acceso Pro activo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-income/5 border border-income/20 rounded-lg p-2.5">
            <Check size={14} className="text-income" />
            <span className="text-income text-sm font-medium">Acceso Pro activo por este plan</span>
          </div>
          <p className="text-muted text-xs">
            Tu acceso se mantiene mientras el titular del grupo tenga el plan Familiar activo. Tus datos son completamente privados.
          </p>
        </div>
        <button
          onClick={async () => {
            if (!confirm('¿Querés salir del grupo familiar? Perderás el acceso Pro.')) return;
            setLeaving(true);
            await onLeave();
            setLeaving(false);
          }}
          disabled={leaving}
          className="btn-danger w-full flex items-center justify-center gap-2"
        >
          <UserMinus size={15} />
          {leaving ? 'Saliendo...' : 'Salir del grupo familiar'}
        </button>
      </div>
    );
  }

  // Sin plan familiar
  if (!isFamily) {
    return (
      <div className="empty-state tab-enter">
        <div className="w-16 h-16 rounded-full bg-pro/10 flex items-center justify-center">
          <Users size={28} className="text-pro" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Plan Familiar</h2>
          <p className="text-muted text-sm mt-1 max-w-xs">
            Invitá hasta 3 personas. Cada una tiene su propia cuenta privada con acceso Pro incluido.
          </p>
        </div>
        <button onClick={onUpgrade} className="btn-pro flex items-center gap-2 mt-1">
          <Sparkles size={15} />
          Ver Plan Familiar
        </button>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNewInvite(null);
    if (!email.trim()) return;
    setLoading(true);
    try {
      const invite = await onInvite(email.trim());
      setNewInvite(invite);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la invitación.');
    } finally {
      setLoading(false);
    }
  };

  const accepted = invitations.filter((i) => i.status === 'accepted');
  const pending  = invitations.filter((i) => i.status === 'pending');

  return (
    <div className="space-y-4 tab-enter">
      <h2 className="text-white font-bold text-lg">Mi grupo familiar</h2>

      {/* Slots */}
      <div className="card space-y-3">
        <p className="text-muted text-xs">
          {usedSlots}/{maxGuests} invitados · {freeSlots} slot{freeSlots !== 1 ? 's' : ''} libre{freeSlots !== 1 ? 's' : ''}
        </p>
        <SlotVisual used={usedSlots} max={maxGuests} />
      </div>

      {/* Formulario de invitación */}
      {freeSlots > 0 ? (
        <form onSubmit={handleInvite} className="card space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Mail size={14} className="text-pro" />
            Invitar persona
          </h3>
          <p className="text-muted text-xs">
            Sus datos son 100% privados — vos no podés ver sus finanzas ni ellos las tuyas.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="input flex-1"
              required
            />
            <button type="submit" disabled={loading} className="btn-pro px-4 flex-shrink-0">
              {loading ? '...' : 'Invitar'}
            </button>
          </div>
          {error && <p className="text-expense text-xs">{error}</p>}
          {newInvite && (
            <div className="space-y-2 tab-enter">
              <p className="text-income text-xs font-medium flex items-center gap-1">
                <Check size={12} />
                Invitación lista — compartí este link por WhatsApp o email:
              </p>
              <InviteLink token={newInvite.token} />
              <p className="text-muted text-xs">El link expira en 7 días.</p>
            </div>
          )}
        </form>
      ) : (
        <div className="card border-muted/20 text-center py-3">
          <p className="text-muted text-sm">Alcanzaste el máximo de {maxGuests} invitados.</p>
        </div>
      )}

      {/* Miembros activos */}
      {accepted.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm">Miembros activos</h3>
          {accepted.map((inv) => (
            <div key={inv.id} className="card flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-pro/10 border border-pro/30 flex items-center justify-center flex-shrink-0">
                  <UserCheck size={14} className="text-pro" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{inv.invited_email}</p>
                  <p className="text-income text-xs">Acceso Pro activo</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!inv.invited_user_id) return;
                  if (confirm(`¿Eliminar a ${inv.invited_email} del grupo? Perderá el acceso Pro.`)) {
                    onRemove(inv.id, inv.invited_user_id);
                  }
                }}
                className="text-muted hover:text-expense p-1.5 rounded-lg hover:bg-expense/10 transition-colors flex-shrink-0"
              >
                <UserMinus size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invitaciones pendientes */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm">Pendientes</h3>
          {pending.map((inv) => (
            <div key={inv.id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-goal/10 border border-goal/30 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-goal" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{inv.invited_email}</p>
                    <p className="text-goal text-xs">Esperando aceptación</p>
                  </div>
                </div>
                <button
                  onClick={() => onCancel(inv.id)}
                  className="text-muted hover:text-expense p-1.5 rounded-lg hover:bg-expense/10 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <InviteLink token={inv.token} />
            </div>
          ))}
        </div>
      )}

      {invitations.length === 0 && !newInvite && (
        <div className="card text-center py-6 space-y-1">
          <Users size={26} className="text-muted mx-auto" />
          <p className="text-muted text-sm">Todavía no invitaste a nadie.</p>
          <p className="text-muted text-xs">Cada persona tendrá su propia cuenta privada.</p>
        </div>
      )}
    </div>
  );
}
