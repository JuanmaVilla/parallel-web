"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink, type Href } from "@/components/ui/ButtonLink";
import { SplitText } from "@/components/motion/SplitText";
import { Magnetic } from "@/components/motion/Magnetic";
import { useSceneProgress } from "@/components/motion/useSceneProgress";
import { usePrefersReducedMotion } from "@/components/scroll/useScrollProgress";

/**
 * Primera pantalla: escena dirigida por scroll en dos actos.
 *
 * ACTO 1 — la sala. Cinco planos de texto gigante montados como una
 * habitacion, con la camara dentro. Al hacer scroll la caja avanza y el
 * visitante la atraviesa. El nombre del estudio y lo que hace no estan
 * escritos en un parrafo: son el espacio.
 *
 * ACTO 2 — el campo. Antes de que la sala termine de irse, las piezas del
 * estudio ya estan pasando volando junto a la camara. Los dos tramos se
 * solapan a proposito: si uno acabase donde empieza el otro se veria el corte.
 *
 * El titular vive fuera de las dos capas 3D, en 2D plano y con z-index
 * propio. Metido dentro de la sala, el navegador lo ordenaria por profundidad
 * y desapareceria detras de una pared en cuanto esta se acercase.
 *
 * Presupuesto de color: la sala entera es el elemento de marca del viewport,
 * asi que los dos botones van en neutral. Es la inversion habitual de la
 * regla 80/15/5 (MARCA.md §3) cuando lo que lleva la marca es el fondo.
 *
 * El bloque central ocupa una columna contenida — 56rem, titular a 20ch — a
 * proposito. En una escena a pantalla completa el protagonista es el espacio,
 * no el texto: un titular ancho compite con las paredes y las dos cosas
 * pierden. Es tambien mas chico de lo que pide la intuicion.
 *
 * Sin JavaScript la escena queda quieta en su primer frame y el titular
 * visible: el <noscript> del layout devuelve las palabras a su sitio.
 */
export function Hero({
  ctaPrimaryHref = "#paquetes",
  ctaSecondaryHref = "#antes-despues",
}: {
  /** Destino del CTA principal. Ancla en la landing, ruta en el home. */
  ctaPrimaryHref?: Href;
  ctaSecondaryHref?: Href;
} = {}) {
  const t = useTranslations("home");
  const room = useTranslations("home").raw("room") as Record<RoomFace, string[]>;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLLIElement[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const { sceneRef, stageRef } = useSceneProgress<HTMLElement, HTMLDivElement>({
    smoothing: 0.1,
    onFrame: (progress, time) => {
      // Pasado el final del tramo de salida el contenido ya esta a opacidad
      // cero: ahi se retira del arbol de foco y del hit-testing, porque
      // invisible no es lo mismo que ausente.
      const content = contentRef.current;
      if (content) {
        const hidden = progress >= CONTENT_EXIT_END;
        if (hidden !== content.hasAttribute("data-hidden")) {
          content.toggleAttribute("data-hidden", hidden);
        }
      }

      const cards = cardsRef.current;
      if (!cards.length) return;

      // El campo arranca antes de que la sala acabe de irse. Reencuadrar el
      // progreso global al tramo del acto y volver a normalizarlo es lo que
      // permite que los dos convivan sin pisarse.
      const fieldP = segment(progress, FIELD_FROM, 1);
      // Deriva constante para que las tarjetas ya se muevan sin tocar nada.
      const drift = reducedMotion ? 0 : DRIFT_SPEED * (time / 1000);

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const spec = CARDS[i];
        if (!card || !spec) continue;

        const z = spec.z0 + fieldP * FIELD_TRAVEL + drift;
        // Un objeto fuera de rango es invisible pero el navegador lo sigue
        // componiendo. Descartarlo explicitamente ahorra una capa por frame.
        const visible = fieldP > 0 && z > Z_FAR - 100 && z < Z_NEAR;
        if (!visible) {
          if (card.style.display !== "none") card.style.display = "none";
          continue;
        }
        if (card.style.display) card.style.display = "";

        // Los offsets laterales van sobredimensionados: una traslacion en X
        // ocurre en el espacio 3D y despues se proyecta, asi que a z lejano
        // se encoge y el campo se amontonaria en el centro.
        card.style.transform =
          `translate3d(calc(-50% + ${spec.x}vw), calc(-50% + ${spec.y}vh), ${z.toFixed(1)}px)` +
          ` rotate(${spec.rot}deg)`;
        card.style.opacity = (
          ramp((z - Z_FAR) / 700) * ramp((Z_NEAR - z) / 420)
        ).toFixed(3);
      }
    },
  });

  // Parallax de puntero sobre el halo. Es el unico elemento que sigue al
  // raton: moviendo tambien el texto, leer mientras se mueve el cursor se
  // vuelve incomodo.
  const haloRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const stage = stageRef.current;
    const halo = haloRef.current;
    if (!stage || !halo) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      halo.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      tx = (event.clientX / rect.width - 0.5) * 90;
      ty = (event.clientY / rect.height - 0.5) * 60;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [stageRef]);

  return (
    <section
      ref={sceneRef}
      aria-label={t("eyebrow")}
      className="pl-scene h-[170vh] bg-bg lg:h-[200vh]"
    >
      <div ref={stageRef} className="pl-scene__stage">
        {/* Capa 0 — halo de marca, detras de todo. */}
        <div aria-hidden className="pl-hero__halo-wrap">
          <div ref={haloRef} className="pl-hero__halo" />
        </div>

        {/* Capa 1 — la sala. Perspective compartida y preserve-3d: es la
            unica capa del sitio donde eso es correcto, porque las cinco caras
            son un mismo cuerpo y tienen que ocluirse entre si. */}
        <div aria-hidden className="pl-room">
          <div className="pl-room__box">
            {ROOM_FACES.map((face) => (
              <div
                key={face}
                className={`pl-room__face pl-room__face--${face}`}
              >
                {/* Cada cara lleva sus lineas apiladas. Partir la frase en
                    dos permite componerla mucho mas grande: una sola linea
                    larga tiene que encoger hasta caber en el ancho del plano
                    y pierde toda la presencia. */}
                {room[face].map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="pl-room__vignette" />
        </div>

        {/* Capa 2 — el campo de fotos del estudio. */}
        <ul aria-hidden className="pl-field">
          {CARDS.map((card, i) => (
            <li
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="pl-field__card"
              style={{ display: "none" }}
            >
              {/* <img> y no next/image a proposito. Los webp ya vienen al
                  tamano exacto que la escena necesita (scripts/convert-hero-
                  cards.mjs), asi que el optimizador no tendria nada que
                  recortar; y son diez piezas que tienen que estar decodificadas
                  antes de que el visitante llegue al segundo acto — cualquier
                  aparicion tardia se ve. El alt va vacio porque la lista entera
                  es aria-hidden: son ambiente, no contenido. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.src}
                alt=""
                className="size-full object-cover"
                loading="eager"
                decoding="async"
              />
            </li>
          ))}
        </ul>

        {/* Capa 5 — contenido. Siempre por encima, siempre en 2D. */}
        <div ref={contentRef} className="pl-hero__content">
          <div className="mx-auto flex h-full w-full max-w-[56rem] flex-col items-center justify-center px-4 text-center">
            <h1 className="max-w-[20ch] font-sans font-bold text-fluid-hero leading-display tracking-title text-ink uppercase">
              <SplitText immediate accent={t("headlineAccent")}>
                {t("headline")}
              </SplitText>
            </h1>

            <p className="mx-auto mt-6 max-w-[48ch] text-body-lg leading-body text-ink-body">
              {t("subhead")}
            </p>

            {/* Los dos en neutral: el color de marca del viewport se lo lleva
                entero la sala. */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Magnetic>
                <ButtonLink href={ctaPrimaryHref} variant="inverse">
                  {t("ctaPrimary")}
                </ButtonLink>
              </Magnetic>
              <ButtonLink href={ctaSecondaryHref} variant="secondary">
                {t("ctaSecondary")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   Geometria de la escena

   Z_NEAR se queda muy por debajo del techo de la distancia focal
   (--pl-z-max = 675px con perspective 900). Pasado ese punto la escala se
   dispara: a z = 850 un objeto se ve 18 veces mas grande y llena la pantalla.
   ------------------------------------------------------------------ */

/** Punto del recorrido donde el contenido ya llego a opacidad cero.
    Tiene que coincidir con el tramo declarado en .pl-hero__content. */
const CONTENT_EXIT_END = 0.88;

/** Donde arranca el segundo acto. La sala se apaga en 0.58, asi que los dos
    conviven un tramo. */
const FIELD_FROM = 0.24;

const Z_NEAR = 520;
const Z_FAR = -2300;
/** Cuanto avanza cada foto en z a lo largo del tramo. Es la velocidad del
    campo: cuanto mas alto, mas rapido pasan las fotos por el mismo scroll.
    A 3200 el campo entero se vaciaba antes de que terminara la escena. */
const FIELD_TRAVEL = 2400;
/** Deriva en reposo, px/s. Lento a proposito: es respiracion, no movimiento. */
const DRIFT_SPEED = 30;

type Card = { x: number; y: number; z0: number; rot: number; src: string };

/**
 * Reparto del campo.
 *
 * El z inicial se escalona en grupos y no linealmente: repartido en linea,
 * las ultimas tarjetas nunca llegan a la camara y el flujo se corta a mitad
 * de recorrido. La zona central queda libre — es donde vive el titular.
 */
const CARDS: Card[] = [
  { x: -34, y: -26, z0: -2300, rot: -7, src: "/hero-cards/01-fader.webp" },
  { x: 31, y: -30, z0: -1920, rot: 5, src: "/hero-cards/08-waveform.webp" },
  { x: -42, y: 14, z0: -1540, rot: 4, src: "/hero-cards/09-knob.webp" },
  { x: 38, y: 20, z0: -1160, rot: -6, src: "/hero-cards/04-monitors.webp" },
  { x: -26, y: 32, z0: -780, rot: 8, src: "/hero-cards/02-vu-meter.webp" },
  { x: 27, y: -8, z0: -2140, rot: -4, src: "/hero-cards/05-patchbay.webp" },
  { x: -46, y: -6, z0: -1760, rot: 6, src: "/hero-cards/07-headphones.webp" },
  { x: 45, y: 30, z0: -1380, rot: -8, src: "/hero-cards/03-vocalist.webp" },
  { x: -30, y: -34, z0: -1000, rot: 3, src: "/hero-cards/06-console.webp" },
  { x: 33, y: 36, z0: -620, rot: -5, src: "/hero-cards/10-booth.webp" },
];

type RoomFace = "ceiling" | "floor" | "left" | "right";

/**
 * La sala no tiene pared del fondo.
 *
 * La tuvo, y el centro del encuadre es justo donde va el titular: cualquier
 * palabra ahi detras compite con lo unico que hay que leer, por grande y
 * apagada que este. Sin ella, el punto de fuga es negro puro y el titular
 * cae sobre vacio. El nombre del estudio se compone entero en el techo.
 */
const ROOM_FACES: RoomFace[] = ["ceiling", "floor", "left", "right"];

function ramp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function segment(progress: number, from: number, to: number) {
  return ramp((progress - from) / (to - from || 1));
}
