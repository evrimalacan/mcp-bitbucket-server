// =============================================================================
// Common Types
// =============================================================================

/**
 * Generic paginated response wrapper for Bitbucket Server API responses.
 * Most list endpoints in Bitbucket Server return this structure.
 */
export interface PaginatedResponse<T> {
  /** Whether this is the last page of results */
  isLastPage: boolean;
  /** Maximum number of items per page */
  limit: number;
  /** Starting index for the next page (only present if not last page) */
  nextPageStart?: number;
  /** Number of items in this page */
  size: number;
  /** Starting index of this page */
  start: number;
  /** Array of items in this page */
  values: T[];
}

// =============================================================================
// Repository & Project Types
// =============================================================================

/**
 * Link object from Bitbucket Server API.
 */
export interface RestLink {
  /** Link URL */
  href: string;
  /** Link name (optional) */
  name?: string;
}

/**
 * Links object from Bitbucket Server API responses.
 */
export interface RestLinks {
  /** Self links */
  self?: RestLink[];
  /** Clone links */
  clone?: RestLink[];
  /** Alternative links */
  [key: string]: RestLink[] | undefined;
}

/**
 * Repository state values from Bitbucket Server.
 */
export type RepositoryState = 'AVAILABLE' | 'INITIALISATION_FAILED' | 'INITIALISING' | 'OFFLINE';

/**
 * Project type values from Bitbucket Server.
 */
export type ProjectType = 'NORMAL' | 'PERSONAL';

/**
 * Bitbucket Server project information (RestProject schema from Swagger).
 * Simplified to include only commonly used readonly fields.
 */
export interface RestProject {
  /** Project ID */
  id: number;
  /** Project key (e.g., "PRJ") */
  key: string;
  /** Project name (e.g., "My Cool Project") */
  name: string;
  /** Project description */
  description?: string;
  /** Project type */
  type: ProjectType;
  /** Whether the project is public */
  public?: boolean;
  /** Project scope (e.g., "PROJECT") */
  scope?: string;
  /** Links */
  links?: RestLinks;
}

/**
 * Bitbucket Server repository information (RestRepository schema from Swagger).
 * Simplified to include only commonly used readonly fields.
 */
export interface RestRepository {
  /** Repository ID */
  id: number;
  /** Repository name (e.g., "My repo") */
  name: string;
  /** Repository slug (e.g., "my-repo") */
  slug: string;
  /** Repository description */
  description?: string;
  /** Hierarchy ID (e.g., "e3c939f9ef4a7fae272e") */
  hierarchyId?: string;
  /** SCM ID (e.g., "git") */
  scmId?: string;
  /** Repository state */
  state?: RepositoryState;
  /** Status message (e.g., "Available") */
  statusMessage?: string;
  /** Whether the repository is forkable */
  forkable?: boolean;
  /** Whether the repository is archived */
  archived?: boolean;
  /** Whether the repository is public */
  public?: boolean;
  /** Repository partition */
  partition?: number;
  /** Repository scope (e.g., "REPOSITORY") */
  scope?: string;
  /** Project this repository belongs to */
  project?: RestProject;
  /** Origin repository (for forks) */
  origin?: RestRepository;
  /** Links */
  links?: RestLinks;
}

/**
 * Response type for list repositories endpoint.
 */
export type RepositoriesResponse = PaginatedResponse<RestRepository>;

// =============================================================================
// Pull Request Types
// =============================================================================

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
  /** Links */
  links?: RestLinks;
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
 * Bitbucket Server comment object (RestComment schema from Swagger).
 * Represents the raw API response structure.
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
  /** Comment anchor (file/line location) */
  anchor?: RestCommentAnchor;
  /** Permitted operations */
  permittedOperations?: unknown;
  /** Comment properties (reactions, likes) */
  properties?: {
    /** Reactions with full user arrays */
    reactions?: Array<{
      emoticon: string;
      users?: Array<unknown>;
    }>;
    /** Like information */
    likedBy?: {
      total?: number;
    };
  };
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
 * Commit person object (author or committer) from Bitbucket Server API.
 * Part of RestCommit schema from Swagger.
 */
export interface RestCommitPerson {
  /** Person's full name */
  name: string;
  /** Person's email address */
  emailAddress?: string;
  /** Avatar URL (writeOnly in Swagger, included for completeness) */
  avatarUrl?: string;
}

/**
 * Minimal commit reference (RestMinimalCommit schema from Swagger).
 * Used in parent commit references.
 */
export interface RestMinimalCommit {
  /** Commit hash */
  id: string;
  /** Short commit hash (first 11 chars) */
  displayId: string;
}

/**
 * Complete commit object (RestCommit schema from Swagger).
 * Used in RESCOPED activity's added/removed commits arrays.
 */
export interface RestCommit {
  /** Commit hash */
  id: string;
  /** Short commit hash (first 11 chars) */
  displayId: string;
  /** Commit author information */
  author: RestCommitPerson;
  /** Timestamp when commit was authored */
  authorTimestamp: number;
  /** Commit committer information */
  committer: RestCommitPerson;
  /** Timestamp when commit was committed */
  committerTimestamp: number;
  /** Commit message */
  message: string;
  /** Parent commits */
  parents: RestMinimalCommit[];
}

/**
 * Pull request activity (RestPullRequestActivity schema from Swagger).
 * Base activity structure without diff field (diff is in RestPullRequestActivityApiResponse).
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
  /** Comment anchor (location in code where comment was made) */
  commentAnchor?: RestCommentAnchor;
  /** Commit ID (for commit activities) */
  commit?: {
    id: string;
    displayId: string;
  };
  /** Added reviewers (for reviewer change activities) */
  addedReviewers?: RestUser[];
  /** Removed reviewers (for reviewer change activities) */
  removedReviewers?: RestUser[];
  /** Added commits (for RESCOPED activities) */
  added?: {
    commits?: RestCommit[];
  };
  /** Removed commits (for RESCOPED activities) */
  removed?: {
    commits?: RestCommit[];
  };
}

/**
 * Response type for pull request activities endpoint.
 */
export type ActivitiesResponse = PaginatedResponse<RestPullRequestActivity>;

// =============================================================================
// API Response Types - What Bitbucket API returns (includes extra fields)
// =============================================================================

/**
 * User object as returned by Bitbucket API.
 * Alias for RestUser since base type now includes all API fields.
 */
export interface RestUserApiResponse extends RestUser {}

/**
 * Comment object as returned by Bitbucket API.
 * Alias for RestComment since base type now matches full API response.
 */
export interface RestCommentApiResponse extends RestComment {}

/**
 * Pull request activity as returned by Bitbucket API.
 * Includes diff field and full user/comment structures.
 */
export interface RestPullRequestActivityApiResponse extends Omit<RestPullRequestActivity, 'user' | 'comment'> {
  /** User with links */
  user: RestUserApiResponse;
  /** Comment with API structure */
  comment?: RestCommentApiResponse;
  /** Diff field (contains code changes context) */
  diff?: unknown;
}

/**
 * Repository with required project (for inbox PRs).
 */
export interface RestRepositoryWithProject extends Omit<RestRepository, 'project'> {
  /** Project (required for inbox PRs) */
  project: RestProject;
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

/**
 * Emoticon object from Bitbucket Server (RestEmoticon schema from Swagger).
 * Represents an emoticon reaction that can be added to comments.
 */
export interface RestEmoticon {
  /** Emoticon shortcut (e.g., "thumbsup") */
  shortcut: string;
  /** URL to the emoticon image/SVG */
  url: string;
  /** Emoticon value/identifier (optional) */
  value?: string;
}

/**
 * User reaction to a comment (RestUserReaction schema from Swagger).
 * Returned when adding a reaction to a comment.
 */
export interface RestUserReaction {
  /** The comment that was reacted to */
  comment: RestComment;
  /** The emoticon that was added */
  emoticon: RestEmoticon;
  /** The user who reacted */
  user: RestUser;
}

// =============================================================================
// Method Parameter Types - For BitbucketService Methods
// =============================================================================

/**
 * Parameters for getUserProfile method
 */
export interface GetUserProfileParams {
  /** The username/slug of the Bitbucket Server user */
  username: string;
}

/**
 * Parameters for getAllUsers method
 */
export interface GetAllUsersParams {
  /** Filter users by username, name or email address (partial match) */
  filter?: string;
}

/**
 * Parameters for listProjects method
 */
export interface ListProjectsParams {
  /** Filter projects by name (partial match) */
  name?: string;
  /** Filter by permission (e.g., PROJECT_READ, PROJECT_WRITE, PROJECT_ADMIN) */
  permission?: string;
  /** Starting index for pagination (default: 0) */
  start?: number;
  /** Maximum number of projects to return (default: 25) */
  limit?: number;
}

/**
 * Parameters for listRepositories method
 */
export interface ListRepositoriesParams {
  /** The Bitbucket Server project key */
  projectKey: string;
}

/**
 * Parameters for getInboxPullRequests method
 */
export interface GetInboxPullRequestsParams {
  /** Starting index for pagination (default: 0) */
  start?: number;
  /** Maximum number of pull requests to return (default: 25) */
  limit?: number;
}

/**
 * Parameters for getPullRequestChanges method
 */
export interface GetPullRequestChangesParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** Number of items to return (default: 25, note: endpoint is not paged) */
  limit?: number;
}

/**
 * Parameters for getting pull request details.
 */
export interface GetPullRequestParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
}

/**
 * Parameters for getting pull request diff.
 */
export interface GetPullRequestDiffParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** Path to file (optional - empty for full PR diff) */
  path?: string;
  /** Number of context lines around changes (default: 10) */
  contextLines?: number;
  /** Whitespace handling: 'show' or 'ignore-all' */
  whitespace?: 'show' | 'ignore-all';
  /** Response format: 'text' for raw diff, 'json' for structured (default: 'text') */
  format?: 'text' | 'json';
}

/**
 * Parameters for getPullRequestFileDiff method
 */
export interface GetPullRequestFileDiffParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** The path to the file to diff (e.g., 'src/main.ts') */
  path: string;
  /** Number of context lines around added/removed lines (default: 10) */
  contextLines?: number;
}

/**
 * Parameters for getPullRequestActivities method
 */
export interface GetPullRequestActivitiesParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** Filter activities by type (e.g., ["COMMENTED", "REVIEW_COMMENTED"]) */
  activityTypes?: string[];
  /** Starting index for pagination (default: 0) */
  start?: number;
  /** Maximum number of items to return (default: 25) */
  limit?: number;
}

/**
 * Parameters for addPullRequestComment method
 */
export interface AddPullRequestCommentParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** The comment text */
  text: string;
  /** Parent comment ID for replies */
  parentId?: number;
  /** File path for file-specific comments */
  path?: string;
  /** Line number for inline comments */
  line?: number;
  /** Type of line (default: CONTEXT) */
  lineType?: LineType;
  /** Side of diff (default: TO) */
  fileType?: FileType;
}

/**
 * Parameters for deleting a pull request comment.
 */
export interface DeletePullRequestCommentParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** The comment ID to delete */
  commentId: number;
  /** The expected version of the comment (prevents concurrent modification conflicts) */
  version: number;
}

/**
 * Parameters for updateReviewStatus method
 */
export interface UpdateReviewStatusParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** The review status: APPROVED (approve), NEEDS_WORK (request changes), or UNAPPROVED (neutral/remove approval) */
  status: ParticipantStatus;
}

/**
 * Parameters for addPullRequestCommentReaction method
 */
export interface AddPullRequestCommentReactionParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** The comment ID */
  commentId: number;
  /** The emoticon identifier (thumbsup, thumbsdown, heart, thinking_face, laugh) */
  emoticon: string;
}

/**
 * Parameters for removePullRequestCommentReaction method
 */
export interface RemovePullRequestCommentReactionParams {
  /** The Bitbucket project key */
  projectKey: string;
  /** The repository slug */
  repositorySlug: string;
  /** The pull request ID */
  pullRequestId: number;
  /** The comment ID */
  commentId: number;
  /** The emoticon identifier to remove */
  emoticon: string;
}
