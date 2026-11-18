# Próximos passos

Lista viva do que falta para o site crescer. Marque com `[x]` o que for concluído.

## Depende de você

### Para subir e crescer
- [ ] Fazer o merge do pull request #1 e, em **Settings → Pages**, trocar o branch para `master`
- [ ] Comprar o domínio e mandar o nome (eu troco o endereço em todo o site e passo o DNS)
- [ ] Criar o Google Search Console (tipo "Domínio") e mandar o registro TXT de verificação
- [ ] Criar uma conta grátis no GoatCounter (estatísticas sem cookies) e mandar o nome do site

### Decisões de texto (me responder para eu ajustar)
- [ ] **Equipe ou só você?** Se for só você, trocar "Equipe Indoor Growing Lab" e "Conheça a equipe" pela marca "Indoor Growing Lab" ou por uma assinatura em primeira pessoa (nome ou apelido). Equipe inventada derruba a confiança de parceiros e do Google quando descoberta.
- [ ] **Frase sobre saúde na home** ("benefícios que ela pode trazer à saúde"). Alegação de saúde costuma fazer lojas e programas de afiliado recusarem parceria. Sugestão: tirar da home ("apaixonados pela cultura canábica e pelo cultivo bem feito") e manter a parte de saúde só em "Quem somos", com o aviso médico.

### Para dar credibilidade
- [ ] Fotos reais dos 14 sintomas do diagnóstico (lista de arquivos abaixo)
- [ ] E-mail de contato com o domínio (ex.: contato@seudominio.com.br)
- [ ] Revisão dos guias por alguém com experiência de cultivo (pH, temperaturas, tempos)
- [ ] Revisão do aviso jurídico por um advogado antes de divulgar em larga escala

### Para monetizar
- [ ] Escolher produtos vendidos no Brasil e entrar em programas de afiliado (conferir se aceitam o tema)
- [ ] Preencher preços em reais (`priceBRL` no `data.js`) e links de afiliado
- [ ] Com os primeiros produtos brasileiros com link: eu coloco indicações no resultado das calculadoras de Espaço, Luz e Exaustão ("Você precisa de 268 m³/h. Estes exaustores atendem."), filtradas pelo seu grow. É o ponto mais natural para venda no site

### Para validar
- [ ] Testar num celular de verdade: rolar o ciclo, instalar como app, usar uma calculadora
- [ ] Teste com 3 pessoas (uma que nunca plantou), observando sem ajudar
- [ ] Reservar o mesmo nome do domínio no Instagram (avatar: `assets/icons/icon-512.png`)

### Fotos do diagnóstico
Uma por sintoma, sua ou com licença de uso. Luz branca, de perto, horizontal, mínimo 1200 px.
`n.jpg` amarelo nas folhas de baixo · `mg.jpg` amarelo entre nervuras · `k.jpg` bordas secando ·
`ca.jpg` manchas de ferrugem · `fe.jpg` folhas novas quase brancas · `light.jpg` topo desbotado perto do LED ·
`burn.jpg` pontinhas queimadas · `claw.jpg` folhas em garra · `over.jpg` excesso de água ·
`under.jpg` falta de água · `oidio.jpg` pó branco · `acaros.jpg` pontinhos e teias ·
`gnats.jpg` mosquinhas na terra · `botrytis.jpg` mofo cinza no bud

## Posso fazer sem depender de você
- [ ] Hospedar as fontes no próprio site (mais rápido e melhor para a LGPD)
- [ ] Revisar o modo escuro com a identidade nova
- [ ] Fazer links antigos (`#luz`, `#clima`...) levarem à ferramenta certa
- [ ] Aviso ao trocar o nível de detalhe
- [ ] Novos guias: treinamento (LST e poda), secagem e cura, nutrição básica, segurança elétrica

## Quando o domínio chegar (técnico)
- [ ] Arquivo `CNAME` no repositório
- [ ] Atualizar `SITE` em `scripts/build.js` e as tags `og:`/canonical do `index.html`, rodar `node scripts/build.js` e `node scripts/og.js`
- [ ] Enviar o `sitemap.xml` no Search Console
