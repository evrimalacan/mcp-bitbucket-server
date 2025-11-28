# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for Bitbucket Server/Data Center integration. The server provides tools for:
- **User management**: Get user profile, list all users
- **Project operations**: List projects with filtering
- **Repository operations**: List repositories in a project
- **Pull request operations**: Create PR, get PR details, get inbox PRs, get changed files, get full/file diffs (text and structured), add comments (three separate tools: general, file-level, and line-level), delete comments, add/remove emoticon reactions, get activities, update review status (approve/request changes)

## Architecture

This is a **simple, straightforward implementation** using the `bitbucket-data-center-client` library:

```
Tool → bitbucketService (BitbucketClient) → Bitbucket Server REST API
```

**Key principles:**
- Use the `bitbucket-data-center-client` library for all API calls
- Type-safe client methods (no manual endpoint construction)
- Minimal error handling (let errors bubble up)
- Simple, readable code
- Verify endpoint capabilities against Swagger documentation when needed

## Bitbucket Server API Documentation

### Always Verify with Swagger

**CRITICAL**: The Bitbucket Server Swagger documentation is located at `BitbucketServerSwagger.json` in the project root. Always verify endpoint capabilities and parameters against this file before implementing tools.

The Swagger file is **67,521 lines** - use grep to find specific endpoints:

```bash
# Find an endpoint
grep -n '"/api/latest/users"' BitbucketServerSwagger.json

# Read endpoint details
# Use the line number from grep, then read ~80 lines
```

### Authentication

The `bitbucket-data-center-client` library handles authentication automatically using Bearer tokens.

Configuration is done via environment variables in `.env`:
- `BITBUCKET_URL`: Your Bitbucket Server base URL
- `BITBUCKET_TOKEN`: Personal Access Token from Bitbucket Server

The library automatically adds the `Authorization: Bearer ${token}` header to all requests.

## Project Structure

```
src/
├── config.ts                    # Environment validation (BITBUCKET_URL, BITBUCKET_TOKEN)
├── index.ts                     # Main entry point, MCP server setup
├── services/
│   └── bitbucket.ts            # BitbucketClient singleton (export const bitbucketService)
└── tools/
    ├── index.ts                # Tool registration
    ├── users/
    │   ├── index.ts            # Barrel export
    │   ├── get_user_profile.ts # User profile operations
    │   └── get_all_users.ts    # List all users
    ├── projects/
    │   ├── index.ts            # Barrel export
    │   └── list_projects.ts    # List projects with filtering
    ├── repositories/
    │   ├── index.ts            # Barrel export
    │   └── list_repositories.ts # List repositories in a project
    └── pull-requests/
        ├── index.ts                       # Barrel export
        ├── get_inbox_pull_requests.ts     # Get PRs in reviewer's inbox
        ├── get_pr_details.ts              # Get full PR details
        ├── get_pr_diff.ts                 # Get PR diff (text or JSON)
        ├── add_pr_comment.ts              # Add general/reply comment
        ├── add_pr_file_comment.ts         # Add file-level comment
        ├── add_pr_line_comment.ts         # Add line-specific comment
        ├── delete_pr_comment.ts           # Delete comment
        ├── add_pr_comment_reaction.ts     # Add emoticon reaction
        ├── remove_pr_comment_reaction.ts  # Remove emoticon reaction
        ├── get_pr_changes.ts              # Get changed files list
        ├── get_pr_file_diff.ts            # Get structured file diff
        ├── get_pr_activities.ts           # Get PR activities/comments
        └── update_review_status.ts        # Approve/request changes
```

## TypeScript Types

All TypeScript types are provided by the `bitbucket-data-center-client` library. You don't need to define or maintain types manually.

The library exports comprehensive types for:
- Users, projects, repositories
- Pull requests, comments, activities
- Diffs, changes, and review statuses
- Paginated responses

Simply import types from the library when needed:

```typescript
import type { RestPullRequest, RestComment } from 'bitbucket-data-center-client';
```

## Tool Development Workflow

### 1. Check the Library Documentation

The `bitbucket-data-center-client` library provides all necessary methods. Check:
- Library README: https://github.com/evrimalacan/bitbucket-data-center-client
- Existing tools in `src/tools/` for examples

### 2. Implement the Tool

Follow this simple pattern using the client library:

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { bitbucketService } from "../../services/bitbucket.js";

const schema = z.object({
  requiredParam: z.string().describe("Description of parameter"),
  optionalParam: z.string().optional().describe("Optional parameter"),
});

export const toolNameTool = (server: McpServer) => {
  server.registerTool(
    "tool_name",
    {
      title: "Human Readable Title",
      description: "Clear description of what this tool does",
      inputSchema: schema.shape,
    },
    async ({ requiredParam, optionalParam }) => {
      // Call the appropriate library method
      const result = await bitbucketService.someMethod({
        requiredParam,
        optionalParam,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
};
```

### 3. Register the Tool

```typescript
// 1. Export from domain barrel file (e.g., src/tools/users/index.ts)
export * from "./tool_name.js";

// 2. Import and register in src/tools/index.ts
import { toolNameTool } from "./domain/index.js";

export function registerTools(server: McpServer) {
  // ... existing tools
  toolNameTool(server);
}
```

### 4. Run the Linter

Always run the linter after implementing a new tool:

```bash
npm run lint
```

The linter will auto-fix formatting, catch unused variables, and ensure code quality. Fix any warnings before committing.

## Code Style Guidelines

### Keep It Simple

**✅ DO:**
- Use `bitbucketService` client methods: `bitbucketService.getUserProfile(...)`
- Minimal error handling (let errors bubble up)
- Short, focused functions
- Clear parameter names
- Destructure parameters directly in async handler

**❌ DON'T:**
- Add wrapper functions around the library
- Over-engineer error handling
- Add unnecessary abstractions
- Use try-catch unless absolutely required

### Example: Simple Tool

```typescript
// ✅ Good - simple and direct using the library
export const getUserProfileTool = (server: McpServer) => {
  server.registerTool(
    "get_user_profile",
    {
      title: "Get Bitbucket User Profile",
      description: "Gets Bitbucket Server user profile details by username",
      inputSchema: schema.shape,
    },
    async ({ username }) => {
      const user = await bitbucketService.getUserProfile({ username });

      return {
        content: [{ type: "text", text: JSON.stringify(user, null, 2) }],
      };
    }
  );
};
```

```typescript
// ❌ Bad - over-engineered
export const getUserProfileTool = (server: McpServer) => {
  server.registerTool("bitbucket_get_user_profile", { ... }, async (params) => {
    try {
      const validated = validateParams(params); // Unnecessary - zod handles this
      const client = getClient(); // Unnecessary - use bitbucketService directly
      const response = await client.getUser(validated.username);

      return formatResponse(response); // Over-abstracted
    } catch (error) {
      return handleError(error); // Let errors bubble
    }
  });
};
```

## Current Tools

### get_user_profile
**File**: `src/tools/users/get_user_profile.ts`
**Endpoint**: `GET /users/{username}`
**Parameters**:
- `username` (required): The username/slug of the Bitbucket Server user

### get_all_users
**File**: `src/tools/users/get_all_users.ts`
**Endpoint**: `GET /users`
**Parameters**:
- `filter` (optional): Filter users by username, name or email (partial match)

### list_projects
**File**: `src/tools/projects/list_projects.ts`
**Endpoint**: `GET /projects`
**Parameters**:
- `name` (optional): Filter projects by name (partial match)
- `permission` (optional): Filter by permission (e.g., PROJECT_READ, PROJECT_WRITE, PROJECT_ADMIN)
- `start` (optional): Starting index for pagination (default: 0)
- `limit` (optional): Maximum number of projects to return (default: 25)

**Returns**: Paginated list of projects with project keys, names, descriptions, and permission levels.

**Purpose**: Discover available projects that the authenticated user has access to. Use the project key from this response to list repositories in specific projects.

### list_repositories
**File**: `src/tools/repositories/list_repositories.ts`
**Endpoint**: `GET /projects/{projectKey}/repos`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key

**Note**: According to Swagger, this endpoint does NOT support `name` or `permission` query parameters. Only pagination (`start`, `limit`) is supported.

### get_inbox_pull_requests
**File**: `src/tools/pull-requests/get_inbox_pull_requests.ts`
**Endpoint**: `GET /inbox/pull-requests`
**Parameters**:
- `start` (optional): Starting index for pagination (default: 0)
- `limit` (optional): Maximum number of PRs to return (default: 25)

**Returns**: Paginated list of pull requests where the authenticated user is assigned as a reviewer. Each PR includes ONLY essential review information:
- `id` - Pull request ID
- `title` - PR title
- `description` - PR description
- `state` - PR state (OPEN/MERGED/DECLINED)
- `author` - Author display name (string)
- `projectKey` - Project key for review tools
- `repositorySlug` - Repository slug for review tools
- `createdDate` - Creation timestamp
- `updatedDate` - Last update timestamp

**Token Optimization**: Response is heavily optimized to reduce token usage by ~92% (100KB → 7.7KB for 25 PRs):
- Strips all nested objects (reviewers, branches, repository details, project details)
- Removes all user objects except author display name
- Flattens `projectKey` and `repositorySlug` to top level
- Removes all metadata not needed for review

**Purpose**: Discover all PRs across all projects and repositories that need your review in one call. Much more efficient than querying project by project. Use the `id`, `projectKey`, and `repositorySlug` from the response to review specific PRs with other tools.

### create_pull_request
**File**: `src/tools/pull-requests/create_pull_request.ts`
**Endpoint**: `POST /projects/{projectKey}/repos/{repositorySlug}/pull-requests`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `fromBranch` (required): Source branch name (e.g., "feature-x")
- `toBranch` (required): Target branch name (e.g., "main")
- `title` (required): PR title
- `description` (optional): PR description in markdown format
- `reviewers` (optional): Array of reviewer usernames to add

**Returns**: Created pull request object including `id`, `title`, `state`, `fromRef`, `toRef`, `author`, and web URL.

**Purpose**: Create a new pull request from a source branch to a target branch. Accepts simple branch names - they are automatically converted to full refs (e.g., "main" → "refs/heads/main").

**Error Cases**:
- 400: Malformed request
- 401: Insufficient permissions
- 404: Repository or branches don't exist
- 409: Branches are the same, PR already exists, or target repo is archived

### get_pull_request
**File**: `src/tools/pull-requests/get_pr_details.ts`
**Endpoint**: `GET /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID

**Returns**: Full pull request object including:
- `id`, `version`, `title`, `description`
- `state` (OPEN/MERGED/DECLINED), `open`, `closed`
- `fromRef` - Source branch with `displayId` (branch name) and `latestCommit`
- `toRef` - Destination branch with `displayId` and `latestCommit`
- `author` - Author user object with display name, role, and approval status
- `reviewers` - Array of reviewer objects
- `participants` - Array of participant objects
- `createdDate`, `updatedDate` - Timestamps

**Purpose**: Get comprehensive metadata for a pull request. Use this when you need full PR details including source/destination branches, author information, and reviewers. Essential for tools that need to understand PR context before performing operations.

### get_pull_request_diff
**File**: `src/tools/pull-requests/get_pr_diff.ts`
**Endpoint**: `GET /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/diff/{path}`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `path` (optional): File path (omit or empty string for full PR diff)
- `contextLines` (optional): Number of context lines around changes (default: 10)
- `whitespace` (optional): 'show' or 'ignore-all' (default: show)
- `format` (optional): 'text' or 'json' (default: 'text')
  - `'text'`: Returns raw diff as plain text string (uses `Accept: text/plain` header)
  - `'json'`: Returns structured diff object with hunks/segments (uses `Accept: application/json` header)

**Returns**:
- When `format='text'` (default): Raw diff as plain text in unified diff format (string)
- When `format='json'`: Structured diff object (DiffResponse) with hunks, segments, and line-by-line data

**Purpose**: Get the complete diff for a PR in one call (when `path` is omitted) or for a specific file. The format parameter controls the response type based on the Accept header. Use `format='text'` (default) for raw text suitable for parsing or display - the background-greg service uses this for generating PR review contexts. Use `format='json'` when you need structured data with exact line numbers and segments.

### add_pr_comment
**File**: `src/tools/pull-requests/add_pr_comment.ts`
**Endpoint**: `POST /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/comments`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `text` (required): The comment text
- `parentId` (optional): Parent comment ID to reply to an existing comment

**Purpose**: Add a general comment to a pull request that is not attached to any specific file or line. Also use this tool for all replies - when you provide `parentId`, the reply automatically inherits the location (file/line) from the parent comment, so you don't need to specify path/line/lineType/fileType. For creating file-specific or line-specific comments, use the specialized tools below.

**Returns**: Simple success message with comment ID.

### add_pr_file_comment
**File**: `src/tools/pull-requests/add_pr_file_comment.ts`
**Endpoint**: `POST /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/comments`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `text` (required): The comment text
- `path` (required): File path to attach the comment to (e.g., "src/main.ts")

**Purpose**: Add a comment attached to a specific file in the PR (file-level comment, not line-specific). The comment will appear at the file level in the PR diff view. For replies to existing comments, use add_pr_comment with parentId.

**Returns**: Simple success message with comment ID.

### add_pr_line_comment
**File**: `src/tools/pull-requests/add_pr_line_comment.ts`
**Endpoint**: `POST /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/comments`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `text` (required): The comment text
- `path` (required): File path (e.g., "src/main.ts")
- `line` (required): Line number to comment on (use destination line number from diff)
- `lineType` (required): Type of line - "ADDED" (green +), "REMOVED" (red -), or "CONTEXT" (unchanged)
- `fileType` (required): Side of diff - "FROM" (source/old) or "TO" (destination/new)

**Purpose**: Add an inline comment to a specific line in the PR diff. Use line numbers from `get_pull_request_file_diff` (destination line for TO side, source line for FROM side). Match the `lineType` to the segment type from the diff. For replies to existing comments, use add_pr_comment with parentId.

**Returns**: Simple success message with comment ID.

### get_pull_request_changes
**File**: `src/tools/pull-requests/get_pr_changes.ts`
**Endpoint**: `GET /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/changes`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `limit` (optional): Number of items to return (default: 25, note: endpoint is not paged)

**Returns**: List of changed files with metadata (file paths, change types like ADD/MODIFY/DELETE, content IDs, comment counts)

**Purpose**: Get an overview of all files changed in a PR. Use this as the first step before fetching detailed diffs. Always returns all changes with comment counts included.

### get_pull_request_file_diff
**File**: `src/tools/pull-requests/get_pr_file_diff.ts`
**Endpoint**: `GET /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/diff/{path}`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `path` (required): File path to diff (e.g., "src/main.ts")
- `contextLines` (optional): Lines of context around changes (default: 10)

**Returns**: Structured JSON with hunks, segments, and exact line numbers for each change. Each line includes `source` (FROM line number) and `destination` (TO line number) fields. Existing comments are embedded in the diff. Whitespace changes are always included.

**Purpose**: Get line-by-line diff data for commenting on specific lines. Use the line numbers from this response when calling `add_pr_comment`.

### get_pull_request_activities
**File**: `src/tools/pull-requests/get_pr_activities.ts`
**Endpoint**: `GET /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/activities`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `activityTypes` (optional): Filter by activity types - array of strings
- `start` (optional): Starting index for pagination (default: 0)
- `limit` (optional): Maximum items to return (default: 25)

**Returns**: Paginated list of activity items with:
- `action`: Activity type (COMMENTED, APPROVED, DECLINED, MERGED, REVIEWED, UPDATED, RESCOPED, etc.)
- `id`: Activity ID
- `createdDate`: Timestamp
- `user`: Who performed the action
- Additional fields based on action type

**Activity Action Types** (from Bitbucket Server Swagger):
- `COMMENTED` - General or inline comment added
- `REVIEW_COMMENTED` - Review comment added
- `APPROVED` / `UNAPPROVED` - Approval status changed
- `REVIEWED` / `REVIEW_FINISHED` / `REVIEW_DISCARDED` - Review actions
- `MERGED` - PR was merged
- `OPENED` / `REOPENED` / `DECLINED` - PR status changes
- `UPDATED` / `RESCOPED` - PR updated (commits added/removed)
- `DELETED` - Activity was deleted
- `AUTO_MERGE_REQUESTED` / `AUTO_MERGE_CANCELLED` - Auto-merge actions

**Filtering Examples**:
- Get only comments: `activityTypes: ["COMMENTED", "REVIEW_COMMENTED"]`
- Get approvals/reviews: `activityTypes: ["APPROVED", "UNAPPROVED", "REVIEWED"]`
- Get all activity: Omit `activityTypes` parameter

**Token Optimization**: Response is automatically optimized to reduce token usage by ~50%:
- Removes `diff` field (use `commentAnchor.path` with `get_pull_request_file_diff` to fetch code context on demand)
- Removes `user.links` from all user objects
- Removes `comment.permittedOperations`
- Simplifies `reactions` and `likedBy` to counts only

**Purpose**: Get an overview of PR activity. Can filter to specific types (e.g., only comments) to reduce response size. Each comment activity includes full comment text, author, and creation date. For inline comments, use `commentAnchor` (path, line, lineType, fileType) to fetch the relevant diff separately.

### update_review_status
**File**: `src/tools/pull-requests/update_review_status.ts`
**Endpoint**: `PUT /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/participants/{userSlug}`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `status` (required): Review status - `APPROVED`, `NEEDS_WORK`, or `UNAPPROVED`

**Auto-detected**:
- `userSlug`: Automatically detected from the authenticated user via `X-AUSERNAME` response header

**Returns**: Updated participant object with review status, role, and lastReviewedCommit.

**Purpose**: Change the authenticated user's review status for a PR. Automatically adds the user as a participant/reviewer if not already. The API automatically updates `lastReviewedCommit` to the latest commit when status is `APPROVED` or `NEEDS_WORK`. Only requires `REPO_READ` permission.

**Status Values**:
- `APPROVED` - Approve the PR
- `NEEDS_WORK` - Request changes (shows as "Requested changes" in UI from 8.10+)
- `UNAPPROVED` - Neutral/remove approval

**Note**: The tool makes a lightweight request to `/application-properties` to extract the authenticated username from the `X-AUSERNAME` response header, eliminating the need for users to provide their own slug.

### delete_pr_comment
**File**: `src/tools/pull-requests/delete_pr_comment.ts`
**Endpoint**: `DELETE /projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/comments/{commentId}`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `commentId` (required): The ID of the comment to delete
- `version` (required): The expected version of the comment (for optimistic locking)

**Returns**: Simple success message confirming deletion.

**Purpose**: Delete a pull request comment. You can delete your own comments. Only REPO_ADMIN users can delete comments created by others. Comments with replies cannot be deleted. The `version` parameter must be provided to prevent concurrent modification conflicts - get the version from the comment object returned by other tools.

**Permissions**:
- Own comments: Any user can delete their own comments
- Others' comments: Requires REPO_ADMIN permission
- Comments with replies: Cannot be deleted (will return error)

### add_pr_comment_reaction
**File**: `src/tools/pull-requests/add_pr_comment_reaction.ts`
**Endpoint**: `PUT /comment-likes/latest/projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/comments/{commentId}/reactions/{emoticon}`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `commentId` (required): The comment ID
- `emoticon` (required): The emoticon identifier - one of: `thumbsup`, `thumbsdown`, `heart`, `thinking_face`, `laughing`

**Returns**: RestUserReaction object with comment, emoticon details (shortcut, url), and user who reacted.

**Purpose**: Add an emoticon reaction to a pull request comment. The operation is idempotent - adding the same reaction twice will succeed without error. Only predefined emoticons are supported to prevent invalid values.

**Supported Emoticons**:
- `thumbsup` - Thumbs up 👍
- `thumbsdown` - Thumbs down 👎
- `heart` - Heart ❤️
- `thinking_face` - Thinking face 🤔
- `laughing` - Laughing face 😄

**Note**: Uses the Bitbucket Server comment-likes plugin API (`/rest/comment-likes/latest/`), not the core API.

### remove_pr_comment_reaction
**File**: `src/tools/pull-requests/remove_pr_comment_reaction.ts`
**Endpoint**: `DELETE /comment-likes/latest/projects/{projectKey}/repos/{repositorySlug}/pull-requests/{pullRequestId}/comments/{commentId}/reactions/{emoticon}`
**Parameters**:
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `commentId` (required): The comment ID
- `emoticon` (required): The emoticon identifier to remove - one of: `thumbsup`, `thumbsdown`, `heart`, `thinking_face`, `laughing`

**Returns**: Simple success message (204 No Content).

**Purpose**: Remove an emoticon reaction from a pull request comment. Only the user who added the reaction can remove it. If the reaction doesn't exist, the operation still succeeds (idempotent).

**Supported Emoticons**: Same as `add_pr_comment_reaction`

**Note**: Uses the Bitbucket Server comment-likes plugin API (`/rest/comment-likes/latest/`), not the core API.

## Pull Request Review Workflow

For agents reviewing PRs and leaving comments on specific lines:

0. **Discover PRs to review**:
   ```
   get_inbox_pull_requests()
   → Returns PRs across all projects: [{id, title, description, state, author, projectKey, repositorySlug, ...}, ...]
   ```
   Use `id`, `projectKey`, and `repositorySlug` from each PR for the following steps.

1. **[Optional] Get activity overview or comments**:
   ```
   # Get all activity
   get_pull_request_activities(projectKey, repositorySlug, pullRequestId)

   # Or get only comments (smaller response)
   get_pull_request_activities(projectKey, repositorySlug, pullRequestId,
     activityTypes=["COMMENTED", "REVIEW_COMMENTED"])
   → Returns filtered activities: [{action: "COMMENTED", comment: {text, author, ...}, ...}, ...]
   ```
   Use this to see existing discussions before reviewing.

2. **Get all changed files**:
   ```
   get_pull_request_changes(projectKey, repositorySlug, pullRequestId)
   → Returns list of files: [{path, type: "MODIFY", ...}, ...]
   ```

3. **For each file of interest, get structured diff**:
   ```
   get_pull_request_file_diff(projectKey, repositorySlug, pullRequestId, path="src/main.ts")
   → Returns: {hunks: [{segments: [{type: "ADDED", lines: [{source: 42, destination: 43, line: "code"}]}]}]}
   ```

4. **Comment on specific lines**:
   ```
   add_pr_line_comment(
     projectKey, repositorySlug, pullRequestId,
     text="Consider using const here",
     path="src/main.ts",
     line=43,              // Use destination line number from diff
     lineType="ADDED",     // Use segment type from diff
     fileType="TO"         // "TO" for destination side
   )
   ```

5. **Update review status**:
   ```
   # Approve the PR
   update_review_status(
     projectKey, repositorySlug, pullRequestId,
     status="APPROVED"
   )

   # Or request changes
   update_review_status(
     projectKey, repositorySlug, pullRequestId,
     status="NEEDS_WORK"
   )
   ```

**Key Points**:
- Use `destination` line numbers from the diff for the `TO` side (most common)
- Use `source` line numbers for the `FROM` side
- Match `lineType` to the segment type from the diff (ADDED/REMOVED/CONTEXT)
- The structured diff ensures exact line number accuracy
- `userSlug` is automatically detected - no need to provide it

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run the server
node dist/index.js

# Type checking
npx tsc --noEmit

# Lint and auto-fix issues
npm run lint
```

**IMPORTANT**: Always run `npm run lint` after making code changes. The linter will auto-fix formatting issues and catch unused variables, type errors, and other code quality issues.

## Environment Setup

Required environment variables in `.env`:

```bash
# Bitbucket Server URL
BITBUCKET_URL=https://your-bitbucket-server.com

# Personal Access Token
BITBUCKET_TOKEN=your_token_here
```

See `.env.example` for template.

## Common Patterns

### Pagination

The `bitbucket-data-center-client` library handles pagination automatically. Just pass the pagination parameters:

```typescript
const result = await bitbucketService.listProjects({
  start: 0,
  limit: 25,
});
```

Paginated responses include:
- `values`: Array of results
- `size`: Number of results in this page
- `limit`: Page size
- `isLastPage`: Boolean
- `nextPageStart`: Start value for next page

### Error Handling

The library throws errors with Bitbucket Server's error format. Let them bubble up - the MCP SDK will handle them appropriately.

## Resources

- **Library Documentation**: https://github.com/evrimalacan/bitbucket-data-center-client
- **Swagger Documentation**: `BitbucketServerSwagger.json` in project root (for reference)
- **Bitbucket Server REST API Docs**: Available via Bitbucket Server UI (triple dot menu)
