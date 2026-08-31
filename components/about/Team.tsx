import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/Section";
import { RevealList } from "@/components/motion/RevealList";

type Member = {
  name: string;
  /** Se compone en Lastica: el sufijo Label lo hace verificar por
   *  scripts/lint-headlines.mjs, que exige ASCII puro. */
  roleLabel: string;
  bio: string;
  /** Archivo bajo /public/equipo, sin extension. */
  photo: string;
  alt: string;
};

/**
 * Los dos, uno por uno.
 *
 * La foto de AboutUs los muestra juntos y en pequeño: sirve como prueba de
 * que existen, no para saber quien es quien. En /nosotros la pregunta si es
 * quien es quien, asi que cada uno tiene su ficha con nombre, rol y en que
 * anda.
 *
 * Retrato en 4:5 y no cuadrado: es la proporcion de retrato de la marca
 * (MARCA.md §5) y deja aire arriba de la cabeza sin recortar hombros.
 *
 * Las fotos van a color, sin tratamiento: se saco el duotono que las
 * igualaba. Si en algun momento se reemplazan las tomas, conviene tirarlas
 * con la misma luz — sin filtro que las empareje, cualquier diferencia de
 * temperatura entre una y otra queda a la vista.
 *
 * Sin color de marca en las tarjetas — el rol va en Lastica sobre tinta
 * secundaria. El presupuesto de acento de este viewport se lo lleva el
 * eyebrow del encabezado.
 */
export function Team() {
  const t = useTranslations("about.team");
  const members = t.raw("members") as Member[];

  return (
    <Section tone="bg">
      <SectionHeader
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subhead={t("subhead")}
      />

      {/* Con techo de ancho: a 1440 la grilla suelta da retratos de 800px de
          alto, que en una ficha de equipo se leen como portada. */}
      <RevealList className="mt-16 grid max-w-[840px] gap-8 sm:grid-cols-2 lg:gap-12">
        {members.map((member) => (
          <li key={member.name} className="pl-card flex flex-col">
            {/* relative porque la foto va con `fill`, que se posiciona
                contra el ancestro posicionado mas cercano. Lo ponia la clase
                del duotono; sin ella y sin esto, el retrato se va del marco y
                la ficha queda vacia. */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-elevated">
              <Image
                src={`/equipo/${member.photo}.webp`}
                alt={member.alt}
                fill
                sizes="(min-width: 900px) 400px, (min-width: 640px) 44vw, 92vw"
                className="object-cover"
              />
            </div>

            <h3 className="mt-8 font-sans font-bold text-heading-sm leading-heading tracking-title text-ink uppercase">
              {member.name}
            </h3>
            <p className="mt-2 font-display text-caption uppercase tracking-caps text-ink-secondary">
              {member.roleLabel}
            </p>
            <p className="mt-6 max-w-[46ch] text-body-md leading-body text-ink-body">
              {member.bio}
            </p>
          </li>
        ))}
      </RevealList>
    </Section>
  );
}
