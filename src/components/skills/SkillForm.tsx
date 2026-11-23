"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import {
  createUserSkillAction,
  type SkillActionState,
} from "@/actions/skills";
import {
  PlusCircle,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface CatalogSkillOption {
  id: string;
  name: string;
  category: string;
}

interface SkillFormProps {
  catalogSkills: CatalogSkillOption[];
}

const ACADEMIC_CATEGORIES = [
  "Programação",
  "Idiomas",
  "Matemática",
  "Design",
  "Humanidades",
  "Música",
  "Ciências Naturais",
  "Negócios & Gestão",
];

const initialState: SkillActionState = {};

export default function SkillForm({ catalogSkills }: SkillFormProps) {
  const [state, formAction, isPending] = useActionState(
    createUserSkillAction,
    initialState
  );

  const [selectedType, setSelectedType] = useState<"TEACH" | "LEARN">("TEACH");
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("Programação");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setSkillName("");
      formRef.current?.reset();
    }
  }, [state]);

  const handleSelectCatalogSkill = (name: string) => {
    setSkillName(name);
    const matched = catalogSkills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (matched) {
      setCategory(matched.category);
    }
  };

  return (
    <div className="academic-card p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
            Cadastro de Competência • Server Action (Receita 20)
          </span>
          <h3 className="text-lg font-serif font-bold text-slate-900">
            Adicionar Habilidade ao Portfólio Acadêmico
          </h3>
        </div>

        {/* Seletor Visual de Papel: Ensina vs Quer Aprender */}
        <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setSelectedType("TEACH")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedType === "TEACH"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Posso Ensinar
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("LEARN")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedType === "LEARN"
                ? "bg-indigo-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Quero Aprender
          </button>
        </div>
      </div>

      {state.error && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && state.message && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="type" value={selectedType} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nome da Habilidade com Datalist do Catálogo */}
          <div>
            <label htmlFor="skillName" className="label-academic">
              Disciplina ou Habilidade
            </label>
            <input
              id="skillName"
              name="skillName"
              type="text"
              list="catalog-skills-list"
              required
              value={skillName}
              onChange={(e) => handleSelectCatalogSkill(e.target.value)}
              placeholder="Ex.: Python, Inglês, Cálculo..."
              className="input-academic"
            />
            <datalist id="catalog-skills-list">
              {catalogSkills.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.category}
                </option>
              ))}
            </datalist>
            {state.fieldErrors?.skillName && (
              <p className="text-xs text-amber-700 mt-1">
                {state.fieldErrors.skillName[0]}
              </p>
            )}
          </div>

          {/* Categoria Acadêmica */}
          <div>
            <label htmlFor="category" className="label-academic">
              Área / Categoria Acadêmica
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-academic"
            >
              {ACADEMIC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {state.fieldErrors?.category && (
              <p className="text-xs text-amber-700 mt-1">
                {state.fieldErrors.category[0]}
              </p>
            )}
          </div>

          {/* Nível de Proficiência */}
          <div>
            <label htmlFor="level" className="label-academic">
              {selectedType === "TEACH"
                ? "Meu Nível de Domínio"
                : "Meu Nível Atual no Tema"}
            </label>
            <select
              id="level"
              name="level"
              defaultValue={
                selectedType === "TEACH" ? "AVANCADO" : "INICIANTE"
              }
              className="input-academic"
            >
              <option value="INICIANTE">Iniciante</option>
              <option value="INTERMEDIARIO">Intermediário</option>
              <option value="AVANCADO">Avançado</option>
            </select>
          </div>
        </div>

        {/* Sugestões Rápidas do Catálogo */}
        {catalogSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-slate-500 mr-1">
              Catálogo rápido:
            </span>
            {catalogSkills.slice(0, 8).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectCatalogSkill(s.name)}
                className="px-2 py-0.5 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div>
          <label htmlFor="notes" className="label-academic">
            Ementa, Foco de Estudo ou Observações Metodológicas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder={
              selectedType === "TEACH"
                ? "Ex.: Posso auxiliar com listas práticas, estruturação de projetos, conversação ou revisão de artigos..."
                : "Ex.: Busco desenvolver base prática para leitura de artigos ou aplicação no meu TCC..."
            }
            className="input-academic resize-none"
          />
          {state.fieldErrors?.notes && (
            <p className="text-xs text-amber-700 mt-1">
              {state.fieldErrors.notes[0]}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className={
              selectedType === "TEACH"
                ? "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                : "btn-primary"
            }
          >
            <PlusCircle className="w-4 h-4" />
            {isPending
              ? "Registrando no Portfólio..."
              : selectedType === "TEACH"
              ? "Registrar Competência que Ensino"
              : "Registrar Competência que Quero Aprender"}
          </button>
        </div>
      </form>
    </div>
  );
}
