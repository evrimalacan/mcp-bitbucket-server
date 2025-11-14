import { BitbucketService } from '../client/bitbucket.client.js';
import { bitbucketConfig } from '../config.js';

/**
 * Singleton BitbucketService instance for MCP tools.
 * Created from environment configuration.
 */
export const bitbucketService = new BitbucketService({
  baseUrl: bitbucketConfig.baseUrl,
  token: bitbucketConfig.token,
});
