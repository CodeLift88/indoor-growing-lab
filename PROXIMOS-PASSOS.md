# Próximos passos

Lista viva do que falta para o site crescer. Marque com `[x]` o que for concluído.
Última revisão: 18 nov. 2026, depois das críticas de direção de arte e de produto.

## Para começar a próxima sessão
1. Planejar e produzir o primeiro vídeo (ver "Vídeos" abaixo)
2. Diário: comparação antes e depois
3. Revisar estilos de link (reduzir a dois)

## Depende de você

### Para subir e crescer
- [ ] Fazer o merge do pull request #1 e, em **Settings → Pages**, trocar o branch para `master`
- [ ] Reservar o @growmetria no Instagram e o domínio `growmetria.com.br` (se der, também `grometria.com.br` para redirecionar)
- [ ] Pedir o registro da marca **Growmetria** no INPI (classes 41 e 35) antes de divulgar em larga escala: no Brasil a marca é de quem pede primeiro
- [ ] Comprar o domínio e mandar o nome (eu troco o endereço em todo o site e passo o DNS)
- [ ] Criar o Google Search Console (tipo "Domínio") e mandar o registro TXT de verificação
- [ ] Criar uma conta grátis no GoatCounter (estatísticas sem cookies) e mandar o nome do site
- [ ] Newsletter: criar conta grátis no Buttondown ou Brevo (os dois funcionam com a LGPD) para eu colocar a inscrição no site

### Decisões (me responder para eu ajustar)
- [ ] **Equipe ou só você?** Hoje o site assina "Equipe Growmetria". Opções: assinar só "Growmetria", ou uma assinatura em primeira pessoa (nome ou apelido). Equipe inventada derruba a confiança de parceiros e do Google quando descoberta. Deixamos para depois; "Conheça a equipe" já saiu da home
- [x] Frase sobre saúde na home: removida
- [ ] Tamanho padrão da ficha da hero para quem chega pela primeira vez: hoje 120×120 (500 W, R$ 185/mês). Sugestão: 80×80, mais próximo de quem está começando

### Para dar credibilidade
- [ ] Fotos reais dos 14 sintomas do diagnóstico (lista de arquivos abaixo)
- [ ] E-mail de contato com o domínio (ex.: contato@growmetria.com.br)
- [x] Página "Como fazemos" (fórmulas, faixas, fontes, afiliados)
- [ ] Revisão dos guias por alguém com experiência de cultivo (pH, temperaturas, tempos). Quando houver, o nome entra em cada guia revisado
- [ ] Revisão do aviso jurídico por um advogado antes de divulgar em larga escala (o texto do STF já foi corrigido para "presunção de uso pessoal", não autorização)

### Para monetizar (deixado para depois)
- [ ] Escolher produtos vendidos no Brasil e entrar em programas de afiliado (conferir se aceitam o tema)
- [ ] Preencher preços em reais (`priceBRL` no `data.js`) e links de afiliado
- [ ] Com os primeiros produtos com link: indicações no resultado das calculadoras de Espaço, Luz e Exaustão ("Você precisa de 268 m³/h. Estes exaustores atendem."), filtradas pelo grow da pessoa
- [ ] Link na ficha da hero: "Kits que fecham essa ficha →" (sugestão da crítica de direção de arte)
- [ ] Apresentação de uma página para growshops e associações (patrocínio de ferramenta)

### Para validar
- [ ] Testar num celular de verdade: rolar o ciclo, instalar como app, salvar uma foto no diário e baixar a ficha
- [ ] Teste com 3 pessoas (uma que nunca plantou), observando sem ajudar

### Fotos do diagnóstico
Uma por sintoma, sua ou com licença de uso. Luz branca, de perto, horizontal, mínimo 1200 px.
`n.jpg` amarelo nas folhas de baixo · `mg.jpg` amarelo entre nervuras · `k.jpg` bordas secando ·
`ca.jpg` manchas de ferrugem · `fe.jpg` folhas novas quase brancas · `light.jpg` topo desbotado perto do LED ·
`burn.jpg` pontinhas queimadas · `claw.jpg` folhas em garra · `over.jpg` excesso de água ·
`under.jpg` falta de água · `oidio.jpg` pó branco · `acaros.jpg` pontinhos e teias ·
`gnats.jpg` mosquinhas na terra · `botrytis.jpg` mofo cinza no bud

## Posso fazer sem depender de você

### Site
- [ ] Revisar estilos de link: hoje há mono verde, mono sublinhado, sans com seta e sans sublinhado. Reduzir a dois (mono só para rótulos e números)
- [ ] Hospedar as fontes no próprio site (mais rápido e melhor para a LGPD)
- [ ] Revisar o modo escuro com a identidade nova (hero, ficha, diário)
- [ ] Fazer links antigos (`#luz`, `#clima`...) levarem à ferramenta certa
- [ ] Aviso ao trocar o nível de detalhe
- [ ] Linha de "Como calculamos" ao lado dos números da ficha da hero, levando para `como-fazemos.html`
- [ ] Testar Diagnóstico e Equipamentos no celular (as críticas pularam essas seções)

### Diário
- [x] Fotos viram a ficha do grow ao salvar; só a ficha fica guardada
- [ ] Comparação antes e depois (duas fichas lado a lado)
- [ ] Quando o domínio chegar: colocar o endereço no rodapé da ficha do grow

### Conteúdo
- [ ] Novos guias: treinamento (LST e poda), secagem e cura, nutrição básica, segurança elétrica
- [ ] Atualizar a lista "Comece por aqui" se entrar um guia melhor para iniciantes

## Vídeos (redes sociais)
- [ ] Definir ferramenta: Remotion ou HyperFrames
- [ ] Vídeo de lançamento: o ciclo inteiro em 30 segundos (roteiro na conversa de 18 nov.)
- [ ] Série semanal "Sem chute": um erro comum, o número certo e a ferramenta que resolve
- [ ] Links das redes com UTM (`?utm_source=instagram`) para medir as visitas quando o GoatCounter estiver no ar

## Não vamos fazer agora (decidido)
- Versão internacional (inglês, dólar, polegadas): só depois de provar o modelo no Brasil
- Aplicativo nas lojas: o site já instala como app; só faz sentido se o diário tiver uso semanal comprovado
- Reorganizar o menu em "Aprender / Ferramentas / Meu cultivo": o menu atual usa as palavras que as pessoas procuram

## Quando o domínio chegar (técnico)
- [ ] Arquivo `CNAME` no repositório
- [ ] Atualizar `SITE` em `scripts/build.js` e as tags `og:`/canonical do `index.html`, rodar `node scripts/build.js` e `node scripts/og.js`
- [ ] Enviar o `sitemap.xml` no Search Console
