"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink, type Href } from "@/components/ui/ButtonLink";
import { clamp, useSceneProgress } from "@/components/motion/useSceneProgress";

/**
 * El disco.
 *
 * Un CD inclinado con haces de luz cayendo encima. Al hacer scroll gira y su
 * material pasa de mate a iridiscente: es el paso de la mezcla cruda al
 * master terminado, contado sin escribirlo.
 *
 * Los haces van VERTICALES, nunca en diagonal. Son el recurso de lineas
 * paralelas de la marca usado como luz, y MARCA.md §5 no admite diagonales
 * ni curvas. Van en degradado de marca y el disco queda en cromo neutral —
 * al reves, el disco solo se comeria todo el presupuesto de color.
 *
 * Donde cae cada haz lo calcula JS midiendo la elipse en la que se proyecta
 * el disco: con la inclinacion en 3D, un punto puesto a mano en porcentajes
 * cae fuera del disco en cuanto cambia el ancho de la ventana.
 *
 * La tarjeta lleva el piso del precio de mastering y un link a la tabla
 * completa (id="paquetes", en Services). No porque haga falta vender el
 * precio aca — es porque el miedo real del que llega es "precio escondido"
 * (MARCA.md §1), y el primer numero que ve en toda la pagina esta recien acá,
 * varias pantallas mas abajo. Total: solo el piso, sin desglose; el desglose
 * ya tiene su seccion.
 */
export function DiscScene({
  ctaHref = "#antes-despues",
  priceCtaHref = "#paquetes",
}: {
  ctaHref?: Href;
  /** Destino del link al detalle de precios. */
  priceCtaHref?: Href;
} = {}) {
  const t = useTranslations("home.disc");
  const discRef = useRef<HTMLDivElement | null>(null);
  const holderRef = useRef<HTMLDivElement | null>(null);
  const beamsRef = useRef<HTMLDivElement[]>([]);

  /**
   * Balanceo con el puntero. `px`/`py` son el ultimo pixel donde estuvo, en
   * coordenadas de ventana; `x`/`y` el valor ya suavizado que va al CSS.
   *
   * El listener solo guarda el pixel y no toca el DOM: pointermove llega
   * mucho mas seguido que un frame, y escribir ahi seria pisar el mismo
   * estilo varias veces para que el navegador lo pinte una sola.
   */
  const swayRef = useRef({ px: 0, py: 0, x: 0, y: 0, tracking: false });

  const { sceneRef, stageRef } = useSceneProgress<HTMLElement, HTMLDivElement>({
    smoothing: 0.11,
    onFrame: (progress) => {
      for (let i = 0; i < beamsRef.current.length; i++) {
        const beam = beamsRef.current[i];
        if (!beam) continue;
        // Escalonados: los haces no caen a la vez, caen en cascada. Con todos
        // sincronizados se lee como una persiana bajando, no como luz.
        const grow = clamp((progress - 0.08 - i * 0.045) / 0.22);
        beam.style.setProperty("--grow", grow.toFixed(3));
      }

      // El balanceo se resuelve en el bucle que ya existe, no en uno propio.
      // Sale gratis: este rAF ya esta corriendo, y el IntersectionObserver
      // del hook lo apaga cuando la escena se va de pantalla — un rAF suelto
      // para un efecto de puntero seguiria gastando frames sin que nadie lo
      // vea.
      const disc = discRef.current;
      const stage = stageRef.current;
      if (!disc || !stage) return;

      const sway = swayRef.current;
      let goalX = 0;
      let goalY = 0;
      if (sway.tracking) {
        const rect = stage.getBoundingClientRect();
        goalX = clamp(((sway.px - rect.left) / rect.width) * 2 - 1, -1, 1);
        goalY = clamp(((sway.py - rect.top) / rect.height) * 2 - 1, -1, 1);
      }
      // Sin puntero el objetivo es cero, asi que la misma interpolacion que
      // lo lleva hasta el lo devuelve solo a la pose de reposo.
      sway.x += (goalX - sway.x) * SWAY_SMOOTHING;
      sway.y += (goalY - sway.y) * SWAY_SMOOTHING;
      disc.style.setProperty("--sway-x", sway.x.toFixed(4));
      disc.style.setProperty("--sway-y", sway.y.toFixed(4));
    },
  });

  // Seguimiento del puntero.
  //
  // Escucha en toda la ventana y no sobre el disco: la capa del disco es
  // `pointer-events: none` — es decorativa y no tiene que robarle el click a
  // la tarjeta —, asi que no hay nada ahi que pueda recibir un hover. Y
  // ademas se siente mejor: el disco acusa el movimiento mientras uno recorre
  // la seccion, sin tener que acertarle.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    // En tactil no hay puntero que seguir, y con movimiento reducido el disco
    // se queda en su pose: en los dos casos ni siquiera se engancha el
    // listener.
    if (!fine.matches || still.matches) return;

    const onMove = (event: PointerEvent) => {
      const sway = swayRef.current;
      sway.px = event.clientX;
      sway.py = event.clientY;
      sway.tracking = true;
    };
    // El puntero se fue de la ventana: vuelve a reposo en vez de quedarse
    // trabado en la ultima inclinacion.
    const onLeave = () => {
      swayRef.current.tracking = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Posicion de los haces. Se mide una vez y se recalcula al cambiar el
  // tamano: leer el rect por frame seria forzar layout sesenta veces por
  // segundo para un valor que no cambia mientras nadie toca la ventana.
  useEffect(() => {
    const stage = stageRef.current;
    const disc = discRef.current;
    const holder = holderRef.current;
    if (!stage || !disc || !holder) return;

    const place = () => {
      const styles = getComputedStyle(disc);
      const camera = (name: string) =>
        parseFloat(styles.getPropertyValue(name));
      const perspective = camera("--pl-disc-perspective");
      const tilt = (camera("--pl-disc-tilt") * Math.PI) / 180;
      const lean = (camera("--pl-disc-lean") * Math.PI) / 180;

      // offsetWidth/offsetLeft ignoran el transform, asi que dan el circulo
      // original y su sitio de maquetado. Medir el rect ya transformado
      // daria la caja de la elipse inclinada, cuyos ejes no estan alineados
      // con la pantalla: no sirve para ubicar un punto de la superficie.
      const radius = disc.offsetWidth / 2;

      // El centro visual del disco cae EXACTAMENTE en (offsetLeft, offsetTop)
      // y no en el medio de la caja: el CSS lo cuelga de top/left 50% y lo
      // corre con translate -50% -50%, asi que el punto de maquetado ya es el
      // centro. Sumarle el radio otra vez lo desplazaba un radio abajo y a la
      // derecha, y ahi es donde caian los haces.
      const holderRect = holder.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const cx = holderRect.left - stageRect.left + disc.offsetLeft;
      const cy = holderRect.top - stageRect.top + disc.offsetTop;

      /**
       * Lleva un punto del disco sin inclinar (coordenadas locales, -1 a 1
       * sobre el radio) al pixel donde queda en pantalla. Repite la misma
       * cadena que el CSS y en el mismo orden: rotateX, rotateZ y la
       * division de la perspectiva. El giro con el scroll NO entra — es una
       * rotacion sobre el propio eje del disco, y un circulo girado sobre su
       * eje ocupa el mismo sitio, asi que el punto de impacto no se mueve.
       */
      const project = (u: number, v: number) => {
        const x0 = u * radius;
        const y0 = v * radius;
        // rotateX: lo que esta abajo se viene hacia el que mira.
        const y1 = y0 * Math.cos(tilt);
        const z1 = y0 * Math.sin(tilt);
        // rotateZ sobre el resultado: la inclinacion diagonal.
        const x2 = x0 * Math.cos(lean) - y1 * Math.sin(lean);
        const y2 = x0 * Math.sin(lean) + y1 * Math.cos(lean);
        // Perspectiva: lo cercano se agranda, lo lejano se achica.
        const scale = perspective / (perspective - z1);
        return { x: cx + x2 * scale, y: cy + y2 * scale };
      };

      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;

      beamsRef.current.forEach((beam, i) => {
        if (!beam) return;
        const spec = BEAMS[i];
        const { x, y } =
          spec.kind === "hit"
            ? project(spec.u, spec.v)
            : // Los que pasan de largo no tocan el disco: no hay punto que
              // proyectar, van a los costados y siguen hasta la tarjeta.
              { x: spec.x * stageWidth, y: stageHeight * 0.72 };
        beam.style.left = `${x.toFixed(1)}px`;
        beam.style.height = `${Math.max(0, y).toFixed(1)}px`;
      });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(stage);
    // Tambien la zona del disco: su alto lo decide la tarjeta, que crece sola
    // cuando el texto reparte distinto al cargar la tipografia. Observando
    // solo el escenario, los haces se quedaban apuntando al sitio viejo.
    observer.observe(holder);
    return () => observer.disconnect();
  }, [stageRef]);

  return (
    <section
      ref={sceneRef}
      aria-label={t("eyebrow")}
      className="pl-scene h-[240vh] border-t border-line bg-bg"
    >
      <div ref={stageRef} className="pl-scene__stage flex flex-col">
        {/* Haces. Cruzan por delante del disco y su punto de impacto queda a
            la vista sobre la superficie. Dos siguen de largo hasta la
            tarjeta: son los que atan la escena con lo unico que hay que
            leer.

            Quedan fuera del reparto en columnas, en una capa propia sobre el
            escenario entero: tienen que poder bajar desde el borde de arriba
            hasta la altura de la tarjeta, o sea cruzar las dos zonas. */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {BEAMS.map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) beamsRef.current[i] = el;
              }}
              className="pl-beam"
            >
              <span className="pl-beam__hit" />
            </div>
          ))}
        </div>

        <div ref={holderRef} aria-hidden className="pl-disc-stage">
          <div ref={discRef} className="pl-disc">
            <span className="pl-disc__hole" />
          </div>
        </div>

        {/* Tarjeta. Va abajo y centrada, y es lo unico interactivo de la
            escena. Al ser hermana de la zona del disco y no una capa suelta,
            es ella la que decide cuanto sitio le queda al disco. */}
        <div className="relative px-4 pb-10 lg:pb-16">
          <div className="mx-auto max-w-[38rem] rounded-lg border border-line bg-elevated/90 p-6 text-center backdrop-blur-md lg:p-8">
            <p className="font-display text-caption uppercase tracking-caps text-brand-orange">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 font-sans font-bold text-fluid-h2 leading-heading tracking-title text-ink uppercase">
              {t("heading")}{" "}
              <span className="pl-text-gradient">{t("headingAccent")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-body-lg leading-body text-ink">
              {t("subhead")}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
              <ButtonLink href={ctaHref} variant="secondary">
                {t("cta")}
              </ButtonLink>
              {/* En la landing apunta al ancla "paquetes" —Section le deja el
                  id con su scroll-mt—; en el home, a /servicios. */}
              <ButtonLink href={priceCtaHref} variant="ghost" className="px-0">
                {t("priceCta")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Los haces.
 *
 * `hit` — cae sobre el disco. Va en coordenadas LOCALES del disco sin
 * inclinar: -1 a 1 sobre el radio, medido como si el disco estuviera de
 * frente. Es project() el que lo lleva al pixel que le toca. Definirlos asi y
 * no en pantalla es lo que hace que los angulos de la camara se puedan tocar
 * en el CSS sin volver a acomodar los nueve haces a mano.
 *
 * Ninguno llega a 0.85 — mas afuera cae en el canto, donde la superficie ya
 * esta casi de perfil y el punto de impacto no se lee. Ninguno baja de 0.2,
 * que es donde empieza el agujero central.
 *
 * `rail` — pasa de largo por el costado y sigue hasta la altura de la
 * tarjeta. Su x va en fraccion del ancho del escenario: no toca el disco,
 * asi que no hay nada que proyectar. Son los dos que atan la escena con lo
 * unico que hay para leer.
 */
/**
 * Interpolacion del balanceo. Bastante mas lento que el del scroll (0.11):
 * el puntero salta de un lado al otro de la pantalla de un manotazo, y
 * siguiendolo de cerca el disco pega un latigazo. Arrastrando, parece que
 * tuviera peso.
 */
const SWAY_SMOOTHING = 0.06;

type Beam =
  | { kind: "hit"; u: number; v: number }
  | { kind: "rail"; x: number };

const BEAMS: Beam[] = [
  { kind: "rail", x: 0.11 },
  { kind: "hit", u: -0.68, v: 0.22 },
  { kind: "hit", u: -0.46, v: -0.38 },
  { kind: "hit", u: -0.2, v: 0.5 },
  { kind: "hit", u: 0.06, v: -0.44 },
  { kind: "hit", u: 0.34, v: 0.34 },
  { kind: "hit", u: 0.58, v: -0.18 },
  { kind: "hit", u: 0.78, v: 0.1 },
  { kind: "rail", x: 0.89 },
];
