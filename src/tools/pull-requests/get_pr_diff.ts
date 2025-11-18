import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  path: z.string().optional().describe('Optional path to a specific file (omit for full PR diff)'),
  sinceId: z.string().optional().describe('The since commit hash to get diff from a specific commit'),
  untilId: z.string().optional().describe('The until commit hash to get diff up to a specific commit'),
  contextLines: z.number().optional().describe('Number of context lines around changes (default: 10)'),
  whitespace: z.enum(['show', 'ignore-all']).optional().describe('Whitespace handling (default: show)'),
  format: z
    .enum(['text', 'json'])
    .optional()
    .describe('Response format: "text" for raw diff, "json" for structured (default: text)'),
});

export const getPullRequestDiffTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_get_pull_request_diff',
    {
      title: 'Get Pull Request Diff',
      description:
        'Retrieve diff for a pull request. Omit the path parameter to get the full PR diff, or specify a file path to get diff for a specific file. Use format="text" (default) for raw unified diff format, or format="json" for structured diff with hunks and segments. Use contextLines to control how many unchanged lines are shown around changes. Use sinceId and untilId to get diff between specific commits (useful for reviewing incremental changes).',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, path, sinceId, untilId, contextLines, whitespace, format }) => {
      const result = await bitbucketService.getPullRequestDiff({
        projectKey,
        repositorySlug,
        pullRequestId,
        path,
        sinceId,
        untilId,
        contextLines,
        whitespace,
        format,
      });

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
};
