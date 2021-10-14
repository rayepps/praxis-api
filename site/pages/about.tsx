import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../src/components/ui/Footer'
import Header from '../src/components/ui/Header'
import AboutScene from '../src/components/scenes/About'

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>Praxis | Our Story</title>
        <meta
          name="description" 
          content="The best tactical, survival, and medical trainings from over a hundred companies across the US. Organized and searchable. Start training today." 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <AboutScene />
      <Footer />
    </>
  )
}

export default About
