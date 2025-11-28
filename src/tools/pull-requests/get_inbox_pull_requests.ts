import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';
import type { InboxPullRequestsResponse } from '../tools.types.js';

const schema = z.object({
  start: z.number().optional().describe('Starting index for pagination (default: 0)'),
  limit: z.number().optional().describe('Maximum number of pull requests to return (default: 25)'),
});

export const getInboxPullRequestsTool = (server: McpServer) => {
  server.registerTool(
    'get_inbox_pull_requests',
    {
      title: 'Get Inbox Pull Requests',
      description:
        "Returns pull requests in the authenticated user's inbox where they are assigned as a reviewer. Returns PRs across all projects and repositories in one call. Each PR includes only essential review information: id, title, description, state, author name, projectKey, and repositorySlug - everything needed to review the PR using other tools. Response is heavily optimized to reduce token usage by ~92%.",
      inputSchema: schema.shape,
    },
    async ({ start, limit }) => {
      const result = await bitbucketService.getInboxPullRequests({ start, limit });

      const minimal: InboxPullRequestsResponse = {
        size: result.size,
        limit: result.limit,
        isLastPage: result.isLastPage,
        start: result.start,
        nextPageStart: result.nextPageStart,
        values: result.values.map((pr) => ({
          id: pr.id,
          title: pr.title,
          description: pr.description,
          state: pr.state,
          author: pr.author.user.displayName,
          projectKey: pr.toRef.repository.project.key,
          repositorySlug: pr.toRef.repository.slug,
          createdDate: pr.createdDate,
          updatedDate: pr.updatedDate,
        })),
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
