import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Store from '#/store/Store'
import WrappedIntlProvider from '#/components/WrappedIntlProvider'
import { IntlProvider } from 'react-intl'
import { ThemeProvider } from '#/components/styles/theme'
import { getRouter } from '#/router'

export const Route = createFileRoute('/$hudId/$slug')({
  component: RouteComponent,
})

const store = new Store()
// const three = (
//   <Canvas>
//     <ambientLight intensity={0.1} />
//     <directionalLight color="red" position={[0, 0, 5]} />
//     <mesh>
//       <boxGeometry scale={5} />
//       <meshStandardMaterial />
//     </mesh>
//   </Canvas>
// )

function RouteComponent() {
  // const t = Route.useParams()
  // const canvas = useRef(null)
  return (
    <WrappedIntlProvider>
      <ThemeProvider store={store}>
        <div className="support-root"></div>
        <div id="canvas-container"></div>
      </ThemeProvider>
    </WrappedIntlProvider>
  )
}
