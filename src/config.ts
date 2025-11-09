import { config } from 'dotenv';

config();

export interface BitbucketConfig {
  baseUrl: string;
  token: string;
}

function validateConfig(): BitbucketConfig {
  const baseUrl = process.env.BITBUCKET_URL;
  const token = process.env.BITBUCKET_TOKEN;

  if (!baseUrl) {
    throw new Error('BITBUCKET_URL environment variable is required');
  }

  if (!token) {
    throw new Error('BITBUCKET_TOKEN environment variable is required');
  }

  return {
    baseUrl,
    token,
  };
}

export const bitbucketConfig = validateConfig();
