import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Footer from '../../src/components/ui/Footer'
import Header from '../../src/components/ui/Header'
import TrainingScene from '../../src/components/scenes/Training'
import * as t from '../../src/types'
import graphcms from '../../src/graphcms'


type Props = {
  training: t.Training
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const slug = context.params?.['slug'] ?? ''
  const training = await graphcms.findTraining(slug as string)
  return {
    props: {
      training
    }
  }
}

const TrainingPage: NextPage<Props> = ({
  training
}) => {
  return (
    <>
      <Head>
        <title>Praxis | {training.name}</title>
        <meta
          name="description"
          content="The best tactical, survival, and medical trainings from over a hundred companies across the US. Organized and searchable. Start training today."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <TrainingScene
        training={training}
      />
      <Footer />
    </>
  )
}

export default TrainingPage
