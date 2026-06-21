import AppLogo from '../AppLogo'
import '#/styles/sass/layout/Header.module.scss'
import Container from './Container'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { SignInButton } from '../input/SignInButton'

export default function Header({}: {}) {
  return (
    <header>
      <Container as="div" className="header">
        <nav>
          <ul>
            <li>
              <a href="/" className="home-link">
                <AppLogo />
              </a>
            </li>
            <li>
              <a href="/spoke">Scene Editor</a>
            </li>
            <li>
              <a href="/admin" rel="noreferrer noopener">
                <i>
                  <FontAwesomeIcon icon={faCog} />
                </i>{' '}
                Admin
              </a>
            </li>
          </ul>
        </nav>
        <div className="sign-in">
          <SignInButton />
        </div>
      </Container>
    </header>
  )
}
