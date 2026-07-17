import AppLogo from '../AppLogo';
// import '#/styles/sass/layout/Header.module.scss'
import Container from './Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { SignInButton } from '../input/Button';

export default function Header({}: {}) {
  return (
    <header className="block lg:p-0">
      <Container
        as="div"
        className="flex flex-col lg:h-35 lg:flex-row lg:items-[inherit]"
      >
        <nav className="flex flex-col lg:flex-row">
          <ul className="flex flex-col m-0 p-0 list-none items-center justify-between lg:justify-end lg:flex-row">
            <li className="first:pt-5 pt-5 lg:pt-0">
              <a
                className="my-0 mx-4 text-md text-primary font-bold [text-decoration:none] whitespace-nowrap inline-block w-31"
                href="/"
              >
                <AppLogo className="max-h-20.75 h-full" />
              </a>
            </li>
            <li className="first:pt-5 pt-5 lg:pt-0">
              <a
                className="my-0 mx-4 text-md text-primary font-bold [text-decoration:none] whitespace-nowrap"
                href="/spoke"
              >
                Scene Editor
              </a>
            </li>
            <li className="first:pt-5 pt-5 lg:pt-0">
              <a
                className="my-0 mx-4 text-md text-primary font-bold [text-decoration:none] whitespace-nowrap"
                href="/admin"
                rel="noreferrer noopener"
              >
                <i>
                  <FontAwesomeIcon icon={faCog} />
                </i>{' '}
                Admin
              </a>
            </li>
          </ul>
        </nav>
        <div className="hidden flex-col items-center pt-5 text-md font-bold lg:flex lg:flex-row lg:justify-end lg:flex-1 lg:pt-0">
          <SignInButton className="ml-2 text-link" />
        </div>
      </Container>
    </header>
  );
}
