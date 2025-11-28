import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  text: z.string().describe('The comment text'),
  path: z.string().describe('File path to attach the comment to (e.g., "src/main.ts")'),
});

export const addPrFileCommentTool = (server: McpServer) => {
  server.registerTool(
    'add_pr_file_comment',
    {
      title: 'Add File-Level Pull Request Comment',
      description:
        'Add a comment attached to a specific file in a pull request (not to a specific line). The comment will appear at the file level in the PR diff view. To reply to an existing comment (including file/line comments), use add_pr_comment instead.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, text, path }) => {
      const result = await bitbucketService.addPullRequestComment({
        projectKey,
        repositorySlug,
        pullRequestId,
        text,
        path,
      });

      return {
        content: [
          {
            type: 'text',
            text: `File comment added successfully. Comment ID: ${result.id}`,
          },
        ],
      };
    },
  );
};
