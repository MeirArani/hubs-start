import HomePage from '#/react-components/home/HomePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <div className="m-0 h-full flex flex-col">
      <HomePage />
    </div>
  );
}
