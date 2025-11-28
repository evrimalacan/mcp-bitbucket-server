import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  commentId: z.number().describe('The comment ID'),
  emoticon: z
    .enum(['thumbsup', 'thumbsdown', 'heart', 'thinking_face', 'laughing'])
    .describe('The emoticon to remove (thumbsup, thumbsdown, heart, thinking_face, laughing)'),
});

export const removePrCommentReactionTool = (server: McpServer) => {
  server.registerTool(
    'remove_pr_comment_reaction',
    {
      title: 'Remove Emoticon Reaction from PR Comment',
      description:
        'Remove an emoticon reaction from a pull request comment. Only the user who added the reaction can remove it. Supported emoticons: thumbsup, thumbsdown, heart, thinking_face, laughing.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, commentId, emoticon }) => {
      await bitbucketService.removePullRequestCommentReaction({
        projectKey,
        repositorySlug,
        pullRequestId,
        commentId,
        emoticon,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Reaction "${emoticon}" removed successfully from comment ${commentId}.`,
          },
        ],
      };
    },
  );
};
