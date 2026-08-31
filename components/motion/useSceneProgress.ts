"use client";

import { useEffect, useRef } from "react";

/**
 * Progreso de scroll normalizado, escrito como variable CSS.
 *
 * Es el motor de todas las escenas del sitio. Tres decisiones lo sostienen:
 *
 * 1. El scroll es una LINEA DE TIEMPO, no una serie de eventos. Se normaliza
 *    la posicion del elemento a un progreso 0 -> 1 y cada transformacion se
 *    deriva de ese numero. Asi la escena es reversible, tolera scroll rapido,
 *    saltos de ancla y recargas a media pagina.
 *
 * 2. El resultado se escribe en una variable CSS (`--p`) sobre el escenario,
 *    no en estado de React. Un setState por frame re-renderiza el arbol entero
 *    sesenta veces por segundo para una animacion que el compositor resuelve
 *    solo. Escribir una custom property no re-renderiza nada.
 *
 * 3. Fuera de viewport no corre nada. Un IntersectionObserver decide cuando
 *    arranca y para el bucle; sin el, cada escena de la pagina tendria un rAF
 *    vivo compitiendo por el frame budget.
 *
 * El suavizado interpola hacia el objetivo (lerp). El scroll nativo avanza a
 * saltos de ~100px por muesca de rueda; sin interpolar, la escena avanza a
 * tirones. 0.12 arrastra con elegancia, 0.2 es mas directo, por debajo de
 * 0.06 se siente pegajoso. Con movimiento reducido se salta el lerp.
 */

type Mode =
  /**
   * Contenedor alto con un hijo sticky. El recorrido util es la altura del
   * contenedor menos un viewport: 0 cuando su tope toca el tope de la
   * ventana, 1 cuando su base la alcanza.
   */
  | "sticky"
  /**
   * Elemento de altura normal que cruza la pantalla. 0 cuando su borde
   * superior entra por abajo, 1 cuando su borde inferior sale por arriba.
   * Es el que sirve para parallax y para lineas que se dibujan al pasar.
   */
  | "cross";

type Options = {
  mode?: Mode;
  /** Factor de interpolacion por frame. */
  smoothing?: number;
  /**
   * Se llama una vez por frame mientras la escena esta en pantalla, con el
   * progreso ya suavizado y el reloj del rAF. Para lo que no se puede
   * expresar con calc() sobre --p.
   */
  onFrame?: (progress: number, time: number) => void;
};

export function useSceneProgress<
  Scene extends HTMLElement,
  Stage extends HTMLElement = Scene,
>({ mode = "sticky", smoothing = 0.12, onFrame }: Options = {}) {
  /** Contenedor que define el recorrido. */
  const sceneRef = useRef<Scene | null>(null);
  /** Elemento donde se escribe --p. Si no se usa, se escribe en la escena. */
  const stageRef = useRef<Stage | null>(null);

  // El callback se guarda en un ref para que cambiar su identidad entre
  // renders no reinicie el observer ni el bucle.
  const frameRef = useRef(onFrame);
  useEffect(() => {
    frameRef.current = onFrame;
  });

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let current = 0;
    let inView = false;
    let primed = false;

    const read = () => {
      const rect = scene.getBoundingClientRect();
      if (mode === "cross") {
        const span = window.innerHeight + rect.height;
        return clamp((window.innerHeight - rect.top) / (span || 1));
      }
      const travel = rect.height - window.innerHeight;
      return travel <= 0 ? 0 : clamp(-rect.top / travel);
    };

    const write = (value: number) => {
      const target = stageRef.current ?? scene;
      target.style.setProperty("--p", value.toFixed(4));
    };

    const tick = (time: number) => {
      const goal = read();
      // El primer frame se planta en el valor real en vez de venir desde 0:
      // si no, recargar a media escena produce un barrido de entrada que el
      // usuario no pidio.
      current =
        reduced || !primed ? goal : current + (goal - current) * smoothing;
      primed = true;

      write(current);
      frameRef.current?.(current, time);

      if (inView) raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
          // Al salir se deja el valor del extremo, no el ultimo interpolado:
          // si no, la escena queda congelada a medio camino al volver.
          current = read();
          write(current);
        }
      },
      // Margen generoso: la escena tiene que estar lista un poco antes de
      // asomar, o el primer frame visible ya llega tarde.
      { rootMargin: "20% 0px" },
    );

    observer.observe(scene);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [mode, smoothing]);

  return { sceneRef, stageRef };
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Reencuadra un progreso global a un sub-tramo y lo vuelve a normalizar.
 * Los tramos de una escena tienen que solaparse: si uno acaba exactamente
 * donde empieza el siguiente, se ve el corte.
 */
export function segment(progress: number, from: number, to: number) {
  return clamp((progress - from) / (to - from || 1));
}
