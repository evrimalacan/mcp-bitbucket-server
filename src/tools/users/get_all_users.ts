import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketClient } from '../../services/bitbucket.js';

const schema = z.object({
  filter: z.string().optional().describe('Filter users by username, name or email address (partial match)'),
});

export const getAllUsersTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_get_all_users',
    {
      title: 'Get All Bitbucket Users',
      description: 'Retrieve a page of users from Bitbucket Server, optionally filtered by search term',
      inputSchema: schema.shape,
    },
    async (params) => {
      const { filter } = schema.parse(params);

      const response = await bitbucketClient.get('/users', {
        params: filter ? { filter } : {},
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
