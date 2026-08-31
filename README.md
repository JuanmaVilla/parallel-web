# parallel-web

Sitio de Parallel Studio. Next.js 16 (App Router) · React 19 · Tailwind v4 · next-intl (es/en).

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Corre `lint:headlines` y después compila |
| `npm run lint` | ESLint |
| `npm run lint:headlines` | Falla si un rótulo o precio en Lastica lleva tilde, `ñ`, `¿` o `¡` |
| `npm run lint:hex` | Falla si hay un color hardcodeado fuera de `app/tokens.css` |

## Estructura

```
app/tokens.css      Fuente de verdad de los valores de diseño (--pl-*)
app/globals.css     Puente tokens -> Tailwind v4 (@theme inline)
app/[locale]/       Rutas
components/scroll/  Secuencias de scroll con scrub de video
lib/                brand.ts · sequences.ts
i18n/ messages/     next-intl
scripts/            convert-sequence.sh + linters
public/             fonts/ · sequences/ · logos
```

## Reglas que hacen fallar el build

- **Los rótulos en Lastica no llevan acentos.** Lastica no tiene `Á É Í Ó Ú Ñ ¿ ¡`. Los titulares van en Proxima Nova 700 y sí los admiten.
- **Nada de hex sueltos.** Todo color sale de `app/tokens.css`.

Sistema de marca completo: [../MARCA.md](../MARCA.md). Contexto para agentes: [../CLAUDE.md](../CLAUDE.md).

## Secuencias de scroll

Un mp4 all-keyframe al que se le escribe `currentTime` según el progreso de scroll. Para agregar una:

```bash
./scripts/convert-sequence.sh <video-master.mp4> <nombre-secuencia>
```

Imprime el bloque para pegar en `lib/sequences.ts`.
