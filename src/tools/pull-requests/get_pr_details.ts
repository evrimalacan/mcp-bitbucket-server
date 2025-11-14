import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
});

export const getPullRequestDetailsTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_get_pull_request',
    {
      title: 'Get Pull Request Details',
      description:
        'Retrieve full details for a pull request including title, description, author, state, source branch (fromRef), destination branch (toRef), created/updated dates, reviewers, and participants. Use this to get comprehensive PR metadata.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId }) => {
      const result = await bitbucketService.getPullRequest({
        projectKey,
        repositorySlug,
        pullRequestId,
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
