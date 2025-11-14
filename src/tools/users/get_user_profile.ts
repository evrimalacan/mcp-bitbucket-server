import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  username: z.string().describe('The username/slug of the Bitbucket Server user'),
});

export const getUserProfileTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_get_user_profile',
    {
      title: 'Get Bitbucket User Profile',
      description: 'Gets Bitbucket Server user profile details by username',
      inputSchema: schema.shape,
    },
    async ({ username }) => {
      // Call service method
      const user = await bitbucketService.getUserProfile({ username });

      // Return full data (no stripping needed for user profile)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(user, null, 2),
          },
        ],
      };
    },
  );
};
