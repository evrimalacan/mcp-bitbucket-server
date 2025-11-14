import axios, { type AxiosInstance } from 'axios';
import type {
  AddCommentBody,
  AddPullRequestCommentParams,
  ChangesResponse,
  DeletePullRequestCommentParams,
  DiffResponse,
  GetAllUsersParams,
  GetInboxPullRequestsParams,
  GetPullRequestActivitiesParams,
  GetPullRequestChangesParams,
  GetPullRequestDiffParams,
  GetPullRequestFileDiffParams,
  GetPullRequestParams,
  GetUserProfileParams,
  InboxPullRequest,
  ListProjectsParams,
  ListRepositoriesParams,
  PaginatedResponse,
  RepositoriesResponse,
  RestComment,
  RestProject,
  RestPullRequest,
  RestPullRequestActivityApiResponse,
  RestPullRequestParticipant,
  RestUser,
  UpdateReviewStatusParams,
} from './bitbucket.types.js';

/**
 * Bitbucket Server API client.
 * Provides typed methods for interacting with Bitbucket Server REST API.
 */
export class BitbucketService {
  private client: AxiosInstance;

  constructor(config: { baseUrl: string; token: string }) {
    this.client = axios.create({
      baseURL: `${config.baseUrl}/rest/api/latest`,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get a Bitbucket Server user profile by username
   */
  async getUserProfile(params: GetUserProfileParams): Promise<RestUser> {
    const response = await this.client.get<RestUser>(`/users/${params.username}`);
    return response.data;
  }

  /**
   * Get all users, optionally filtered by search term
   */
  async getAllUsers(params?: GetAllUsersParams): Promise<PaginatedResponse<RestUser>> {
    const response = await this.client.get<PaginatedResponse<RestUser>>('/users', {
      params: params?.filter ? { filter: params.filter } : {},
    });
    return response.data;
  }

  /**
   * List projects, optionally filtered by name or permission
   */
  async listProjects(params?: ListProjectsParams): Promise<PaginatedResponse<RestProject>> {
    const response = await this.client.get<PaginatedResponse<RestProject>>('/projects', {
      params,
    });
    return response.data;
  }

  /**
   * List all repositories in a project
   */
  async listRepositories(params: ListRepositoriesParams): Promise<RepositoriesResponse> {
    const response = await this.client.get<RepositoriesResponse>(`/projects/${params.projectKey}/repos`);
    return response.data;
  }

  /**
   * Get pull requests in the authenticated user's inbox (where they are assigned as reviewer)
   */
  async getInboxPullRequests(params?: GetInboxPullRequestsParams): Promise<PaginatedResponse<InboxPullRequest>> {
    const response = await this.client.get<PaginatedResponse<InboxPullRequest>>('/inbox/pull-requests', { params });
    return response.data;
  }

  /**
   * Get pull request details (title, description, author, branches, etc.)
   */
  async getPullRequest(params: GetPullRequestParams): Promise<RestPullRequest> {
    const { projectKey, repositorySlug, pullRequestId } = params;
    const response = await this.client.get<RestPullRequest>(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}`,
    );
    return response.data;
  }

  /**
   * Get all changed files in a pull request
   */
  async getPullRequestChanges(params: GetPullRequestChangesParams): Promise<ChangesResponse> {
    const { projectKey, repositorySlug, pullRequestId, limit } = params;
    const response = await this.client.get<ChangesResponse>(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/changes`,
      { params: limit ? { limit } : {} },
    );
    return response.data;
  }

  /**
   * Get structured line-by-line diff for a specific file in a pull request
   */
  async getPullRequestFileDiff(params: GetPullRequestFileDiffParams): Promise<DiffResponse> {
    const { projectKey, repositorySlug, pullRequestId, path, contextLines } = params;
    const response = await this.client.get<DiffResponse>(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/diff/${path}`,
      { params: contextLines ? { contextLines } : {} },
    );
    return response.data;
  }

  /**
   * Get diff for a pull request (or specific file).
   * When path is empty or undefined, returns the full PR diff.
   * Format controls the response type:
   * - 'text': Raw diff as plain text string
   * - 'json': Structured diff object (DiffResponse)
   */
  async getPullRequestDiff(params: GetPullRequestDiffParams): Promise<string | DiffResponse> {
    const { projectKey, repositorySlug, pullRequestId, path, contextLines, whitespace, format = 'text' } = params;

    const queryParams: Record<string, string | number> = {};
    if (contextLines !== undefined) queryParams.contextLines = contextLines;
    if (whitespace) queryParams.whitespace = whitespace;

    const response = await this.client.get<string | DiffResponse>(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/diff/${path || ''}`,
      {
        params: queryParams,
        headers: { Accept: format === 'text' ? 'text/plain' : 'application/json' },
      },
    );
    return response.data;
  }

  /**
   * Get activity on a pull request (comments, approvals, merges, reviews, updates)
   */
  async getPullRequestActivities(
    params: GetPullRequestActivitiesParams,
  ): Promise<PaginatedResponse<RestPullRequestActivityApiResponse>> {
    const { projectKey, repositorySlug, pullRequestId, ...queryParams } = params;
    const response = await this.client.get<PaginatedResponse<RestPullRequestActivityApiResponse>>(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/activities`,
      { params: queryParams },
    );
    return response.data;
  }

  /**
   * Add a comment to a pull request (supports general comments, replies, and inline file/line comments)
   */
  async addPullRequestComment(params: AddPullRequestCommentParams): Promise<RestComment> {
    const { projectKey, repositorySlug, pullRequestId, text, parentId, path, line, lineType, fileType } = params;

    const body: AddCommentBody = { text };
    if (parentId) body.parent = { id: parentId };
    if (path) {
      body.anchor = {
        path,
        diffType: 'EFFECTIVE',
        ...(line !== undefined && { line }),
        ...(lineType && { lineType }),
        ...(fileType && { fileType }),
      };
    }

    const response = await this.client.post<RestComment>(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/comments`,
      body,
    );
    return response.data;
  }

  /**
   * Delete a pull request comment. Returns void on success (HTTP 204).
   * Anyone can delete their own comment. Only REPO_ADMIN can delete others' comments.
   * Comments with replies cannot be deleted.
   */
  async deletePullRequestComment(params: DeletePullRequestCommentParams): Promise<void> {
    const { projectKey, repositorySlug, pullRequestId, commentId, version } = params;

    await this.client.delete(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/comments/${commentId}`,
      {
        params: { version },
      },
    );
  }

  /**
   * Update review status for a pull request (approve, request changes, or remove approval)
   */
  async updateReviewStatus(params: UpdateReviewStatusParams): Promise<RestPullRequestParticipant> {
    const { projectKey, repositorySlug, pullRequestId, status } = params;

    // Get authenticated user slug from application properties
    const propertiesResponse = await this.client.get('/application-properties');
    const userSlug = propertiesResponse.headers['x-ausername'];

    const response = await this.client.put<RestPullRequestParticipant>(
      `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/participants/${userSlug}`,
      { status },
    );
    return response.data;
  }
}
