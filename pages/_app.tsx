import type { AppProps } from 'next/app'
import "../styles/style.css"
import { FC, useMemo } from "react";
import { SessionProvider } from "next-auth/react"
export default function App({ Component, pageProps: { session, ...pageProps }, }: AppProps) {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  
    return (

      <SessionProvider session={session}>
      <Component {...pageProps} />
      </SessionProvider>

    );
  };
  
