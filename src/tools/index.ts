import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listProjectsTool } from './projects/index.js';
import {
  addPrCommentTool,
  getInboxPullRequestsTool,
  getPrActivitiesTool,
  getPrChangesTool,
  getPrFileDiffTool,
  updateReviewStatusTool,
} from './pull-requests/index.js';
import { listRepositoriesTool } from './repositories/index.js';
import { getAllUsersTool, getUserProfileTool } from './users/index.js';

export function registerTools(server: McpServer) {
  // User tools
  getUserProfileTool(server);
  getAllUsersTool(server);

  // Project tools
  listProjectsTool(server);

  // Repository tools
  listRepositoriesTool(server);

  // Pull request tools
  getInboxPullRequestsTool(server);
  addPrCommentTool(server);
  getPrChangesTool(server);
  getPrFileDiffTool(server);
  getPrActivitiesTool(server);
  updateReviewStatusTool(server);
}
