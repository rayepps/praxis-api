import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Footer from '../../src/components/ui/Footer'
import Header from '../../src/components/ui/Header'
import FeaturedTagScene from '../../src/components/scenes/FeaturedTag'
import * as t from '../../src/types'
import graphcms from '../../src/graphcms'


type Props = {
  featuredTag: t.FeaturedTag
  trainings: t.Training[]
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const slug = context.params?.['slug'] ?? ''
  const featuredTag = await graphcms.findFeaturedTag(slug as string)
  if (!featuredTag) {
    return {
      notFound: true
    }
  }
  const trainings = await graphcms.findTrainingsWithTag(slug as string)
  return {
    props: {
      featuredTag, trainings
    }
  }
}

const FeaturedTagPage: NextPage<Props> = ({
  featuredTag,
  trainings
}) => {
  return (
    <>
      <Head>
        <title>Praxis | {featuredTag.tag.name} Trainings</title>
        <meta
          name="description"
          content={
            `The best ${featuredTag.tag.name} trainings from over a hundred companies across the US. Organized and searchable. Start training today.`
          }
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <FeaturedTagScene
        featuredTag={featuredTag}
        trainings={trainings}
      />
      <Footer />
    </>
  )
}

export default FeaturedTagPage
