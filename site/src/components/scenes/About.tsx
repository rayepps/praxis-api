import {
  Text,
  Heading,
  Pane,
  Paragraph,
  majorScale
} from 'evergreen-ui'
import { Center } from '../Layout'


export default function AboutScene() {

  return (
    <Center paddingY={majorScale(4)}>
      <Center maxWidth={800}>
        <Text textAlign='center' size={600}>Who We Are</Text>
        <Heading textAlign='center' size={800} marginBottom={majorScale(2)}>Curating Badass Factories</Heading>
        <Paragraph maxWidth={500} paddingX={majorScale(4)}>
          We bring all the great training companies in the USA to you. We find them, we make sure they're tier one, and we list their trainings here where they're easy to search and sort. Our goal is to make quality training more available. There are dozens of tactical companies in each state. Many of them travel. Many of them have awful websites. This does not work for the current and coming generations. We are your one stop shop to find a training near you on the date you need.We're based in the Treasure Valley of Idaho.
        </Paragraph>
      </Center>
    </Center>
  )
}