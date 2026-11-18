# Growmetria

Guia de cultivo indoor do iniciante ao avançado: o ciclo completo animado e calculadoras de espaço, luz, clima, exaustão e conta de luz.

Site estático, sem framework. Funciona abrindo `index.html` direto no navegador ou publicado no GitHub Pages.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Página principal |
| `styles.css` | Todos os estilos (tema claro padrão, escuro opcional) |
| `app.js` | Lógica das calculadoras, ciclo animado, listas |
| `data.js` | **Conteúdo**: tendas, fases, equipamentos, guias, lista de compras |
| `guide.js` | Tema e menu das páginas de guia |
| `glossary.js` | Glossário embutido (PPFD, VPD, pH…), usado em todas as páginas |
| `plan.js` | Cronograma do cultivo (datas, agenda .ics), usado pela home e pelo diário |
| `diario.html` + `diario.js` | Diário de cultivo, salvo só no navegador (página gerada, lógica no .js) |
| `sw.js` + `manifest.webmanifest` | Modo app: instalar na tela inicial e abrir sem internet |
| `assets/icons/*.png` | Ícones do app (gerados por `scripts/icons.js`) |
| `assets/logo.svg`, `logo-claro.svg`, `logo-horizontal.svg` | Logo em vetor: símbolo para fundo claro, para fundo escuro e assinatura com o nome. Cores: tinta `#16190F`, papel `#F2EEE4`, líquido `#D4F25A` |
| `assets/logo-mark.svg` | Favicon (símbolo claro sobre fundo escuro arredondado) |
| `privacidade.html` | Privacidade e contato (gerada) |
| `sobre.html` | Quem somos: Equipe Growmetria (gerada) |
| `partials/*.html` | Conteúdo de cada ferramenta (espaço, luz, clima, exaustão, calendário, diagnóstico, equipamentos) e a barra de resumo. Edite aqui |
| `calculadoras/*.html`, `diagnostico.html`, `equipamentos.html` | Páginas das ferramentas (geradas a partir de `partials/`, não edite à mão) |
| `guias/*.html` | Páginas dos guias (geradas, não edite à mão) |
| `assets/og/*.png` | Imagens de prévia ao compartilhar links (geradas) |
| `scripts/build.js` | Gera `guias/`, `privacidade.html`, `sitemap.xml` e `robots.txt` a partir de `data.js` |
| `scripts/og.js` | Gera as imagens de prévia |

## Editar conteúdo

Tudo fica em `data.js`. Depois de criar ou editar um guia, rode:

```bash
node scripts/build.js
```

Se mudou o título de um guia ou criou um novo, gere também a imagem de prévia (precisa do Playwright com Chromium):

```bash
node scripts/og.js
```

Cada guia tem três textos de chamada:
- `title` e `excerpt`: título e resumo completos, com a palavra "cannabis". Aparecem na página do guia, no Google e na prévia ao compartilhar.
- `short` e `blurb`: título e resumo neutros, usados na listagem da página principal, que fica sem citar a planta.

Dentro do texto de um guia (`html`):
- `href="#clima"` aponta para uma calculadora da página principal (`#kit`, `#luz`, `#clima`, `#ar`, `#energia`).
- `href="guia:rega"` aponta para outro guia pelo `id`.
- Tabelas com `<thead>` viram cartões empilhados no celular automaticamente.

Para adicionar um termo ao glossário, inclua uma linha na lista `TERMS` em `glossary.js`.

Os sintomas da ferramenta de diagnóstico ficam em `diagnoses`, no `data.js`. Cada um aponta para um desenho (`illo`) definido em `app.js`.

## Ferramentas em páginas separadas

Cada ferramenta tem página própria. A lista fica em `tools` e `pages` no `data.js`, e os endereços em `routes`. O `app.js` é o mesmo em todas as páginas: campos que não estão na página atual usam o valor salvo no navegador (`igl-setup`), então o setup é um só em todo o site e os cartões da página inicial mostram os resultados atuais.

Para mudar o conteúdo de uma ferramenta, edite `partials/<nome>.html` e rode `node scripts/build.js`. Links dentro dos partials usam `{{base}}` no começo, que o gerador troca pelo caminho certo.

## Modo app

O `sw.js` busca sempre a versão nova quando há internet e guarda uma cópia para usar sem conexão. Ao mudar a lista de arquivos principais (`CORE`), aumente o número em `CACHE` (por exemplo, `igl-v2`).

## Links de afiliado

Em cada item de `hardware` no `data.js`, troque `officialUrl`/`amazonUrl` pelo link de afiliado e marque `officialAffiliate`/`amazonAffiliate` como `true`. Cupom real vai em `coupon: 'CODIGO'`. O aviso de afiliado e a marca ✦ aparecem sozinhos.

## Endereço publicado

`https://codelift88.github.io/indoor-growing-lab/`. Se mudar, atualize a constante `SITE` em `scripts/build.js` e as tags `og:` do `index.html`.
