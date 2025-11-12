/**
 * Type definitions for Bitbucket Server API responses.
 * Types are based on the Bitbucket Server REST API Swagger documentation.
 */

// Common types
export type { PaginatedResponse } from './common.js';
// Pull request types
export type {
  ActivitiesResponse,
  ActivityAction,
  AddCommentBody,
  ChangesResponse,
  ChangeType,
  DiffResponse,
  DiffType,
  FileType,
  InboxPullRequest,
  InboxPullRequestsResponse,
  LineType,
  MinimalPullRequest,
  PullRequestState,
  RestChange,
  RestComment,
  RestCommentAnchor,
  RestCommentApiResponse,
  RestCommentLikedBy,
  RestCommentProperties,
  RestCommentReaction,
  RestDiff,
  RestDiffHunk,
  RestDiffLine,
  RestDiffSegment,
  RestMinimalRef,
  RestMinimalRefWithRepository,
  RestPath,
  RestPullRequest,
  RestPullRequestActivity,
  RestPullRequestActivityApiResponse,
  RestUser,
  RestUserApiResponse,
  UserType,
} from './pull-request.js';
// Repository types
export type {
  ProjectType,
  RepositoriesResponse,
  RepositoryState,
  RestProject,
  RestRepository,
} from './repository.js';
