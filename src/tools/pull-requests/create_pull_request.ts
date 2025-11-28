import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  fromBranch: z.string().describe('Source branch name (e.g., "feature-x")'),
  toBranch: z.string().describe('Target branch name (e.g., "main")'),
  title: z.string().describe('PR title'),
  description: z.string().optional().describe('PR description in markdown format'),
  reviewers: z.array(z.string()).optional().describe('Array of reviewer usernames to add'),
});

export const createPullRequestTool = (server: McpServer) => {
  server.registerTool(
    'create_pull_request',
    {
      title: 'Create Pull Request',
      description:
        'Create a new pull request from a source branch to a target branch. Accepts simple branch names (e.g., "feature-x", "main") - they are automatically converted to full refs. Returns the created PR details including ID, title, state, and web URL.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, fromBranch, toBranch, title, description, reviewers }) => {
      const result = await bitbucketService.createPullRequest({
        projectKey,
        repositorySlug,
        title,
        description,
        fromBranch,
        toBranch,
        reviewers,
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
