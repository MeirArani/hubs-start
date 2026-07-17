import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/hubs')({
  component: RouteComponent,
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        console.log(body);
        return Response.json({ message: 'testing' });
      },
    },
  },
});

function RouteComponent() {
  return <></>;
}
