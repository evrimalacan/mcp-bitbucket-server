import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketClient } from '../../services/bitbucket.js';

const schema = z.object({
  start: z.number().optional().describe('Starting index for pagination (default: 0)'),
  limit: z.number().optional().describe('Maximum number of pull requests to return (default: 25)'),
});

export const getInboxPullRequestsTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_get_inbox_pull_requests',
    {
      title: 'Get Inbox Pull Requests',
      description:
        "Returns pull requests in the authenticated user's inbox where they are assigned as a reviewer. Returns PRs across all projects and repositories in one call. Each PR includes only essential review information: id, title, description, state, author name, projectKey, and repositorySlug - everything needed to review the PR using other tools. Response is heavily optimized to reduce token usage by ~92%.",
      inputSchema: schema.shape,
    },
    async ({ start, limit }) => {
      const response = await bitbucketClient.get('/inbox/pull-requests', {
        params: { start, limit },
      });

      // Strip to minimal PR - only what agent needs to review
      const minimalPr = (pr: any): any => {
        return {
          id: pr.id,
          title: pr.title,
          description: pr.description,
          state: pr.state,
          author: pr.author.user.displayName,
          projectKey: pr.toRef.repository.project.key,
          repositorySlug: pr.toRef.repository.slug,
          createdDate: pr.createdDate,
          updatedDate: pr.updatedDate,
        };
      };

      const minimal = {
        size: response.data.size,
        limit: response.data.limit,
        isLastPage: response.data.isLastPage,
        start: response.data.start,
        nextPageStart: response.data.nextPageStart,
        values: response.data.values.map(minimalPr),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(minimal, null, 2),
          },
        ],
      };
    },
  );
};
