# SheetSync — Comparador de Planilhas

Ferramenta web para comparar planilhas Excel/CSV com uma planilha mestre, gerando relatórios detalhados de mudanças.

## Funcionalidades

- **Planilha Mestre** — suba uma planilha base que ficará salva no navegador (localStorage). Ao voltar ao site, ela já estará carregada
- **Trocar Mestre** — substitua a planilha mestre a qualquer momento
- **Comparação** — suba uma nova planilha e veja o relatório com todas as diferenças
- **Relatório detalhado** — filtre por adicionados, removidos e modificados; veja campo a campo o que mudou
- Suporte a `.xlsx`, `.xls` e `.csv`

## Tecnologias

- [Next.js 14](https://nextjs.org/) (App Router)
- [SheetJS (xlsx)](https://sheetjs.com/) — parsing de planilhas
- [lucide-react](https://lucide.dev/) — ícones

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy no Vercel

1. Faça push deste repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Clique em **Deploy** — sem variáveis de ambiente necessárias

## Estrutura do projeto

```
├── app/
│   ├── globals.css       # Design system e variáveis CSS
│   ├── layout.js         # Root layout
│   └── page.js           # Página principal
├── components/
│   ├── DropZone.js       # Área de upload (drag & drop)
│   └── Report.js         # Visualizador do relatório
├── lib/
│   └── sheetUtils.js     # Parsing, comparação e localStorage
└── next.config.js
```

## Como funciona a comparação

A comparação usa a **primeira coluna** de cada aba como chave identificadora das linhas. Linhas com a mesma chave são comparadas campo a campo. Linhas sem correspondência são marcadas como adicionadas ou removidas.

---

Feito para rodar 100% no browser — sem backend, sem banco de dados.
