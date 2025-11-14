import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  text: z.string().describe('The comment text'),
  path: z.string().describe('File path (e.g., "src/main.ts")'),
  line: z.number().describe('Line number to comment on (use destination line number from diff)'),
  lineType: z
    .enum(['ADDED', 'REMOVED', 'CONTEXT'])
    .describe('Type of line: ADDED (green +), REMOVED (red -), or CONTEXT (unchanged)'),
  fileType: z.enum(['FROM', 'TO']).describe('Side of diff: FROM (source/old) or TO (destination/new)'),
});

export const addPrLineCommentTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_add_pr_line_comment',
    {
      title: 'Add Line-Level Pull Request Comment',
      description:
        'Add an inline comment to a specific line in a pull request. Use the line numbers from bitbucket_get_pull_request_file_diff (destination line for TO side, source line for FROM side). Match the lineType to the segment type from the diff (ADDED/REMOVED/CONTEXT). To reply to an existing comment (including file/line comments), use bitbucket_add_pr_comment instead.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, text, path, line, lineType, fileType }) => {
      const result = await bitbucketService.addPullRequestComment({
        projectKey,
        repositorySlug,
        pullRequestId,
        text,
        path,
        line,
        lineType,
        fileType,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Line comment added successfully. Comment ID: ${result.id}`,
          },
        ],
      };
    },
  );
};
