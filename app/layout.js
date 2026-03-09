import './globals.css';

export const metadata = {
  title: 'SheetSync — Comparador de Planilhas',
  description: 'Compare planilhas e visualize mudanças com clareza',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
