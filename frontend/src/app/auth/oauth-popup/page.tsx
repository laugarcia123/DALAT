"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User, ArrowRight, Loader2, ShieldCheck, Check } from "lucide-react";

function OAuthPopupContent() {
  const searchParams = useSearchParams();
  const providerParam = searchParams.get("provider") || "google";
  const provider =
    providerParam.toLowerCase() === "github"
      ? "GitHub"
      : providerParam.toLowerCase() === "facebook"
      ? "Facebook"
      : "Google";

  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleSelectAccount = (email: string, name: string) => {
    setSelectedUser(email);
    setIsAuthorizing(true);

    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_LOGIN_SUCCESS",
            provider: provider,
            email: email,
            name: name,
          },
          "*"
        );
        window.close();
      } else {
        // Fallback si no hay window.opener (abierto en la misma pestaña)
        window.location.href = `/?social_auth=${encodeURIComponent(
          provider
        )}&email=${encodeURIComponent(email)}`;
      }
    }, 600);
  };

  if (provider === "Google") {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between p-4 sm:p-8 font-sans text-[#202124] select-none">
        {/* Main Card */}
        <div className="w-full max-w-[450px] mx-auto bg-white rounded-2xl border border-[#dadce0] p-8 sm:p-10 shadow-sm transition-all duration-200">
          {/* Google 4-Color Logo */}
          <div className="flex justify-center mb-4">
            <svg className="w-10 h-10" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-normal text-[#202124] tracking-normal mb-1 font-sans">
              Acceder con Google
            </h1>
            <p className="text-sm text-[#5f6368]">
              Elegir una cuenta para ir a <span className="font-semibold text-[#202124]">Dalat</span>
            </p>
          </div>

          {/* Accounts List */}
          <div className="border-t border-[#dadce0] divide-y divide-[#dadce0] -mx-4 sm:-mx-6">
            {/* Account 1: Daniel Granados */}
            <button
              type="button"
              disabled={isAuthorizing}
              onClick={() =>
                handleSelectAccount("danielgaber@gmail.com", "Daniel Granados")
              }
              className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] active:bg-[#f1f3f4] transition text-left cursor-pointer group disabled:opacity-60"
            >
              {/* Google Avatar circle */}
              <div className="w-9 h-9 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm shrink-0 shadow-xs">
                D
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] transition truncate">
                  Daniel Granados
                </div>
                <div className="text-xs text-[#5f6368] truncate">
                  danielgaber@gmail.com
                </div>
              </div>
              {selectedUser === "danielgaber@gmail.com" && isAuthorizing ? (
                <Loader2 className="w-4 h-4 text-[#1a73e8] animate-spin" />
              ) : null}
            </button>

            {/* Account 2: "Usar otra cuenta" */}
            {!showCustomInput ? (
              <button
                type="button"
                disabled={isAuthorizing}
                onClick={() => setShowCustomInput(true)}
                className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] active:bg-[#f1f3f4] transition text-left cursor-pointer text-[#202124] text-sm font-medium disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-full border border-[#dadce0] flex items-center justify-center text-[#5f6368] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <span>Usar otra cuenta</span>
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customEmail.trim()) {
                    handleSelectAccount(
                      customEmail.trim(),
                      customEmail.split("@")[0]
                    );
                  }
                }}
                className="p-4 bg-[#f8f9fa] space-y-3"
              >
                <label className="text-xs text-[#5f6368] font-medium block">
                  Correo electrónico o teléfono
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#dadce0] bg-white text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-1.5 text-xs text-[#1a73e8] hover:bg-[#f1f3f4] rounded font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="px-4 py-1.5 text-xs bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded font-medium shadow-xs transition"
                  >
                    {isAuthorizing ? "Conectando..." : "Siguiente"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Legal / Permissions disclaimer */}
          <div className="mt-8 text-[12px] text-[#5f6368] leading-relaxed border-t border-[#dadce0] pt-4">
            Para continuar, Google compartirá tu nombre, dirección de correo electrónico, preferencia de idioma y foto de perfil con <strong className="text-[#202124]">Dalat</strong>. Antes de usar esta app, puedes consultar la{" "}
            <a href="#" className="text-[#1a73e8] hover:underline">
              Política de Privacidad
            </a>{" "}
            y las{" "}
            <a href="#" className="text-[#1a73e8] hover:underline">
              Condiciones del Servicio
            </a>{" "}
            de Dalat.
          </div>
        </div>

        {/* Google Popup Footer */}
        <div className="w-full max-w-[450px] mx-auto mt-4 flex items-center justify-between text-xs text-[#5f6368] px-2">
          <span>Español (Latinoamérica)</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#202124]">Ayuda</a>
            <a href="#" className="hover:text-[#202124]">Privacidad</a>
            <a href="#" className="hover:text-[#202124]">Condiciones</a>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for GitHub / Facebook
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold">Autorizar Dalat con {provider}</h2>
        <p className="text-xs text-slate-400">
          ¿Deseas permitir que Dalat acceda a tu cuenta de {provider}?
        </p>
        <button
          onClick={() =>
            handleSelectAccount("danielgaber@gmail.com", "Daniel Granados")
          }
          className="w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs shadow-md transition"
        >
          {isAuthorizing ? "Autorizando..." : "Continuar como Daniel Granados"}
        </button>
      </div>
    </div>
  );
}

export default function OAuthPopupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Cargando Google...</div>}>
      <OAuthPopupContent />
    </Suspense>
  );
}
