import type { ReactNode } from 'react'
import Page from './Page'

export default function PageContainer({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <Page className={className}>{children}</Page>
}
