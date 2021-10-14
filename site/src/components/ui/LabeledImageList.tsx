import {
  Pane,
  Text,
  majorScale
} from 'evergreen-ui'
import Link from 'next/link'
import theme from 'src/theme'


interface LabeledImage {
  imageUrl: string
  label: string
  link: string
}

export default function LabeledImageList({
  items
}: {
  items: LabeledImage[]
}) {
  const columns = 2
  return (
    <Pane
      display='grid'
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {items.map((item) => (
        <Link key={item.link} href={item.link}>
          <Pane
            backgroundImage={`url(${item.imageUrl})`}
            backgroundSize='cover'
            backgroundPosition='center center'
            height={500}
            borderRadius={4}
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <Text
              display='block'
              padding={majorScale(4)}
              backgroundColor={theme.colors.green.alpha(0.5).rgb().string()}
              color={theme.colors.white.hex()}
              borderRadius='20px'
              fontSize={30}
            >
              {item.label}
            </Text>
          </Pane>
        </Link>
      ))}
    </Pane>
  )
}