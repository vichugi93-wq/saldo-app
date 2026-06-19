import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types/transaction';
import { Goal } from '../types/goal';
import { CurrencyCode } from '../types/currency';
import { getCurrency } from '../utils/currencies';
import { formatCurrency } from '../utils/formatters';

interface AIAnalysisRecord {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface AnthropicResponse {
  content: Array<{ text: string }>;
  error?: { message: string };
}

async function callAnthropic(model: string, max_tokens: number, prompt: string): Promise<string> {
  const body = { model, max_tokens, messages: [{ role: 'user', content: prompt }] };

  // Intentar Edge Function primero (seguro, sin exponer la key)
  try {
    const { data, error } = await supabase.functions.invoke<AnthropicResponse>('anthropic-proxy', { body });
    if (!error && data && !data.error) {
      const text = data.content?.[0]?.text;
      if (text) return text;
    }
  } catch {
    // Edge Function no deployada todavía — usar fallback directo
  }

  // Fallback: llamada directa con env var (mientras el proxy no esté deployado)
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) throw new Error('NO_API_KEY');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('API_ERROR');
  const result = await response.json() as AnthropicResponse;
  const text = result.content?.[0]?.text;
  if (!text) throw new Error('Respuesta vacía de la IA');
  return text;
}

export function useAIAnalysis(userId: string | undefined) {
  const [analyses, setAnalyses] = useState<AIAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    setAnalyses((data as AIAnalysisRecord[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAnalyses(); }, [fetchAnalyses]);

  const analyzeFinances = async (
    transactions: Transaction[],
    goals: Goal[],
    currency: CurrencyCode,
    userName: string,
  ) => {
    setAnalyzing(true);
    try {
      const currencyInfo = getCurrency(currency);
      const now = new Date();
      const monthTxs = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const income  = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      const expenseByCategory = monthTxs
        .filter((t) => t.type === 'expense')
        .reduce<Record<string, number>>((acc, t) => {
          acc[t.category] = (acc[t.category] ?? 0) + t.amount;
          return acc;
        }, {});

      const prompt = `Eres un asesor financiero personal. Analiza las finanzas de ${userName} y responde en español.

Moneda: ${currencyInfo.name} (${currencyInfo.symbol})
Mes actual:
- Ingresos totales: ${formatCurrency(income, currency)}
- Gastos totales: ${formatCurrency(expense, currency)}
- Saldo neto: ${formatCurrency(income - expense, currency)}

Gastos por categoría:
${Object.entries(expenseByCategory).map(([cat, amt]) => `- ${cat}: ${formatCurrency(amt, currency)}`).join('\n')}

Metas activas:
${goals.filter((g) => g.status === 'active').map((g) => `- ${g.name}: ${formatCurrency(g.current_amount, currency)} de ${formatCurrency(g.target_amount, currency)} (${Math.round((g.current_amount / g.target_amount) * 100)}%)`).join('\n') || '- Sin metas activas'}

Proporciona exactamente este análisis en formato markdown:
## Puntuación de salud financiera: X/10
(explicación breve)

## Diagnóstico
(análisis de ingresos y gastos)

## 3 patrones detectados
1. ...
2. ...
3. ...

## 3 recomendaciones de ahorro
1. ...
2. ...
3. ...

## Distribución sugerida hacia metas
(sugerencia específica en ${currencyInfo.name})

## Proyección temporal para metas
(estimación de cuándo alcanzará cada meta)`;

      const content = await callAnthropic('claude-sonnet-4-6', 1500, prompt);

      const { data, error } = await supabase
        .from('ai_analyses')
        .insert({ user_id: userId, content })
        .select()
        .single();
      if (error) throw error;

      const newAnalysis = data as AIAnalysisRecord;
      setAnalyses((prev) => [newAnalysis, ...prev.slice(0, 4)]);
      return content;
    } finally {
      setAnalyzing(false);
    }
  };

  const interpretTransaction = async (text: string, currency: CurrencyCode) => {
    const prompt = `Interpreta esta descripción de transacción financiera y devuelve un JSON con:
{
  "type": "income" o "expense",
  "amount": número (solo el monto, sin símbolo ni puntos de miles),
  "category": una de [Alimentación, Transporte, Salud, Entretenimiento, Ropa, Hogar, Educación, Otros, Salario, Freelance, Negocio, Inversiones, Otros ingresos],
  "description": descripción limpia y corta
}

Moneda del usuario: ${getCurrency(currency).name}
Texto: "${text}"

Devuelve SOLO el JSON, sin explicación.`;

    try {
      const text_result = await callAnthropic('claude-haiku-4-5-20251001', 200, prompt);
      return JSON.parse(text_result) as {
        type: 'income' | 'expense';
        amount: number;
        category: string;
        description: string;
      };
    } catch {
      return null;
    }
  };

  const deleteAnalysis = async (id: string) => {
    await supabase.from('ai_analyses').delete().eq('id', id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    analyses,
    loading,
    analyzing,
    analyzeFinances,
    interpretTransaction,
    deleteAnalysis,
    refetch: fetchAnalyses,
  };
}
