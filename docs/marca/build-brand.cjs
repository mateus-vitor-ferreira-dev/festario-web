// Gera o kit de marca do Festário a partir de constantes — rode de novo para regenerar.
//
//   node docs/marca/build-brand.cjs <AlegreyaSans-ExtraBold.ttf> <Alegreya-SemiBold.ttf> docs/marca/svg
//
// Também escreve `public/festario-favicon.svg` e `src/components/Brand/geometry.ts`, para o app desenhar a
// marca inline com exatamente a mesma geometria dos arquivos. Precisa de `opentype.js`.
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");

const [wordFontPath, sloganFontPath, out] = process.argv.slice(2);
if (!wordFontPath || !sloganFontPath || !out) {
  console.error("uso: node docs/marca/build-brand.cjs <AlegreyaSans-ExtraBold.ttf> <Alegreya-SemiBold.ttf> <pasta de saída>");
  process.exit(1);
}
const ROOT = path.resolve(__dirname, "../..");

const C = {
  anil: "#27357e", anilEscuro: "#141936", anilClaro: "#9aa8f2",
  milho: "#f4b41a", pitanga: "#d8344a",
  nevoa: "#f5f6fb", papel: "#ffffff", noite: "#0f1330",
};

// ── Símbolo (grade 512) ──
// A folha do calendário é uma bandeirinha de festa junina: corpo com corte em V (que também lembra um
// marcador de página: a data guardada), cabeçalho pitanga com duas argolas e a célula milho do dia reservado.
const G = {
  header: "M88 160A56 56 0 0 1 144 104H154V130A38 38 0 0 0 230 130V104H282V130A38 38 0 0 0 358 130V104H368A56 56 0 0 1 424 160V200H88Z",
  body: "M88 224H424V448L256 368L88 448Z",
  cell: "M276 256A20 20 0 0 1 296 276V316A20 20 0 0 1 276 336H236A20 20 0 0 1 216 316V276A20 20 0 0 1 236 256Z",
  pegs: [{ x: 170, y: 56, width: 44, height: 96, rx: 22 }, { x: 298, y: 56, width: 44, height: 96, rx: 22 }],
};
/** Limites do desenho na grade 512 e o quadrado justo usado pelo app (centro do desenho, ~4% de folga). */
const BOX = { x0: 88, y0: 56, x1: 424, y1: 448 };
const SQUARE = { x: 52, y: 48, size: 408 };

const rect = (r, fill) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${r.rx}"${fill ? ` fill="${fill}"` : ""}/>`;
function simbolo({ header, body, pegs, cell }) {
  const top = `<path fill="${header}" d="${G.header}"/>\n  <g fill="${pegs}">${G.pegs.map((p) => rect(p)).join("")}</g>`;
  // mono: a célula vira recorte no corpo (evenodd), tudo numa cor só
  if (!cell) return `${top}\n  <path fill="${body}" fill-rule="evenodd" d="${G.body}${G.cell}"/>`;
  return `${top}\n  <path fill="${body}" d="${G.body}"/>\n  <path fill="${cell}" d="${G.cell}"/>`;
}
const CLARO = { header: C.pitanga, body: C.anil, pegs: C.anil, cell: C.milho };
const ESCURO = { header: C.pitanga, body: C.anilClaro, pegs: C.anilClaro, cell: C.milho };
const MONO = { header: "currentColor", body: "currentColor", pegs: "currentColor", cell: null };

const svg = (w, h, body, title, vb = `0 0 ${w} ${h}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" role="img" aria-label="${title}">\n  <title>${title}</title>\n  ${body}\n</svg>\n`;

// ── Texto em contorno ──
/**
 * "Festário" em contorno, com o agudo separado para receber a pitanga. Devolve os paths já posicionados
 * (x a partir de 0, linha de base em 0) e a largura.
 */
function textPaths(font, text, size, { splitAccent = false, tracking = 0 } = {}) {
  const scale = size / font.unitsPerEm;
  const xHeight = (font.tables.os2.sxHeight || font.unitsPerEm * 0.5) * scale;
  const body = [];
  const accent = [];
  let x = 0;
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((glyph, i) => {
    const p = glyph.getPath(x, 0, size);
    if (splitAccent && text[i] === "á") {
      // separa os contornos: o que fica todo acima da altura-x é o acento
      let cur = [];
      const contours = [];
      for (const cmd of p.commands) {
        if (cmd.type === "M" && cur.length) { contours.push(cur); cur = []; }
        cur.push(cmd);
      }
      if (cur.length) contours.push(cur);
      for (const c of contours) {
        const ys = c.flatMap((cmd) => [cmd.y, cmd.y1, cmd.y2].filter((v) => v !== undefined));
        const target = ys.length && Math.max(...ys) < -xHeight * 0.95 ? accent : body;
        const part = new opentype.Path(); part.commands = c; target.push(part.toPathData(2));
      }
    } else {
      body.push(p.toPathData(2));
    }
    const next = glyphs[i + 1];
    x += glyph.advanceWidth * scale + (next ? font.getKerningValue(glyph, next) * scale + tracking * size : 0);
  });
  return { body: body.join(""), accent: accent.join(""), width: x };
}

const wordFont = opentype.loadSync(wordFontPath);
const sloganFont = opentype.loadSync(sloganFontPath);

// ── Logotipo ──
// Símbolo com 104 de altura; a versal do nome mede ~2/3 dele e a linha de base fica na ponta da bandeirinha.
const SYM_H = 104;
const K = SYM_H / (BOX.y1 - BOX.y0);
const SYM_W = (BOX.x1 - BOX.x0) * K;
const capHeight = wordFont.tables.os2.sCapHeight || wordFont.unitsPerEm * 0.68;
const WORD_SIZE = (SYM_H * 0.66) / (capHeight / wordFont.unitsPerEm);
const GAP = 28;
const word = textPaths(wordFont, "Festário", WORD_SIZE, { splitAccent: true, tracking: -0.005 });
const LOGO = { w: Math.ceil(SYM_W + GAP + word.width), h: SYM_H, wordX: SYM_W + GAP, baseline: SYM_H };

function logoBody(cores, ink, offX = 0, offY = 0) {
  return `<g transform="translate(${(offX - BOX.x0 * K).toFixed(3)} ${(offY - BOX.y0 * K).toFixed(3)}) scale(${K.toFixed(5)})">\n  ${simbolo(cores)}\n  </g>\n  `
    + `<g transform="translate(${(offX + LOGO.wordX).toFixed(2)} ${(offY + LOGO.baseline).toFixed(2)})">`
    + `<path fill="${ink}" d="${word.body}"/><path fill="${C.pitanga}" d="${word.accent}"/></g>`;
}
// Os arquivos levam o respiro do guia (¼ da altura do símbolo) embutido.
const PAD = SYM_H / 4;
const padded = (cores, ink) => svg(Math.ceil(LOGO.w + PAD * 2), Math.ceil(LOGO.h + PAD * 2), logoBody(cores, ink, PAD, PAD), "Festário");

// ── Favicon (grade 32, desenho próprio em medidas inteiras; anil-claro na aba escura) ──
const favicon = `<style>
    .h{fill:${C.pitanga}} .b{fill:${C.anil}} .m{fill:${C.milho}}
    @media (prefers-color-scheme: dark) { .b{fill:${C.anilClaro}} }
  </style>
  <path class="h" d="M4 8A4 4 0 0 1 8 4H24A4 4 0 0 1 28 8V12H4Z"/>
  <rect class="b" x="8" y="2" width="4" height="8" rx="2"/>
  <rect class="b" x="20" y="2" width="4" height="8" rx="2"/>
  <path class="b" d="M4 14H28V30L16 24L4 30Z"/>
  <rect class="m" x="12" y="16" width="8" height="6" rx="1"/>`;

// ── Ícone de app (fundo anil, símbolo em ~60% da altura: cabe na máscara redonda do Android) ──
function appIcon(size) {
  const k = (size * 0.6) / (BOX.y1 - BOX.y0);
  const cx = (BOX.x0 + BOX.x1) / 2; const cy = (BOX.y0 + BOX.y1) / 2;
  return svg(size, size, `<rect width="${size}" height="${size}" fill="${C.anil}"/>\n  `
    + `<g transform="translate(${(size / 2 - cx * k).toFixed(2)} ${(size / 2 - cy * k).toFixed(2)}) scale(${k.toFixed(5)})">\n  `
    + `${simbolo({ header: C.pitanga, body: C.papel, pegs: C.papel, cell: C.milho })}\n  </g>`, "Festário");
}

// ── Open Graph 1200×630: varal de bandeirinhas, logotipo e o slogan ──
const SLOGAN = "Data marcada, festa garantida.";
function varal() {
  const cores = [C.pitanga, C.milho, C.anil, C.milho];
  const sag = 34; const n = 15; const w = 52; const step = 1200 / n;
  const out = [`<path d="M-10 18Q600 ${18 + 2 * sag} 1210 18" fill="none" stroke="${C.anil}" stroke-width="4" stroke-linecap="round"/>`];
  for (let i = 0; i < n; i++) {
    const x = i * step + (step - w) / 2;
    const t = (x + w / 2 + 10) / 1220;
    const y = 18 + 2 * sag * 2 * t * (1 - t); // ponto no cordão (Bézier quadrática)
    const h = w * 1.25;
    out.push(`<path fill="${cores[i % 4]}" d="M${x.toFixed(1)} ${y.toFixed(1)}H${(x + w).toFixed(1)}V${(y + h).toFixed(1)}L${(x + w / 2).toFixed(1)} ${(y + h - w * 0.4).toFixed(1)}L${x.toFixed(1)} ${(y + h).toFixed(1)}Z"/>`);
  }
  return out.join("\n  ");
}
const ogScale = 640 / LOGO.w;
const ogX = (1200 - LOGO.w * ogScale) / 2; const ogY = 228;
const slogan = textPaths(sloganFont, SLOGAN, 56);
const og = `<rect width="1200" height="630" fill="${C.nevoa}"/>\n  ${varal()}\n  `
  + `<g transform="translate(${ogX.toFixed(1)} ${ogY}) scale(${ogScale.toFixed(5)})">\n  ${logoBody(CLARO, C.anil)}\n  </g>\n  `
  + `<path fill="${C.anilEscuro}" transform="translate(${((1200 - slogan.width) / 2).toFixed(1)} ${(ogY + LOGO.h * ogScale + 92).toFixed(1)})" d="${slogan.body}"/>\n  `
  + `<rect y="606" width="1200" height="24" fill="${C.anil}"/>`;

const files = {
  "festario-simbolo.svg": svg(512, 512, simbolo(CLARO), "Festário"),
  "festario-simbolo-escuro.svg": svg(512, 512, simbolo(ESCURO), "Festário"),
  "festario-simbolo-mono.svg": svg(512, 512, simbolo(MONO), "Festário"),
  "festario-favicon.svg": svg(32, 32, favicon, "Festário"),
  "festario-logotipo.svg": padded(CLARO, C.anil),
  "festario-logotipo-escuro.svg": padded(ESCURO, C.papel),
  "apple-touch-icon.svg": appIcon(180),
  "festario-icone-512.svg": appIcon(512),
  "og-image.svg": svg(1200, 630, og, `Festário: ${SLOGAN}`),
};
fs.mkdirSync(out, { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, n), s);
fs.writeFileSync(path.join(ROOT, "public/festario-favicon.svg"), files["festario-favicon.svg"]);

// ── Geometria para o componente Brand (desenho inline que segue o tema) ──
const r = (n) => Number(n.toFixed(3));
const geometry = `// Gerado por docs/marca/build-brand.cjs — não edite à mão; rode o script de novo.

/** Símbolo na grade 512: cabeçalho, argolas, corpo em bandeirinha e a célula do dia reservado. */
export const SYMBOL = {
    header: "${G.header}",
    body: "${G.body}",
    cell: "${G.cell}",
    pegs: ${JSON.stringify(G.pegs)},
} as const;

/** Quadrado justo em volta do símbolo (viewBox do \`FestarioSymbol\`). */
export const SYMBOL_VIEWBOX = "${SQUARE.x} ${SQUARE.y} ${SQUARE.size} ${SQUARE.size}";

/** Logotipo sem respiro: símbolo com ${SYM_H} de altura e o nome à direita. */
export const LOGO = {
    width: ${LOGO.w},
    height: ${LOGO.h},
    /** Transform que leva o símbolo da grade 512 para o logotipo. */
    symbolTransform: "translate(${r(-BOX.x0 * K)} ${r(-BOX.y0 * K)}) scale(${K.toFixed(5)})",
    /** Onde o símbolo termina (o recorte do nome começa aqui e leva o espaço entre os dois). */
    symbolWidth: ${r(SYM_W)},
    /** Onde o nome começa e a linha de base (ponta da bandeirinha). */
    wordX: ${r(LOGO.wordX)},
    baseline: ${LOGO.baseline},
} as const;

/** "Festário" em contorno (Alegreya Sans ExtraBold), sem o agudo. */
export const WORDMARK_PATH = "${word.body}";

/** O agudo do "á", em pitanga. */
export const WORDMARK_ACCENT_PATH = "${word.accent}";
`;
fs.writeFileSync(path.join(ROOT, "src/components/Brand/geometry.ts"), geometry);

console.log(Object.keys(files).join("\n"), `\nlogotipo: ${LOGO.w} x ${LOGO.h} (corpo do nome ${WORD_SIZE.toFixed(1)})`);
