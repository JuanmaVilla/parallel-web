"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSceneProgress } from "@/components/motion/useSceneProgress";

type Item = { title: string; body: string; details: string[] };

/**
 * Los servicios como tarjetas que cruzan la pantalla.
 *
 * Variante de la seccion anterior, montada al lado para poder compararlas.
 * Aca el titular se queda clavado en el centro y son las tarjetas las que se
 * mueven: entran por abajo, cruzan la pantalla y salen por arriba.
 *
 * Las cuatro van al mismo paso. Cada una recorre el mismo tramo de scroll y
 * lo recorre a velocidad constante, asi que la seccion se lee como una cinta
 * que avanza sola y no como cuatro pases con ritmo propio. El tramo util
 * para mirar y pulsar una tarjeta no lo da una pausa: lo da el solape, que
 * mantiene cada tarjeta en pantalla casi medio recorrido.
 *
 * Tres niveles de informacion, uno por cada gesto que el usuario ya conoce:
 * el rotulo se ve siempre, el hover descubre de que va el servicio, y el
 * click gira la tarjeta y muestra el detalle. Nada obliga a llegar al tercero.
 *
 * En tactil no hay hover, asi que ahi el panel va siempre puesto: si el
 * segundo nivel dependiera del puntero, en movil la tarjeta no diria nada.
 *
 * El recorrido lo escribe el rAF sobre el elemento exterior y el giro vive en
 * uno interior. Separarlos es lo que permite que convivan: el de fuera se
 * traslada en 2D y aporta la perspective, el de dentro rota en 3D dentro de
 * ella.
 *
 * Las portadas son fotos del estudio, una por servicio. Van mas expuestas que
 * las del hero porque aca el texto se apoya encima de la imagen — ver COVERS.
 */
export function ServiceCards() {
  const t = useTranslations("home.cards");
  const items = t.raw("items") as Item[];
  const cardsRef = useRef<HTMLLIElement[]>([]);

  // Una sola tarjeta girada a la vez. Con varias abiertas la seccion pasa de
  // ser un recorrido a ser un formulario.
  const [flipped, setFlipped] = useState<number | null>(null);

  const { sceneRef, stageRef } = useSceneProgress<HTMLElement, HTMLDivElement>({
    smoothing: 0.12,
    onFrame: (progress) => {
      // En pantalla angosta no hay sitio para dos carriles: las tarjetas se
      // centran, se turnan en vez de solaparse, y paran un poco por debajo
      // del centro para no tapar el titular entero.
      const narrow = window.innerWidth < 768;
      const step = narrow ? NARROW_STEP : CARD_STEP;
      const span = narrow ? NARROW_SPAN : CARD_SPAN;

      for (let i = 0; i < cardsRef.current.length; i++) {
        const card = cardsRef.current[i];
        if (!card) continue;

        const from = CARD_FROM + i * step;
        const at = clamp((progress - from) / span);

        // Fuera de su tramo la tarjeta no se compone: un elemento invisible
        // que el navegador sigue pintando cuesta una capa por frame.
        if (at <= 0 || at >= 1) {
          if (card.style.display !== "none") card.style.display = "none";
          continue;
        }
        if (card.style.display) card.style.display = "";

        const lane = narrow ? LANES[i] * 0.22 : LANES[i];
        // En angosto el carril entero baja: sin la pausa del centro no hay
        // momento en el que apartar la tarjeta del titular, asi que se aparta
        // durante todo el recorrido.
        const drop = narrow ? NARROW_DROP : 0;

        card.style.transform =
          `translate(-50%, -50%) translate(${lane.toFixed(1)}vw, ${(travel(at) + drop).toFixed(1)}vh)` +
          ` rotate(${TILTS[i]}deg)`;
        // Aparece y se va en los extremos del tramo, nunca de golpe.
        card.style.opacity = Math.min(
          clamp(at / 0.12),
          clamp((1 - at) / 0.12),
        ).toFixed(3);
      }
    },
  });

  return (
    <section
      ref={sceneRef}
      aria-labelledby="servicios-tarjetas"
      className="pl-scene h-[420vh] border-t border-line bg-bg"
    >
      <div
        ref={stageRef}
        className="pl-scene__stage flex items-center justify-center"
      >
        <div className="pl-svc-title mx-auto w-full max-w-[1440px] px-4 text-center lg:px-16">
          <h2
            id="servicios-tarjetas"
            className="font-sans font-bold uppercase text-fluid-svc leading-display tracking-title text-ink"
          >
            {t("heading")}
          </h2>
          {/* El aviso va en Lastica: rotulo corto en versalitas, ASCII puro. */}
          <p className="mt-8 font-display text-body-sm uppercase tracking-caps text-brand-orange">
            {t("hint")}
          </p>
        </div>

        <ul className="pl-svc-deck">
          {items.map((item, i) => (
            <li
              key={item.title}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="pl-svc"
              style={{ display: "none" }}
            >
              <button
                type="button"
                onClick={() => setFlipped((v) => (v === i ? null : i))}
                aria-expanded={flipped === i}
                data-flipped={flipped === i ? "" : undefined}
                className="pl-svc__flip"
              >
                {/* Cara de delante: portada + rotulo, y el resumen al pasar
                    el puntero. */}
                <span className="pl-svc__face">
                  <span aria-hidden className="pl-svc__cover">
                    {/* <img> y no next/image: los webp ya vienen al tamano
                        exacto que la tarjeta necesita (scripts/convert-fotos
                        .mjs), y son cuatro piezas que tienen que estar
                        decodificadas antes de que la tarjeta entre en pantalla.
                        El alt va vacio porque la portada es aria-hidden — el
                        titulo del servicio ya esta en el rotulo de al lado. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={COVERS[i]}
                      alt=""
                      className="size-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  </span>

                  {/* Punto que avisa que la tarjeta responde al puntero.
                      Decorativo: para quien navega con teclado o lector el
                      aviso ya lo da el foco, que abre el mismo panel. */}
                  <span aria-hidden className="pl-svc__cue" />

                  <span aria-hidden className="pl-svc__label">
                    <span className="block font-sans text-heading-sm font-bold leading-heading tracking-title text-ink">
                      {item.title}
                    </span>
                  </span>

                  <span className="pl-svc__info">
                    <span className="pl-svc__info-text">
                      <span className="block font-sans text-heading-sm font-bold leading-heading tracking-title text-ink">
                        {item.title}
                      </span>
                      {/* Cuerpo en el gris de texto mas alto, no en el
                          secundario: encima de una foto, aunque este
                          desenfocada y bajada de brillo, el gris medio se
                          empasta con el fondo. */}
                      <span className="mt-3 block text-body-md leading-body text-ink-body">
                        {item.body}
                      </span>
                    </span>
                    <span className="inline-flex min-h-11 items-center self-start rounded-full bg-ink px-5 font-sans text-body-sm font-bold uppercase tracking-caps text-bg">
                      {t("open")}
                    </span>
                  </span>
                </span>

                {/* Cara de atras: el detalle. */}
                <span className="pl-svc__face pl-svc__face--back">
                  <span className="pl-svc__back-head">
                    {/* Numero en Lastica: dato tecnico, versalitas, ASCII
                        puro. Es el unico elemento de marca de la cara. */}
                    <span className="block font-display text-caption uppercase tracking-caps text-brand-orange">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-2 block font-sans text-body-lg font-bold leading-heading tracking-title text-ink">
                      {item.title}
                    </span>
                  </span>

                  {/* Un dato por fila. No es una lista real porque esto vive
                      dentro de un <button>, que solo admite contenido de
                      frase — de ahi los span. */}
                  <span className="pl-svc__specs">
                    {item.details.map((detail) => (
                      <span key={detail} className="pl-svc__spec">
                        <span aria-hidden className="pl-svc__spec-mark" />
                        <span className="text-body-sm leading-body text-ink-body">
                          {detail}
                        </span>
                      </span>
                    ))}
                  </span>

                  <span className="pl-svc__back-foot font-sans text-body-sm font-bold uppercase tracking-caps text-ink-secondary">
                    {t("close")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Portadas. Una foto por servicio, en el orden de home.cards.items.
 *
 * Estan expuestas mas alto que las del hero a proposito: el rotulo y el panel
 * de hover se apoyan encima, asi que una foto tan oscura como las del campo
 * dejaria el texto sin contraste contra el que apoyarse. Ademas separa las dos
 * secciones — el hero es ambiente, esto es el gesto de cada servicio.
 */
const COVERS = [
  "/service-cards/01-mezcla.webp",
  "/service-cards/02-mastering.webp",
  "/service-cards/03-vocal.webp",
  "/service-cards/04-beats.webp",
];

/* ------------------------------------------------------------------
   Recorrido

   La escena mide 420vh y las cuatro tarjetas se la reparten en partes
   iguales: mismo tramo de scroll cada una, misma distancia recorrida, misma
   velocidad. Arrancan escalonadas con la misma diferencia entre una y la
   siguiente, asi que la cadencia con la que aparecen tambien es pareja.

   Los numeros no son libres: la ultima tarjeta tiene que terminar su tramo
   justo al final de la escena. Con cuatro tarjetas eso es
   CARD_FROM + 3*STEP + SPAN = 1. Si la suma se pasa de 1, la ultima queda
   cortada a mitad de recorrido cuando la seccion se acaba — y entonces esa
   tarjeta ya no va al mismo paso que las otras tres.

   Con SPAN 0.44 y STEP 0.18 hay 0.26 de solape: siempre hay dos en pantalla,
   la que se va y la que llega. Sin ese solape la seccion se leeria como
   cuatro pases sueltos en vez de como un flujo.
   ------------------------------------------------------------------ */

const CARD_FROM = 0.02;
const CARD_STEP = 0.18;
const CARD_SPAN = 0.44;

/* En angosto los carriles se juntan en el centro, asi que dos tarjetas
   solapadas chocarian. Se turnan: el solape baja a 0.02 — lo que dura el
   fundido de los extremos — y cierran igual en 1 (0.02 + 3*0.24 + 0.26). */
const NARROW_STEP = 0.24;
const NARROW_SPAN = 0.26;
/** Cuanto baja el carril entero respecto del centro, en vh. Deja el titular
    a la vista por encima durante todo el recorrido. */
const NARROW_DROP = 17;

/** Carril horizontal de cada tarjeta, en vw desde el centro. Alternan lado
    para que el ojo cruce la pantalla y ninguna tape al titular entero. */
const LANES = [-28, 26, -24, 30];
/** Inclinacion fija de cada tarjeta. Fija y no atada a la velocidad: a
    velocidad constante no hay nada que enderezar, y una tarjeta que gira
    sola mientras avanza parejo se lee como un rebote. */
const TILTS = [-6, 5, 7, -5];

/**
 * Posicion vertical en vh: de +78 (abajo, fuera) a -78 (arriba, fuera).
 *
 * Lineal a proposito. Cualquier suavizado en los extremos haria que la
 * tarjeta que entra y la que sale fueran a distinta velocidad que la que
 * cruza el centro, que es justo lo que esta seccion no quiere.
 */
function travel(at: number) {
  return 78 * (1 - 2 * at);
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}
