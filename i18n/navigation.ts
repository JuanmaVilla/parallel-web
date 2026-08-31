import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Usar SIEMPRE estos wrappers en vez de next/link y next/navigation:
// mantienen el locale activo al navegar.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
