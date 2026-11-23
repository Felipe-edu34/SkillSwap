"use client";

import { useActionState, useState, useTransition } from "react";
import {
  updateUserSkillAction,
  deleteUserSkillAction,
  type SkillActionState,
} from "@/actions/skills";
import {
  Pencil,
  Trash2,
  Check,
  X,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export interface UserSkillItem {
  id: string;
  type: "TEACH" | "LEARN";
  level: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  notes: string | null;
  skill: {
    id: string;
    name: string;
    category: string;
    description: string | null;
  };
}

const LEVEL_LABELS: Record<UserSkillItem["level"], string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

const initialState: SkillActionState = {};

export default function UserSkillCard({ item }: { item: UserSkillItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [updateState, updateFormAction, isUpdating] = useActionState(
    async (prev: SkillActionState, formData: FormData) => {
      const res = await updateUserSkillAction(prev, formData);
      if (res.success) {
        setIsEditing(false);
      }
      return res;
    },
    initialState
  );

  const handleDelete = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteUserSkillAction(item.id);
      if (result.error) {
        setDeleteError(result.error);
        setConfirmDelete(false);
      }
    });
  };

  const isTeach = item.type === "TEACH";

  return (
    <div
      className={`academic-card p-5 space-y-3 border-l-4 ${
        isTeach ? "border-l-emerald-700" : "border-l-indigo-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-neutral text-[11px]">
              {item.skill.category}
            </span>
            <span className={isTeach ? "badge-teach" : "badge-learn"}>
              {isTeach ? (
                <GraduationCap className="w-3 h-3" />
              ) : (
                <BookOpen className="w-3 h-3" />
              )}
              {LEVEL_LABELS[item.level]}
            </span>
          </div>

          <h4 className="text-base font-serif font-bold text-slate-900 pt-0.5">
            {item.skill.name}
          </h4>
        </div>

        {/* Ações de Edição e Remoção com Confirmação */}
        {!isEditing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setConfirmDelete(false);
              }}
              title="Editar nível ou observações"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                title="Remover competência"
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                <span className="text-[11px] font-semibold text-amber-800 mr-1">
                  Confirmar?
                </span>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 disabled:opacity-50"
                >
                  {isDeleting ? "..." : "Sim"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="p-0.5 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteError && (
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
          {deleteError}
        </p>
      )}

      {!isEditing ? (
        <p className="text-xs text-slate-600 leading-relaxed">
          {item.notes ||
            item.skill.description ||
            "Nenhuma observação metodológica registrada."}
        </p>
      ) : (
        <form
          action={updateFormAction}
          className="pt-2 border-t border-slate-200 space-y-3"
        >
          <input type="hidden" name="userSkillId" value={item.id} />

          {updateState.error && (
            <p className="text-xs text-amber-700">{updateState.error}</p>
          )}

          <div>
            <label className="label-academic">Nível de Proficiência</label>
            <select
              name="level"
              defaultValue={item.level}
              className="input-academic py-1.5 text-xs"
            >
              <option value="INICIANTE">Iniciante</option>
              <option value="INTERMEDIARIO">Intermediário</option>
              <option value="AVANCADO">Avançado</option>
            </select>
          </div>

          <div>
            <label className="label-academic">Observações / Ementa</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={item.notes ?? ""}
              className="input-academic py-1.5 text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="btn-primary py-1.5 px-3 text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
