import HomePage from '#/components/home/HomePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="home-root">
      <HomePage />
    </div>
  )
}
