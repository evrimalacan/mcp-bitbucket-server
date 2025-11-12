import type { PaginatedResponse } from './common.js';
import type { RestRepository } from './repository.js';

/**
 * Pull request state values from Bitbucket Server.
 */
export type PullRequestState = 'OPEN' | 'MERGED' | 'DECLINED';

/**
 * Change type for file changes in pull requests.
 */
export type ChangeType = 'ADD' | 'COPY' | 'DELETE' | 'MODIFY' | 'MOVE' | 'UNKNOWN';

/**
 * Diff type values.
 */
export type DiffType = 'COMMIT' | 'EFFECTIVE' | 'RANGE';

/**
 * File side in diff (FROM = source, TO = destination).
 */
export type FileType = 'FROM' | 'TO';

/**
 * Line type in diff segments.
 */
export type LineType = 'ADDED' | 'CONTEXT' | 'REMOVED';

/**
 * User type values from Bitbucket Server.
 */
export type UserType = 'NORMAL' | 'SERVICE';

/**
 * Activity action types from Bitbucket Server.
 */
export type ActivityAction =
  | 'APPROVED'
  | 'AUTO_MERGE_CANCELLED'
  | 'AUTO_MERGE_REQUESTED'
  | 'COMMENTED'
  | 'DECLINED'
  | 'DELETED'
  | 'MERGED'
  | 'OPENED'
  | 'REOPENED'
  | 'RESCOPED'
  | 'REVIEW_COMMENTED'
  | 'REVIEW_DISCARDED'
  | 'REVIEW_FINISHED'
  | 'REVIEWED'
  | 'UNAPPROVED'
  | 'UPDATED';

/**
 * Participant role in a pull request.
 */
export type ParticipantRole = 'AUTHOR' | 'REVIEWER' | 'PARTICIPANT';

/**
 * Participant status in a pull request (review status).
 */
export type ParticipantStatus = 'UNAPPROVED' | 'NEEDS_WORK' | 'APPROVED';

/**
 * Bitbucket Server user object (RestUser schema from Swagger).
 */
export interface RestUser {
  /** User's display name */
  displayName: string;
  /** User's email address */
  emailAddress?: string;
  /** Unique user ID */
  id?: number;
  /** User's short name/username */
  name: string;
  /** User's slug */
  slug: string;
  /** User type */
  type?: UserType;
  /** Whether user is active */
  active?: boolean;
}

/**
 * File path object (RestPath schema from Swagger).
 */
export interface RestPath {
  /** Path components */
  components?: string[];
  /** File extension */
  extension?: string;
  /** File name */
  name?: string;
  /** Parent path */
  parent?: string;
  /** Full path string */
  toString?: string;
}

/**
 * Minimal ref for branch references (RestMinimalRef schema from Swagger).
 */
export interface RestMinimalRef {
  /** Display ID (e.g., "main") */
  displayId: string;
  /** Ref ID (e.g., "refs/heads/main") */
  id: string;
  /** Latest commit hash */
  latestCommit?: string;
  /** Repository this ref belongs to */
  repository?: RestRepository;
}

/**
 * Comment anchor - specifies where a comment is attached (RestCommentAnchor schema from Swagger).
 */
export interface RestCommentAnchor {
  /** Diff type */
  diffType?: DiffType;
  /** File side (FROM/TO) */
  fileType?: FileType;
  /** Line number */
  line?: number;
  /** Line type */
  lineType?: LineType;
  /** Whether this is an orphaned comment */
  orphaned?: boolean;
  /** File path */
  path?: RestPath | string;
  /** Source path (for moves) */
  srcPath?: RestPath | string;
}

/**
 * Comment reaction with simplified count.
 */
export interface RestCommentReaction {
  /** Emoticon/emoji */
  emoticon: string;
  /** Number of users who reacted */
  count: number;
}

/**
 * Simplified liked-by information.
 */
export interface RestCommentLikedBy {
  /** Total number of likes */
  total: number;
}

/**
 * Comment properties with simplified reactions and likes.
 */
export interface RestCommentProperties {
  /** Reactions to the comment */
  reactions?: RestCommentReaction[];
  /** Like information */
  likedBy?: RestCommentLikedBy;
}

/**
 * Bitbucket Server comment object (RestComment schema from Swagger).
 * Simplified to remove bloat (permittedOperations, anchor/commentAnchor, full reactions, etc.)
 */
export interface RestComment {
  /** Comment ID */
  id: number;
  /** Comment text */
  text: string;
  /** Comment author */
  author: RestUser;
  /** Creation timestamp */
  createdDate: number;
  /** Last update timestamp */
  updatedDate?: number;
  /** Version number */
  version: number;
  /** Nested replies */
  comments?: RestComment[];
  /** Comment properties */
  properties?: RestCommentProperties;
  /** Parent comment (for replies) */
  parent?: { id: number };
}

/**
 * Full pull request object (RestPullRequest schema from Swagger).
 * Includes all fields for reference, but most tools use MinimalPullRequest.
 */
export interface RestPullRequest {
  /** Pull request ID */
  id: number;
  /** Pull request version */
  version: number;
  /** Pull request title */
  title: string;
  /** Pull request description */
  description?: string;
  /** Pull request state */
  state: PullRequestState;
  /** Whether PR is open */
  open: boolean;
  /** Whether PR is closed */
  closed: boolean;
  /** Creation timestamp */
  createdDate: number;
  /** Last update timestamp */
  updatedDate: number;
  /** Source branch ref */
  fromRef: RestMinimalRef;
  /** Target branch ref */
  toRef: RestMinimalRef;
  /** Whether PR is locked */
  locked?: boolean;
  /** Pull request author */
  author?: {
    user: RestUser;
    role: string;
    approved: boolean;
    status: string;
  };
  /** Pull request reviewers */
  reviewers?: Array<{
    user: RestUser;
    role: string;
    approved: boolean;
    status: string;
  }>;
  /** Pull request participants */
  participants?: Array<{
    user: RestUser;
    role: string;
    approved: boolean;
    status: string;
  }>;
}

/**
 * Minimal pull request object returned by get_inbox_pull_requests.
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
 * Response type for inbox pull requests endpoint.
 * Contains paginated list of minimal PRs.
 */
export interface InboxPullRequestsResponse extends PaginatedResponse<MinimalPullRequest> {}

/**
 * File change in a pull request (RestChange schema from Swagger).
 */
export interface RestChange {
  /** Content ID for the file */
  contentId?: string;
  /** Source content ID (for moves/copies) */
  srcContentId?: string;
  /** Whether executable bit changed */
  executable?: boolean;
  /** Percentage similarity (for moves/copies) */
  percentUnchanged?: number;
  /** Change type */
  type: ChangeType;
  /** Node type */
  nodeType?: string;
  /** Source path (for moves) */
  srcPath?: RestPath;
  /** Destination path */
  path?: RestPath;
  /** Whether file is a link */
  link?: boolean;
  /** Number of comments on this file */
  comments?: number;
}

/**
 * Response type for pull request changes endpoint.
 */
export type ChangesResponse = PaginatedResponse<RestChange>;

/**
 * Line in a diff (RestDiffLine schema from Swagger).
 */
export interface RestDiffLine {
  /** Source (FROM) line number */
  source?: number;
  /** Destination (TO) line number */
  destination?: number;
  /** Line content */
  line?: string;
  /** Whether line is truncated */
  truncated?: boolean;
  /** Inline comments on this line */
  commentIds?: number[];
  /** Whether line has conflicts */
  conflictMarker?: string;
}

/**
 * Segment in a diff hunk (RestDiffSegment schema from Swagger).
 */
export interface RestDiffSegment {
  /** Segment type */
  type: LineType;
  /** Lines in this segment */
  lines: RestDiffLine[];
  /** Whether segment is truncated */
  truncated?: boolean;
}

/**
 * Hunk in a diff (RestDiffHunk schema from Swagger).
 */
export interface RestDiffHunk {
  /** Source (FROM) line number */
  sourceLine: number;
  /** Source span */
  sourceSpan: number;
  /** Destination (TO) line number */
  destinationLine: number;
  /** Destination span */
  destinationSpan: number;
  /** Segments in this hunk */
  segments: RestDiffSegment[];
  /** Whether hunk is truncated */
  truncated?: boolean;
  /** Context lines */
  context?: string;
}

/**
 * Diff for a file (RestDiff schema from Swagger).
 */
export interface RestDiff {
  /** Source path */
  source?: RestPath | null;
  /** Destination path */
  destination?: RestPath | null;
  /** Hunks in this diff */
  hunks?: RestDiffHunk[];
  /** Whether diff is truncated */
  truncated?: boolean;
  /** Source properties */
  properties?: {
    fromHash?: string;
  };
  /** Destination properties */
  toHash?: string;
  /** Whether file is binary */
  binary?: boolean;
  /** Line comments */
  lineComments?: RestComment[];
  /** File comments */
  fileComments?: RestComment[];
}

/**
 * Response type for pull request file diff endpoint.
 */
export interface DiffResponse {
  /** Diff data */
  diffs: RestDiff[];
  /** Source commit hash */
  fromHash?: string;
  /** Destination commit hash */
  toHash?: string;
  /** Context lines setting */
  contextLines?: number;
  /** Whitespace setting */
  whitespace?: string;
}

/**
 * Pull request activity (RestPullRequestActivity schema from Swagger).
 * Optimized to remove diff, user.links, and simplify reactions.
 */
export interface RestPullRequestActivity {
  /** Activity ID */
  id: number;
  /** Creation timestamp */
  createdDate: number;
  /** User who performed the action */
  user: RestUser;
  /** Activity action type */
  action: ActivityAction;
  /** Comment (for comment activities) */
  comment?: RestComment;
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
 * Response type for pull request activities endpoint.
 */
export type ActivitiesResponse = PaginatedResponse<RestPullRequestActivity>;

// =============================================================================
// API Response Types - What Bitbucket API returns (includes extra fields)
// =============================================================================

/**
 * User object as returned by Bitbucket API (includes links that we strip).
 */
export interface RestUserApiResponse extends RestUser {
  /** Links object (stripped in our responses) */
  links?: unknown;
}

/**
 * Comment object as returned by Bitbucket API (includes fields we strip).
 */
export interface RestCommentApiResponse extends Omit<RestComment, 'author' | 'comments' | 'properties'> {
  /** Author with links */
  author: RestUserApiResponse;
  /** Nested comments with API response structure */
  comments?: RestCommentApiResponse[];
  /** Anchor field (we rename to commentAnchor in our type) */
  anchor?: RestCommentAnchor;
  /** Permitted operations (stripped in our responses) */
  permittedOperations?: unknown;
  /** Properties with full reaction structure (before simplification) */
  properties?: {
    reactions?: Array<{
      emoticon: string;
      users?: Array<unknown>;
    }>;
    likedBy?: {
      total?: number;
    };
  };
}

/**
 * Pull request activity as returned by Bitbucket API (includes diff field we strip).
 */
export interface RestPullRequestActivityApiResponse extends Omit<RestPullRequestActivity, 'user' | 'comment'> {
  /** User with links */
  user: RestUserApiResponse;
  /** Comment with API structure */
  comment?: RestCommentApiResponse;
  /** Diff field (stripped in our responses to save ~50% tokens) */
  diff?: unknown;
}

/**
 * Repository with required project (for inbox PRs).
 */
export interface RestRepositoryWithProject extends Omit<RestRepository, 'project'> {
  /** Project (required for inbox PRs) */
  project: import('./repository.js').RestProject;
}

/**
 * Minimal ref with required repository and project (for inbox PRs).
 */
export interface RestMinimalRefWithRepository extends Omit<RestMinimalRef, 'repository'> {
  /** Repository with project (required for inbox PRs) */
  repository: RestRepositoryWithProject;
}

/**
 * Pull request from inbox endpoint (author and toRef.repository are required).
 */
export interface InboxPullRequest extends Omit<RestPullRequest, 'author' | 'toRef'> {
  /** Pull request author (required for inbox PRs) */
  author: {
    user: RestUser;
    role: string;
    approved: boolean;
    status: string;
  };
  /** Target branch ref with required repository */
  toRef: RestMinimalRefWithRepository;
}

/**
 * Request body for adding a comment to a pull request.
 */
export interface AddCommentBody {
  /** Comment text */
  text: string;
  /** Parent comment ID for replies */
  parent?: { id: number };
  /** Comment anchor for file/line comments */
  anchor?: {
    path: string;
    diffType: DiffType;
    line?: number;
    lineType?: LineType;
    fileType?: FileType;
  };
}

/**
 * Pull request participant (RestPullRequestParticipant schema from Swagger).
 * Represents a user's participation in a pull request with their role and review status.
 */
export interface RestPullRequestParticipant {
  /** User information */
  user: RestUser;
  /** Participant role */
  role?: ParticipantRole;
  /** Whether the participant approved the PR */
  approved?: boolean;
  /** Review status */
  status?: ParticipantStatus;
  /** Last commit hash reviewed by this participant */
  lastReviewedCommit?: string;
}
