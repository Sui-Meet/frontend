'use client'
import "./globals.css";
import {
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import '@radix-ui/themes/styles.css';
import { networkConfig } from "@/config";
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient();
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme appearance="light" accentColor="orange" radius="full">
          <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
              <WalletProvider autoConnect>
                {children}
                <Toaster />
              </WalletProvider>
            </SuiClientProvider>
          </QueryClientProvider>
        </Theme>
      </body>
    </html>
  );
}
