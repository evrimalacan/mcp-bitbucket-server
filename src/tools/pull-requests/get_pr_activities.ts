import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestComment, RestUser, RestUserApiResponse } from 'bitbucket-data-center-client';
import { z } from 'zod';
import { bitbucketService } from '../../services/bitbucket.js';
import type {
  OptimizedActivitiesResponse,
  OptimizedComment,
  OptimizedCommentLikedBy,
  OptimizedCommentReaction,
} from '../tools.types.js';

// Activity action types from Bitbucket Server Swagger
const ActivityType = z.enum([
  'APPROVED',
  'AUTO_MERGE_CANCELLED',
  'AUTO_MERGE_REQUESTED',
  'COMMENTED',
  'DECLINED',
  'DELETED',
  'MERGED',
  'OPENED',
  'REOPENED',
  'RESCOPED',
  'REVIEW_COMMENTED',
  'REVIEW_DISCARDED',
  'REVIEW_FINISHED',
  'REVIEWED',
  'UNAPPROVED',
  'UPDATED',
]);

const schema = z.object({
  projectKey: z.string().describe('The Bitbucket project key'),
  repositorySlug: z.string().describe('The repository slug'),
  pullRequestId: z.number().describe('The pull request ID'),
  activityTypes: z
    .array(ActivityType)
    .optional()
    .describe(
      'Filter activities by type. Example: ["COMMENTED", "REVIEW_COMMENTED"] to get only comments, or ["APPROVED", "UNAPPROVED"] for approvals.',
    ),
  start: z.number().optional().describe('Starting index for pagination (default: 0)'),
  limit: z.number().optional().describe('Maximum number of items to return (default: 25)'),
});

export const getPrActivitiesTool = (server: McpServer) => {
  server.registerTool(
    'get_pull_request_activities',
    {
      title: 'Get Pull Request Activities',
      description:
        "Gets activity on a pull request including comments, approvals, merges, reviews, and updates. Can optionally filter by activity types (e.g., only comments). Returns a paginated list with action types like COMMENTED, APPROVED, DECLINED, MERGED, REVIEWED, etc. Use activityTypes parameter to filter: e.g., ['COMMENTED', 'REVIEW_COMMENTED'] for only comments. Response is optimized for token usage - use commentAnchor.path with get_pr_file_diff to fetch code context when needed.",
      inputSchema: schema.shape,
    },
    async ({ projectKey, repositorySlug, pullRequestId, activityTypes, start, limit }) => {
      const response = await bitbucketService.getPullRequestActivities({
        projectKey,
        repositorySlug,
        pullRequestId,
        start,
        limit,
      });

      // Helper function to strip user links (API returns links but we exclude from type)
      const stripUserBloat = (user: RestUserApiResponse): RestUser => {
        // biome-ignore lint/correctness/noUnusedVariables: Removing links field from API response
        const { links, ...userWithoutLinks } = user;
        return userWithoutLinks;
      };

      // Helper function to simplify reactions to just counts
      const simplifyReactions = (
        reactions: Array<{ emoticon: string; users?: Array<unknown> }>,
      ): OptimizedCommentReaction[] => {
        if (!reactions || !Array.isArray(reactions)) return reactions;
        return reactions.map((reaction) => ({
          emoticon: reaction.emoticon,
          count: reaction.users?.length || 0,
        }));
      };

      // Helper function to simplify likedBy to just count
      const simplifyLikedBy = (likedBy: { total?: number }): OptimizedCommentLikedBy => {
        return { total: likedBy.total || 0 };
      };

      // Helper function to strip bloat from comments
      const stripBloatFromComment = (comment: RestComment): OptimizedComment => {
        // biome-ignore lint/correctness/noUnusedVariables: Removing anchor and permittedOperations from API response
        const { anchor, permittedOperations, ...rest } = comment;

        // Build optimized comment with stripped user and simplified properties
        const optimizedComment: OptimizedComment = {
          ...rest,
          author: stripUserBloat(comment.author),
          properties: comment.properties
            ? {
                reactions: comment.properties.reactions ? simplifyReactions(comment.properties.reactions) : undefined,
                likedBy: comment.properties.likedBy ? simplifyLikedBy(comment.properties.likedBy) : undefined,
              }
            : undefined,
          comments: comment.comments ? comment.comments.map(stripBloatFromComment) : undefined,
        };

        return optimizedComment;
      };

      // Strip bloat from all activities (remove diff field which is large)
      const strippedValues = response.values.map((activity) => {
        // biome-ignore lint/correctness/noUnusedVariables: Removing diff field from API response
        const { diff, ...rest } = activity;

        // Build clean activity with stripped user and comment
        const cleanActivity = {
          ...rest,
          user: stripUserBloat(activity.user),
          comment: activity.comment ? stripBloatFromComment(activity.comment) : undefined,
        };

        return cleanActivity;
      });

      // Filter by activity types if specified
      let responseData: OptimizedActivitiesResponse = {
        ...response,
        values: strippedValues,
      };

      if (activityTypes && activityTypes.length > 0) {
        const filteredValues = strippedValues.filter((activity) => activityTypes.includes(activity.action));
        responseData = {
          ...response,
          values: filteredValues,
          size: filteredValues.length,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(responseData, null, 2),
          },
        ],
      };
    },
  );
};
