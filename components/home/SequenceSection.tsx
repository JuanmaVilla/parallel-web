import { ScrollSequence } from "@/components/scroll/ScrollSequence";

/**
 * Secuencia de scroll del home: los auriculares y el microfono giran, se
 * separan, y el isotipo de Parallel aparece al final del recorrido.
 *
 * Va sin texto encima a proposito. El remate de la secuencia es el logo, y
 * un titular superpuesto le caeria justo arriba en el momento en que
 * aparece. Una pieza, un foco (MARCA.md §5).
 *
 * Entra y sale entre dos palabras gigantes. Son las que evitan el corte seco
 * entre una escena a pantalla completa y la grilla de precios: anuncian el
 * cambio de capitulo y le dan al ojo donde apoyarse mientras el video sale.
 *
 * 200vh y no 400: cada viewport de scroll extra es una pantalla mas entre el
 * visitante y los precios. Con prefers-reduced-motion el bloque colapsa al
 * poster estatico.
 */
export function SequenceSection() {
  return <ScrollSequence sequence="heroStudio" height="200vh" priority />;
}
