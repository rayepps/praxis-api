import { Pane, Image, majorScale } from 'evergreen-ui'
import { Split } from 'src/components/Layout'


export default function HorizontalGallery({
  images
}: {
  images: string[]
}) {
  return (
    <Split
      overflowX='scroll'
    >
      {(images ?? []).map((imageUrl, i) => (
        <Pane marginRight={i === images.length-1 ? 0 : majorScale(3)} key={`${imageUrl}_${i}`}>
          <Image height={200} width='auto' src={imageUrl} borderRadius={4} />  
        </Pane>
      ))}
    </Split>
  )
}