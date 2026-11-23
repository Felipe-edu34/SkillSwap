"use client";

import { useActionState, useState } from "react";
import { registerAction, type AuthActionState } from "@/actions/auth";
import {
  UserPlus,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const initialState: AuthActionState = {};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [geoMessage, setGeoMessage] = useState<string>("");

  const handleCaptureLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      setGeoMessage("Geolocalização não suportada neste navegador.");
      return;
    }

    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
        setGeoStatus("success");
        setGeoMessage(
          "Coordenadas capturadas para cálculo de proximidade (Haversine)."
        );
      },
      () => {
        setGeoStatus("error");
        setGeoMessage(
          "Permissão de localização negada. Você ainda pode se cadastrar normalmente informando sua cidade."
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="label-academic">
            Nome Completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Ex.: Ana Beatriz Costa"
            className="input-academic"
          />
          {state.fieldErrors?.name && (
            <p className="text-xs text-amber-700 mt-1">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="label-academic">
            E-mail Institucional ou Pessoal
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ana.costa@ufrn.edu.br"
            className="input-academic"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-amber-700 mt-1">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="institutionOrArea" className="label-academic">
            Curso / Área — Instituição
          </label>
          <input
            id="institutionOrArea"
            name="institutionOrArea"
            type="text"
            required
            placeholder="Ex.: Ciência da Computação — UFRN"
            className="input-academic"
          />
          {state.fieldErrors?.institutionOrArea && (
            <p className="text-xs text-amber-700 mt-1">
              {state.fieldErrors.institutionOrArea[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="label-academic">
            Cidade e UF
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            placeholder="Ex.: Natal, RN"
            className="input-academic"
          />
          {state.fieldErrors?.city && (
            <p className="text-xs text-amber-700 mt-1">
              {state.fieldErrors.city[0]}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="label-academic">
          Senha (mínimo de 6 caracteres)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="input-academic"
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-amber-700 mt-1">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="label-academic">
          Resumo Acadêmico & Objetivos de Estudo (Opcional)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          placeholder="Conte brevemente sobre sua área de pesquisa, projetos atuais e o que gostaria de trocar com colegas..."
          className="input-academic resize-none"
        />
        {state.fieldErrors?.bio && (
          <p className="text-xs text-amber-700 mt-1">
            {state.fieldErrors.bio[0]}
          </p>
        )}
      </div>

      {/* Geolocalização Opcional para Bônus Haversine */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              Proximidade para Encontros Presenciais (Opcional)
            </span>
            <span className="text-[11px] text-slate-500">
              Permite priorizar colegas do mesmo campus ou cidade no algoritmo de match.
            </span>
          </div>
          <button
            type="button"
            onClick={handleCaptureLocation}
            disabled={geoStatus === "loading"}
            className="btn-secondary text-xs py-1.5 px-3 shrink-0"
          >
            {geoStatus === "loading" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-indigo-900" />
            )}
            {coords ? "Atualizar Coordenadas" : "Capturar Localização"}
          </button>
        </div>

        <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
        <input type="hidden" name="longitude" value={coords?.lng ?? ""} />

        {geoStatus === "success" && coords && (
          <p className="text-xs text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>
              {geoMessage} ({coords.lat}, {coords.lng})
            </span>
          </p>
        )}

        {geoStatus === "error" && (
          <p className="text-xs text-amber-700">{geoMessage}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-2.5 mt-2"
      >
        <UserPlus className="w-4 h-4" />
        {isPending ? "Criando Perfil Acadêmico..." : "Concluir Cadastro e Configurar Competências"}
      </button>
    </form>
  );
}
