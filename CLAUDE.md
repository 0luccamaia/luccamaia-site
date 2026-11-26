# Site luccamaia.com

Responda sempre em português.

Site pessoal de Lucca Maia (branding): HTML, CSS e JS estáticos, sem build. Animações com Motion via CDN.

## Publicar
- Repositório `0luccamaia/luccamaia-site`, branch `main`, raiz. GitHub Pages publica cada push em 1 a 2 minutos.
- Ao mudar `main.js` ou `styles.css`, aumente o `?v=` correspondente no `index.html`, senão os visitantes recebem a versão antiga em cache.
- Não apague `CNAME` nem `.nojekyll`. HTTPS está ativo e forçado.
- DNS na Hostinger: registros A `@` para os IPs do GitHub Pages (185.199.108-111.153) e CNAME `www` para `0luccamaia.github.io`.
- Se o certificado HTTPS travar, remover e adicionar o domínio de novo no GitHub Pages resolveu da última vez.

## Formulário
- Envia para o Web3Forms (a chave no `index.html` é pública por design). Os e-mails chegam em studioluccamaia@gmail.com. Plano grátis: 250 envios por mês.

## Conteúdo
- Contatos: Instagram @eu.luccamaia, e-mail studioluccamaia@gmail.com.
- Processo, nesta ordem: Posicionamento, Estratégia, Valor, Tribo (Tribo sempre por último, inclusive nas opções do formulário).
- Projetos: Digno, Lógos (com acento) e Praça Açaiteria (2025). Textos e imagens vêm do arquivo do Figma do Lucca.
- Capa: "Venda sem oferta. Marca é diferenciação." Não usar a palavra "preço" no título.

## Cuidados
- Teste no celular (até 800 px): no topo, a foto fica logo abaixo do subtítulo, sem sobrepor o texto.
- A logo (`assets/logo-mark.svg`) é exibida girada 90°. Os ícones do site (`favicon.svg` e PNGs) já estão girados.
