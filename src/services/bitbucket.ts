import { BitbucketClient } from 'bitbucket-data-center-client';
import { bitbucketConfig } from '../config.js';

/**
 * Singleton BitbucketClient instance for MCP tools.
 * Created from environment configuration.
 */
export const bitbucketService = new BitbucketClient({
  baseUrl: bitbucketConfig.baseUrl,
  token: bitbucketConfig.token,
});
