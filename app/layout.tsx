import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import WalletContextProvider from "./context/WalletProvider";

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
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}