"use client";

import { useState } from "react";
import { RefreshCw, Code2, ChevronDown, ChevronUp } from "lucide-react";

interface ApiMatchPreview {
  userId: string;
  name: string;
  score: number;
  matchTypeLabel: string;
  headline: string;
}

/**
 * Componente Client-Side que demonstra o consumo direto da API própria
 * GET /api/matches a partir do navegador com fetch() + useState (Receitas 18, 19 e 23).
 */
export default function MatchesApiVerifier() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [minScoreFilter, setMinScoreFilter] = useState("50");
  const [apiData, setApiData] = useState<{
    generatedAt?: string;
    matches?: ApiMatchPreview[];
  } | null>(null);

  async function handleFetchFromApi() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/matches?minScore=${encodeURIComponent(minScoreFilter)}`
      );
      const json = await res.json();
      setApiData(json);
      setExpanded(true);
    } catch (err) {
      console.error("Erro ao consultar /api/matches:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="academic-card p-4 bg-slate-50/70 border-slate-200 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-900">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              Inspeção do Endpoint REST Próprio (GET /api/matches • Receitas 19 e 23)
            </span>
            <span className="text-[11px] text-slate-500">
              Teste a consulta assíncrona via fetch() no cliente filtrando por score mínimo.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(e.target.value)}
            aria-label="Score mínimo"
            className="input-academic py-1.5 px-2.5 text-xs w-36 bg-white"
          >
            <option value="0">Score ≥ 0%</option>
            <option value="50">Score ≥ 50%</option>
            <option value="70">Score ≥ 70%</option>
            <option value="85">Score ≥ 85%</option>
          </select>

          <button
            type="button"
            onClick={handleFetchFromApi}
            disabled={loading}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Consultando..." : "Consultar API JSON"}
          </button>

          {apiData && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {expanded && apiData && (
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Resposta JSON de <code className="font-mono text-indigo-900">/api/matches?minScore={minScoreFilter}</code>:
            </span>
            <span>{apiData.matches?.length ?? 0} resultado(s)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {apiData.matches?.map((m) => (
              <div
                key={m.userId}
                className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between gap-2"
              >
                <div className="truncate">
                  <p className="font-semibold text-slate-900 truncate">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {m.headline}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shrink-0">
                  {m.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
