import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { bitbucketClient } from "../../services/bitbucket.js";

const schema = z.object({
  projectKey: z.string().describe("The Bitbucket project key"),
  repositorySlug: z.string().describe("The repository slug"),
  pullRequestId: z.number().describe("The pull request ID"),
  limit: z
    .number()
    .optional()
    .describe("Number of items to return (default: 25, note: endpoint is not paged)"),
});

export const getPrChangesTool = (server: McpServer) => {
  server.registerTool(
    "bitbucket_get_pull_request_changes",
    {
      title: "Get Pull Request Changes",
      description:
        "Gets a list of all changed files in a pull request with file-level metadata (file paths, change types like ADD/MODIFY/DELETE, content IDs). This is useful for getting an overview of what files changed. For line-by-line diff data, use bitbucket_get_pull_request_file_diff.",
      inputSchema: schema.shape,
    },
    async (params) => {
      const { projectKey, repositorySlug, pullRequestId, limit } = schema.parse(params);

      const queryParams: Record<string, string> = {
        withComments: "true",
      };
      if (limit !== undefined) {
        queryParams.limit = limit.toString();
      }

      const response = await bitbucketClient.get(
        `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/changes`,
        { params: queryParams }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    }
  );
};
