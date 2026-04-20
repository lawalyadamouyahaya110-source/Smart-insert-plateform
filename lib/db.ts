import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type AppDocument = {
  _id?: string;
} & Record<string, unknown>;

type QueryFilter = Record<string, unknown>;
type SortSpec = Record<string, 1 | -1>;
type UpdateSpec = { $set: Record<string, unknown> };

type QueryLike = {
  eq: (column: string, value: unknown) => QueryLike;
  in: (column: string, values: unknown[]) => QueryLike;
  is: (column: string, value: null) => QueryLike;
  order: (column: string, options?: { ascending?: boolean }) => QueryLike;
};

type GlobalSupabase = typeof globalThis & {
  __supabaseAdmin?: SupabaseClient | null;
};

const globalSupabase = globalThis as GlobalSupabase;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function getSupabaseAdmin(): SupabaseClient {
  if (!globalSupabase.__supabaseAdmin) {
    globalSupabase.__supabaseAdmin = createClient(
      getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      process.env.SUPABASE_SERVICE_ROLE_KEY || getEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return globalSupabase.__supabaseAdmin;
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function toDatabaseKey(key: string): string {
  if (key === '_id') return 'id';
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

function toAppKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function mapDocumentFromDatabase(document: AppDocument): AppDocument {
  const next: AppDocument = {};
  Object.entries(document).forEach(([key, value]) => {
    next[toAppKey(key)] = value;
  });
  return next;
}

function applyFilter<T extends QueryLike>(query: T, filter?: QueryFilter): T {
  if (!filter || Object.keys(filter).length === 0) return query;

  let nextQuery: QueryLike = query;

  Object.entries(filter).forEach(([column, rawValue]) => {
    const value = normalizeValue(rawValue);

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      '$in' in (value as Record<string, unknown>)
    ) {
      nextQuery = nextQuery.in(toDatabaseKey(column), ((value as { $in: unknown[] }).$in || []).map(normalizeValue));
      return;
    }

    if (value === null) {
      nextQuery = nextQuery.is(toDatabaseKey(column), null);
      return;
    }

    nextQuery = nextQuery.eq(toDatabaseKey(column), value);
  });

  return nextQuery as T;
}

function applySort<T extends QueryLike>(query: T, sort?: SortSpec): T {
  if (!sort) return query;

  let nextQuery: QueryLike = query;
  Object.entries(sort).forEach(([column, direction]) => {
    nextQuery = nextQuery.order(toDatabaseKey(column), { ascending: direction !== -1 });
  });
  return nextQuery as T;
}

function sanitizeDocument(document: AppDocument): AppDocument {
  const next: AppDocument = {};
  Object.entries(document).forEach(([key, value]) => {
    const normalizedKey = toDatabaseKey(key);
    next[normalizedKey] = normalizeValue(value);
  });
  return next;
}

class SupabaseCursor {
  private readonly client: SupabaseClient;
  private readonly table: string;
  private readonly filter?: QueryFilter;
  private sortSpec?: SortSpec;

  constructor(client: SupabaseClient, table: string, filter?: QueryFilter) {
    this.client = client;
    this.table = table;
    this.filter = filter;
  }

  sort(sort: SortSpec) {
    this.sortSpec = sort;
    return this;
  }

  async toArray<TSchema extends AppDocument = AppDocument>(): Promise<TSchema[]> {
    let query = this.client.from(this.table).select('*');
    query = applyFilter(query, this.filter);
    query = applySort(query, this.sortSpec);

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []).map((row) => mapDocumentFromDatabase(row as AppDocument))) as TSchema[];
  }
}

class SupabaseCollection<TSchema extends AppDocument = AppDocument> {
  private readonly client: SupabaseClient;
  private readonly table: string;

  constructor(client: SupabaseClient, table: string) {
    this.client = client;
    this.table = table;
  }

  find(filter?: QueryFilter) {
    return new SupabaseCursor(this.client, this.table, filter);
  }

  async findOne(filter?: QueryFilter): Promise<TSchema | null> {
    let query = this.client.from(this.table).select('*').limit(1);
    query = applyFilter(query, filter);

    const { data, error } = await query;
    if (error) throw error;
    return ((data && data[0] && mapDocumentFromDatabase(data[0] as AppDocument)) || null) as TSchema | null;
  }

  async insertOne(document: TSchema) {
    const { data, error } = await this.client
      .from(this.table)
      .insert(sanitizeDocument(document))
      .select()
      .limit(1);

    if (error) throw error;
    return {
      insertedId: document.id || document._id,
      acknowledged: true,
      data: data?.[0] ? mapDocumentFromDatabase(data[0] as AppDocument) : null,
    };
  }

  async insertMany(documents: TSchema[]) {
    if (documents.length === 0) {
      return { acknowledged: true, insertedCount: 0 };
    }

    const { error } = await this.client.from(this.table).insert(documents.map(sanitizeDocument));
    if (error) throw error;
    return { acknowledged: true, insertedCount: documents.length };
  }

  async updateOne(filter: QueryFilter, update: UpdateSpec) {
    let query = this.client.from(this.table).update(sanitizeDocument(update.$set || {})).select('*');
    query = applyFilter(query, filter);

    const { data, error } = await query;
    if (error) throw error;
    return {
      matchedCount: data?.length ? 1 : 0,
      modifiedCount: data?.length ? 1 : 0,
    };
  }

  async updateMany(filter: QueryFilter, update: UpdateSpec) {
    let query = this.client.from(this.table).update(sanitizeDocument(update.$set || {})).select('*');
    query = applyFilter(query, filter);

    const { data, error } = await query;
    if (error) throw error;
    return {
      matchedCount: data?.length || 0,
      modifiedCount: data?.length || 0,
    };
  }

  async deleteOne(filter: QueryFilter) {
    let query = this.client.from(this.table).delete().select('*').limit(1);
    query = applyFilter(query, filter);

    const { data, error } = await query;
    if (error) throw error;
    return { deletedCount: data?.length ? 1 : 0 };
  }

  async deleteMany(filter: QueryFilter) {
    let query = this.client.from(this.table).delete().select('*');
    query = applyFilter(query, filter);

    const { data, error } = await query;
    if (error) throw error;
    return { deletedCount: data?.length || 0 };
  }

  async countDocuments(filter?: QueryFilter) {
    let query = this.client.from(this.table).select('*', { count: 'exact', head: true });
    query = applyFilter(query, filter);

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

export type AppDb = {
  collection<TSchema extends AppDocument = AppDocument>(name: string): SupabaseCollection<TSchema>;
};

export async function getDb(): Promise<AppDb> {
  const client = getSupabaseAdmin();
  return {
    collection<TSchema extends AppDocument = AppDocument>(name: string) {
      return new SupabaseCollection<TSchema>(client, name);
    },
  };
}
