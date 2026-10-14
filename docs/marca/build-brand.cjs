// Gera o kit de marca do Festário (SVGs) a partir de constantes — rode de novo para regenerar.
const fs = require("fs"); const path = require("path"); const opentype = require("opentype.js");
const [fontPath, out] = process.argv.slice(2);
const C = { anil: "#27357e", anilEscuro: "#141936", anilClaro: "#9aa8f2", milho: "#f4b41a", pitanga: "#d8344a", nevoa: "#f5f6fb", noite: "#0f1330" };

// ── Símbolo (viewBox 64): calendário com o topo em varal de bandeirinhas e o check da data ──
const flags = [[12, 15.3, 22, 16.7, 16.8, 26.5], [27, 17.4, 37, 17.4, 32, 27.5], [42, 16.7, 52, 15.3, 47.2, 26.5]];
const flagPath = ([a, b, c, d, e, f]) => `M${a} ${b} L${c} ${d} L${e} ${f} Z`;
function simbolo({ corpo, fio, check, f1, f2 }) {
  return `<rect x="6" y="18" width="52" height="40" rx="10" fill="${corpo}"/>
  <path d="M5 13 Q32 22 59 13" fill="none" stroke="${fio}" stroke-width="3.2" stroke-linecap="round"/>
  ${flags.map((fl, i) => `<path d="${flagPath(fl)}" fill="${i === 1 ? f2 : f1}" stroke-linejoin="round"/>`).join("\n  ")}
  <path d="M21 38 l8 8 l15 -16" fill="none" stroke="${check}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const svg = (vb, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>\n  ${body}\n</svg>\n`;
const claro = { corpo: C.anil, fio: C.anil, check: "#ffffff", f1: C.milho, f2: C.pitanga };
const escuro = { corpo: C.nevoa, fio: C.nevoa, check: C.anil, f1: C.milho, f2: C.pitanga };

// Monocromático: corpo e fio em currentColor; check e bandeirinhas recortados (vazados).
const mono = `<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
    <rect width="64" height="64" fill="#fff"/>
    ${flags.map((fl) => `<path d="${flagPath(fl)}" fill="#000" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/>`).join("\n    ")}
    <path d="M21 38 l8 8 l15 -16" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </mask></defs>
  <g mask="url(#m)" fill="currentColor"><rect x="6" y="18" width="52" height="40" rx="10"/>
  <path d="M5 13 Q32 22 59 13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></g>
  ${flags.map((fl) => `<path d="${flagPath(fl)}" fill="currentColor"/>`).join("\n  ")}`;

// Favicon (16–32 px): sem o fio; bandeirinhas maiores apoiadas no topo; check mais grosso.
// Em aba escura o anil some (~1,6:1): a media query troca o corpo para anil-claro e o check para noite.
const favicon = `<style>.corpo{fill:${C.anil}}.check{stroke:#fff}@media (prefers-color-scheme:dark){.corpo{fill:${C.anilClaro}}.check{stroke:${C.noite}}}</style>
  <rect class="corpo" x="4" y="8" width="56" height="52" rx="12"/>
  <path d="M10 8 H24 L17 22 Z" fill="${C.milho}"/><path d="M25 8 H39 L32 22 Z" fill="${C.pitanga}"/><path d="M40 8 H54 L47 22 Z" fill="${C.milho}"/>
  <path class="check" d="M18 39 l9 9 l18 -19" fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;

// ── Logotipo: símbolo + "Festário" em contorno (Alegreya Sans ExtraBold) ──
const font = opentype.loadSync(fontPath);
const size = 62; // altura de versal ≈ 40 = altura do corpo do símbolo
const tp = font.getPath("Festário", 0, 0, size); const bb = tp.getBoundingBox();
const gap = 14, tx = 64 + gap - bb.x1, ty = 58; // linha de base alinhada à base do corpo
const width = Math.ceil(64 + gap + (bb.x2 - bb.x1) + 2);
const logo = (s, cor) => `<g>${simbolo(s)}</g>\n  <path transform="translate(${tx.toFixed(2)} ${ty})" fill="${cor}" d="${tp.toPathData(2)}"/>`;

const files = {
  "festario-simbolo.svg": svg("0 0 64 64", simbolo(claro), "Festário"),
  "festario-simbolo-escuro.svg": svg("0 0 64 64", simbolo(escuro), "Festário"),
  "festario-simbolo-mono.svg": svg("0 0 64 64", mono, "Festário"),
  "festario-favicon.svg": svg("0 0 64 64", favicon, "Festário"),
  "festario-logotipo.svg": svg(`0 0 ${width} 64`, logo(claro, C.anilEscuro), "Festário"),
  "festario-logotipo-escuro.svg": svg(`0 0 ${width} 64`, logo(escuro, C.nevoa), "Festário"),
};
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, n), s);
console.log(Object.keys(files).join("\n"), "\nlogotipo:", width, "x 64");
