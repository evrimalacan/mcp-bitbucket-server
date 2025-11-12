import type { PaginatedResponse } from './common.js';

/**
 * Repository state values from Bitbucket Server.
 */
export type RepositoryState = 'AVAILABLE' | 'INITIALISATION_FAILED' | 'INITIALISING' | 'OFFLINE';

/**
 * Project type values from Bitbucket Server.
 */
export type ProjectType = 'NORMAL' | 'PERSONAL';

/**
 * Bitbucket Server project information (RestProject schema from Swagger).
 * Simplified to include only commonly used readonly fields.
 */
export interface RestProject {
  /** Project ID */
  id: number;
  /** Project key (e.g., "PRJ") */
  key: string;
  /** Project name (e.g., "My Cool Project") */
  name: string;
  /** Project description */
  description?: string;
  /** Project type */
  type: ProjectType;
  /** Whether the project is public */
  public?: boolean;
  /** Project scope (e.g., "PROJECT") */
  scope?: string;
}

/**
 * Bitbucket Server repository information (RestRepository schema from Swagger).
 * Simplified to include only commonly used readonly fields.
 */
export interface RestRepository {
  /** Repository ID */
  id: number;
  /** Repository name (e.g., "My repo") */
  name: string;
  /** Repository slug (e.g., "my-repo") */
  slug: string;
  /** Repository description */
  description?: string;
  /** Hierarchy ID (e.g., "e3c939f9ef4a7fae272e") */
  hierarchyId?: string;
  /** SCM ID (e.g., "git") */
  scmId?: string;
  /** Repository state */
  state?: RepositoryState;
  /** Status message (e.g., "Available") */
  statusMessage?: string;
  /** Whether the repository is forkable */
  forkable?: boolean;
  /** Whether the repository is archived */
  archived?: boolean;
  /** Whether the repository is public */
  public?: boolean;
  /** Repository partition */
  partition?: number;
  /** Repository scope (e.g., "REPOSITORY") */
  scope?: string;
  /** Project this repository belongs to */
  project?: RestProject;
  /** Origin repository (for forks) */
  origin?: RestRepository;
}

/**
 * Response type for list repositories endpoint.
 */
export type RepositoriesResponse = PaginatedResponse<RestRepository>;
