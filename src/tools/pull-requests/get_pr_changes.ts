import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  limit: z.number().optional().describe('Number of items to return (default: 25, note: endpoint is not paged)'),
});

export const getPrChangesTool = (server: McpServer) => {
  server.registerTool(
    'get_pull_request_changes',
    {
      title: 'Get Pull Request Changes',
      description:
        'Gets a list of all changed files in a pull request with file-level metadata (file paths, change types like ADD/MODIFY/DELETE, content IDs). This is useful for getting an overview of what files changed. For line-by-line diff data, use get_pull_request_file_diff.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, limit }) => {
      const result = await bitbucketService.getPullRequestChanges({
        projectKey,
        repositorySlug,
        pullRequestId,
        limit,
      });

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
