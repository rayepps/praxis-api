import { useEffect } from 'react'
import Modal from 'src/components/ui/Modal'
import EventDetailScene from 'src/components/scenes/EventDetail'
import { useRecoilState } from 'recoil'
import { currentEventState } from 'src/state/search'
import { useFetch } from 'src/hooks'
import * as api from 'src/api'
import * as t from 'src/types'


export default function EventDetailModal() {

  const [currentEventId, setCurrentEvent] = useRecoilState(currentEventState)
  const findEvent = useFetch(api.findEvent)

  useEffect(() => {
    if (!currentEventId) return
    findEvent.fetch(currentEventId)
  }, [currentEventId])

  const closeModal = () => {
    setCurrentEvent(undefined)
  }

  if (!currentEventId) return null

  if (!findEvent.started || findEvent.loading) return (
    <Modal open onClose={closeModal} hideHeader>
      <span>loading...</span>
    </Modal>
  )

  const event = findEvent.data?.event as t.Event

  return (
    <Modal open hideHeader onClose={closeModal} title={event.training.name}>
      <EventDetailScene event={event} onClose={closeModal} />
    </Modal>
  )
}