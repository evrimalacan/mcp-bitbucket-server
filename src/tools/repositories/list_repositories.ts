import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket Server project key'),
});

export const listRepositoriesTool = (server: McpServer) => {
  server.registerTool(
    'list_repositories',
    {
      title: 'List Bitbucket Repositories',
      description: 'List all repositories in a Bitbucket Server project',
      inputSchema: schema.shape,
    },
    async ({ projectKey }) => {
      const result = await bitbucketService.listRepositories({ projectKey });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
};
