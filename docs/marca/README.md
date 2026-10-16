# Festário — guia da marca

**Festário** junta *festa* ao sufixo de *calendário*, *diário* e *horário*: é a agenda das festas. Domínios livres na escolha (14/10/2026): `festario.com.br` e `festario.app`. O `festario.com` já estava registrado.

## O símbolo
Um calendário cuja **folha é uma bandeirinha** de festa junina. O corte em V da bandeirinha também lembra um marcador de página: a data guardada. O cabeçalho pitanga leva as duas argolas do calendário, e a célula milho é o dia reservado. A festa brasileira e a reserva garantida cabem na mesma forma.

Slogan: **Data marcada, festa garantida.**

| Arquivo (`svg/`) | Uso |
|---|---|
| `festario-logotipo.svg` / `-escuro.svg` | marca completa: header, login, e-mails, Open Graph |
| `festario-simbolo.svg` / `-escuro.svg` | espaços quadrados: avatar, ícone de app, carregamento |
| `festario-simbolo-mono.svg` | uma cor só (`currentColor`): usar **inline** no HTML para herdar a cor do texto |
| `festario-favicon.svg` | **só de 16 a 32 px**. Desenho próprio na grade 32, em medidas inteiras, que troca o anil pelo anil-claro na aba escura (`prefers-color-scheme`) |
| `apple-touch-icon.svg` / `festario-icone-512.svg` | ícone de app: símbolo claro sobre anil, em ~60% da altura, para caber na máscara redonda do Android |
| `og-image.svg` | compartilhamento (1200×630): varal de bandeirinhas, logotipo e o slogan |

Os PNGs de `public/` (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.png`) são esses SVGs rasterizados no tamanho exato.

O nome no logotipo é a **Alegreya Sans ExtraBold**, convertida em contorno, então não depende da fonte instalada. O agudo do "á" sai em pitanga. O slogan da og-image é a **Alegreya SemiBold**. A fonte é da Huerta Tipográfica, sob a SIL Open Font License 1.1. A interface continua com Alegreya (títulos) e Alegreya Sans (texto), por continuidade com o app.

## Tamanho mínimo e respiro
- **Logotipo:** altura mínima de **24 px** na tela e **8 mm** impresso.
- **Símbolo:** **24 px**. Abaixo disso, use o favicon.
- **Respiro:** em volta da marca, deixe livre **¼ da altura do símbolo**, sem texto nem borda nesse espaço.

## Cores
Os tokens ficam em [`tokens.css`](tokens.css).

| Token | Hex | Papel |
|---|---|---|
| Anil | `#27357e` | primária: botões, links, marca |
| Anil escuro | `#141936` | texto principal |
| Anil claro | `#9aa8f2` | marca e links no tema escuro |
| Milho | `#f4b41a` | destaque decorativo |
| Pitanga | `#d8344a` | destaque, celebração |
| Pitanga escura | `#b8233a` | erro e alerta em texto |
| Névoa / Papel | `#f5f6fb` / `#ffffff` | fundo e superfícies |
| Grafite | `#5a6079` | texto secundário |
| Noite / Noite superfície | `#0f1330` / `#1a1f45` | tema escuro |

### Contraste (WCAG 2.2, calculado)
| Texto | Fundo | Razão | Nível |
|---|---|---|---|
| Anil escuro | Névoa | 15,92:1 | AAA |
| Anil | Papel | 11,07:1 | AAA |
| Papel (branco) | Anil (botão) | 11,07:1 | AAA |
| Grafite | Névoa | 5,75:1 | AA |
| Grafite | Papel | 6,21:1 | AA |
| Anil escuro | Milho | 9,32:1 | AAA |
| Papel (branco) | Pitanga | 4,66:1 | AA |
| Pitanga escura | Papel | 6,29:1 | AA |
| Névoa | Noite | 16,83:1 | AAA |
| Névoa texto | Noite | 11,55:1 | AAA |
| Anil claro | Noite | 8,01:1 | AAA |
| Anil claro | Noite superfície | 6,98:1 | AA |
| Noite | Anil claro (botão escuro) | 8,01:1 | AAA |
| **Milho** | **Papel** | **1,84:1** | **reprova: milho nunca é texto sobre fundo claro** |

## Usos errados
- Trocar as cores fixas do símbolo: cabeçalho e agudo em pitanga, célula do dia em milho. Só o corpo e as argolas mudam (anil no claro, anil-claro no escuro).
- Esticar, girar, aplicar sombra, contorno ou gradiente.
- Usar o favicon acima de 32 px ou o símbolo completo abaixo de 24 px.
- Colocar o símbolo colorido sobre foto ou fundo de baixo contraste. Nesses casos, use a versão mono em branco ou anil escuro.
- Escrever "Festario" sem acento, "FESTÁRIO" em caixa alta ou "festário" em minúsculas em material de marca.

## Para regenerar
Os SVGs são gerados por código a partir de constantes (cores e geometria). O script é o [`build-brand.cjs`](build-brand.cjs), com `opentype.js`:

```sh
F=node_modules/@expo-google-fonts
node docs/marca/build-brand.cjs $F/alegreya-sans/800ExtraBold/AlegreyaSans_800ExtraBold.ttf \
  $F/alegreya/600SemiBold/Alegreya_600SemiBold.ttf docs/marca/svg
```

Ele também escreve `public/festario-favicon.svg` e `src/components/Brand/geometry.ts`, então o logotipo desenhado no app nunca se separa dos arquivos. Depois, rasterize os PNGs de `public/` a partir dos SVGs no tamanho de cada um. Para mudar uma cor, troque o token e regenere tudo, sem editar os arquivos à mão.
