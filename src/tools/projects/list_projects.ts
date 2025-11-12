import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketClient } from '../../services/bitbucket.js';

const schema = z.object({
  name: z.string().optional().describe('Filter projects by name (partial match)'),
  permission: z.string().optional().describe('Filter by permission (e.g., PROJECT_READ, PROJECT_WRITE, PROJECT_ADMIN)'),
  start: z.number().optional().describe('Starting index for pagination (default: 0)'),
  limit: z.number().optional().describe('Maximum number of projects to return (default: 25)'),
});

export const listProjectsTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_list_projects',
    {
      title: 'List Projects',
      description:
        'Retrieve a page of projects. Only projects for which the authenticated user has PROJECT_VIEW permission will be returned. Can filter by name or permission level.',
      inputSchema: schema.shape,
    },
    async ({ name, permission, start, limit }) => {
      const response = await bitbucketClient.get('/projects', {
        params: { name, permission, start, limit },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  );
};
