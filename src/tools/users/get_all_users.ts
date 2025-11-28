import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  filter: z.string().optional().describe('Filter users by username, name or email address (partial match)'),
});

export const getAllUsersTool = (server: McpServer) => {
  server.registerTool(
    'get_all_users',
    {
      title: 'Get All Bitbucket Users',
      description: 'Retrieve a page of users from Bitbucket Server, optionally filtered by search term',
      inputSchema: schema.shape,
    },
    async ({ filter }) => {
      // Call service method
      const response = await bitbucketService.getAllUsers(filter ? { filter } : undefined);

      // Return full data
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  );
};
