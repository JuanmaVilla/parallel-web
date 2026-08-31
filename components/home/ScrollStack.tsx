"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { LiveMeter } from "@/components/motion/LiveMeter";
import { useSceneProgress } from "@/components/motion/useSceneProgress";

type Line = { title: string };

/**
 * Para que viene el cliente, construyendose con el scroll.
 *
 * Es lo primero que se lee despues del hero, asi que habla de la persona y no
 * del estudio. Nadie llega buscando una mezcla ni un master: llega con una
 * cancion que ya escribio y ya canto mil veces, y todavia no la escucho como
 * suena en su cabeza. Las cuatro lineas arman esa espera: lo que el artista
 * ya hizo, lo unico que le falta, en que consiste eso exactamente, y que pasa
 * ahi mismo. El climax de la escena no es un servicio — es el momento de
 * escuchar el resultado, que es la fantasia real de cualquiera que graba por
 * primera vez.
 *
 * Los nombres de los servicios — mezcla, master, tratamiento vocal, beats —
 * quedan para la seccion siguiente, que es donde ya sirven: primero el
 * visitante se reconoce en la escena, despues le importa como se llama cada
 * paso. Al reves se le pide que compre vocabulario tecnico antes de haberse
 * visto en la pagina. El precio, mas abajo todavia.
 *
 * La pantalla arranca completamente vacia — negro puro, sin un borde ni una
 * sombra — y cada pieza entra cuando el recorrido llega a su tramo: primero el
 * rotulo, luego la entradilla, y despues las fichas. Nada esta esperando ahi
 * de entrada.
 *
 * Las cuatro lineas NO se apilan: se turnan. Hay una sola frase en pantalla a
 * la vez — entra, se queda lo que dura su tramo de scroll y se va justo cuando
 * la siguiente empieza a entrar. Apiladas, las cuatro compiten por el mismo
 * golpe de vista y el orden en que estan escritas deja de importar; de a una,
 * el visitante lee la frase que le toca y no puede saltarse el remate. Es
 * ademas lo que permite componerlas al doble de cuerpo: el alto que antes se
 * repartian ahora lo tiene entera cada una. La mecanica esta en
 * .pl-stack__line.
 *
 * La cuarta es distinta de las otras tres. Las tres primeras son el planteo
 * y esta es la respuesta, asi que no entra: se enciende — parpadea como un
 * tubo, con las tintas corridas, y queda en naranja de marca con un rayo
 * debajo. Y no se va: es el remate y tiene que seguir puesto cuando la
 * seccion se acaba.
 *
 * Para que sea el unico elemento de marca del viewport cuando llega (regla
 * 80/15/5, MARCA.md §3), el rotulo naranja y la entradilla se retiran antes:
 * llevan --hold, igual que las lineas. La entradilla ademas dice casi lo
 * mismo que el remate, asi que verlas juntas le quitaria el golpe.
 *
 * Releva directamente al hero, con margen negativo sobre la cola de su
 * escenario sticky: sin el solape, quedaria media pantalla de escena ya
 * apagada entre las dos.
 *
 * Las fichas son recursos graficos de la marca, no logos: el estudio no tiene
 * todavia clientes que mostrar y no vamos a inventarlos.
 *
 * Tipografia: el rotulo va en Lastica, que es su reparto — versalitas cortas
 * y ASCII puro (MARCA.md §4). Las lineas NO: son titulares, y a ese tamano el
 * trazo fino y monolineal de Lastica se lee peor cuanto mas grande esta. Van
 * en Proxima Nova 700, que ademas admite los acentos de "cancion" — y aca
 * escribir "cancion" sin tilde arruinaria justo la frase que tiene que sonar
 * escrita por una persona.
 *
 * Y van en caja alta y baja, no en versalitas. Una frase entera en mayusculas
 * a este cuerpo se lee como un cartel y obliga a descifrar cada palabra por su
 * silueta; en caja mixta las ascendentes y descendentes dan forma a la palabra
 * y se lee de un golpe.
 */
export function ScrollStack() {
  const t = useTranslations("home.stack");
  const lines = t.raw("lines") as Line[];

  // El encendido del remate corre a su propio ritmo, asi que no puede salir de
  // un calc() sobre --p: lo dispara este atributo. Ver .pl-punch en globals.css.
  const punchRef = useRef<HTMLLIElement | null>(null);

  const { sceneRef, stageRef } = useSceneProgress<HTMLElement, HTMLDivElement>({
    smoothing: 0.12,
    onFrame: (progress) => {
      const punch = punchRef.current;
      if (!punch) return;

      // Dos umbrales y no uno. Con uno solo, pararse justo encima basta para
      // que el temblor del scroll suavizado lo cruce ida y vuelta varias veces
      // por segundo y la frase se quede reencendiendose.
      const wasLit = punch.hasAttribute("data-lit");
      const lit = wasLit ? progress > PUNCH_OFF : progress >= PUNCH_ON;
      if (lit !== wasLit) punch.toggleAttribute("data-lit", lit);
    },
  });

  return (
    <section
      ref={sceneRef}
      aria-label={t("eyebrow")}
      className="pl-scene relative z-20 -mt-[45vh] h-[460vh] bg-bg"
    >
      <div
        ref={stageRef}
        className="pl-scene__stage flex items-center justify-center"
      >
        {/* Fichas. Decorativas y fuera del flujo, para que no empujen al
            texto ni aparezcan en el orden de lectura. */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {CHIPS.map((chip, i) => (
            <div
              key={i}
              className={
                `pl-chip ${chip.photo ? "pl-chip--photo" : chip.size} ` +
                `${chip.narrow === false ? "pl-chip--wide-only" : ""}`
              }
              style={
                {
                  top: chip.top,
                  left: chip.left,
                  "--depth": chip.depth,
                  "--tilt": `${chip.tilt}deg`,
                  "--from": CHIP_FROM + i * CHIP_STEP,
                } as React.CSSProperties
              }
            >
              {chip.photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={chip.photo}
                  alt=""
                  className="size-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <ChipArt kind={chip.art} />
              )}
            </div>
          ))}
        </div>

        <div className="pl-stack__column relative mx-auto w-full max-w-[1440px] px-4 text-center lg:px-16">
          {/* El rotulo es el unico elemento en color de marca de la seccion.
              Naranja y no rojo: sobre negro es la parada del degradado con
              mas contraste, y aca el texto es chico. */}
          <p
            className="pl-stack__item mx-auto font-display text-body-sm uppercase tracking-caps text-brand-orange"
            style={{ "--from": 0.06, "--hold": 0.66 } as React.CSSProperties}
          >
            {t("eyebrow")}
          </p>

          <p
            className="pl-stack__item mx-auto mt-8 text-body-lg leading-body text-ink-body"
            style={{ "--from": 0.17, "--hold": 0.55 } as React.CSSProperties}
          >
            {t("lead")}
          </p>

          {/* Una frase por vez. La ultima no se va: cierra la seccion. */}
          <ul className="pl-stack__lines mt-10">
            {lines.map((line, i) => {
              const isPunch = i === lines.length - 1;
              return (
                <li
                  key={line.title}
                  ref={isPunch ? punchRef : undefined}
                  // data-text alimenta las dos copias del glitch, que son
                  // pseudoelementos y no pueden leer el nodo de texto.
                  data-text={isPunch ? line.title : undefined}
                  className={
                    "pl-stack__line font-sans font-bold tracking-title text-fluid-stack leading-heading" +
                    (isPunch ? " pl-punch" : " text-ink")
                  }
                  style={
                    {
                      "--from": LINE_FROM + i * LINE_STEP,
                      ...(isPunch ? { "--hold": 1 } : null),
                    } as React.CSSProperties
                  }
                >
                  {line.title}
                  {isPunch ? (
                    <span aria-hidden className="pl-punch__bolt" />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ChipArt({ kind }: { kind: ChipKind }) {
  if (kind === "meter") {
    return (
      <LiveMeter
        levels={[0.35, 0.7, 0.5, 1, 0.62, 0.44]}
        amplitude={0.3}
        speed={0.4}
        className="h-8 gap-1"
        barClassName="w-1 rounded-full"
      />
    );
  }
  if (kind === "pads") {
    return (
      <div className="grid grid-cols-2 gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="size-4 rounded-xs border border-line bg-bg" />
        ))}
      </div>
    );
  }
  if (kind === "spectrum") {
    return (
      <div
        className="h-1.5 w-2/3 rounded-full"
        style={{ background: "var(--pl-gradient-heat-meter)" }}
      />
    );
  }
  return <div className="pl-lines size-full opacity-60" />;
}

type ChipKind = "meter" | "pads" | "spectrum" | "lines";

/* Reparto del recorrido.
 *
 * La escena mide 460vh, o sea 360vh de recorrido util. Cada linea se lleva
 * 0.18 de progreso — unos 65vh de scroll — que es lo que tarda en entrar,
 * quedarse el tiempo de leerla y salir. Mas corto y la frase se va antes de
 * haberla terminado; mas largo y el visitante scrollea contra una pantalla
 * que no cambia.
 *
 * Los tramos se tocan a proposito: la ventana de salida de una (--hold 0.14
 * mas 0.06 de fundido, ver .pl-stack__line) termina 0.02 despues de que
 * arranque la siguiente. Ese solape minimo es lo que evita el frame en negro
 * entre frase y frase.
 *
 * Las fichas se intercalan entre las lineas en vez de entrar en bloque:
 * alternando, el ojo va de una punta a otra de la pantalla y la escena se
 * siente construida, no rellenada. */
const LINE_FROM = 0.26;
const LINE_STEP = 0.18;

/* Umbrales del encendido del remate. La ultima linea arranca en 0.80 y tarda
   0.05 en entrar: prende en 0.83, con la frase ya casi opaca pero todavia
   subiendo, para que el parpadeo la agarre en movimiento. Se apaga bastante
   antes, en 0.78, y esa distancia entre los dos numeros es la banda muerta
   que evita el reencendido al pararse encima. */
const PUNCH_ON = 0.83;
const PUNCH_OFF = 0.78;
const CHIP_FROM = 0.1;
const CHIP_STEP = 0.075;

/**
 * Sitio de las fichas. Todas fuera de la columna central de lectura: una
 * ficha detras del texto obliga al ojo a separarlos y cansa.
 *
 * `narrow: false` las retira en movil con .pl-chip--wide-only. Ahi la columna
 * de texto ocupa casi todo el ancho, asi que las que en desktop quedan
 * holgadamente a un lado caen justo detras de un servicio. Las que sobreviven
 * son las de las bandas de arriba y de abajo, donde no hay texto en ningun
 * ancho.
 */
const CHIPS: {
  top: string;
  left: string;
  size: string;
  depth: number;
  tilt: number;
  art: ChipKind;
  narrow?: false;
  /** Si esta, la ficha lleva foto y crece a .pl-chip--photo. */
  photo?: string;
}[] = [
  { top: "12%", left: "8%", size: "size-20", depth: 120, tilt: -8, art: "pads", photo: "/stack-chips/01-escuchando.webp" },
  { top: "26%", left: "78%", size: "h-16 w-24", depth: 190, tilt: 6, art: "meter", photo: "/stack-chips/02-letra.webp" },
  { top: "58%", left: "5%", size: "h-14 w-24", depth: 80, tilt: 5, art: "spectrum", narrow: false },
  { top: "70%", left: "84%", size: "size-20", depth: 150, tilt: -6, art: "pads", narrow: false },
  { top: "8%", left: "62%", size: "h-12 w-16", depth: 60, tilt: 9, art: "lines" },
  { top: "80%", left: "30%", size: "h-14 w-20", depth: 210, tilt: -4, art: "meter", photo: "/stack-chips/03-consola.webp" },
  { top: "44%", left: "90%", size: "h-12 w-16", depth: 100, tilt: 7, art: "lines", narrow: false },
  { top: "88%", left: "60%", size: "h-16 w-24", depth: 130, tilt: 4, art: "spectrum", photo: "/stack-chips/04-cabina.webp" },
];
