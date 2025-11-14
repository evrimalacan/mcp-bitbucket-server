import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  status: z
    .enum(['APPROVED', 'NEEDS_WORK', 'UNAPPROVED'])
    .describe(
      'The review status: APPROVED (approve), NEEDS_WORK (request changes), or UNAPPROVED (neutral/remove approval)',
    ),
});

export const updateReviewStatusTool = (server: McpServer) => {
  server.registerTool(
    'bitbucket_update_review_status',
    {
      title: 'Update Pull Request Review Status',
      description:
        'Change the review status for a pull request. Sets the authenticated user\'s review status to APPROVED (approve the PR), NEEDS_WORK (request changes - shows as "Requested changes" in UI), or UNAPPROVED (neutral/remove approval). Automatically detects the authenticated user and adds them as a participant/reviewer if not already. Updates lastReviewedCommit to the latest commit when approving or requesting changes. Requires REPO_READ permission.',
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, status }) => {
      const result = await bitbucketService.updateReviewStatus({
        projectKey,
        repositorySlug,
        pullRequestId,
        status,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
};
