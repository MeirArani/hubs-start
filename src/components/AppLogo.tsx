import logo from '../../public/icons/app-logo.png'

export default function AppLogo({ className }: { className?: string }) {
  return <img className={className} src={logo}></img>
}
