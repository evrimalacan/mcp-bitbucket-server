import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketClient } from '../../services/bitbucket.js';
import type { AddCommentBody, RestComment } from '../../types/index.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  text: z.string().describe('The comment text'),
  parentId: z.number().optional().describe('Parent comment ID for replies'),
  path: z.string().optional().describe('File path for file-specific comments'),
  line: z.number().optional().describe('Line number for inline comments'),
  lineType: z.enum(['ADDED', 'REMOVED', 'CONTEXT']).optional().describe('Type of line (default: CONTEXT)'),
  fileType: z.enum(['FROM', 'TO']).optional().describe('Side of diff (default: TO)'),
});

export const addPrCommentTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_add_pr_comment',
    {
      title: 'Add Pull Request Comment',
      description: 'Add a comment to a pull request. Supports general comments, replies, and inline file/line comments',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, text, parentId, path, line, lineType, fileType }) => {
      const body: AddCommentBody = { text };

      if (parentId) {
        body.parent = { id: parentId };
      }

      if (path) {
        body.anchor = {
          path,
          diffType: 'EFFECTIVE',
          ...(line && {
            line,
            lineType: lineType || 'CONTEXT',
            fileType: fileType || 'TO',
          }),
        };
      }

      const response = await bitbucketClient.post<RestComment>(
        `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/comments`,
        body,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  );
};
