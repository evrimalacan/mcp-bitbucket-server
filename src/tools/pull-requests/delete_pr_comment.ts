import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  commentId: z.number().describe('The ID of the comment to delete'),
  version: z.number().describe('The expected version of the comment (get from comment object)'),
});

export const deletePrCommentTool = (server: McpServer) => {
  server.registerTool(
    'delete_pr_comment',
    {
      title: 'Delete Pull Request Comment',
      description:
        'Delete a pull request comment. You can delete your own comments. Only REPO_ADMIN users can delete comments created by others. Comments with replies cannot be deleted. You must provide the comment version to prevent concurrent modification conflicts - get the version from the comment object.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, commentId, version }) => {
      await bitbucketService.deletePullRequestComment({
        projectKey,
        repositorySlug,
        pullRequestId,
        commentId,
        version,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Comment ${commentId} deleted successfully.`,
          },
        ],
      };
    },
  );
};
