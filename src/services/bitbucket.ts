import axios from 'axios';
import { bitbucketConfig } from '../config.js';

export const bitbucketClient = axios.create({
  baseURL: `${bitbucketConfig.baseUrl}/rest/api/latest`,
  headers: {
    Authorization: `Bearer ${bitbucketConfig.token}`,
  },
});
