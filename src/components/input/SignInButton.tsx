// import '#/styles/sass/input/'
import { Link } from '@tanstack/react-router'
export function SignInButton({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link
      className={`${mobile ? 'mobile-sign-in' : 'sign-in-button'} button signin`}
      to="/signin"
    >
      Sign in/Sign up
    </Link>
  )
}
