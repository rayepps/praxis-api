import Head from 'next/head'
import type { AppProps } from 'next/app'
import { BreakpointProvider } from 'react-socks'

import '../src/styles/reset.css'
import '../src/styles/index.css'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
      </Head>
      <BreakpointProvider>
        <Component {...pageProps} />
      </BreakpointProvider>
    </>
  )
}

export default MyApp
