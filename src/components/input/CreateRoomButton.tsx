import Button from './Button'

export default function CreateRoomButton() {
  return (
    <Button
      preset="landing"
      onClick={(e) => {
        e.preventDefault()
      }}
      className="xl"
    >
      Create Room
    </Button>
  )
}
