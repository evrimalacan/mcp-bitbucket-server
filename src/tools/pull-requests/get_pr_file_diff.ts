import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { bitbucketClient } from "../../services/bitbucket.js";

const schema = z.object({
  projectKey: z.string().describe("The Bitbucket project key"),
  repositorySlug: z.string().describe("The repository slug"),
  pullRequestId: z.number().describe("The pull request ID"),
  path: z.string().describe("The path to the file to diff (e.g., 'src/main.ts')"),
  contextLines: z
    .number()
    .optional()
    .describe("Number of context lines around added/removed lines (default: 10)"),
});

export const getPrFileDiffTool = (server: McpServer) => {
  server.registerTool(
    "bitbucket_get_pull_request_file_diff",
    {
      title: "Get Pull Request File Diff",
      description:
        "Gets a structured line-by-line diff for a specific file in a pull request. Returns JSON with hunks, segments, and exact line numbers (source and destination). Includes existing comments embedded in the diff. Whitespace changes are always included. This is essential for commenting on specific lines - use the line numbers from this response when adding comments.",
      inputSchema: schema.shape,
    },
    async (params) => {
      const { projectKey, repositorySlug, pullRequestId, path, contextLines } =
        schema.parse(params);

      const queryParams: Record<string, string> = {
        withComments: "true",
      };
      if (contextLines !== undefined) {
        queryParams.contextLines = contextLines.toString();
      }

      const response = await bitbucketClient.get(
        `/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/diff/${path}`,
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
