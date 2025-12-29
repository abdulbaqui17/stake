export const metadata = {
  title: "SOL Staking Frontend",
  description: "A minimal Next.js frontend for SOL staking"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-100">
        {children}
      </body>
    </html>
  );
}