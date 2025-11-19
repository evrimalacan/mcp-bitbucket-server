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
    .describe('The emoticon to add (thumbsup, thumbsdown, heart, thinking_face, laughing)'),
});

export const addPrCommentReactionTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_add_pr_comment_reaction',
    {
      title: 'Add Emoticon Reaction to PR Comment',
      description:
        'Add an emoticon reaction to a pull request comment. Supported emoticons: thumbsup, thumbsdown, heart, thinking_face, laughing. The operation is idempotent - adding the same reaction twice will succeed.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, commentId, emoticon }) => {
      const result = await bitbucketService.addPullRequestCommentReaction({
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
            text: `Reaction "${result.emoticon.shortcut}" added successfully to comment ${commentId} by ${result.user.displayName}.`,
          },
        ],
      };
    },
  );
};
