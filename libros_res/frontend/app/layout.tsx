export const metadata = {
  title: "Buscador de Libros",
  description: "Aplicación para buscar libros usando la API de Google Books",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
