# Indoor Growing Lab

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
| `guias/*.html` | Páginas dos guias (geradas, não edite à mão) |
| `assets/og/*.png` | Imagens de prévia ao compartilhar links (geradas) |
| `scripts/build.js` | Gera `guias/`, `sitemap.xml` e `robots.txt` a partir de `data.js` |
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

Dentro do texto de um guia (`html`):
- `href="#clima"` aponta para uma calculadora da página principal (`#kit`, `#luz`, `#clima`, `#ar`, `#energia`).
- `href="guia:rega"` aponta para outro guia pelo `id`.
- Tabelas com `<thead>` viram cartões empilhados no celular automaticamente.

## Links de afiliado

Em cada item de `hardware` no `data.js`, troque `officialUrl`/`amazonUrl` pelo link de afiliado e marque `officialAffiliate`/`amazonAffiliate` como `true`. Cupom real vai em `coupon: 'CODIGO'`. O aviso de afiliado e a marca ✦ aparecem sozinhos.

## Endereço publicado

`https://codelift88.github.io/indoor-growing-lab/`. Se mudar, atualize a constante `SITE` em `scripts/build.js` e as tags `og:` do `index.html`.
