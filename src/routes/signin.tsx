import { SignInModalContainer } from '#/react-components/auth/SignInModalContainer';
import { Center } from '#/react-components/layout/Center';
import PageContainer from '#/react-components/layout/PageContainer';
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/signin')({
  component: SignInRoot,
});

function SignInRoot() {
  return (
    <div className="flex flex-col m-0 h-full">
      <PageContainer className="grow">
        <Center>
          <SignInModalContainer />
        </Center>
      </PageContainer>
    </div>
  );
}
