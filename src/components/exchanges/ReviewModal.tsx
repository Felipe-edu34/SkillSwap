"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type ReviewActionState } from "@/actions/reviews";
import { Star, X, CheckCircle2, AlertCircle, Send } from "lucide-react";

interface ReviewModalProps {
  exchangeId: string;
  partnerName: string;
  taughtSkillName: string;
  learnedSkillName: string;
}

const initialState: ReviewActionState = {};

export default function ReviewModal({
  exchangeId,
  partnerName,
  taughtSkillName,
  learnedSkillName,
}: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, formAction, isPending] = useActionState(
    createReviewAction,
    initialState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
      >
        <Star className="w-3.5 h-3.5 fill-white" />
        Avaliar Troca (Etapa 6)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="academic-card max-w-lg w-full p-6 space-y-5 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  Certificação de Histórico • Etapa 6 (Avaliada)
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Avaliar Mentoria com {partnerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state.success ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      Avaliação Registrada com Sucesso!
                    </p>
                    <p>{state.message}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-primary text-xs"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="exchangeId" value={exchangeId} />
                <input type="hidden" name="rating" value={rating} />

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Intercâmbio:{" "}
                  <strong className="text-emerald-800">
                    Você ensinou {taughtSkillName}
                  </strong>{" "}
                  ↔{" "}
                  <strong className="text-indigo-900">
                    Aprendeu {learnedSkillName}
                  </strong>
                </div>

                {state.error && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{state.error}</span>
                  </div>
                )}

                {/* Seletor Interativo de 1 a 5 Estrelas */}
                <div>
                  <label className="label-academic">
                    Nota Pedagógica (1 a 5 Estrelas)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        className={`p-2 rounded-lg border transition-all flex items-center gap-1 text-xs font-bold ${
                          starValue <= rating
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            starValue <= rating
                              ? "fill-amber-500 text-amber-500"
                              : "text-slate-300"
                          }`}
                        />
                        <span>{starValue}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="label-academic">
                    Parecer Acadêmico Construtivo
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    required
                    rows={4}
                    placeholder={`Descreva como foi a didática, organização e colaboração com ${partnerName} durante as sessões...`}
                    className="input-academic text-xs resize-none"
                  />
                  {state.fieldErrors?.comment && (
                    <p className="text-xs text-amber-700 mt-1">
                      {state.fieldErrors.comment[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isPending
                      ? "Certificando Avaliação..."
                      : "Registrar Avaliação (Etapa 6)"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
