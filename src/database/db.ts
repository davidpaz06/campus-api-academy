import { Pool, PoolClient, QueryResult } from 'pg';
import { dbConfig } from './dbConfig';
// import dotenv from "dotenv";

// dotenv.config();

// TODO - Env file for db config

/**
 * Interface that defines the structure of a dependency between queries in transactions.
 * Allows the result of a query (sourceIndex) to be used as a parameter in another query (targetIndex).
 *
 * @interface Dependency
 * @property {number} sourceIndex - Index of the source query in the queries array
 * @property {number} targetIndex - Index of the target query that will receive the value
 * @property {number} targetParamIndex - Index of the parameter in the target query where the value will be inserted
 */
interface Dependency {
  sourceIndex: number;
  targetIndex: number;
  targetParamIndex: number;
}

/**
 * Database class implements the Singleton pattern to manage PostgreSQL connections.
 * Provides methods for executing SQL queries, transactions and dependency handling.
 *
 * @class Database
 * @example
 * ```typescript
 * const queries = {
 *   "getUser": "SELECT * FROM users WHERE id = $1",
 *   "createUser": "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id"
 * };
 * const db = Database.getInstance(queries);
 * const user = await db.query("getUser", [123]);
 * ```
 */
class Database {
  /** Unique singleton instance */
  private static instance: Database;

  /** PostgreSQL connection pool */
  private pool!: Pool;

  /** Dictionary of predefined SQL queries */
  private queries: Record<string, string> = {};

  /**
   * Private constructor that implements the Singleton pattern.
   * If no instance exists, it creates one and initializes the connection pool.
   * If an instance already exists, returns the existing instance.
   *
   * @param {Record<string, string>} queries - Dictionary of predefined SQL queries
   * @returns {Database} The unique Database instance
   */
  constructor(queries: Record<string, string>) {
    if (!Database.instance) {
      this.initializePool();
      this.queries = queries;
      Database.instance = this;
    }
    return Database.instance;
  }

  /**
   * Initializes the PostgreSQL connection pool using dbConfig configuration.
   * Executed only once when creating the first singleton instance.
   *
   * @private
   * @returns {void}
   */
  private initializePool(): void {
    this.pool = new Pool(dbConfig);

    // Manejo de eventos del pool
    this.pool.on('connect', () => {
      console.log('✅ Nueva conexión establecida a la base de datos');
    });

    this.pool.on('error', (error) => {
      console.error('❌ Error en el pool de conexiones:', error);
    });
  }

  /**
   * Static method to get the unique Database instance (Singleton pattern).
   * If no instance exists, creates one with the provided queries.
   * If an instance already exists, returns the existing instance ignoring new queries.
   *
   * @param {Record<string, string>} queries - Optional dictionary of predefined SQL queries
   * @returns {Database} The unique Database instance
   *
   * @example
   * ```typescript
   * const db = Database.getInstance({
   *   "getAllUsers": "SELECT * FROM users",
   *   "getUserById": "SELECT * FROM users WHERE id = $1"
   * });
   * ```
   */
  public static getInstance(queries: Record<string, string> = {}): Database {
    if (!Database.instance) {
      Database.instance = new Database(queries);
    } else {
      // CORREGIDO: Si la instancia ya existe pero hay queries nuevas, agregarlas
      if (Object.keys(queries).length > 0) {
        Database.instance.queries = {
          ...Database.instance.queries,
          ...queries,
        };
      }
    }
    return Database.instance;
  }

  /**
   * Executes a predefined SQL query that is stored in the queries dictionary.
   * Gets a connection from the pool, executes the query and releases the connection.
   *
   * @param {string} queryName - Name of the predefined query in the dictionary
   * @param {any[]} params - Optional parameters for the SQL query
   * @returns {Promise<QueryResult>} SQL query result
   * @throws {Error} If the query doesn't exist in the dictionary or execution fails
   *
   * @example
   * ```typescript
   * const result = await db.queryList("getUserById", [123]);
   * const user = result.rows[0];
   * ```
   */
  async queryList(queryName: string, params?: any[]): Promise<QueryResult> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query: string = this.queries[queryName];
      const res: QueryResult<any> = await client.query({
        text: query,
        values: params,
      });
      return res;
    } catch (error) {
      console.error(`Error executing query:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Executes a direct SQL query (raw SQL text).
   * Useful for dynamic queries that are not predefined in the dictionary.
   * Gets a connection from the pool, executes the query and releases the connection.
   *
   * @param {string} queryName - The complete SQL text of the query to execute
   * @param {any[]} params - Optional parameters for the SQL query
   * @returns {Promise<QueryResult>} SQL query result
   * @throws {Error} If query execution fails
   *
   * @example
   * ```typescript
   * const result = await db.rawQuery("SELECT COUNT(*) FROM users WHERE active = $1", [true]);
   * const count = result.rows[0].count;
   * ```
   */
  async rawQuery(queryName: string, params?: any[]): Promise<QueryResult> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query: string = queryName;
      const res: QueryResult<any> = await client.query({
        text: query,
        values: params,
      });
      return res;
    } catch (error) {
      console.error(`Error executing raw query:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Smart method that executes queries automatically detecting the type.
   * If queryName exists in the predefined queries dictionary, uses queryList().
   * If it doesn't exist, treats it as raw SQL and uses rawQuery().
   *
   * @param {string} queryName - Predefined query name or complete SQL text
   * @param {any[]} params - Optional parameters for the SQL query
   * @returns {Promise<QueryResult>} SQL query result
   * @throws {Error} If query execution fails
   *
   * @example
   * ```typescript
   * // Using predefined query
   * const user = await db.query("getUserById", [123]);
   *
   * // Using raw SQL
   * const products = await db.query("SELECT * FROM products WHERE price > $1", [100]);
   * ```
   */
  async query(queryName: string, params?: any[]): Promise<QueryResult> {
    try {
      if (this.queries[queryName]) {
        // If query exists in the queries list
        return await this.queryList(queryName, params);
      } else {
        // If it's a raw query
        return await this.rawQuery(queryName, params);
      }
    } catch (error) {
      console.error(`Error executing query:`, error);
      throw error;
    }
  }

  /**
   * Executes multiple SQL queries within an atomic transaction.
   * All queries execute or fail together (ACID compliance).
   * Supports dependencies between queries, where the result of one query
   * can be used as a parameter in subsequent queries.
   *
   * @param {string[]} queryArray - Array of query names or raw SQL
   * @param {any[][]} paramsArray - Array of arrays with parameters for each query
   * @param {Dependency[]} dependencies - Optional array of dependencies between queries
   * @returns {Promise<QueryResult[]>} Array with the results of all queries
   * @throws {Error} If any query fails, the entire transaction is rolled back
   *
   * @example
   * ```typescript
   * const queries = ["createUser", "createProfile"];
   * const params = [
   *   ["John", "john@email.com"],
   *   [null, "Profile description"] // null will be replaced by the user ID
   * ];
   * const dependencies = [
   *   { sourceIndex: 0, targetIndex: 1, targetParamIndex: 0 }
   * ];
   * const results = await db.transaction(queries, params, dependencies);
   * ```
   */
  async transaction(
    queryArray: string[],
    paramsArray: any[][],
    dependencies: Dependency[] = [],
  ): Promise<QueryResult[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const results: QueryResult[] = [];

      for (let i: number = 0; i < queryArray.length; i++) {
        const query: string = this.queries[queryArray[i]] || queryArray[i];
        const params: any[] = paramsArray[i];
        const res: QueryResult<any> = await client.query(query, params);
        results.push(res);

        // Handle dependencies: use the first value of the result as ID
        if (
          res.rows[0] &&
          typeof res.rows[0] === 'object' &&
          res.rows[0] !== null
        ) {
          const firstRow = res.rows[0] as Record<string, unknown>;
          const id = Object.values(firstRow)[0];

          dependencies.forEach((dep) => {
            if (dep.sourceIndex === i) {
              paramsArray[dep.targetIndex][dep.targetParamIndex] = id;
            }
          });
        }
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error executing transaction:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Database;
