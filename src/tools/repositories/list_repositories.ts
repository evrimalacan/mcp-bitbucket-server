import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { z } from 'zod';
import { bitbucketClient } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket Server project key'),
});

export const listRepositoriesTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_list_repositories',
    {
      title: 'List Bitbucket Repositories',
      description: 'List all repositories in a Bitbucket Server project',
      inputSchema: schema.shape,
    },
    async (params) => {
      const { projectKey } = schema.parse(params);

      if (!projectKey) {
        throw new McpError(ErrorCode.InvalidParams, 'Project key is required');
      }

      try {
        const response = await bitbucketClient.get(`/projects/${projectKey}/repos`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Error listing repositories for project ${projectKey}:`, error.message);

        if (axios.isAxiosError(error) && error.response) {
          const apiErrorMessage =
            error.response.data?.errors?.[0]?.message ?? error.response.data?.message ?? error.message;

          throw new McpError(ErrorCode.InternalError, `Bitbucket Server API error: ${apiErrorMessage}`);
        }

        throw new McpError(ErrorCode.InternalError, `Failed to list repositories: ${error.message}`);
      }
    },
  );
};
