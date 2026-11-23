"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createExchangeProposalAction,
  type ExchangeActionState,
} from "@/actions/exchanges";
import {
  ArrowLeftRight,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export interface SkillOption {
  id: string;
  name: string;
}

interface ProposeExchangeModalProps {
  receiverId: string;
  receiverName: string;
  myTeachSkills: SkillOption[];
  peerTeachSkills: SkillOption[];
  defaultOfferedSkillId?: string | null;
  defaultRequestedSkillId?: string | null;
  buttonLabel?: string;
  buttonClassName?: string;
}

const initialState: ExchangeActionState = {};

export default function ProposeExchangeModal({
  receiverId,
  receiverName,
  myTeachSkills,
  peerTeachSkills,
  defaultOfferedSkillId,
  defaultRequestedSkillId,
  buttonLabel = "Propor Troca",
  buttonClassName = "btn-primary text-xs py-2 px-3.5",
}: ProposeExchangeModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createExchangeProposalAction,
    initialState
  );

  const firstName = receiverName.split(" ")[0];

  const initialOffered =
    defaultOfferedSkillId || myTeachSkills[0]?.id || "";
  const initialRequested =
    defaultRequestedSkillId || peerTeachSkills[0]?.id || "";

  const canPropose =
    myTeachSkills.length > 0 && peerTeachSkills.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName}
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="academic-card max-w-lg w-full p-6 space-y-5 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
                  Formalização de Intercâmbio • Etapa 1 de 6
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Propor Troca com {receiverName}
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

            {!canPropose ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1.5">
                  <p className="font-semibold">
                    Requisitos para propor uma troca acadêmica:
                  </p>
                  <p>
                    Você precisa ter ao menos uma competência cadastrada como{" "}
                    <strong>&ldquo;Pode Ensinar&rdquo;</strong> em seu portfólio, e{" "}
                    {firstName} deve possuir ao menos uma competência disponível para ensinar.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Fechar
                  </button>
                  <Link href="/skills" className="btn-primary text-xs">
                    Cadastrar Minhas Competências
                  </Link>
                </div>
              </div>
            ) : state.success ? (
              <div className="space-y-5 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Proposta Registrada!</p>
                    <p className="text-xs leading-relaxed">{state.message}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Continuar Explorando
                  </button>
                  <Link href="/exchanges" className="btn-primary text-xs">
                    Ir para Painel de Trocas
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="receiverId" value={receiverId} />

                {state.error && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{state.error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-academic text-emerald-800">
                      O que você vai ensinar
                    </label>
                    <select
                      name="offeredSkillId"
                      defaultValue={initialOffered}
                      className="input-academic text-xs"
                    >
                      {myTeachSkills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label-academic text-indigo-900">
                      O que {firstName} vai ensinar
                    </label>
                    <select
                      name="requestedSkillId"
                      defaultValue={initialRequested}
                      className="input-academic text-xs"
                    >
                      {peerTeachSkills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="label-academic">
                    Mensagem Acadêmica & Sugestão de Plano de Estudo
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    defaultValue={`Olá ${firstName}! Vi nossa compatibilidade no SkillSwap. Posso organizar encontros práticos para te ajudar na disciplina que ensino em troca da sua mentoria. Como está sua disponibilidade nesta semana?`}
                    className="input-academic text-xs resize-none"
                  />
                  {state.fieldErrors?.message && (
                    <p className="text-xs text-amber-700 mt-1">
                      {state.fieldErrors.message[0]}
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
                      ? "Enviando Solicitação..."
                      : "Enviar Solicitação (Etapa 1)"}
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
