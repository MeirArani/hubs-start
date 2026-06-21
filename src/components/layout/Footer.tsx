import Container from './Container'
import '#/styles/sass/layout/Footer.module.scss'

export default function Footer({
  hidePoweredBy = false,
}: {
  hidePoweredBy?: boolean
}) {
  return (
    <footer>
      <Container as="div" className="footer">
        <div className="powered-by">
          Powered by
          <a className="link" href="https://hubsfoundation.org">
            Hubs
          </a>
        </div>
        {/* <nav>
          <ul></ul>
        </nav> */}
      </Container>
    </footer>
  )
}
