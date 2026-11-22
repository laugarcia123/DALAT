"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export interface StaggeredTextProps {
  text: string;
  as?: React.ElementType;
  segmentBy?: "words" | "chars" | "lines";
  staggerDirection?: "forward" | "reverse" | "center";
  delay?: number; // In milliseconds
  duration?: number; // In seconds
  blur?: boolean;
  direction?: "top" | "bottom" | "left" | "right";
  threshold?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

export const StaggeredText: React.FC<StaggeredTextProps> = ({
  text,
  as: Component = "h2",
  segmentBy = "words",
  staggerDirection = "forward",
  delay = 80,
  duration = 0.7,
  blur = true,
  direction = "bottom",
  threshold = 0.15,
  className = "",
  onAnimationComplete,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const elementsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = elementsRef.current.filter(Boolean);
    if (!targets.length) return;

    // Reset initial styles
    let initX = 0;
    let initY = 0;
    if (direction === "bottom") initY = 35;
    else if (direction === "top") initY = -35;
    else if (direction === "right") initX = 35;
    else if (direction === "left") initX = -35;

    gsap.set(targets, {
      opacity: 0,
      x: initX,
      y: initY,
      filter: blur ? "blur(12px)" : "blur(0px)",
      willChange: "transform, opacity, filter",
    });

    let staggerFrom: "start" | "end" | "center" = "start";
    if (staggerDirection === "reverse") staggerFrom = "end";
    else if (staggerDirection === "center") staggerFrom = "center";

    const triggerAnimation = () => {
      gsap.to(targets, {
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        duration: duration,
        ease: "power3.out",
        stagger: {
          each: delay / 1000,
          from: staggerFrom,
        },
        onComplete: onAnimationComplete,
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(targets);
    };
  }, [text, segmentBy, staggerDirection, delay, duration, blur, direction, threshold, onAnimationComplete]);

  // Build segmented words/characters
  elementsRef.current = [];
  const words = text.split(" ");

  return (
    <Component
      ref={containerRef as React.Ref<any>}
      className={`inline-flex flex-wrap items-center justify-center ${className}`}
    >
      {segmentBy === "words" &&
        words.map((word, wordIndex) => (
          <span
            key={`w-${wordIndex}`}
            ref={(el) => {
              elementsRef.current[wordIndex] = el;
            }}
            className="inline-block mr-[0.28em] last:mr-0 select-none will-change-transform"
          >
            {word}
          </span>
        ))}

      {segmentBy === "chars" &&
        words.map((word, wordIndex) => (
          <span key={`w-${wordIndex}`} className="inline-block whitespace-nowrap mr-[0.28em] last:mr-0">
            {word.split("").map((char, charIndex) => {
              const globalIndex = elementsRef.current.length;
              return (
                <span
                  key={`c-${charIndex}`}
                  ref={(el) => {
                    elementsRef.current[globalIndex] = el;
                  }}
                  className="inline-block select-none will-change-transform"
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
    </Component>
  );
};

export default StaggeredText;
