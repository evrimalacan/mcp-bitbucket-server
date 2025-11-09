# MCP Bitbucket Server

An MCP (Model Context Protocol) server for Bitbucket Server/Data Center integration.

## Features

This MCP server provides tools for:

- **User Management**: Get user profiles, list all users with filtering
- **Repository Operations**: List repositories in projects
- **Pull Request Operations**: Add comments to pull requests (general, replies, and inline)

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file with your Bitbucket Server credentials:

```bash
# Bitbucket Server URL
BITBUCKET_URL=https://your-bitbucket-server.com

# Personal Access Token
BITBUCKET_TOKEN=your_personal_access_token
```

See `.env.example` for a template.

### Generating a Personal Access Token

1. Log in to your Bitbucket Server instance
2. Go to **Profile** → **Manage account** → **Personal access tokens**
3. Click **Create a token**
4. Give it a name and select appropriate permissions:
   - **Project permissions**: Read
   - **Repository permissions**: Read
5. Copy the generated token to your `.env` file

## Usage

### Development Mode

```bash
npm run dev
```

### Production

```bash
npm run build
node dist/index.js
```

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Available Tools

### User Tools

#### bitbucket_get_user_profile
Get detailed information about a specific Bitbucket user.

**Parameters:**
- `username` (required): The username/slug of the Bitbucket Server user

**Example:**
```json
{
  "username": "john.doe"
}
```

#### bitbucket_get_all_users
Retrieve a list of all Bitbucket users with optional filtering.

**Parameters:**
- `filter` (optional): Filter users by username, name or email address (partial match)

**Examples:**
```json
// Get all users
{}

// Search for users matching "john"
{
  "filter": "john"
}
```

### Repository Tools

#### bitbucket_list_repositories
List all repositories in a Bitbucket Server project.

**Parameters:**
- `projectKey` (required): The Bitbucket Server project key (e.g., "PROJ", "DEV")

**Example:**
```json
{
  "projectKey": "PROJ"
}
```

### Pull Request Tools

#### bitbucket_add_pr_comment
Add a comment to a pull request. Supports general comments, replies, and inline file/line comments.

**Parameters:**
- `projectKey` (required): The Bitbucket Server project key
- `repositorySlug` (required): The repository slug
- `pullRequestId` (required): The pull request ID
- `text` (required): The comment text
- `parentId` (optional): Parent comment ID for replies
- `path` (optional): File path for file-specific comments
- `line` (optional): Line number for inline comments
- `lineType` (optional): "ADDED", "REMOVED", or "CONTEXT"
- `fileType` (optional): "FROM" or "TO"

**Examples:**
```json
// General comment
{
  "projectKey": "PROJ",
  "repositorySlug": "my-repo",
  "pullRequestId": 123,
  "text": "Looks good to me!"
}

// Reply to a comment
{
  "projectKey": "PROJ",
  "repositorySlug": "my-repo",
  "pullRequestId": 123,
  "text": "I agree",
  "parentId": 456
}

// Inline comment on a specific line
{
  "projectKey": "PROJ",
  "repositorySlug": "my-repo",
  "pullRequestId": 123,
  "text": "This variable name could be clearer",
  "path": "src/app.ts",
  "line": 42,
  "lineType": "ADDED"
}
```

## Project Structure

```
src/
├── config.ts                    # Environment variables with validation
├── index.ts                     # Main entry point, MCP server setup
├── services/
│   └── bitbucket.ts            # Bitbucket API client (axios instance)
└── tools/
    ├── index.ts                # Tool registration
    ├── users/                  # User management tools
    │   ├── get_user_profile.ts
    │   └── get_all_users.ts
    ├── repositories/           # Repository operations tools
    │   └── list_repositories.ts
    └── pull-requests/          # Pull request tools
        └── add_pr_comment.ts
```

## Development

### Adding New Tools

1. Check the Bitbucket Server Swagger documentation (`BitbucketServerSwagger.json`)
2. Create a new tool file in the appropriate domain folder
3. Export it from the domain's `index.ts`
4. Register it in `src/tools/index.ts`

See `CLAUDE.md` for detailed development guidelines.

### Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Architecture

This is a simple, straightforward MCP server implementation:

- **Authentication**: Bearer token (Personal Access Token)
- **HTTP Client**: Axios with direct usage (no wrapper classes)
- **API Version**: `/rest/api/latest`
- **Error Handling**: Minimal - let errors bubble up naturally

## API Documentation

The Bitbucket Server REST API Swagger specification is included in the repository at `BitbucketServerSwagger.json`. This is the source of truth for all endpoint capabilities and parameters.

## License

See [LICENSE](LICENSE) file for details.

## Resources

- [Bitbucket Server REST API Documentation](https://docs.atlassian.com/bitbucket-server/rest/)
- [Model Context Protocol](https://modelcontextprotocol.io)
