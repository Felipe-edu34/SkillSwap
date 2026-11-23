import { ExchangeStatus } from "@prisma/client";
import { EXCHANGE_STEPS, getStepMeta } from "@/lib/exchange-state";
import { Check, Clock } from "lucide-react";

interface ExchangeStepperProps {
  currentStatus: ExchangeStatus;
  role: "requester" | "receiver";
}

export default function ExchangeStepper({
  currentStatus,
  role,
}: ExchangeStepperProps) {
  const currentMeta = getStepMeta(currentStatus);
  const currentStepNumber = currentMeta.stepNumber;

  return (
    <div className="space-y-3">
      {/* Barra Horizontal com os 6 Estados Numerados */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {EXCHANGE_STEPS.map((step) => {
          const isCompleted = step.stepNumber < currentStepNumber;
          const isActive = step.stepNumber === currentStepNumber;

          return (
            <div
              key={step.status}
              className={`p-2.5 rounded-lg border text-xs transition-all flex items-center gap-2 ${
                isCompleted
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                  : isActive
                  ? "bg-indigo-900 border-indigo-900 text-white shadow-xs ring-2 ring-indigo-900/20"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-emerald-700 text-white"
                    : isActive
                    ? "bg-white text-indigo-900"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  step.stepNumber
                )}
              </div>

              <div className="min-w-0">
                <span className="font-semibold block truncate leading-tight">
                  {step.label}
                </span>
                <span
                  className={`text-[10px] block truncate ${
                    isCompleted
                      ? "text-emerald-700"
                      : isActive
                      ? "text-indigo-200"
                      : "text-slate-400"
                  }`}
                >
                  Etapa {step.stepNumber}/6
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orientação Pedagógica Contextual para o Papel do Usuário */}
      <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-indigo-900 shrink-0" />
          <span>
            <strong className="text-slate-900">
              Etapa Atual ({currentMeta.stepNumber}/6 — {currentMeta.label}):
            </strong>{" "}
            {currentMeta.actionGuidance[role]}
          </span>
        </div>
      </div>
    </div>
  );
}
