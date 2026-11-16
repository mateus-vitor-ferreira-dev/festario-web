# Contribuindo com o Festário — App

Este repositório é proprietário. O código é público para consulta, mas contribuições são aceitas só por convite. Se você não foi convidado, não abra pull requests. Para falar com a equipe, use https://festario.com.br.

## Fluxo de branches

```
feat/*  ou  fix/*  →  develop  →  main
```

- Crie o branch a partir da `develop`: `feat/<assunto>` para funcionalidade, `fix/<assunto>` para correção.
- Abra o pull request para a `develop`.
- A release sai por um pull request da `develop` para a `main`. Cada push na `main` publica o app em produção.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/) com a descrição em português:

```
feat: filtra a vitrine de serviços pela data da festa
fix: mantém o filtro de status ao trocar de página
```

Tipos usados: `feat`, `fix`, `refactor`, `test`, `chore` e `docs`.

## Antes de abrir o pull request

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run lint` sem erros
- [ ] `npm test` passando
- [ ] `npm run test:coverage` acima dos thresholds de `vite.config.ts` (linhas 84%, funções 82%, branches 75%)

Preencha o modelo em [`.github/pull_request_template.md`](.github/pull_request_template.md): descrição, tipo de mudança, como testar e, se houver mudança visual, as capturas de antes e depois.

## Estilo

- Comentários explicam o porquê, não o quê. Nunca citam número de issue ou de pull request.
- Mensagens de commit e textos de pull request não mencionam IA.
- Siga o que o ESLint e o TypeScript (modo strict) pedem; não desligue regras para passar no CI.
