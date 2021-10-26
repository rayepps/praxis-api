import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../src/components/ui/Footer'
import Header from '../src/components/ui/Header'
import PrivacyPolicyScene from '../src/components/scenes/PrivacyPolicy'


const PrivacyPolicyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Praxis | Privacy Policy</title>
        <meta
          name="description" 
          content="The best tactical, survival, and medical trainings from over a hundred companies across the US. Organized and searchable. Start training today." 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <PrivacyPolicyScene />
      <Footer />
    </>
  )
}

export default PrivacyPolicyPage
