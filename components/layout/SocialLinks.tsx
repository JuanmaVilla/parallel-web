import { useTranslations } from "next-intl";
import {
  InstagramIcon,
  MailIcon,
  WhatsAppOutlineIcon,
} from "@/components/ui/icons";
import { social } from "@/lib/site-nav";

/**
 * Fila de accesos directos a los canales del estudio.
 *
 * Server component: son tres enlaces con destino fijo, no hay estado. Se
 * monta igual dentro de la barra —que si es cliente— porque no depende de
 * nada del navegador.
 *
 * Un solo componente para los dos sitios donde aparecen, con la lista de
 * canales por prop: la barra lleva solo Instagram (es el perfil, no un canal
 * de venta; el CTA de escribir ya esta al lado) y el pie los tres.
 *
 * Los destinos salen todos de `social` en lib/site-nav.ts. El numero y el
 * mail viven ahi una sola vez.
 *
 * Sin color de canal: van en tinta secundaria y el hover mueve el borde al
 * acento. El verde de WhatsApp esta reservado al boton flotante, que es el
 * unico elemento donde el reconocimiento del canal pesa mas que el sistema
 * (MARCA.md §3, regla 80/15/5).
 */

const channelOrder = ["instagram", "whatsapp", "email"] as const;

type Channel = (typeof channelOrder)[number];

const glyphs = {
  instagram: InstagramIcon,
  whatsapp: WhatsAppOutlineIcon,
  email: MailIcon,
} as const;

type SocialLinksProps = {
  /** Canales a mostrar, en el orden fijo de `channelOrder`. */
  channels?: readonly Channel[];
  /**
   * `boxed` dibuja el recuadro de la barra de contacto del pie; `bare` deja
   * solo el glifo, para meterlo entre los controles de la barra superior.
   */
  variant?: "bare" | "boxed";
  className?: string;
};

export function SocialLinks({
  channels = channelOrder,
  variant = "boxed",
  className = "",
}: SocialLinksProps) {
  const t = useTranslations("social");

  // Los destinos externos abren en pestana nueva; `mailto:` no, porque no
  // navega a ningun lado — lo atiende el cliente de correo.
  const hrefs: Record<Channel, string> = {
    instagram: social.instagram.href,
    whatsapp: `https://wa.me/${social.whatsapp.number}`,
    email: `mailto:${social.email.address}`,
  };

  // size-11 son los 44px de area tactil minima, con recuadro o sin el.
  const base =
    "inline-flex size-11 items-center justify-center text-ink-secondary transition-colors duration-200 ease-standard hover:text-ink";
  const box =
    variant === "boxed"
      ? " rounded-md border border-line hover:border-accent"
      : "";

  const visible = channelOrder.filter((channel) => channels.includes(channel));

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {visible.map((channel) => {
        const Glyph = glyphs[channel];
        const external = channel !== "email";

        return (
          <li key={channel}>
            <a
              href={hrefs[channel]}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              aria-label={t(channel)}
              className={base + box}
            >
              <Glyph className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
