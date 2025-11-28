/**
 * MCP Tool-specific types for optimized responses.
 * These types are used by MCP tools to strip data for token efficiency.
 * They are NOT part of the library interface (src/client/).
 */

import type { ActivityAction, PaginatedResponse, PullRequestState, RestUser } from 'bitbucket-data-center-client';

// =============================================================================
// Pull Request Optimization Types
// =============================================================================

/**
 * Minimal pull request object returned by get_inbox_pull_requests tool.
 * Optimized version with only essential review information (~92% smaller).
 */
export interface MinimalPullRequest {
  /** Pull request ID */
  id: number;
  /** Pull request title */
  title: string;
  /** Pull request description */
  description?: string;
  /** Pull request state */
  state: PullRequestState;
  /** Author display name (simplified from full user object) */
  author: string;
  /** Project key (flattened from toRef.repository.project.key) */
  projectKey: string;
  /** Repository slug (flattened from toRef.repository.slug) */
  repositorySlug: string;
  /** Creation timestamp */
  createdDate: number;
  /** Last update timestamp */
  updatedDate: number;
}

/**
 * Response type for inbox pull requests tool (optimized).
 * Contains paginated list of minimal PRs.
 */
export interface InboxPullRequestsResponse extends PaginatedResponse<MinimalPullRequest> {}

// =============================================================================
// Comment Optimization Types (for get_pr_activities tool)
// =============================================================================

/**
 * Optimized comment reaction with simplified count (no users array).
 * Used by MCP tools to reduce token usage.
 */
export interface OptimizedCommentReaction {
  /** Emoticon/emoji */
  emoticon: string;
  /** Number of users who reacted (no users array) */
  count: number;
}

/**
 * Optimized liked-by information (just total count).
 * Used by MCP tools to reduce token usage.
 */
export interface OptimizedCommentLikedBy {
  /** Total number of likes */
  total: number;
}

/**
 * Optimized comment properties with simplified reactions and likes.
 * Used by MCP tools to reduce token usage.
 */
export interface OptimizedCommentProperties {
  /** Reactions to the comment (simplified to counts only) */
  reactions?: OptimizedCommentReaction[];
  /** Like information (simplified to count only) */
  likedBy?: OptimizedCommentLikedBy;
}

/**
 * Optimized comment object for MCP tools.
 * Strips links, permittedOperations, and simplifies reactions/likes.
 */
export interface OptimizedComment {
  /** Comment ID */
  id: number;
  /** Comment text */
  text: string;
  /** Comment author (without links) */
  author: RestUser;
  /** Creation timestamp */
  createdDate: number;
  /** Last update timestamp */
  updatedDate?: number;
  /** Version number */
  version: number;
  /** Nested replies (optimized recursively) */
  comments?: OptimizedComment[];
  /** Comment properties (simplified reactions/likes) */
  properties?: OptimizedCommentProperties;
  /** Parent comment (for replies) */
  parent?: { id: number };
}

/**
 * Optimized pull request activity for MCP tools.
 * Strips diff field and uses optimized comments/users.
 */
export interface OptimizedPullRequestActivity {
  /** Activity ID */
  id: number;
  /** Creation timestamp */
  createdDate: number;
  /** User who performed the action (without links) */
  user: RestUser;
  /** Activity action type */
  action: ActivityAction;
  /** Comment (optimized, for comment activities) */
  comment?: OptimizedComment;
  /** Comment action (for comment activities) */
  commentAction?: string;
  /** Commit ID (for commit activities) */
  commit?: {
    id: string;
    displayId: string;
  };
  /** Added reviewers (for reviewer change activities) */
  addedReviewers?: RestUser[];
  /** Removed reviewers (for reviewer change activities) */
  removedReviewers?: RestUser[];
}

/**
 * Response type for pull request activities tool (optimized).
 */
export type OptimizedActivitiesResponse = PaginatedResponse<OptimizedPullRequestActivity>;
