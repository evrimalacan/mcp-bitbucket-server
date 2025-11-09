import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { bitbucketClient } from "../../services/bitbucket.js";

// Activity action types from Bitbucket Server Swagger
const ActivityType = z.enum([
	"APPROVED",
	"AUTO_MERGE_CANCELLED",
	"AUTO_MERGE_REQUESTED",
	"COMMENTED",
	"DECLINED",
	"DELETED",
	"MERGED",
	"OPENED",
	"REOPENED",
	"RESCOPED",
	"REVIEW_COMMENTED",
	"REVIEW_DISCARDED",
	"REVIEW_FINISHED",
	"REVIEWED",
	"UNAPPROVED",
	"UPDATED",
]);

const schema = z.object({
	projectKey: z.string().describe("The Bitbucket project key"),
	repositorySlug: z.string().describe("The repository slug"),
	pullRequestId: z.number().describe("The pull request ID"),
	activityTypes: z
		.array(ActivityType)
		.optional()
		.describe(
			'Filter activities by type. Example: ["COMMENTED", "REVIEW_COMMENTED"] to get only comments, or ["APPROVED", "UNAPPROVED"] for approvals.'
		),
	start: z
		.number()
		.optional()
		.describe("Starting index for pagination (default: 0)"),
	limit: z
		.number()
		.optional()
		.describe("Maximum number of items to return (default: 25)"),
});

export const getPrActivitiesTool = (server: McpServer) => {
	server.registerTool(
		"bitbucket_get_pull_request_activities",
		{
			title: "Get Pull Request Activities",
			description:
				"Gets activity on a pull request including comments, approvals, merges, reviews, and updates. Can optionally filter by activity types (e.g., only comments). Returns a paginated list with action types like COMMENTED, APPROVED, DECLINED, MERGED, REVIEWED, etc. Use activityTypes parameter to filter: e.g., ['COMMENTED', 'REVIEW_COMMENTED'] for only comments. Response is optimized for token usage - use commentAnchor.path with get_pr_file_diff to fetch code context when needed.",
			inputSchema: schema.shape,
		},
		async (params) => {
			const { projectKey, repositorySlug, pullRequestId, activityTypes, start, limit } =
				schema.parse(params);

			const queryParams: Record<string, string> = {};
			if (start !== undefined) {
				queryParams.start = start.toString();
			}
			if (limit !== undefined) {
				queryParams.limit = limit.toString();
			}

			queryParams.fromType = "COMMENT";

			const response = await bitbucketClient.get(
				`/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/activities`,
				{
					params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
				},
			);

			// Helper function to strip user bloat
			const stripUserBloat = (user: any): any => {
				if (!user) return user;
				const { links, ...userWithoutLinks } = user;
				return userWithoutLinks;
			};

			// Helper function to simplify reactions to just counts
			const simplifyReactions = (reactions: any[]): any[] => {
				if (!reactions || !Array.isArray(reactions)) return reactions;
				return reactions.map((reaction: any) => ({
					emoticon: reaction.emoticon,
					count: reaction.users?.length || 0,
				}));
			};

			// Helper function to simplify likedBy to just count
			const simplifyLikedBy = (likedBy: any): any => {
				if (!likedBy) return likedBy;
				return { total: likedBy.total || 0 };
			};

			// Helper function to strip bloat from comments
			const stripBloatFromComment = (comment: any): any => {
				if (!comment) return comment;

				const { anchor, permittedOperations, ...strippedComment } = comment;

				// Strip user links from author
				if (strippedComment.author) {
					strippedComment.author = stripUserBloat(strippedComment.author);
				}

				// Simplify reactions and likedBy in properties
				if (strippedComment.properties) {
					if (strippedComment.properties.reactions) {
						strippedComment.properties.reactions = simplifyReactions(strippedComment.properties.reactions);
					}
					if (strippedComment.properties.likedBy) {
						strippedComment.properties.likedBy = simplifyLikedBy(strippedComment.properties.likedBy);
					}
				}

				// Recursively strip from nested comments (replies)
				if (strippedComment.comments && Array.isArray(strippedComment.comments)) {
					strippedComment.comments = strippedComment.comments.map(stripBloatFromComment);
				}

				return strippedComment;
			};

			// Strip bloat from all activities
			const strippedValues = response.data.values.map((activity: any) => {
				const { diff, ...activityWithoutDiff } = activity;

				// Strip user links
				if (activityWithoutDiff.user) {
					activityWithoutDiff.user = stripUserBloat(activityWithoutDiff.user);
				}

				// Strip comment bloat
				if (activityWithoutDiff.comment) {
					activityWithoutDiff.comment = stripBloatFromComment(activityWithoutDiff.comment);
				}

				return activityWithoutDiff;
			});

			// Filter by activity types if specified
			let responseData = {
				...response.data,
				values: strippedValues,
			};

			if (activityTypes && activityTypes.length > 0) {
				const filteredValues = strippedValues.filter((activity: any) =>
					activityTypes.includes(activity.action)
				);
				responseData = {
					...response.data,
					values: filteredValues,
					size: filteredValues.length,
				};
			}

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(responseData, null, 2),
					},
				],
			};
		},
	);
};
