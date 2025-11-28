import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  text: z.string().describe('The comment text'),
  parentId: z.number().optional().describe('Parent comment ID to reply to an existing comment'),
});

export const addPrCommentTool = (server: McpServer) => {
  server.registerTool(
    'add_pr_comment',
    {
      title: 'Add General Pull Request Comment',
      description:
        'Add a general comment to a pull request (not attached to any specific file or line). Use parentId to reply to an existing comment. For file or line-specific comments, use add_pr_file_comment or add_pr_line_comment instead.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, text, parentId }) => {
      const result = await bitbucketService.addPullRequestComment({
        projectKey,
        repositorySlug,
        pullRequestId,
        text,
        parentId,
      });

      const message = parentId
        ? `Reply added successfully. Comment ID: ${result.id}`
        : `Comment added successfully. Comment ID: ${result.id}`;

      return {
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    },
  );
};
