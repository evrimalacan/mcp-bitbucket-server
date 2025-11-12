import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { z } from 'zod';
import { bitbucketClient } from '../../services/bitbucket.js';

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
      try {
        const response = await bitbucketClient.get(`/users/${username}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Error fetching user profile for ${username}:`, error.message);

        if (axios.isAxiosError(error) && error.response) {
          const apiErrorMessage =
            error.response.data?.errors?.[0]?.message ?? error.response.data?.message ?? error.message;

          throw new McpError(ErrorCode.InternalError, `Bitbucket Server API error: ${apiErrorMessage}`);
        }

        throw new McpError(ErrorCode.InternalError, `Failed to fetch user profile: ${error.message}`);
      }
    },
  );
};
