import { createFileRoute } from '@tanstack/react-router';
import { getOrchestratorBackendUrl } from './proxyUtils';

export const Route = createFileRoute('/orchestrator/github/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const backendUrl = getOrchestratorBackendUrl();
          return await fetch(`${backendUrl}/github/webhook`, {
            method: 'POST',
            headers: request.headers,
            body: request.body,
            // @ts-expect-error: 'duplex' is required by Node/undici for streaming bodies
            duplex: 'half',
          });
        } catch (error) {
          console.error('Error in POST handler:', error);
          return new Response('Internal server error', { status: 500 });
        }
      },
    },
  },
});
