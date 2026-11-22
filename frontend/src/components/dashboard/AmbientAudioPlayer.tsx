"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  CloudRain,
  Brain,
  Wind,
  Coffee,
  Sparkles,
  Radio
} from "lucide-react";

export type SoundscapeId = "lluvia" | "ondas_alpha" | "ruido_blanco" | "biblioteca" | "ondas_theta";

interface Soundscape {
  id: SoundscapeId;
  name: string;
  tag: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: "lluvia",
    name: "Lluvia suave en ventana",
    tag: "Aislamiento acústico",
    subtitle: "Gotas continuas con filtro pasabajas",
    icon: CloudRain,
    description: "Aísla conversaciones del hogar, tráfico y ruidos repentinos con una textura continua relajante.",
  },
  {
    id: "ondas_alpha",
    name: "Ondas Alpha (10 Hz)",
    tag: "Flujo cognitivo",
    subtitle: "Pulsos binaurales 200 Hz / 210 Hz",
    icon: Brain,
    description: "Sintoniza la frecuencia cerebral óptima para absorber lecturas densas y retención de memoria sostenida.",
  },
  {
    id: "ruido_blanco",
    name: "Ruido blanco puro",
    tag: "Cero distracciones",
    subtitle: "Densidad espectral constante",
    icon: Wind,
    description: "Crea una barrera acústica uniforme para eliminar cambios bruscos de sonido en tu entorno de estudio.",
  },
  {
    id: "biblioteca",
    name: "Biblioteca silenciosa",
    tag: "Presencia cálida",
    subtitle: "Resonancia cálida de sala",
    icon: Coffee,
    description: "Emula la atmósfera y resonancia profunda de una sala de estudio universitaria para enfoque prolongado.",
  },
  {
    id: "ondas_theta",
    name: "Ondas Theta (6 Hz)",
    tag: "Anti-ansiedad",
    subtitle: "Binaural suave 150 Hz / 156 Hz",
    icon: Sparkles,
    description: "Reduce la sobrecarga mental y el estrés antes de exámenes difíciles manteniendo la lucidez de estudio.",
  },
];

function generatePinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
    b6 = white * 0.115926;
  }
  return noiseBuffer;
}

function generateWhiteNoiseBuffer(ctx: AudioContext, gain: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * gain;
  }
  return noiseBuffer;
}

interface AmbientAudioPlayerProps {
  isLightMode?: boolean;
}

export default function AmbientAudioPlayer({ isLightMode = false }: AmbientAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeId>("lluvia");
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Web Audio Context & Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const activeSourcesRef = useRef<Array<{ stop?: () => void; disconnect: () => void }>>([]);

  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopCurrentAudio = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        if (src.stop) src.stop();
        src.disconnect();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
  };

  const startSoundscape = (soundId: SoundscapeId) => {
    stopCurrentAudio();
    try {
      const ctx = getAudioContext();
      const mainGain = ctx.createGain();
      const effectiveVol = isMuted ? 0 : volume;
      mainGain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      if (soundId === "lluvia") {
        const noiseBuffer = generatePinkNoiseBuffer(ctx);
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(820, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(mainGain);
        whiteNoise.start();

        activeSourcesRef.current.push(whiteNoise);
      } else if (soundId === "ondas_alpha") {
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        oscLeft.type = "sine";
        oscRight.type = "sine";
        oscLeft.frequency.setValueAtTime(200, ctx.currentTime);
        oscRight.frequency.setValueAtTime(210, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.18, ctx.currentTime);

        oscLeft.connect(subGain);
        oscRight.connect(subGain);
        subGain.connect(mainGain);

        oscLeft.start();
        oscRight.start();

        activeSourcesRef.current.push(oscLeft, oscRight);
      } else if (soundId === "ondas_theta") {
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        oscLeft.type = "sine";
        oscRight.type = "sine";
        oscLeft.frequency.setValueAtTime(150, ctx.currentTime);
        oscRight.frequency.setValueAtTime(156, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.19, ctx.currentTime);

        oscLeft.connect(subGain);
        oscRight.connect(subGain);
        subGain.connect(mainGain);

        oscLeft.start();
        oscRight.start();

        activeSourcesRef.current.push(oscLeft, oscRight);
      } else if (soundId === "ruido_blanco") {
        const noiseBuffer = generateWhiteNoiseBuffer(ctx, 0.065);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3200, ctx.currentTime);

        noise.connect(filter);
        filter.connect(mainGain);
        noise.start();

        activeSourcesRef.current.push(noise);
      } else if (soundId === "biblioteca") {
        const noiseBuffer = generateWhiteNoiseBuffer(ctx, 0.045);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(430, ctx.currentTime);

        const hum = ctx.createOscillator();
        hum.type = "sine";
        hum.frequency.setValueAtTime(88, ctx.currentTime);

        const humGain = ctx.createGain();
        humGain.gain.setValueAtTime(0.035, ctx.currentTime);

        noise.connect(lowpass);
        lowpass.connect(mainGain);
        hum.connect(humGain);
        humGain.connect(mainGain);

        noise.start();
        hum.start();

        activeSourcesRef.current.push(noise, hum);
      }
    } catch (err) {
      console.warn("No se pudo iniciar el audio de concentración:", err);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopCurrentAudio();
      setIsPlaying(false);
    } else {
      startSoundscape(currentSoundscape);
      setIsPlaying(true);
    }
  };

  const handleSelectSoundscape = (soundId: SoundscapeId) => {
    setCurrentSoundscape(soundId);
    if (isPlaying) {
      startSoundscape(soundId);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) setIsMuted(false);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : newVol, audioCtxRef.current.currentTime);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(nextMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        void audioCtxRef.current.close();
      }
    };
  }, []);

  const activeSoundObj = SOUNDSCAPES.find((s) => s.id === currentSoundscape) || SOUNDSCAPES[0];
  const IconComponent = activeSoundObj.icon;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden transition-all duration-300 ${
        isLightMode
          ? "bg-white border-slate-200/90 shadow-slate-900/5 text-slate-800"
          : "bg-[#0c0e18] border-white/[0.08] shadow-black/20 text-white"
      }`}
    >
      {/* Soft ambient cosmic glow */}
      {isPlaying && (
        <div
          className={`absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isLightMode ? "bg-violet-400/10" : "bg-purple-600/10"
          }`}
        />
      )}

      {/* Header Bar */}
      <div
        className={`flex items-center justify-between pb-3 border-b ${
          isLightMode ? "border-slate-100" : "border-white/[0.08]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLightMode
                ? "bg-violet-50 border-violet-200/80 text-violet-600"
                : "bg-white/[0.04] border-white/[0.08] text-purple-300"
            }`}
          >
            <Radio className="w-4 h-4" />
          </div>
          <h3
            className={`text-sm font-bold tracking-tight truncate ${
              isLightMode ? "text-slate-900" : "text-white"
            }`}
          >
            Aísla distracciones con frecuencias sintetizadas
          </h3>
        </div>
      </div>

      {/* Responsive Workspace Grid: Stacks cleanly below 1280px (tablet/laptop) and side-by-side on xl */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Player Side (5 cols on xl, full width on smaller) */}
        <div
          className={`xl:col-span-5 p-4 sm:p-5 rounded-xl border space-y-4 transition-all duration-200 ${
            isLightMode
              ? "bg-slate-50/80 border-slate-200/90 shadow-xs"
              : "bg-[#0e111d] border-white/[0.08] shadow-lg shadow-black/20"
          }`}
        >
          {/* Active Sound Card Header with Equalizer Visualizer */}
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLightMode
                    ? "bg-violet-100 text-violet-700 border-violet-200 shadow-xs"
                    : "bg-purple-500/15 border-white/[0.08] text-purple-200"
                }`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider block ${
                    isLightMode ? "text-violet-600" : "text-purple-300"
                  }`}
                >
                  {activeSoundObj.tag}
                </span>
                <h4
                  className={`text-sm font-bold truncate ${
                    isLightMode ? "text-slate-900" : "text-white"
                  }`}
                >
                  {activeSoundObj.name}
                </h4>
                <p
                  className={`text-[11px] truncate ${
                    isLightMode ? "text-slate-500" : "text-slate-400"
                  }`}
                  title={activeSoundObj.subtitle}
                >
                  {activeSoundObj.subtitle}
                </p>
              </div>
            </div>

            {/* Equalizer Visualizer Bars */}
            <div
              className={`flex items-end gap-1 h-7 shrink-0 px-2 py-1 rounded-lg border transition-all ${
                isLightMode
                  ? "bg-violet-100/70 border-violet-200"
                  : "bg-black/40 border-white/[0.08]"
              }`}
              title={isPlaying ? "Audio reproduciéndose" : "Audio en pausa"}
            >
              <span
                className={`w-1 rounded-full transition-all duration-300 ${
                  isLightMode ? "bg-violet-600" : "bg-purple-400"
                } ${isPlaying ? "h-5 animate-pulse" : "h-1.5 opacity-30"}`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-200 ${
                  isLightMode ? "bg-violet-500" : "bg-purple-300"
                } ${isPlaying ? "h-3.5 animate-bounce" : "h-1.5 opacity-30"}`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-400 ${
                  isLightMode ? "bg-indigo-600" : "bg-violet-400"
                } ${isPlaying ? "h-6 animate-pulse" : "h-1.5 opacity-30"}`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-300 ${
                  isLightMode ? "bg-violet-500" : "bg-purple-400"
                } ${isPlaying ? "h-4 animate-bounce" : "h-1.5 opacity-30"}`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-500 ${
                  isLightMode ? "bg-indigo-500" : "bg-violet-300"
                } ${isPlaying ? "h-5 animate-pulse" : "h-1.5 opacity-30"}`}
              />
            </div>
          </div>

          <p
            className={`text-xs leading-relaxed border-t pt-2.5 ${
              isLightMode
                ? "text-slate-600 border-slate-200/70"
                : "text-slate-300/90 border-white/[0.06]"
            }`}
          >
            {activeSoundObj.description}
          </p>

          {/* Master Controls: Play button & Volume */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={togglePlay}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                isPlaying
                  ? isLightMode
                    ? "bg-violet-700 hover:bg-violet-800 text-white shadow-violet-700/20"
                    : "bg-purple-900/80 hover:bg-purple-900 text-white border border-purple-500/30"
                  : isLightMode
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/20"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current text-white shrink-0" />
                  <span className="text-white font-semibold whitespace-nowrap">Pausar ambiente</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white shrink-0" />
                  <span className="text-white font-semibold whitespace-nowrap">Iniciar sonido</span>
                </>
              )}
            </button>

            {/* Volume control */}
            <div
              className={`flex items-center gap-2 border px-3 py-2 rounded-xl shrink-0 ${
                isLightMode
                  ? "bg-white border-slate-200 shadow-xs"
                  : "bg-[#090b14] border-white/[0.08]"
              }`}
            >
              <button
                type="button"
                onClick={toggleMute}
                className={`transition cursor-pointer ${
                  isLightMode
                    ? "text-violet-600 hover:text-violet-800"
                    : "text-purple-300 hover:text-white"
                }`}
                title={isMuted ? "Activar sonido" : "Silenciar"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className={`w-16 sm:w-20 h-1.5 rounded-lg cursor-pointer ${
                  isLightMode
                    ? "bg-slate-200 accent-indigo-600"
                    : "bg-slate-800 accent-purple-500"
                }`}
                title={`Volumen: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>
          </div>
        </div>

        {/* Right Soundscape Selection Gallery (7 cols on xl, full width on smaller) */}
        <div className="xl:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2.5">
            {SOUNDSCAPES.map((sound) => {
              const isSelected = currentSoundscape === sound.id;
              const SoundIcon = sound.icon;
              return (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => handleSelectSoundscape(sound.id)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer select-none flex items-start gap-3 relative group ${
                    isSelected
                      ? isLightMode
                        ? "bg-violet-50/80 border-violet-300 shadow-xs ring-1 ring-violet-300/40"
                        : "bg-purple-950/30 border-purple-500/40 shadow-md shadow-black/20"
                      : isLightMode
                      ? "bg-white border-slate-200 hover:border-violet-200 hover:bg-violet-50/30 text-slate-700 shadow-xs"
                      : "bg-[#090b14] border-white/[0.06] hover:border-white/[0.14] hover:bg-[#121424] text-slate-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? isLightMode
                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                          : "bg-purple-500/25 text-purple-200 border border-white/[0.10]"
                        : isLightMode
                        ? "bg-slate-100 text-slate-600 group-hover:text-violet-700 group-hover:bg-violet-100/70 border border-slate-200"
                        : "bg-white/[0.04] text-slate-400 group-hover:text-purple-300 border border-white/[0.06]"
                    }`}
                  >
                    <SoundIcon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-semibold truncate block transition ${
                          isLightMode
                            ? isSelected
                              ? "text-violet-950 font-bold"
                              : "text-slate-800 group-hover:text-violet-700"
                            : isSelected
                            ? "text-white font-bold"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {sound.name}
                      </span>
                      {isSelected && isPlaying && (
                        <div className="flex items-end gap-0.5 h-3 shrink-0">
                          <span
                            className={`w-0.5 rounded-full ${
                              isLightMode ? "bg-violet-600" : "bg-purple-400"
                            } h-3 animate-pulse`}
                          />
                          <span
                            className={`w-0.5 rounded-full ${
                              isLightMode ? "bg-violet-500" : "bg-purple-300"
                            } h-1.5 animate-bounce`}
                          />
                          <span
                            className={`w-0.5 rounded-full ${
                              isLightMode ? "bg-indigo-600" : "bg-violet-400"
                            } h-2.5 animate-pulse`}
                          />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] block mt-0.5 truncate font-medium ${
                        isLightMode
                          ? isSelected
                            ? "text-violet-600"
                            : "text-slate-500 group-hover:text-violet-600"
                          : "text-purple-300/80"
                      }`}
                    >
                      {sound.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
