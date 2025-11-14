#!/usr/bin/env node

// ============ Library Exports ============
// Re-export everything from client for library usage
export * from './client/index.js';

// ============ MCP Server Setup ============
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js';

async function startMcpServer() {
  const server = new McpServer({
    name: 'mcp-bitbucket-server',
    version: '1.0.0',
  });

  registerTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bitbucket MCP Server started');
}

async function main() {
  await startMcpServer();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
