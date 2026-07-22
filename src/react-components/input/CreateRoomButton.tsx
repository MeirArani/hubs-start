import { createServerFn } from '@tanstack/react-start';
import Button from './Button';
import generateHubName from '#/utils/dummy';
import { useNavigate } from '@tanstack/react-router';
export default function CreateRoomButton() {
  const navigate = useNavigate({ from: '/' });
  return (
    <Button
      preset="primary"
      xl
      onClick={async (e) => {
        e.preventDefault();
        const hub = await createNewHub();
        const { hubId } = hub;
        navigate({
          to: '/$hubId/',
          params: { hubId },
        });
      }}
    >
      Create Room
    </Button>
  );
}

async function createNewHub() {
  // Create API Payload (Authorization etc.)
  // POST to API
  // Grab results
  const hub = await GetNewHubData({
    data: { name: generateHubName() },
  });
  // Store CreatorAssignmentTokens

  return hub;
}

const GetNewHubData = createServerFn({ method: 'POST' })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    return {
      creator_assignment_token: 'dummyToken',
      embed_token: 'dummyToken',
      hubId: 'DUMMY',
      hubName: data.name,
      status: 'ok',
      url: `https://localhost:3000/dummyId/${data.name.replaceAll(' ', '-').toLowerCase()}`,
    };
  });
