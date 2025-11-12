import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bitbucketClient } from '../../services/bitbucket.js';
import type { RestPullRequestParticipant } from '../../types/index.js';

// Review status values from Bitbucket Server Swagger
const ReviewStatus = z.enum(['APPROVED', 'NEEDS_WORK', 'UNAPPROVED']);

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  status: ReviewStatus.describe(
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
      // Get authenticated user from response headers
      const propertiesResponse = await bitbucketClient.get('/application-properties');

      // Extract X-AUSERNAME header which contains the authenticated user's slug
      const userSlug = propertiesResponse.headers['x-ausername'];

      if (!userSlug) {
        throw new Error('Could not determine authenticated user from response headers.');
      }

      const response = await bitbucketClient.put<RestPullRequestParticipant>(
        `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/participants/${userSlug}`,
        { status },
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
