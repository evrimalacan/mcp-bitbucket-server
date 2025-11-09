# Bitbucket Server MCP

A **Model Context Protocol (MCP)** server that connects AI assistants to Bitbucket Server/Data Center. Review pull requests, manage repositories, search users, and interact with your Bitbucket instance through natural language in Claude and other AI assistants.

## 🚀 Quick Start

### Get Your Bitbucket Server Credentials

1. Log into your Bitbucket Server instance
2. Go to **Profile** → **Manage account** → **Personal access tokens**
3. Click **Create a token**
4. Give it a name and select appropriate permissions:
   - **Project permissions**: Read (or Write for commenting)
   - **Repository permissions**: Read (or Write for commenting)
5. Copy the generated token
6. Note your Bitbucket Server URL (e.g., `https://bitbucket.yourcompany.com`)

### Configuration

#### Claude Code

Add the server using the Claude Code CLI:

```bash
claude mcp add -s user \
    bitbucket-server \
    npx mcp-bitbucket-server@latest \
    -e "BITBUCKET_URL=https://bitbucket.yourcompany.com" \
    -e "BITBUCKET_TOKEN=your_personal_access_token"
```

#### Manual Configuration (Any MCP Client)

Alternatively, add this configuration to your MCP client's configuration file:

```json
{
  "mcpServers": {
    "bitbucket-server": {
      "command": "npx",
      "args": ["mcp-bitbucket-server@latest"],
      "type": "stdio",
      "env": {
        "BITBUCKET_URL": "https://bitbucket.yourcompany.com",
        "BITBUCKET_TOKEN": "your_personal_access_token"
      }
    }
  }
}
```

## ✨ Features

- 👥 **User Management** - Search users and get profiles
- 📁 **Project & Repository Discovery** - List projects and repositories
- 🔍 **Pull Request Review** - Get PR details, changes, diffs, and activities
- 💬 **Smart Comments** - Add general, reply, and inline comments on PRs
- 📊 **PR Inbox** - See all PRs where you're a reviewer across all projects
- 🎯 **Token Optimized** - Responses optimized to reduce token usage
- 🔒 **Secure Authentication** - Uses Personal Access Tokens
- 🛡️ **Simple & Direct** - Minimal abstractions, direct API access

## 🛠️ Available Tools

The server provides **11 MCP tools** for Bitbucket Server operations:

### User Management
- `bitbucket_get_user_profile` - Get detailed user information
- `bitbucket_get_all_users` - List and search all users

### Projects & Repositories
- `bitbucket_list_projects` - Discover available projects
- `bitbucket_list_repositories` - List repositories in a project

### Pull Request Operations
- `bitbucket_get_inbox_pull_requests` - Get all PRs needing your review
- `bitbucket_get_pull_request_changes` - List all changed files in a PR
- `bitbucket_get_pull_request_file_diff` - Get structured line-by-line diff
- `bitbucket_get_pull_request_activities` - Get PR comments, approvals, and activity
- `bitbucket_add_pr_comment` - Add general, reply, or inline comments

## 💡 Example Queries

- *"Show me all pull requests I need to review"*
- *"Get the changes in pull request #123 in the PROJ repository"*
- *"Show me the diff for src/main.ts in PR #456"*
- *"Add a comment on line 42 of src/app.ts suggesting we use const instead"*
- *"List all repositories in the DEV project"*
- *"Find users named John"*
- *"What are the recent activities on PR #789?"*

## 🏗️ Development

### From Source

```bash
# Clone and setup
git clone https://github.com/evrimalacan/mcp-bitbucket-server.git
cd mcp-bitbucket-server
npm install

# Build
npm run build

# Development mode
npm run dev
```

### Adding New Tools

1. Check the Bitbucket Server Swagger documentation (`BitbucketServerSwagger.json`)
2. Create a new tool file in the appropriate domain folder under `src/tools/`
3. Export it from the domain's `index.ts`
4. Register it in `src/tools/index.ts`

See `CLAUDE.md` for detailed development guidelines.

## 🐛 Troubleshooting

### Common Issues

**"Authentication failed"**
- Verify your Personal Access Token is correct
- Ensure the token has appropriate permissions

**"Access forbidden"**
- Check your Bitbucket user has permission for the resource
- Verify token permissions include required scopes

**"Resource not found"**
- Confirm the project key, repository slug, or PR ID is correct
- Check you have access to the specified resource

## 📚 Documentation

- **[Development Guide](CLAUDE.md)** - Detailed development and contribution guide
- **[Bitbucket Server REST API](https://developer.atlassian.com/server/bitbucket/rest/v1000/intro/)** - Official API reference
- **[Model Context Protocol](https://modelcontextprotocol.io)** - MCP specification

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the development guide in `CLAUDE.md`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/evrimalacan/mcp-bitbucket-server/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/evrimalacan/mcp-bitbucket-server/discussions)
- 📖 **Documentation**: See [CLAUDE.md](CLAUDE.md) for comprehensive guide

---

**Built for developers who want AI assistance with Bitbucket Server**
