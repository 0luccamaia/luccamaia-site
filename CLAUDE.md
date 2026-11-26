# Site luccamaia.com

Responda sempre em português.

Site pessoal de Lucca Maia (branding): HTML, CSS e JS estáticos, sem build. Animações com Motion via CDN.
Páginas: `index.html` (site) e `briefing.html` (pré-briefing, uma pergunta por tela, script `briefing.js`).

## Publicar
- Repositório `0luccamaia/luccamaia-site`, branch `main`, raiz. GitHub Pages publica cada push em 1 a 2 minutos.
- Ao mudar `main.js`, `briefing.js` ou `styles.css`, aumente o `?v=` correspondente nos HTML, senão os visitantes recebem a versão antiga em cache.
- Não apague `CNAME` nem `.nojekyll`. HTTPS está ativo e forçado.
- DNS na Hostinger: registros A `@` para os IPs do GitHub Pages (185.199.108-111.153) e CNAME `www` para `0luccamaia.github.io`.
- Se o certificado HTTPS travar, remover e adicionar o domínio de novo no GitHub Pages resolveu da última vez.

## Formulários
- Os dois formulários (contato e pré-briefing) enviam para o Web3Forms (a chave nos HTML é pública por design). Os e-mails chegam em studioluccamaia@gmail.com. Plano grátis: 250 envios por mês.
- Ao testar, não envie de verdade: substitua o `fetch` no console para ver o que seria enviado.

## Visual
- Minimalista: paleta azul (`--azure #00638e`, `--mist #8cb9cc`, `--azure-light #bfd8e3`), grafite e branco; Inter Tight fina, Instrument Serif itálico nos `<em>`, JetBrains Mono nas etiquetas.
- Paisagens são cordilheiras em SVG, geradas por `node tools/gen-land.js .` (preenche cada `<path data-ridge="nome">` dos HTML e gera `assets/land-*.svg`). Não edite os caminhos à mão.
- O céu do "Porque" muda a cada capítulo pelas paletas em `main.js` (`palettes`).
- A única foto do Lucca no site é a do Sobre (`assets/lucca-sobre.webp`). A capa não tem foto.

## Conteúdo
- Os textos são do Lucca: ao mudar o design, não mude a mensagem.
- Contatos: Instagram @eu.luccamaia, e-mail studioluccamaia@gmail.com.
- Processo, nesta ordem: Posicionamento, Estratégia, Valor, Tribo (Tribo sempre por último, inclusive nas opções do formulário).
- Projetos: Digno, Lógos (com acento) e Praça Açaiteria (2025). Textos e imagens vêm do arquivo do Figma do Lucca.
- Capa: "Venda sem oferta. Marca é diferenciação." Não usar a palavra "preço" no título.

## Cuidados
- Teste no celular (até 800 px) e no computador; no celular o processo vira acordeão e os projetos viram lista.
- A logo (`assets/logo-mark.svg`) é exibida girada 90°. Os ícones do site (`favicon.svg` e PNGs) já estão girados.
