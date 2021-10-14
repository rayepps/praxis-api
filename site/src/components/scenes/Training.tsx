import {
  Pane,
  Heading,
  Text,
  Image,
  majorScale
} from 'evergreen-ui'
import Link from 'next/link'
import { Split } from '../Layout'
import * as t from '../../types'


export default function TrainingScene({
  training
}: {
  training: t.Training
}) {

  return (
    <>
      <Split padding={majorScale(4)}>
        <Split flex={1} alignItems='center'>
          <Image height={50} src={training.company.thumbnail.url} />
          <Pane marginLeft={majorScale(2)}>
            <Heading>{training.name}</Heading>
            <Text>by {training.company.name}</Text>
          </Pane>
        </Split>
        <Pane>
          <Link href={training.externalLink ?? training.directLink ?? '/'}>
            <a>view at {training.company.name}</a>
          </Link>
        </Pane>
      </Split>
      <Split padding={majorScale(4)}>
        <Pane 
          maxWidth={500} 
          minWidth={300}
          display='flex'
          flexDirection='column'
        >
          {training.gallery.map(asset => (
            <Image 
              key={asset.url} 
              src={asset.url} 
              borderRadius={4} 
              marginBottom={majorScale(2)}
            />
          ))}
        </Pane>
        <Pane 
          flex={1} 
          marginLeft={majorScale(4)}
          maxWidth={600}
        >
          <div dangerouslySetInnerHTML={{ __html: training.description.html }} />
        </Pane>
      </Split>
    </>
  )
}