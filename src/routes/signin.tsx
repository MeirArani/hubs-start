import { SignInModalContainer } from '#/components/auth/SignInModalContainer'
import { Center } from '#/components/layout/Center'
import PageContainer from '#/components/layout/PageContainer'
import { createFileRoute } from '@tanstack/react-router'
import { IntlProvider } from 'react-intl'
export const Route = createFileRoute('/signin')({
  component: SignInRoot,
})

function SignInRoot() {
  return (
    <IntlProvider locale="en" defaultLocale="en">
      <PageContainer>
        <Center>
          <SignInModalContainer />
        </Center>
      </PageContainer>
    </IntlProvider>
  )
}
