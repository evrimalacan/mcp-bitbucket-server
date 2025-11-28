import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listProjectsTool } from './projects/index.js';
import {
  addPrCommentReactionTool,
  addPrCommentTool,
  addPrFileCommentTool,
  addPrLineCommentTool,
  createPullRequestTool,
  deletePrCommentTool,
  getInboxPullRequestsTool,
  getPrActivitiesTool,
  getPrChangesTool,
  getPrFileDiffTool,
  getPullRequestDetailsTool,
  getPullRequestDiffTool,
  removePrCommentReactionTool,
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
  createPullRequestTool(server);
  getInboxPullRequestsTool(server);
  getPullRequestDetailsTool(server);
  addPrCommentTool(server);
  addPrCommentReactionTool(server);
  addPrFileCommentTool(server);
  addPrLineCommentTool(server);
  deletePrCommentTool(server);
  getPrChangesTool(server);
  getPullRequestDiffTool(server);
  getPrFileDiffTool(server);
  getPrActivitiesTool(server);
  removePrCommentReactionTool(server);
  updateReviewStatusTool(server);
}
