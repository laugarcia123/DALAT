"use client";

import React, { useState, useEffect } from "react";

interface GhostTypeTextProps {
  /** Text to type. Can be a single string or an array of completions. */
  text?: string;
  completions?: string[];
  /** Optional fixed prefix before the typed text */
  prefix?: string;
  /** Milliseconds per character typed (larger = slower) */
  typingSpeed?: number;
  /** Milliseconds per character deleted */
  deleteSpeed?: number;
  /** Milliseconds to pause when the full text is typed */
  pauseDelay?: number;
  /** Whether to loop the typing effect or stop once typed */
  loop?: boolean;
  /** CSS gradient classes for the typed text */
  gradientClass?: string;
  className?: string;
}

export default function GhostTypeText({
  text = "Tu asistente de estudio personalizado",
  completions,
  prefix = "",
  typingSpeed = 120, // Animación lenta según lo pedido
  deleteSpeed = 50,
  pauseDelay = 4200,
  loop = true,
  gradientClass = "bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent",
  className = "",
}: GhostTypeTextProps) {
  // Use completions if provided, otherwise single text target
  const targetList = completions && completions.length > 0 ? completions : [text];
  const [targetIndex, setTargetIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const fullTarget = targetList[targetIndex] || "";

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Slow typing effect loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentText === fullTarget) {
      if (!loop) return;
      // Pause before deleting so the user can read the complete phrase
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDelay);
    } else if (isDeleting && currentText === "") {
      // Finished deleting -> cycle to next or restart
      setIsDeleting(false);
      setTargetIndex((prev) => (prev + 1) % targetList.length);
    } else if (isDeleting) {
      // Deleting character
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, deleteSpeed);
    } else {
      // Typing character slowly
      timeout = setTimeout(() => {
        setCurrentText((prev) => fullTarget.slice(0, prev.length + 1));
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, fullTarget, typingSpeed, deleteSpeed, pauseDelay, loop, targetList.length]);

  // Remaining ghost preview (the translucent predictive text ahead of current typing)
  const ghostRemaining = fullTarget.slice(currentText.length);

  return (
    <span className={`inline-block font-sans ${className}`}>
      {/* Optional Fixed prefix if present */}
      {prefix && <span className="text-slate-100">{prefix} </span>}

      {/* Typed text with purple-pink gradient (restored) */}
      <span className={`${gradientClass} font-extrabold tracking-tight`}>
        {currentText}
      </span>

      {/* Blinking AI Cursor in neon purple/pink */}
      <span
        className={`inline-block w-[3px] h-[0.9em] align-middle bg-gradient-to-b from-purple-400 to-pink-400 mx-1 rounded-full transition-opacity duration-150 ${
          cursorVisible ? "opacity-100 shadow-[0_0_8px_#c084fc]" : "opacity-0"
        }`}
      />

      {/* Translucent predictive ghost text preview in light purple */}
      {!isDeleting && ghostRemaining.length > 0 && (
        <span className="text-purple-300/30 select-none hidden sm:inline">
          {ghostRemaining}
        </span>
      )}
    </span>
  );
}
