import Form from "next/form";
import Link from "next/link";
import { Search, Filter, RotateCcw } from "lucide-react";

interface DiscoverFiltersProps {
  currentQuery: string;
  currentCategory: string;
  currentType: string;
  categories: string[];
}

/**
 * Formulário de Pesquisa e Filtragem via URL searchParams (Receitas 16 e 17).
 * Utiliza o componente <Form action="/discover"> de "next/form" ensinado na Receita 17,
 * realizando navegação client-side para atualizar os searchParams sem recarregar o layout.
 */
export default function DiscoverFilters({
  currentQuery,
  currentCategory,
  currentType,
  categories,
}: DiscoverFiltersProps) {
  const hasActiveFilters =
    Boolean(currentQuery) || Boolean(currentCategory) || Boolean(currentType);

  return (
    <div className="academic-card p-5 space-y-4">
      <Form
        action="/discover"
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        {/* Busca textual por habilidade, mentor, curso ou cidade */}
        <div className="md:col-span-5">
          <label htmlFor="idSearchQuery" className="label-academic">
            Pesquisar Disciplina, Mentor ou Instituição
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="idSearchQuery"
              name="q"
              type="text"
              defaultValue={currentQuery}
              placeholder="Ex.: Python, Inglês, Cálculo, UFRN..."
              className="input-academic pl-10"
            />
          </div>
        </div>

        {/* Filtro por Categoria Acadêmica */}
        <div className="md:col-span-3">
          <label htmlFor="idCategoryFilter" className="label-academic">
            Área / Categoria
          </label>
          <select
            id="idCategoryFilter"
            name="category"
            defaultValue={currentCategory}
            className="input-academic"
          >
            <option value="">Todas as áreas acadêmicas</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Modalidade (Ensina / Quer Aprender) */}
        <div className="md:col-span-2">
          <label htmlFor="idTypeFilter" className="label-academic">
            Papel na Disciplina
          </label>
          <select
            id="idTypeFilter"
            name="type"
            defaultValue={currentType}
            className="input-academic"
          >
            <option value="">Ensina ou Aprende</option>
            <option value="TEACH">Pode Ensinar</option>
            <option value="LEARN">Quer Aprender</option>
          </select>
        </div>

        {/* Botões de Ação */}
        <div className="md:col-span-2 flex items-center gap-2">
          <button type="submit" className="btn-primary w-full py-2.5">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          {hasActiveFilters && (
            <Link
              href="/discover"
              title="Limpar filtros"
              className="btn-secondary py-2.5 px-3"
            >
              <RotateCcw className="w-4 h-4" />
            </Link>
          )}
        </div>
      </Form>

      {/* Atalhos Rápidos de Categoria via <Link> (Receita 15) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
          Áreas de estudo:
        </span>
        <Link
          href="/discover"
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            !currentCategory
              ? "bg-indigo-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Todas
        </Link>
        {categories.map((cat) => {
          const active =
            currentCategory.toLowerCase() === cat.toLowerCase();
          return (
            <Link
              key={cat}
              href={`/discover?category=${encodeURIComponent(cat)}${
                currentType ? `&type=${encodeURIComponent(currentType)}` : ""
              }${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ""}`}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                active
                  ? "bg-indigo-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
