import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listProjectsTool } from './projects/index.js';
import {
  addPrCommentTool,
  addPrFileCommentTool,
  addPrLineCommentTool,
  deletePrCommentTool,
  getInboxPullRequestsTool,
  getPrActivitiesTool,
  getPrChangesTool,
  getPrFileDiffTool,
  getPullRequestDetailsTool,
  getPullRequestDiffTool,
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
  getPullRequestDetailsTool(server);
  addPrCommentTool(server);
  addPrFileCommentTool(server);
  addPrLineCommentTool(server);
  deletePrCommentTool(server);
  getPrChangesTool(server);
  getPullRequestDiffTool(server);
  getPrFileDiffTool(server);
  getPrActivitiesTool(server);
  updateReviewStatusTool(server);
}
