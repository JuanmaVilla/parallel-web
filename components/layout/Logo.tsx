import Image from "next/image";
import { Link } from "@/i18n/navigation";

/**
 * Isotipo enlazado al home.
 *
 * Se usa el isotipo suelto y no el isologotipo completo porque el bloqueo
 * vertical (P + PARALLEL + STUDIOS) necesita 120 px de ancho para leerse y
 * en una barra de 64 px de alto no entra. El isotipo suelto es una version
 * oficial, admitida cuando la marca ya esta identificada por el contexto.
 *
 * El nombre no se recompone en texto al lado del simbolo: recomponer el
 * bloqueo a mano esta prohibido. Para el lector de pantalla va en sr-only.
 *
 * Origen del archivo: public/marca/isotipo.png, derivado del oficial
 * public/isologotipo-color.png separandole el fondo negro. Ver MARCA.md §8.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center transition-opacity duration-200 ease-standard hover:opacity-80 ${className}`}
    >
      <Image
        src="/marca/isotipo.png"
        alt=""
        width={256}
        height={302}
        priority
        className="h-9 w-auto"
      />
      <span className="sr-only">Parallel Studios</span>
    </Link>
  );
}
