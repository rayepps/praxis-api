import {
  Pane,
  majorScale
} from 'evergreen-ui'
import TrainingList from '../ui/TrainingList'
import Hero from 'src/components/ui/Hero'
import * as t from '../../types'


export default function FeaturedTagScene({
  featuredTag,
  trainings
}: {
  featuredTag: t.FeaturedTag
  trainings: t.Training[]
}) {
  return (
    <>
      <Hero
        text={featuredTag.tag.name}
        backgroundImage={featuredTag.thumbnail.url}
        align='top'
      />
      <Pane padding={majorScale(4)}>
        <TrainingList
          orientation='horizontal'
          trainings={trainings}
        />
      </Pane>
    </>
  )
}