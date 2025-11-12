/**
 * Generic paginated response wrapper for Bitbucket Server API responses.
 * Most list endpoints in Bitbucket Server return this structure.
 */
export interface PaginatedResponse<T> {
  /** Whether this is the last page of results */
  isLastPage: boolean;
  /** Maximum number of items per page */
  limit: number;
  /** Starting index for the next page (only present if not last page) */
  nextPageStart?: number;
  /** Number of items in this page */
  size: number;
  /** Starting index of this page */
  start: number;
  /** Array of items in this page */
  values: T[];
}
