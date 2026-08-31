/**
 * Emite un bloque de datos estructurados.
 *
 * Server component sin estado: se renderiza una vez en build y el JSON queda
 * dentro del HTML estatico.
 *
 * El `<` se escapa como < antes de inyectar. JSON.stringify no escapa
 * nada pensando en HTML, asi que un "</script>" dentro de cualquier texto
 * —una respuesta del FAQ, manana— cerraria la etiqueta antes de tiempo y el
 * resto del JSON se interpretaria como marcado. Es la unica forma segura de
 * usar dangerouslySetInnerHTML aca.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
