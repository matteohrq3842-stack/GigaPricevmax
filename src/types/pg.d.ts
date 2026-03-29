declare module 'pg' {
  export type PoolConfig = {
    connectionString?: string;
    ssl?: unknown;
    max?: number;
  };

  export class Pool {
    constructor(config?: PoolConfig);
    query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
    end(): Promise<void>;
  }
}

