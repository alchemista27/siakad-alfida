
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model YmqGroup
 * 
 */
export type YmqGroup = $Result.DefaultSelection<Prisma.$YmqGroupPayload>
/**
 * Model YmqMember
 * 
 */
export type YmqMember = $Result.DefaultSelection<Prisma.$YmqMemberPayload>
/**
 * Model YmqSetoran
 * 
 */
export type YmqSetoran = $Result.DefaultSelection<Prisma.$YmqSetoranPayload>
/**
 * Model YmqTarget
 * 
 */
export type YmqTarget = $Result.DefaultSelection<Prisma.$YmqTargetPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const SetoranType: {
  tilawah: 'tilawah',
  ziyadah: 'ziyadah',
  murojaah: 'murojaah'
};

export type SetoranType = (typeof SetoranType)[keyof typeof SetoranType]


export const VerificationStatus: {
  pending: 'pending',
  verified: 'verified',
  revision: 'revision'
};

export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus]

}

export type SetoranType = $Enums.SetoranType

export const SetoranType: typeof $Enums.SetoranType

export type VerificationStatus = $Enums.VerificationStatus

export const VerificationStatus: typeof $Enums.VerificationStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqGroup`: Exposes CRUD operations for the **YmqGroup** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqGroups
    * const ymqGroups = await prisma.ymqGroup.findMany()
    * ```
    */
  get ymqGroup(): Prisma.YmqGroupDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqMember`: Exposes CRUD operations for the **YmqMember** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqMembers
    * const ymqMembers = await prisma.ymqMember.findMany()
    * ```
    */
  get ymqMember(): Prisma.YmqMemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqSetoran`: Exposes CRUD operations for the **YmqSetoran** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqSetorans
    * const ymqSetorans = await prisma.ymqSetoran.findMany()
    * ```
    */
  get ymqSetoran(): Prisma.YmqSetoranDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqTarget`: Exposes CRUD operations for the **YmqTarget** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqTargets
    * const ymqTargets = await prisma.ymqTarget.findMany()
    * ```
    */
  get ymqTarget(): Prisma.YmqTargetDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    YmqGroup: 'YmqGroup',
    YmqMember: 'YmqMember',
    YmqSetoran: 'YmqSetoran',
    YmqTarget: 'YmqTarget'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "ymqGroup" | "ymqMember" | "ymqSetoran" | "ymqTarget"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      YmqGroup: {
        payload: Prisma.$YmqGroupPayload<ExtArgs>
        fields: Prisma.YmqGroupFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqGroupFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqGroupFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>
          }
          findFirst: {
            args: Prisma.YmqGroupFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqGroupFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>
          }
          findMany: {
            args: Prisma.YmqGroupFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>[]
          }
          create: {
            args: Prisma.YmqGroupCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>
          }
          createMany: {
            args: Prisma.YmqGroupCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqGroupCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>[]
          }
          delete: {
            args: Prisma.YmqGroupDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>
          }
          update: {
            args: Prisma.YmqGroupUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>
          }
          deleteMany: {
            args: Prisma.YmqGroupDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqGroupUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqGroupUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>[]
          }
          upsert: {
            args: Prisma.YmqGroupUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupPayload>
          }
          aggregate: {
            args: Prisma.YmqGroupAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqGroup>
          }
          groupBy: {
            args: Prisma.YmqGroupGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqGroupGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqGroupCountArgs<ExtArgs>
            result: $Utils.Optional<YmqGroupCountAggregateOutputType> | number
          }
        }
      }
      YmqMember: {
        payload: Prisma.$YmqMemberPayload<ExtArgs>
        fields: Prisma.YmqMemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqMemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqMemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>
          }
          findFirst: {
            args: Prisma.YmqMemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqMemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>
          }
          findMany: {
            args: Prisma.YmqMemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>[]
          }
          create: {
            args: Prisma.YmqMemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>
          }
          createMany: {
            args: Prisma.YmqMemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqMemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>[]
          }
          delete: {
            args: Prisma.YmqMemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>
          }
          update: {
            args: Prisma.YmqMemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>
          }
          deleteMany: {
            args: Prisma.YmqMemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqMemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqMemberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>[]
          }
          upsert: {
            args: Prisma.YmqMemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqMemberPayload>
          }
          aggregate: {
            args: Prisma.YmqMemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqMember>
          }
          groupBy: {
            args: Prisma.YmqMemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqMemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqMemberCountArgs<ExtArgs>
            result: $Utils.Optional<YmqMemberCountAggregateOutputType> | number
          }
        }
      }
      YmqSetoran: {
        payload: Prisma.$YmqSetoranPayload<ExtArgs>
        fields: Prisma.YmqSetoranFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqSetoranFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqSetoranFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>
          }
          findFirst: {
            args: Prisma.YmqSetoranFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqSetoranFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>
          }
          findMany: {
            args: Prisma.YmqSetoranFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>[]
          }
          create: {
            args: Prisma.YmqSetoranCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>
          }
          createMany: {
            args: Prisma.YmqSetoranCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqSetoranCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>[]
          }
          delete: {
            args: Prisma.YmqSetoranDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>
          }
          update: {
            args: Prisma.YmqSetoranUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>
          }
          deleteMany: {
            args: Prisma.YmqSetoranDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqSetoranUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqSetoranUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>[]
          }
          upsert: {
            args: Prisma.YmqSetoranUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSetoranPayload>
          }
          aggregate: {
            args: Prisma.YmqSetoranAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqSetoran>
          }
          groupBy: {
            args: Prisma.YmqSetoranGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqSetoranGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqSetoranCountArgs<ExtArgs>
            result: $Utils.Optional<YmqSetoranCountAggregateOutputType> | number
          }
        }
      }
      YmqTarget: {
        payload: Prisma.$YmqTargetPayload<ExtArgs>
        fields: Prisma.YmqTargetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqTargetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqTargetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>
          }
          findFirst: {
            args: Prisma.YmqTargetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqTargetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>
          }
          findMany: {
            args: Prisma.YmqTargetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>[]
          }
          create: {
            args: Prisma.YmqTargetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>
          }
          createMany: {
            args: Prisma.YmqTargetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqTargetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>[]
          }
          delete: {
            args: Prisma.YmqTargetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>
          }
          update: {
            args: Prisma.YmqTargetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>
          }
          deleteMany: {
            args: Prisma.YmqTargetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqTargetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqTargetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>[]
          }
          upsert: {
            args: Prisma.YmqTargetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqTargetPayload>
          }
          aggregate: {
            args: Prisma.YmqTargetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqTarget>
          }
          groupBy: {
            args: Prisma.YmqTargetGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqTargetGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqTargetCountArgs<ExtArgs>
            result: $Utils.Optional<YmqTargetCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    ymqGroup?: YmqGroupOmit
    ymqMember?: YmqMemberOmit
    ymqSetoran?: YmqSetoranOmit
    ymqTarget?: YmqTargetOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    groupsAsMusyrif: number
    memberships: number
    setoranList: number
    verifiedSetorans: number
    targets: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    groupsAsMusyrif?: boolean | UserCountOutputTypeCountGroupsAsMusyrifArgs
    memberships?: boolean | UserCountOutputTypeCountMembershipsArgs
    setoranList?: boolean | UserCountOutputTypeCountSetoranListArgs
    verifiedSetorans?: boolean | UserCountOutputTypeCountVerifiedSetoransArgs
    targets?: boolean | UserCountOutputTypeCountTargetsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountGroupsAsMusyrifArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqGroupWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqMemberWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSetoranListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqSetoranWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountVerifiedSetoransArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqSetoranWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTargetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqTargetWhereInput
  }


  /**
   * Count Type YmqGroupCountOutputType
   */

  export type YmqGroupCountOutputType = {
    members: number
  }

  export type YmqGroupCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | YmqGroupCountOutputTypeCountMembersArgs
  }

  // Custom InputTypes
  /**
   * YmqGroupCountOutputType without action
   */
  export type YmqGroupCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupCountOutputType
     */
    select?: YmqGroupCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * YmqGroupCountOutputType without action
   */
  export type YmqGroupCountOutputTypeCountMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqMemberWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    fullName: string | null
    username: string | null
    email: string | null
    phone: string | null
    avatarUrl: string | null
    unitName: string | null
    isActive: boolean | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    fullName: string | null
    username: string | null
    email: string | null
    phone: string | null
    avatarUrl: string | null
    unitName: string | null
    isActive: boolean | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    fullName: number
    username: number
    email: number
    phone: number
    avatarUrl: number
    unitName: number
    isActive: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    fullName?: true
    username?: true
    email?: true
    phone?: true
    avatarUrl?: true
    unitName?: true
    isActive?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    fullName?: true
    username?: true
    email?: true
    phone?: true
    avatarUrl?: true
    unitName?: true
    isActive?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    fullName?: true
    username?: true
    email?: true
    phone?: true
    avatarUrl?: true
    unitName?: true
    isActive?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    fullName: string
    username: string | null
    email: string
    phone: string | null
    avatarUrl: string | null
    unitName: string | null
    isActive: boolean
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    username?: boolean
    email?: boolean
    phone?: boolean
    avatarUrl?: boolean
    unitName?: boolean
    isActive?: boolean
    createdAt?: boolean
    groupsAsMusyrif?: boolean | User$groupsAsMusyrifArgs<ExtArgs>
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    setoranList?: boolean | User$setoranListArgs<ExtArgs>
    verifiedSetorans?: boolean | User$verifiedSetoransArgs<ExtArgs>
    targets?: boolean | User$targetsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    username?: boolean
    email?: boolean
    phone?: boolean
    avatarUrl?: boolean
    unitName?: boolean
    isActive?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    username?: boolean
    email?: boolean
    phone?: boolean
    avatarUrl?: boolean
    unitName?: boolean
    isActive?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    fullName?: boolean
    username?: boolean
    email?: boolean
    phone?: boolean
    avatarUrl?: boolean
    unitName?: boolean
    isActive?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fullName" | "username" | "email" | "phone" | "avatarUrl" | "unitName" | "isActive" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    groupsAsMusyrif?: boolean | User$groupsAsMusyrifArgs<ExtArgs>
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    setoranList?: boolean | User$setoranListArgs<ExtArgs>
    verifiedSetorans?: boolean | User$verifiedSetoransArgs<ExtArgs>
    targets?: boolean | User$targetsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      groupsAsMusyrif: Prisma.$YmqGroupPayload<ExtArgs>[]
      memberships: Prisma.$YmqMemberPayload<ExtArgs>[]
      setoranList: Prisma.$YmqSetoranPayload<ExtArgs>[]
      verifiedSetorans: Prisma.$YmqSetoranPayload<ExtArgs>[]
      targets: Prisma.$YmqTargetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fullName: string
      username: string | null
      email: string
      phone: string | null
      avatarUrl: string | null
      unitName: string | null
      isActive: boolean
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    groupsAsMusyrif<T extends User$groupsAsMusyrifArgs<ExtArgs> = {}>(args?: Subset<T, User$groupsAsMusyrifArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    memberships<T extends User$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, User$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    setoranList<T extends User$setoranListArgs<ExtArgs> = {}>(args?: Subset<T, User$setoranListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    verifiedSetorans<T extends User$verifiedSetoransArgs<ExtArgs> = {}>(args?: Subset<T, User$verifiedSetoransArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    targets<T extends User$targetsArgs<ExtArgs> = {}>(args?: Subset<T, User$targetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly avatarUrl: FieldRef<"User", 'String'>
    readonly unitName: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.groupsAsMusyrif
   */
  export type User$groupsAsMusyrifArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    where?: YmqGroupWhereInput
    orderBy?: YmqGroupOrderByWithRelationInput | YmqGroupOrderByWithRelationInput[]
    cursor?: YmqGroupWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqGroupScalarFieldEnum | YmqGroupScalarFieldEnum[]
  }

  /**
   * User.memberships
   */
  export type User$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    where?: YmqMemberWhereInput
    orderBy?: YmqMemberOrderByWithRelationInput | YmqMemberOrderByWithRelationInput[]
    cursor?: YmqMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqMemberScalarFieldEnum | YmqMemberScalarFieldEnum[]
  }

  /**
   * User.setoranList
   */
  export type User$setoranListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    where?: YmqSetoranWhereInput
    orderBy?: YmqSetoranOrderByWithRelationInput | YmqSetoranOrderByWithRelationInput[]
    cursor?: YmqSetoranWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqSetoranScalarFieldEnum | YmqSetoranScalarFieldEnum[]
  }

  /**
   * User.verifiedSetorans
   */
  export type User$verifiedSetoransArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    where?: YmqSetoranWhereInput
    orderBy?: YmqSetoranOrderByWithRelationInput | YmqSetoranOrderByWithRelationInput[]
    cursor?: YmqSetoranWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqSetoranScalarFieldEnum | YmqSetoranScalarFieldEnum[]
  }

  /**
   * User.targets
   */
  export type User$targetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    where?: YmqTargetWhereInput
    orderBy?: YmqTargetOrderByWithRelationInput | YmqTargetOrderByWithRelationInput[]
    cursor?: YmqTargetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqTargetScalarFieldEnum | YmqTargetScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model YmqGroup
   */

  export type AggregateYmqGroup = {
    _count: YmqGroupCountAggregateOutputType | null
    _min: YmqGroupMinAggregateOutputType | null
    _max: YmqGroupMaxAggregateOutputType | null
  }

  export type YmqGroupMinAggregateOutputType = {
    id: string | null
    name: string | null
    musyrifId: string | null
    description: string | null
    scheduleDay: string | null
    scheduleTime: string | null
    whatsappLink: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqGroupMaxAggregateOutputType = {
    id: string | null
    name: string | null
    musyrifId: string | null
    description: string | null
    scheduleDay: string | null
    scheduleTime: string | null
    whatsappLink: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqGroupCountAggregateOutputType = {
    id: number
    name: number
    musyrifId: number
    description: number
    scheduleDay: number
    scheduleTime: number
    whatsappLink: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type YmqGroupMinAggregateInputType = {
    id?: true
    name?: true
    musyrifId?: true
    description?: true
    scheduleDay?: true
    scheduleTime?: true
    whatsappLink?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqGroupMaxAggregateInputType = {
    id?: true
    name?: true
    musyrifId?: true
    description?: true
    scheduleDay?: true
    scheduleTime?: true
    whatsappLink?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqGroupCountAggregateInputType = {
    id?: true
    name?: true
    musyrifId?: true
    description?: true
    scheduleDay?: true
    scheduleTime?: true
    whatsappLink?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type YmqGroupAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqGroup to aggregate.
     */
    where?: YmqGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroups to fetch.
     */
    orderBy?: YmqGroupOrderByWithRelationInput | YmqGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqGroups
    **/
    _count?: true | YmqGroupCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqGroupMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqGroupMaxAggregateInputType
  }

  export type GetYmqGroupAggregateType<T extends YmqGroupAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqGroup]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqGroup[P]>
      : GetScalarType<T[P], AggregateYmqGroup[P]>
  }




  export type YmqGroupGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqGroupWhereInput
    orderBy?: YmqGroupOrderByWithAggregationInput | YmqGroupOrderByWithAggregationInput[]
    by: YmqGroupScalarFieldEnum[] | YmqGroupScalarFieldEnum
    having?: YmqGroupScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqGroupCountAggregateInputType | true
    _min?: YmqGroupMinAggregateInputType
    _max?: YmqGroupMaxAggregateInputType
  }

  export type YmqGroupGroupByOutputType = {
    id: string
    name: string
    musyrifId: string
    description: string | null
    scheduleDay: string | null
    scheduleTime: string | null
    whatsappLink: string | null
    createdAt: Date
    updatedAt: Date
    _count: YmqGroupCountAggregateOutputType | null
    _min: YmqGroupMinAggregateOutputType | null
    _max: YmqGroupMaxAggregateOutputType | null
  }

  type GetYmqGroupGroupByPayload<T extends YmqGroupGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqGroupGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqGroupGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqGroupGroupByOutputType[P]>
            : GetScalarType<T[P], YmqGroupGroupByOutputType[P]>
        }
      >
    >


  export type YmqGroupSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    musyrifId?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    musyrif?: boolean | UserDefaultArgs<ExtArgs>
    members?: boolean | YmqGroup$membersArgs<ExtArgs>
    _count?: boolean | YmqGroupCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroup"]>

  export type YmqGroupSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    musyrifId?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    musyrif?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroup"]>

  export type YmqGroupSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    musyrifId?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    musyrif?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroup"]>

  export type YmqGroupSelectScalar = {
    id?: boolean
    name?: boolean
    musyrifId?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type YmqGroupOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "musyrifId" | "description" | "scheduleDay" | "scheduleTime" | "whatsappLink" | "createdAt" | "updatedAt", ExtArgs["result"]["ymqGroup"]>
  export type YmqGroupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    musyrif?: boolean | UserDefaultArgs<ExtArgs>
    members?: boolean | YmqGroup$membersArgs<ExtArgs>
    _count?: boolean | YmqGroupCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type YmqGroupIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    musyrif?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type YmqGroupIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    musyrif?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $YmqGroupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqGroup"
    objects: {
      musyrif: Prisma.$UserPayload<ExtArgs>
      members: Prisma.$YmqMemberPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      musyrifId: string
      description: string | null
      scheduleDay: string | null
      scheduleTime: string | null
      whatsappLink: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ymqGroup"]>
    composites: {}
  }

  type YmqGroupGetPayload<S extends boolean | null | undefined | YmqGroupDefaultArgs> = $Result.GetResult<Prisma.$YmqGroupPayload, S>

  type YmqGroupCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqGroupFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqGroupCountAggregateInputType | true
    }

  export interface YmqGroupDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqGroup'], meta: { name: 'YmqGroup' } }
    /**
     * Find zero or one YmqGroup that matches the filter.
     * @param {YmqGroupFindUniqueArgs} args - Arguments to find a YmqGroup
     * @example
     * // Get one YmqGroup
     * const ymqGroup = await prisma.ymqGroup.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqGroupFindUniqueArgs>(args: SelectSubset<T, YmqGroupFindUniqueArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqGroup that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqGroupFindUniqueOrThrowArgs} args - Arguments to find a YmqGroup
     * @example
     * // Get one YmqGroup
     * const ymqGroup = await prisma.ymqGroup.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqGroupFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqGroupFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqGroup that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupFindFirstArgs} args - Arguments to find a YmqGroup
     * @example
     * // Get one YmqGroup
     * const ymqGroup = await prisma.ymqGroup.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqGroupFindFirstArgs>(args?: SelectSubset<T, YmqGroupFindFirstArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqGroup that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupFindFirstOrThrowArgs} args - Arguments to find a YmqGroup
     * @example
     * // Get one YmqGroup
     * const ymqGroup = await prisma.ymqGroup.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqGroupFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqGroupFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqGroups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqGroups
     * const ymqGroups = await prisma.ymqGroup.findMany()
     * 
     * // Get first 10 YmqGroups
     * const ymqGroups = await prisma.ymqGroup.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqGroupWithIdOnly = await prisma.ymqGroup.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqGroupFindManyArgs>(args?: SelectSubset<T, YmqGroupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqGroup.
     * @param {YmqGroupCreateArgs} args - Arguments to create a YmqGroup.
     * @example
     * // Create one YmqGroup
     * const YmqGroup = await prisma.ymqGroup.create({
     *   data: {
     *     // ... data to create a YmqGroup
     *   }
     * })
     * 
     */
    create<T extends YmqGroupCreateArgs>(args: SelectSubset<T, YmqGroupCreateArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqGroups.
     * @param {YmqGroupCreateManyArgs} args - Arguments to create many YmqGroups.
     * @example
     * // Create many YmqGroups
     * const ymqGroup = await prisma.ymqGroup.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqGroupCreateManyArgs>(args?: SelectSubset<T, YmqGroupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqGroups and returns the data saved in the database.
     * @param {YmqGroupCreateManyAndReturnArgs} args - Arguments to create many YmqGroups.
     * @example
     * // Create many YmqGroups
     * const ymqGroup = await prisma.ymqGroup.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqGroups and only return the `id`
     * const ymqGroupWithIdOnly = await prisma.ymqGroup.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqGroupCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqGroupCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqGroup.
     * @param {YmqGroupDeleteArgs} args - Arguments to delete one YmqGroup.
     * @example
     * // Delete one YmqGroup
     * const YmqGroup = await prisma.ymqGroup.delete({
     *   where: {
     *     // ... filter to delete one YmqGroup
     *   }
     * })
     * 
     */
    delete<T extends YmqGroupDeleteArgs>(args: SelectSubset<T, YmqGroupDeleteArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqGroup.
     * @param {YmqGroupUpdateArgs} args - Arguments to update one YmqGroup.
     * @example
     * // Update one YmqGroup
     * const ymqGroup = await prisma.ymqGroup.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqGroupUpdateArgs>(args: SelectSubset<T, YmqGroupUpdateArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqGroups.
     * @param {YmqGroupDeleteManyArgs} args - Arguments to filter YmqGroups to delete.
     * @example
     * // Delete a few YmqGroups
     * const { count } = await prisma.ymqGroup.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqGroupDeleteManyArgs>(args?: SelectSubset<T, YmqGroupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqGroups
     * const ymqGroup = await prisma.ymqGroup.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqGroupUpdateManyArgs>(args: SelectSubset<T, YmqGroupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqGroups and returns the data updated in the database.
     * @param {YmqGroupUpdateManyAndReturnArgs} args - Arguments to update many YmqGroups.
     * @example
     * // Update many YmqGroups
     * const ymqGroup = await prisma.ymqGroup.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqGroups and only return the `id`
     * const ymqGroupWithIdOnly = await prisma.ymqGroup.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends YmqGroupUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqGroupUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqGroup.
     * @param {YmqGroupUpsertArgs} args - Arguments to update or create a YmqGroup.
     * @example
     * // Update or create a YmqGroup
     * const ymqGroup = await prisma.ymqGroup.upsert({
     *   create: {
     *     // ... data to create a YmqGroup
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqGroup we want to update
     *   }
     * })
     */
    upsert<T extends YmqGroupUpsertArgs>(args: SelectSubset<T, YmqGroupUpsertArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupCountArgs} args - Arguments to filter YmqGroups to count.
     * @example
     * // Count the number of YmqGroups
     * const count = await prisma.ymqGroup.count({
     *   where: {
     *     // ... the filter for the YmqGroups we want to count
     *   }
     * })
    **/
    count<T extends YmqGroupCountArgs>(
      args?: Subset<T, YmqGroupCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqGroupCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends YmqGroupAggregateArgs>(args: Subset<T, YmqGroupAggregateArgs>): Prisma.PrismaPromise<GetYmqGroupAggregateType<T>>

    /**
     * Group by YmqGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends YmqGroupGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqGroupGroupByArgs['orderBy'] }
        : { orderBy?: YmqGroupGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, YmqGroupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqGroupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqGroup model
   */
  readonly fields: YmqGroupFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqGroup.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqGroupClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    musyrif<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    members<T extends YmqGroup$membersArgs<ExtArgs> = {}>(args?: Subset<T, YmqGroup$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the YmqGroup model
   */
  interface YmqGroupFieldRefs {
    readonly id: FieldRef<"YmqGroup", 'String'>
    readonly name: FieldRef<"YmqGroup", 'String'>
    readonly musyrifId: FieldRef<"YmqGroup", 'String'>
    readonly description: FieldRef<"YmqGroup", 'String'>
    readonly scheduleDay: FieldRef<"YmqGroup", 'String'>
    readonly scheduleTime: FieldRef<"YmqGroup", 'String'>
    readonly whatsappLink: FieldRef<"YmqGroup", 'String'>
    readonly createdAt: FieldRef<"YmqGroup", 'DateTime'>
    readonly updatedAt: FieldRef<"YmqGroup", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqGroup findUnique
   */
  export type YmqGroupFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroup to fetch.
     */
    where: YmqGroupWhereUniqueInput
  }

  /**
   * YmqGroup findUniqueOrThrow
   */
  export type YmqGroupFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroup to fetch.
     */
    where: YmqGroupWhereUniqueInput
  }

  /**
   * YmqGroup findFirst
   */
  export type YmqGroupFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroup to fetch.
     */
    where?: YmqGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroups to fetch.
     */
    orderBy?: YmqGroupOrderByWithRelationInput | YmqGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqGroups.
     */
    cursor?: YmqGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqGroups.
     */
    distinct?: YmqGroupScalarFieldEnum | YmqGroupScalarFieldEnum[]
  }

  /**
   * YmqGroup findFirstOrThrow
   */
  export type YmqGroupFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroup to fetch.
     */
    where?: YmqGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroups to fetch.
     */
    orderBy?: YmqGroupOrderByWithRelationInput | YmqGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqGroups.
     */
    cursor?: YmqGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqGroups.
     */
    distinct?: YmqGroupScalarFieldEnum | YmqGroupScalarFieldEnum[]
  }

  /**
   * YmqGroup findMany
   */
  export type YmqGroupFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroups to fetch.
     */
    where?: YmqGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroups to fetch.
     */
    orderBy?: YmqGroupOrderByWithRelationInput | YmqGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqGroups.
     */
    cursor?: YmqGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroups.
     */
    skip?: number
    distinct?: YmqGroupScalarFieldEnum | YmqGroupScalarFieldEnum[]
  }

  /**
   * YmqGroup create
   */
  export type YmqGroupCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqGroup.
     */
    data: XOR<YmqGroupCreateInput, YmqGroupUncheckedCreateInput>
  }

  /**
   * YmqGroup createMany
   */
  export type YmqGroupCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqGroups.
     */
    data: YmqGroupCreateManyInput | YmqGroupCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqGroup createManyAndReturn
   */
  export type YmqGroupCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * The data used to create many YmqGroups.
     */
    data: YmqGroupCreateManyInput | YmqGroupCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqGroup update
   */
  export type YmqGroupUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqGroup.
     */
    data: XOR<YmqGroupUpdateInput, YmqGroupUncheckedUpdateInput>
    /**
     * Choose, which YmqGroup to update.
     */
    where: YmqGroupWhereUniqueInput
  }

  /**
   * YmqGroup updateMany
   */
  export type YmqGroupUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqGroups.
     */
    data: XOR<YmqGroupUpdateManyMutationInput, YmqGroupUncheckedUpdateManyInput>
    /**
     * Filter which YmqGroups to update
     */
    where?: YmqGroupWhereInput
    /**
     * Limit how many YmqGroups to update.
     */
    limit?: number
  }

  /**
   * YmqGroup updateManyAndReturn
   */
  export type YmqGroupUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * The data used to update YmqGroups.
     */
    data: XOR<YmqGroupUpdateManyMutationInput, YmqGroupUncheckedUpdateManyInput>
    /**
     * Filter which YmqGroups to update
     */
    where?: YmqGroupWhereInput
    /**
     * Limit how many YmqGroups to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqGroup upsert
   */
  export type YmqGroupUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqGroup to update in case it exists.
     */
    where: YmqGroupWhereUniqueInput
    /**
     * In case the YmqGroup found by the `where` argument doesn't exist, create a new YmqGroup with this data.
     */
    create: XOR<YmqGroupCreateInput, YmqGroupUncheckedCreateInput>
    /**
     * In case the YmqGroup was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqGroupUpdateInput, YmqGroupUncheckedUpdateInput>
  }

  /**
   * YmqGroup delete
   */
  export type YmqGroupDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
    /**
     * Filter which YmqGroup to delete.
     */
    where: YmqGroupWhereUniqueInput
  }

  /**
   * YmqGroup deleteMany
   */
  export type YmqGroupDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqGroups to delete
     */
    where?: YmqGroupWhereInput
    /**
     * Limit how many YmqGroups to delete.
     */
    limit?: number
  }

  /**
   * YmqGroup.members
   */
  export type YmqGroup$membersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    where?: YmqMemberWhereInput
    orderBy?: YmqMemberOrderByWithRelationInput | YmqMemberOrderByWithRelationInput[]
    cursor?: YmqMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqMemberScalarFieldEnum | YmqMemberScalarFieldEnum[]
  }

  /**
   * YmqGroup without action
   */
  export type YmqGroupDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroup
     */
    select?: YmqGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroup
     */
    omit?: YmqGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupInclude<ExtArgs> | null
  }


  /**
   * Model YmqMember
   */

  export type AggregateYmqMember = {
    _count: YmqMemberCountAggregateOutputType | null
    _min: YmqMemberMinAggregateOutputType | null
    _max: YmqMemberMaxAggregateOutputType | null
  }

  export type YmqMemberMinAggregateOutputType = {
    id: string | null
    groupId: string | null
    userId: string | null
    joinedAt: Date | null
  }

  export type YmqMemberMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    userId: string | null
    joinedAt: Date | null
  }

  export type YmqMemberCountAggregateOutputType = {
    id: number
    groupId: number
    userId: number
    joinedAt: number
    _all: number
  }


  export type YmqMemberMinAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    joinedAt?: true
  }

  export type YmqMemberMaxAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    joinedAt?: true
  }

  export type YmqMemberCountAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    joinedAt?: true
    _all?: true
  }

  export type YmqMemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqMember to aggregate.
     */
    where?: YmqMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqMembers to fetch.
     */
    orderBy?: YmqMemberOrderByWithRelationInput | YmqMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqMembers
    **/
    _count?: true | YmqMemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqMemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqMemberMaxAggregateInputType
  }

  export type GetYmqMemberAggregateType<T extends YmqMemberAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqMember[P]>
      : GetScalarType<T[P], AggregateYmqMember[P]>
  }




  export type YmqMemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqMemberWhereInput
    orderBy?: YmqMemberOrderByWithAggregationInput | YmqMemberOrderByWithAggregationInput[]
    by: YmqMemberScalarFieldEnum[] | YmqMemberScalarFieldEnum
    having?: YmqMemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqMemberCountAggregateInputType | true
    _min?: YmqMemberMinAggregateInputType
    _max?: YmqMemberMaxAggregateInputType
  }

  export type YmqMemberGroupByOutputType = {
    id: string
    groupId: string
    userId: string
    joinedAt: Date
    _count: YmqMemberCountAggregateOutputType | null
    _min: YmqMemberMinAggregateOutputType | null
    _max: YmqMemberMaxAggregateOutputType | null
  }

  type GetYmqMemberGroupByPayload<T extends YmqMemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqMemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqMemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqMemberGroupByOutputType[P]>
            : GetScalarType<T[P], YmqMemberGroupByOutputType[P]>
        }
      >
    >


  export type YmqMemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    joinedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqMember"]>

  export type YmqMemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    joinedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqMember"]>

  export type YmqMemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    joinedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqMember"]>

  export type YmqMemberSelectScalar = {
    id?: boolean
    groupId?: boolean
    userId?: boolean
    joinedAt?: boolean
  }

  export type YmqMemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "userId" | "joinedAt", ExtArgs["result"]["ymqMember"]>
  export type YmqMemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type YmqMemberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type YmqMemberIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $YmqMemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqMember"
    objects: {
      group: Prisma.$YmqGroupPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      userId: string
      joinedAt: Date
    }, ExtArgs["result"]["ymqMember"]>
    composites: {}
  }

  type YmqMemberGetPayload<S extends boolean | null | undefined | YmqMemberDefaultArgs> = $Result.GetResult<Prisma.$YmqMemberPayload, S>

  type YmqMemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqMemberCountAggregateInputType | true
    }

  export interface YmqMemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqMember'], meta: { name: 'YmqMember' } }
    /**
     * Find zero or one YmqMember that matches the filter.
     * @param {YmqMemberFindUniqueArgs} args - Arguments to find a YmqMember
     * @example
     * // Get one YmqMember
     * const ymqMember = await prisma.ymqMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqMemberFindUniqueArgs>(args: SelectSubset<T, YmqMemberFindUniqueArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqMemberFindUniqueOrThrowArgs} args - Arguments to find a YmqMember
     * @example
     * // Get one YmqMember
     * const ymqMember = await prisma.ymqMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqMemberFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqMemberFindFirstArgs} args - Arguments to find a YmqMember
     * @example
     * // Get one YmqMember
     * const ymqMember = await prisma.ymqMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqMemberFindFirstArgs>(args?: SelectSubset<T, YmqMemberFindFirstArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqMemberFindFirstOrThrowArgs} args - Arguments to find a YmqMember
     * @example
     * // Get one YmqMember
     * const ymqMember = await prisma.ymqMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqMemberFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqMembers
     * const ymqMembers = await prisma.ymqMember.findMany()
     * 
     * // Get first 10 YmqMembers
     * const ymqMembers = await prisma.ymqMember.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqMemberWithIdOnly = await prisma.ymqMember.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqMemberFindManyArgs>(args?: SelectSubset<T, YmqMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqMember.
     * @param {YmqMemberCreateArgs} args - Arguments to create a YmqMember.
     * @example
     * // Create one YmqMember
     * const YmqMember = await prisma.ymqMember.create({
     *   data: {
     *     // ... data to create a YmqMember
     *   }
     * })
     * 
     */
    create<T extends YmqMemberCreateArgs>(args: SelectSubset<T, YmqMemberCreateArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqMembers.
     * @param {YmqMemberCreateManyArgs} args - Arguments to create many YmqMembers.
     * @example
     * // Create many YmqMembers
     * const ymqMember = await prisma.ymqMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqMemberCreateManyArgs>(args?: SelectSubset<T, YmqMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqMembers and returns the data saved in the database.
     * @param {YmqMemberCreateManyAndReturnArgs} args - Arguments to create many YmqMembers.
     * @example
     * // Create many YmqMembers
     * const ymqMember = await prisma.ymqMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqMembers and only return the `id`
     * const ymqMemberWithIdOnly = await prisma.ymqMember.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqMemberCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqMember.
     * @param {YmqMemberDeleteArgs} args - Arguments to delete one YmqMember.
     * @example
     * // Delete one YmqMember
     * const YmqMember = await prisma.ymqMember.delete({
     *   where: {
     *     // ... filter to delete one YmqMember
     *   }
     * })
     * 
     */
    delete<T extends YmqMemberDeleteArgs>(args: SelectSubset<T, YmqMemberDeleteArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqMember.
     * @param {YmqMemberUpdateArgs} args - Arguments to update one YmqMember.
     * @example
     * // Update one YmqMember
     * const ymqMember = await prisma.ymqMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqMemberUpdateArgs>(args: SelectSubset<T, YmqMemberUpdateArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqMembers.
     * @param {YmqMemberDeleteManyArgs} args - Arguments to filter YmqMembers to delete.
     * @example
     * // Delete a few YmqMembers
     * const { count } = await prisma.ymqMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqMemberDeleteManyArgs>(args?: SelectSubset<T, YmqMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqMembers
     * const ymqMember = await prisma.ymqMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqMemberUpdateManyArgs>(args: SelectSubset<T, YmqMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqMembers and returns the data updated in the database.
     * @param {YmqMemberUpdateManyAndReturnArgs} args - Arguments to update many YmqMembers.
     * @example
     * // Update many YmqMembers
     * const ymqMember = await prisma.ymqMember.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqMembers and only return the `id`
     * const ymqMemberWithIdOnly = await prisma.ymqMember.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends YmqMemberUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqMemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqMember.
     * @param {YmqMemberUpsertArgs} args - Arguments to update or create a YmqMember.
     * @example
     * // Update or create a YmqMember
     * const ymqMember = await prisma.ymqMember.upsert({
     *   create: {
     *     // ... data to create a YmqMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqMember we want to update
     *   }
     * })
     */
    upsert<T extends YmqMemberUpsertArgs>(args: SelectSubset<T, YmqMemberUpsertArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqMemberCountArgs} args - Arguments to filter YmqMembers to count.
     * @example
     * // Count the number of YmqMembers
     * const count = await prisma.ymqMember.count({
     *   where: {
     *     // ... the filter for the YmqMembers we want to count
     *   }
     * })
    **/
    count<T extends YmqMemberCountArgs>(
      args?: Subset<T, YmqMemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqMemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends YmqMemberAggregateArgs>(args: Subset<T, YmqMemberAggregateArgs>): Prisma.PrismaPromise<GetYmqMemberAggregateType<T>>

    /**
     * Group by YmqMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqMemberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends YmqMemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqMemberGroupByArgs['orderBy'] }
        : { orderBy?: YmqMemberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, YmqMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqMember model
   */
  readonly fields: YmqMemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqMember.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqMemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    group<T extends YmqGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, YmqGroupDefaultArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the YmqMember model
   */
  interface YmqMemberFieldRefs {
    readonly id: FieldRef<"YmqMember", 'String'>
    readonly groupId: FieldRef<"YmqMember", 'String'>
    readonly userId: FieldRef<"YmqMember", 'String'>
    readonly joinedAt: FieldRef<"YmqMember", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqMember findUnique
   */
  export type YmqMemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * Filter, which YmqMember to fetch.
     */
    where: YmqMemberWhereUniqueInput
  }

  /**
   * YmqMember findUniqueOrThrow
   */
  export type YmqMemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * Filter, which YmqMember to fetch.
     */
    where: YmqMemberWhereUniqueInput
  }

  /**
   * YmqMember findFirst
   */
  export type YmqMemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * Filter, which YmqMember to fetch.
     */
    where?: YmqMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqMembers to fetch.
     */
    orderBy?: YmqMemberOrderByWithRelationInput | YmqMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqMembers.
     */
    cursor?: YmqMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqMembers.
     */
    distinct?: YmqMemberScalarFieldEnum | YmqMemberScalarFieldEnum[]
  }

  /**
   * YmqMember findFirstOrThrow
   */
  export type YmqMemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * Filter, which YmqMember to fetch.
     */
    where?: YmqMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqMembers to fetch.
     */
    orderBy?: YmqMemberOrderByWithRelationInput | YmqMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqMembers.
     */
    cursor?: YmqMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqMembers.
     */
    distinct?: YmqMemberScalarFieldEnum | YmqMemberScalarFieldEnum[]
  }

  /**
   * YmqMember findMany
   */
  export type YmqMemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * Filter, which YmqMembers to fetch.
     */
    where?: YmqMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqMembers to fetch.
     */
    orderBy?: YmqMemberOrderByWithRelationInput | YmqMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqMembers.
     */
    cursor?: YmqMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqMembers.
     */
    skip?: number
    distinct?: YmqMemberScalarFieldEnum | YmqMemberScalarFieldEnum[]
  }

  /**
   * YmqMember create
   */
  export type YmqMemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqMember.
     */
    data: XOR<YmqMemberCreateInput, YmqMemberUncheckedCreateInput>
  }

  /**
   * YmqMember createMany
   */
  export type YmqMemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqMembers.
     */
    data: YmqMemberCreateManyInput | YmqMemberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqMember createManyAndReturn
   */
  export type YmqMemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * The data used to create many YmqMembers.
     */
    data: YmqMemberCreateManyInput | YmqMemberCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqMember update
   */
  export type YmqMemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqMember.
     */
    data: XOR<YmqMemberUpdateInput, YmqMemberUncheckedUpdateInput>
    /**
     * Choose, which YmqMember to update.
     */
    where: YmqMemberWhereUniqueInput
  }

  /**
   * YmqMember updateMany
   */
  export type YmqMemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqMembers.
     */
    data: XOR<YmqMemberUpdateManyMutationInput, YmqMemberUncheckedUpdateManyInput>
    /**
     * Filter which YmqMembers to update
     */
    where?: YmqMemberWhereInput
    /**
     * Limit how many YmqMembers to update.
     */
    limit?: number
  }

  /**
   * YmqMember updateManyAndReturn
   */
  export type YmqMemberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * The data used to update YmqMembers.
     */
    data: XOR<YmqMemberUpdateManyMutationInput, YmqMemberUncheckedUpdateManyInput>
    /**
     * Filter which YmqMembers to update
     */
    where?: YmqMemberWhereInput
    /**
     * Limit how many YmqMembers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqMember upsert
   */
  export type YmqMemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqMember to update in case it exists.
     */
    where: YmqMemberWhereUniqueInput
    /**
     * In case the YmqMember found by the `where` argument doesn't exist, create a new YmqMember with this data.
     */
    create: XOR<YmqMemberCreateInput, YmqMemberUncheckedCreateInput>
    /**
     * In case the YmqMember was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqMemberUpdateInput, YmqMemberUncheckedUpdateInput>
  }

  /**
   * YmqMember delete
   */
  export type YmqMemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
    /**
     * Filter which YmqMember to delete.
     */
    where: YmqMemberWhereUniqueInput
  }

  /**
   * YmqMember deleteMany
   */
  export type YmqMemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqMembers to delete
     */
    where?: YmqMemberWhereInput
    /**
     * Limit how many YmqMembers to delete.
     */
    limit?: number
  }

  /**
   * YmqMember without action
   */
  export type YmqMemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMember
     */
    select?: YmqMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqMember
     */
    omit?: YmqMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqMemberInclude<ExtArgs> | null
  }


  /**
   * Model YmqSetoran
   */

  export type AggregateYmqSetoran = {
    _count: YmqSetoranCountAggregateOutputType | null
    _avg: YmqSetoranAvgAggregateOutputType | null
    _sum: YmqSetoranSumAggregateOutputType | null
    _min: YmqSetoranMinAggregateOutputType | null
    _max: YmqSetoranMaxAggregateOutputType | null
  }

  export type YmqSetoranAvgAggregateOutputType = {
    ayatMulai: number | null
    ayatSelesai: number | null
    jumlahHalaman: number | null
  }

  export type YmqSetoranSumAggregateOutputType = {
    ayatMulai: number | null
    ayatSelesai: number | null
    jumlahHalaman: number | null
  }

  export type YmqSetoranMinAggregateOutputType = {
    id: string | null
    userId: string | null
    date: Date | null
    jenis: $Enums.SetoranType | null
    surahMulai: string | null
    ayatMulai: number | null
    surahSelesai: string | null
    ayatSelesai: number | null
    jumlahHalaman: number | null
    catatan: string | null
    statusVerifikasi: $Enums.VerificationStatus | null
    catatanMusyrif: string | null
    verifiedById: string | null
    verifiedAt: Date | null
    createdAt: Date | null
  }

  export type YmqSetoranMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    date: Date | null
    jenis: $Enums.SetoranType | null
    surahMulai: string | null
    ayatMulai: number | null
    surahSelesai: string | null
    ayatSelesai: number | null
    jumlahHalaman: number | null
    catatan: string | null
    statusVerifikasi: $Enums.VerificationStatus | null
    catatanMusyrif: string | null
    verifiedById: string | null
    verifiedAt: Date | null
    createdAt: Date | null
  }

  export type YmqSetoranCountAggregateOutputType = {
    id: number
    userId: number
    date: number
    jenis: number
    surahMulai: number
    ayatMulai: number
    surahSelesai: number
    ayatSelesai: number
    jumlahHalaman: number
    catatan: number
    statusVerifikasi: number
    catatanMusyrif: number
    verifiedById: number
    verifiedAt: number
    createdAt: number
    _all: number
  }


  export type YmqSetoranAvgAggregateInputType = {
    ayatMulai?: true
    ayatSelesai?: true
    jumlahHalaman?: true
  }

  export type YmqSetoranSumAggregateInputType = {
    ayatMulai?: true
    ayatSelesai?: true
    jumlahHalaman?: true
  }

  export type YmqSetoranMinAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    jenis?: true
    surahMulai?: true
    ayatMulai?: true
    surahSelesai?: true
    ayatSelesai?: true
    jumlahHalaman?: true
    catatan?: true
    statusVerifikasi?: true
    catatanMusyrif?: true
    verifiedById?: true
    verifiedAt?: true
    createdAt?: true
  }

  export type YmqSetoranMaxAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    jenis?: true
    surahMulai?: true
    ayatMulai?: true
    surahSelesai?: true
    ayatSelesai?: true
    jumlahHalaman?: true
    catatan?: true
    statusVerifikasi?: true
    catatanMusyrif?: true
    verifiedById?: true
    verifiedAt?: true
    createdAt?: true
  }

  export type YmqSetoranCountAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    jenis?: true
    surahMulai?: true
    ayatMulai?: true
    surahSelesai?: true
    ayatSelesai?: true
    jumlahHalaman?: true
    catatan?: true
    statusVerifikasi?: true
    catatanMusyrif?: true
    verifiedById?: true
    verifiedAt?: true
    createdAt?: true
    _all?: true
  }

  export type YmqSetoranAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqSetoran to aggregate.
     */
    where?: YmqSetoranWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSetorans to fetch.
     */
    orderBy?: YmqSetoranOrderByWithRelationInput | YmqSetoranOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqSetoranWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSetorans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSetorans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqSetorans
    **/
    _count?: true | YmqSetoranCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: YmqSetoranAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: YmqSetoranSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqSetoranMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqSetoranMaxAggregateInputType
  }

  export type GetYmqSetoranAggregateType<T extends YmqSetoranAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqSetoran]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqSetoran[P]>
      : GetScalarType<T[P], AggregateYmqSetoran[P]>
  }




  export type YmqSetoranGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqSetoranWhereInput
    orderBy?: YmqSetoranOrderByWithAggregationInput | YmqSetoranOrderByWithAggregationInput[]
    by: YmqSetoranScalarFieldEnum[] | YmqSetoranScalarFieldEnum
    having?: YmqSetoranScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqSetoranCountAggregateInputType | true
    _avg?: YmqSetoranAvgAggregateInputType
    _sum?: YmqSetoranSumAggregateInputType
    _min?: YmqSetoranMinAggregateInputType
    _max?: YmqSetoranMaxAggregateInputType
  }

  export type YmqSetoranGroupByOutputType = {
    id: string
    userId: string
    date: Date
    jenis: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman: number
    catatan: string | null
    statusVerifikasi: $Enums.VerificationStatus
    catatanMusyrif: string | null
    verifiedById: string | null
    verifiedAt: Date | null
    createdAt: Date
    _count: YmqSetoranCountAggregateOutputType | null
    _avg: YmqSetoranAvgAggregateOutputType | null
    _sum: YmqSetoranSumAggregateOutputType | null
    _min: YmqSetoranMinAggregateOutputType | null
    _max: YmqSetoranMaxAggregateOutputType | null
  }

  type GetYmqSetoranGroupByPayload<T extends YmqSetoranGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqSetoranGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqSetoranGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqSetoranGroupByOutputType[P]>
            : GetScalarType<T[P], YmqSetoranGroupByOutputType[P]>
        }
      >
    >


  export type YmqSetoranSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    jenis?: boolean
    surahMulai?: boolean
    ayatMulai?: boolean
    surahSelesai?: boolean
    ayatSelesai?: boolean
    jumlahHalaman?: boolean
    catatan?: boolean
    statusVerifikasi?: boolean
    catatanMusyrif?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | YmqSetoran$verifiedByArgs<ExtArgs>
  }, ExtArgs["result"]["ymqSetoran"]>

  export type YmqSetoranSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    jenis?: boolean
    surahMulai?: boolean
    ayatMulai?: boolean
    surahSelesai?: boolean
    ayatSelesai?: boolean
    jumlahHalaman?: boolean
    catatan?: boolean
    statusVerifikasi?: boolean
    catatanMusyrif?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | YmqSetoran$verifiedByArgs<ExtArgs>
  }, ExtArgs["result"]["ymqSetoran"]>

  export type YmqSetoranSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    jenis?: boolean
    surahMulai?: boolean
    ayatMulai?: boolean
    surahSelesai?: boolean
    ayatSelesai?: boolean
    jumlahHalaman?: boolean
    catatan?: boolean
    statusVerifikasi?: boolean
    catatanMusyrif?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | YmqSetoran$verifiedByArgs<ExtArgs>
  }, ExtArgs["result"]["ymqSetoran"]>

  export type YmqSetoranSelectScalar = {
    id?: boolean
    userId?: boolean
    date?: boolean
    jenis?: boolean
    surahMulai?: boolean
    ayatMulai?: boolean
    surahSelesai?: boolean
    ayatSelesai?: boolean
    jumlahHalaman?: boolean
    catatan?: boolean
    statusVerifikasi?: boolean
    catatanMusyrif?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
  }

  export type YmqSetoranOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "date" | "jenis" | "surahMulai" | "ayatMulai" | "surahSelesai" | "ayatSelesai" | "jumlahHalaman" | "catatan" | "statusVerifikasi" | "catatanMusyrif" | "verifiedById" | "verifiedAt" | "createdAt", ExtArgs["result"]["ymqSetoran"]>
  export type YmqSetoranInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | YmqSetoran$verifiedByArgs<ExtArgs>
  }
  export type YmqSetoranIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | YmqSetoran$verifiedByArgs<ExtArgs>
  }
  export type YmqSetoranIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | YmqSetoran$verifiedByArgs<ExtArgs>
  }

  export type $YmqSetoranPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqSetoran"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      verifiedBy: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      date: Date
      jenis: $Enums.SetoranType
      surahMulai: string
      ayatMulai: number
      surahSelesai: string
      ayatSelesai: number
      jumlahHalaman: number
      catatan: string | null
      statusVerifikasi: $Enums.VerificationStatus
      catatanMusyrif: string | null
      verifiedById: string | null
      verifiedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["ymqSetoran"]>
    composites: {}
  }

  type YmqSetoranGetPayload<S extends boolean | null | undefined | YmqSetoranDefaultArgs> = $Result.GetResult<Prisma.$YmqSetoranPayload, S>

  type YmqSetoranCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqSetoranFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqSetoranCountAggregateInputType | true
    }

  export interface YmqSetoranDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqSetoran'], meta: { name: 'YmqSetoran' } }
    /**
     * Find zero or one YmqSetoran that matches the filter.
     * @param {YmqSetoranFindUniqueArgs} args - Arguments to find a YmqSetoran
     * @example
     * // Get one YmqSetoran
     * const ymqSetoran = await prisma.ymqSetoran.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqSetoranFindUniqueArgs>(args: SelectSubset<T, YmqSetoranFindUniqueArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqSetoran that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqSetoranFindUniqueOrThrowArgs} args - Arguments to find a YmqSetoran
     * @example
     * // Get one YmqSetoran
     * const ymqSetoran = await prisma.ymqSetoran.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqSetoranFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqSetoranFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqSetoran that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSetoranFindFirstArgs} args - Arguments to find a YmqSetoran
     * @example
     * // Get one YmqSetoran
     * const ymqSetoran = await prisma.ymqSetoran.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqSetoranFindFirstArgs>(args?: SelectSubset<T, YmqSetoranFindFirstArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqSetoran that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSetoranFindFirstOrThrowArgs} args - Arguments to find a YmqSetoran
     * @example
     * // Get one YmqSetoran
     * const ymqSetoran = await prisma.ymqSetoran.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqSetoranFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqSetoranFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqSetorans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSetoranFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqSetorans
     * const ymqSetorans = await prisma.ymqSetoran.findMany()
     * 
     * // Get first 10 YmqSetorans
     * const ymqSetorans = await prisma.ymqSetoran.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqSetoranWithIdOnly = await prisma.ymqSetoran.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqSetoranFindManyArgs>(args?: SelectSubset<T, YmqSetoranFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqSetoran.
     * @param {YmqSetoranCreateArgs} args - Arguments to create a YmqSetoran.
     * @example
     * // Create one YmqSetoran
     * const YmqSetoran = await prisma.ymqSetoran.create({
     *   data: {
     *     // ... data to create a YmqSetoran
     *   }
     * })
     * 
     */
    create<T extends YmqSetoranCreateArgs>(args: SelectSubset<T, YmqSetoranCreateArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqSetorans.
     * @param {YmqSetoranCreateManyArgs} args - Arguments to create many YmqSetorans.
     * @example
     * // Create many YmqSetorans
     * const ymqSetoran = await prisma.ymqSetoran.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqSetoranCreateManyArgs>(args?: SelectSubset<T, YmqSetoranCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqSetorans and returns the data saved in the database.
     * @param {YmqSetoranCreateManyAndReturnArgs} args - Arguments to create many YmqSetorans.
     * @example
     * // Create many YmqSetorans
     * const ymqSetoran = await prisma.ymqSetoran.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqSetorans and only return the `id`
     * const ymqSetoranWithIdOnly = await prisma.ymqSetoran.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqSetoranCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqSetoranCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqSetoran.
     * @param {YmqSetoranDeleteArgs} args - Arguments to delete one YmqSetoran.
     * @example
     * // Delete one YmqSetoran
     * const YmqSetoran = await prisma.ymqSetoran.delete({
     *   where: {
     *     // ... filter to delete one YmqSetoran
     *   }
     * })
     * 
     */
    delete<T extends YmqSetoranDeleteArgs>(args: SelectSubset<T, YmqSetoranDeleteArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqSetoran.
     * @param {YmqSetoranUpdateArgs} args - Arguments to update one YmqSetoran.
     * @example
     * // Update one YmqSetoran
     * const ymqSetoran = await prisma.ymqSetoran.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqSetoranUpdateArgs>(args: SelectSubset<T, YmqSetoranUpdateArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqSetorans.
     * @param {YmqSetoranDeleteManyArgs} args - Arguments to filter YmqSetorans to delete.
     * @example
     * // Delete a few YmqSetorans
     * const { count } = await prisma.ymqSetoran.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqSetoranDeleteManyArgs>(args?: SelectSubset<T, YmqSetoranDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqSetorans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSetoranUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqSetorans
     * const ymqSetoran = await prisma.ymqSetoran.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqSetoranUpdateManyArgs>(args: SelectSubset<T, YmqSetoranUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqSetorans and returns the data updated in the database.
     * @param {YmqSetoranUpdateManyAndReturnArgs} args - Arguments to update many YmqSetorans.
     * @example
     * // Update many YmqSetorans
     * const ymqSetoran = await prisma.ymqSetoran.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqSetorans and only return the `id`
     * const ymqSetoranWithIdOnly = await prisma.ymqSetoran.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends YmqSetoranUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqSetoranUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqSetoran.
     * @param {YmqSetoranUpsertArgs} args - Arguments to update or create a YmqSetoran.
     * @example
     * // Update or create a YmqSetoran
     * const ymqSetoran = await prisma.ymqSetoran.upsert({
     *   create: {
     *     // ... data to create a YmqSetoran
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqSetoran we want to update
     *   }
     * })
     */
    upsert<T extends YmqSetoranUpsertArgs>(args: SelectSubset<T, YmqSetoranUpsertArgs<ExtArgs>>): Prisma__YmqSetoranClient<$Result.GetResult<Prisma.$YmqSetoranPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqSetorans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSetoranCountArgs} args - Arguments to filter YmqSetorans to count.
     * @example
     * // Count the number of YmqSetorans
     * const count = await prisma.ymqSetoran.count({
     *   where: {
     *     // ... the filter for the YmqSetorans we want to count
     *   }
     * })
    **/
    count<T extends YmqSetoranCountArgs>(
      args?: Subset<T, YmqSetoranCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqSetoranCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqSetoran.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSetoranAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends YmqSetoranAggregateArgs>(args: Subset<T, YmqSetoranAggregateArgs>): Prisma.PrismaPromise<GetYmqSetoranAggregateType<T>>

    /**
     * Group by YmqSetoran.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSetoranGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends YmqSetoranGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqSetoranGroupByArgs['orderBy'] }
        : { orderBy?: YmqSetoranGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, YmqSetoranGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqSetoranGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqSetoran model
   */
  readonly fields: YmqSetoranFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqSetoran.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqSetoranClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    verifiedBy<T extends YmqSetoran$verifiedByArgs<ExtArgs> = {}>(args?: Subset<T, YmqSetoran$verifiedByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the YmqSetoran model
   */
  interface YmqSetoranFieldRefs {
    readonly id: FieldRef<"YmqSetoran", 'String'>
    readonly userId: FieldRef<"YmqSetoran", 'String'>
    readonly date: FieldRef<"YmqSetoran", 'DateTime'>
    readonly jenis: FieldRef<"YmqSetoran", 'SetoranType'>
    readonly surahMulai: FieldRef<"YmqSetoran", 'String'>
    readonly ayatMulai: FieldRef<"YmqSetoran", 'Int'>
    readonly surahSelesai: FieldRef<"YmqSetoran", 'String'>
    readonly ayatSelesai: FieldRef<"YmqSetoran", 'Int'>
    readonly jumlahHalaman: FieldRef<"YmqSetoran", 'Int'>
    readonly catatan: FieldRef<"YmqSetoran", 'String'>
    readonly statusVerifikasi: FieldRef<"YmqSetoran", 'VerificationStatus'>
    readonly catatanMusyrif: FieldRef<"YmqSetoran", 'String'>
    readonly verifiedById: FieldRef<"YmqSetoran", 'String'>
    readonly verifiedAt: FieldRef<"YmqSetoran", 'DateTime'>
    readonly createdAt: FieldRef<"YmqSetoran", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqSetoran findUnique
   */
  export type YmqSetoranFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * Filter, which YmqSetoran to fetch.
     */
    where: YmqSetoranWhereUniqueInput
  }

  /**
   * YmqSetoran findUniqueOrThrow
   */
  export type YmqSetoranFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * Filter, which YmqSetoran to fetch.
     */
    where: YmqSetoranWhereUniqueInput
  }

  /**
   * YmqSetoran findFirst
   */
  export type YmqSetoranFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * Filter, which YmqSetoran to fetch.
     */
    where?: YmqSetoranWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSetorans to fetch.
     */
    orderBy?: YmqSetoranOrderByWithRelationInput | YmqSetoranOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqSetorans.
     */
    cursor?: YmqSetoranWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSetorans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSetorans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqSetorans.
     */
    distinct?: YmqSetoranScalarFieldEnum | YmqSetoranScalarFieldEnum[]
  }

  /**
   * YmqSetoran findFirstOrThrow
   */
  export type YmqSetoranFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * Filter, which YmqSetoran to fetch.
     */
    where?: YmqSetoranWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSetorans to fetch.
     */
    orderBy?: YmqSetoranOrderByWithRelationInput | YmqSetoranOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqSetorans.
     */
    cursor?: YmqSetoranWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSetorans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSetorans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqSetorans.
     */
    distinct?: YmqSetoranScalarFieldEnum | YmqSetoranScalarFieldEnum[]
  }

  /**
   * YmqSetoran findMany
   */
  export type YmqSetoranFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * Filter, which YmqSetorans to fetch.
     */
    where?: YmqSetoranWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSetorans to fetch.
     */
    orderBy?: YmqSetoranOrderByWithRelationInput | YmqSetoranOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqSetorans.
     */
    cursor?: YmqSetoranWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSetorans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSetorans.
     */
    skip?: number
    distinct?: YmqSetoranScalarFieldEnum | YmqSetoranScalarFieldEnum[]
  }

  /**
   * YmqSetoran create
   */
  export type YmqSetoranCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqSetoran.
     */
    data: XOR<YmqSetoranCreateInput, YmqSetoranUncheckedCreateInput>
  }

  /**
   * YmqSetoran createMany
   */
  export type YmqSetoranCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqSetorans.
     */
    data: YmqSetoranCreateManyInput | YmqSetoranCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqSetoran createManyAndReturn
   */
  export type YmqSetoranCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * The data used to create many YmqSetorans.
     */
    data: YmqSetoranCreateManyInput | YmqSetoranCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqSetoran update
   */
  export type YmqSetoranUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqSetoran.
     */
    data: XOR<YmqSetoranUpdateInput, YmqSetoranUncheckedUpdateInput>
    /**
     * Choose, which YmqSetoran to update.
     */
    where: YmqSetoranWhereUniqueInput
  }

  /**
   * YmqSetoran updateMany
   */
  export type YmqSetoranUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqSetorans.
     */
    data: XOR<YmqSetoranUpdateManyMutationInput, YmqSetoranUncheckedUpdateManyInput>
    /**
     * Filter which YmqSetorans to update
     */
    where?: YmqSetoranWhereInput
    /**
     * Limit how many YmqSetorans to update.
     */
    limit?: number
  }

  /**
   * YmqSetoran updateManyAndReturn
   */
  export type YmqSetoranUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * The data used to update YmqSetorans.
     */
    data: XOR<YmqSetoranUpdateManyMutationInput, YmqSetoranUncheckedUpdateManyInput>
    /**
     * Filter which YmqSetorans to update
     */
    where?: YmqSetoranWhereInput
    /**
     * Limit how many YmqSetorans to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqSetoran upsert
   */
  export type YmqSetoranUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqSetoran to update in case it exists.
     */
    where: YmqSetoranWhereUniqueInput
    /**
     * In case the YmqSetoran found by the `where` argument doesn't exist, create a new YmqSetoran with this data.
     */
    create: XOR<YmqSetoranCreateInput, YmqSetoranUncheckedCreateInput>
    /**
     * In case the YmqSetoran was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqSetoranUpdateInput, YmqSetoranUncheckedUpdateInput>
  }

  /**
   * YmqSetoran delete
   */
  export type YmqSetoranDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
    /**
     * Filter which YmqSetoran to delete.
     */
    where: YmqSetoranWhereUniqueInput
  }

  /**
   * YmqSetoran deleteMany
   */
  export type YmqSetoranDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqSetorans to delete
     */
    where?: YmqSetoranWhereInput
    /**
     * Limit how many YmqSetorans to delete.
     */
    limit?: number
  }

  /**
   * YmqSetoran.verifiedBy
   */
  export type YmqSetoran$verifiedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * YmqSetoran without action
   */
  export type YmqSetoranDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSetoran
     */
    select?: YmqSetoranSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSetoran
     */
    omit?: YmqSetoranOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSetoranInclude<ExtArgs> | null
  }


  /**
   * Model YmqTarget
   */

  export type AggregateYmqTarget = {
    _count: YmqTargetCountAggregateOutputType | null
    _avg: YmqTargetAvgAggregateOutputType | null
    _sum: YmqTargetSumAggregateOutputType | null
    _min: YmqTargetMinAggregateOutputType | null
    _max: YmqTargetMaxAggregateOutputType | null
  }

  export type YmqTargetAvgAggregateOutputType = {
    periodeBulan: number | null
    periodeTahun: number | null
    targetKhatam: number | null
    targetHafalanJuz: number | null
  }

  export type YmqTargetSumAggregateOutputType = {
    periodeBulan: number | null
    periodeTahun: number | null
    targetKhatam: number | null
    targetHafalanJuz: number | null
  }

  export type YmqTargetMinAggregateOutputType = {
    id: string | null
    userId: string | null
    periodeBulan: number | null
    periodeTahun: number | null
    targetKhatam: number | null
    targetHafalanJuz: number | null
    createdAt: Date | null
  }

  export type YmqTargetMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    periodeBulan: number | null
    periodeTahun: number | null
    targetKhatam: number | null
    targetHafalanJuz: number | null
    createdAt: Date | null
  }

  export type YmqTargetCountAggregateOutputType = {
    id: number
    userId: number
    periodeBulan: number
    periodeTahun: number
    targetKhatam: number
    targetHafalanJuz: number
    createdAt: number
    _all: number
  }


  export type YmqTargetAvgAggregateInputType = {
    periodeBulan?: true
    periodeTahun?: true
    targetKhatam?: true
    targetHafalanJuz?: true
  }

  export type YmqTargetSumAggregateInputType = {
    periodeBulan?: true
    periodeTahun?: true
    targetKhatam?: true
    targetHafalanJuz?: true
  }

  export type YmqTargetMinAggregateInputType = {
    id?: true
    userId?: true
    periodeBulan?: true
    periodeTahun?: true
    targetKhatam?: true
    targetHafalanJuz?: true
    createdAt?: true
  }

  export type YmqTargetMaxAggregateInputType = {
    id?: true
    userId?: true
    periodeBulan?: true
    periodeTahun?: true
    targetKhatam?: true
    targetHafalanJuz?: true
    createdAt?: true
  }

  export type YmqTargetCountAggregateInputType = {
    id?: true
    userId?: true
    periodeBulan?: true
    periodeTahun?: true
    targetKhatam?: true
    targetHafalanJuz?: true
    createdAt?: true
    _all?: true
  }

  export type YmqTargetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqTarget to aggregate.
     */
    where?: YmqTargetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqTargets to fetch.
     */
    orderBy?: YmqTargetOrderByWithRelationInput | YmqTargetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqTargetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqTargets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqTargets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqTargets
    **/
    _count?: true | YmqTargetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: YmqTargetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: YmqTargetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqTargetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqTargetMaxAggregateInputType
  }

  export type GetYmqTargetAggregateType<T extends YmqTargetAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqTarget]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqTarget[P]>
      : GetScalarType<T[P], AggregateYmqTarget[P]>
  }




  export type YmqTargetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqTargetWhereInput
    orderBy?: YmqTargetOrderByWithAggregationInput | YmqTargetOrderByWithAggregationInput[]
    by: YmqTargetScalarFieldEnum[] | YmqTargetScalarFieldEnum
    having?: YmqTargetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqTargetCountAggregateInputType | true
    _avg?: YmqTargetAvgAggregateInputType
    _sum?: YmqTargetSumAggregateInputType
    _min?: YmqTargetMinAggregateInputType
    _max?: YmqTargetMaxAggregateInputType
  }

  export type YmqTargetGroupByOutputType = {
    id: string
    userId: string
    periodeBulan: number
    periodeTahun: number
    targetKhatam: number
    targetHafalanJuz: number
    createdAt: Date
    _count: YmqTargetCountAggregateOutputType | null
    _avg: YmqTargetAvgAggregateOutputType | null
    _sum: YmqTargetSumAggregateOutputType | null
    _min: YmqTargetMinAggregateOutputType | null
    _max: YmqTargetMaxAggregateOutputType | null
  }

  type GetYmqTargetGroupByPayload<T extends YmqTargetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqTargetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqTargetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqTargetGroupByOutputType[P]>
            : GetScalarType<T[P], YmqTargetGroupByOutputType[P]>
        }
      >
    >


  export type YmqTargetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    periodeBulan?: boolean
    periodeTahun?: boolean
    targetKhatam?: boolean
    targetHafalanJuz?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqTarget"]>

  export type YmqTargetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    periodeBulan?: boolean
    periodeTahun?: boolean
    targetKhatam?: boolean
    targetHafalanJuz?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqTarget"]>

  export type YmqTargetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    periodeBulan?: boolean
    periodeTahun?: boolean
    targetKhatam?: boolean
    targetHafalanJuz?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqTarget"]>

  export type YmqTargetSelectScalar = {
    id?: boolean
    userId?: boolean
    periodeBulan?: boolean
    periodeTahun?: boolean
    targetKhatam?: boolean
    targetHafalanJuz?: boolean
    createdAt?: boolean
  }

  export type YmqTargetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "periodeBulan" | "periodeTahun" | "targetKhatam" | "targetHafalanJuz" | "createdAt", ExtArgs["result"]["ymqTarget"]>
  export type YmqTargetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type YmqTargetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type YmqTargetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $YmqTargetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqTarget"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      periodeBulan: number
      periodeTahun: number
      targetKhatam: number
      targetHafalanJuz: number
      createdAt: Date
    }, ExtArgs["result"]["ymqTarget"]>
    composites: {}
  }

  type YmqTargetGetPayload<S extends boolean | null | undefined | YmqTargetDefaultArgs> = $Result.GetResult<Prisma.$YmqTargetPayload, S>

  type YmqTargetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqTargetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqTargetCountAggregateInputType | true
    }

  export interface YmqTargetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqTarget'], meta: { name: 'YmqTarget' } }
    /**
     * Find zero or one YmqTarget that matches the filter.
     * @param {YmqTargetFindUniqueArgs} args - Arguments to find a YmqTarget
     * @example
     * // Get one YmqTarget
     * const ymqTarget = await prisma.ymqTarget.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqTargetFindUniqueArgs>(args: SelectSubset<T, YmqTargetFindUniqueArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqTarget that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqTargetFindUniqueOrThrowArgs} args - Arguments to find a YmqTarget
     * @example
     * // Get one YmqTarget
     * const ymqTarget = await prisma.ymqTarget.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqTargetFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqTargetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqTarget that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqTargetFindFirstArgs} args - Arguments to find a YmqTarget
     * @example
     * // Get one YmqTarget
     * const ymqTarget = await prisma.ymqTarget.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqTargetFindFirstArgs>(args?: SelectSubset<T, YmqTargetFindFirstArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqTarget that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqTargetFindFirstOrThrowArgs} args - Arguments to find a YmqTarget
     * @example
     * // Get one YmqTarget
     * const ymqTarget = await prisma.ymqTarget.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqTargetFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqTargetFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqTargets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqTargetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqTargets
     * const ymqTargets = await prisma.ymqTarget.findMany()
     * 
     * // Get first 10 YmqTargets
     * const ymqTargets = await prisma.ymqTarget.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqTargetWithIdOnly = await prisma.ymqTarget.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqTargetFindManyArgs>(args?: SelectSubset<T, YmqTargetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqTarget.
     * @param {YmqTargetCreateArgs} args - Arguments to create a YmqTarget.
     * @example
     * // Create one YmqTarget
     * const YmqTarget = await prisma.ymqTarget.create({
     *   data: {
     *     // ... data to create a YmqTarget
     *   }
     * })
     * 
     */
    create<T extends YmqTargetCreateArgs>(args: SelectSubset<T, YmqTargetCreateArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqTargets.
     * @param {YmqTargetCreateManyArgs} args - Arguments to create many YmqTargets.
     * @example
     * // Create many YmqTargets
     * const ymqTarget = await prisma.ymqTarget.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqTargetCreateManyArgs>(args?: SelectSubset<T, YmqTargetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqTargets and returns the data saved in the database.
     * @param {YmqTargetCreateManyAndReturnArgs} args - Arguments to create many YmqTargets.
     * @example
     * // Create many YmqTargets
     * const ymqTarget = await prisma.ymqTarget.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqTargets and only return the `id`
     * const ymqTargetWithIdOnly = await prisma.ymqTarget.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqTargetCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqTargetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqTarget.
     * @param {YmqTargetDeleteArgs} args - Arguments to delete one YmqTarget.
     * @example
     * // Delete one YmqTarget
     * const YmqTarget = await prisma.ymqTarget.delete({
     *   where: {
     *     // ... filter to delete one YmqTarget
     *   }
     * })
     * 
     */
    delete<T extends YmqTargetDeleteArgs>(args: SelectSubset<T, YmqTargetDeleteArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqTarget.
     * @param {YmqTargetUpdateArgs} args - Arguments to update one YmqTarget.
     * @example
     * // Update one YmqTarget
     * const ymqTarget = await prisma.ymqTarget.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqTargetUpdateArgs>(args: SelectSubset<T, YmqTargetUpdateArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqTargets.
     * @param {YmqTargetDeleteManyArgs} args - Arguments to filter YmqTargets to delete.
     * @example
     * // Delete a few YmqTargets
     * const { count } = await prisma.ymqTarget.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqTargetDeleteManyArgs>(args?: SelectSubset<T, YmqTargetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqTargets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqTargetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqTargets
     * const ymqTarget = await prisma.ymqTarget.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqTargetUpdateManyArgs>(args: SelectSubset<T, YmqTargetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqTargets and returns the data updated in the database.
     * @param {YmqTargetUpdateManyAndReturnArgs} args - Arguments to update many YmqTargets.
     * @example
     * // Update many YmqTargets
     * const ymqTarget = await prisma.ymqTarget.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqTargets and only return the `id`
     * const ymqTargetWithIdOnly = await prisma.ymqTarget.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends YmqTargetUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqTargetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqTarget.
     * @param {YmqTargetUpsertArgs} args - Arguments to update or create a YmqTarget.
     * @example
     * // Update or create a YmqTarget
     * const ymqTarget = await prisma.ymqTarget.upsert({
     *   create: {
     *     // ... data to create a YmqTarget
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqTarget we want to update
     *   }
     * })
     */
    upsert<T extends YmqTargetUpsertArgs>(args: SelectSubset<T, YmqTargetUpsertArgs<ExtArgs>>): Prisma__YmqTargetClient<$Result.GetResult<Prisma.$YmqTargetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqTargets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqTargetCountArgs} args - Arguments to filter YmqTargets to count.
     * @example
     * // Count the number of YmqTargets
     * const count = await prisma.ymqTarget.count({
     *   where: {
     *     // ... the filter for the YmqTargets we want to count
     *   }
     * })
    **/
    count<T extends YmqTargetCountArgs>(
      args?: Subset<T, YmqTargetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqTargetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqTarget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqTargetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends YmqTargetAggregateArgs>(args: Subset<T, YmqTargetAggregateArgs>): Prisma.PrismaPromise<GetYmqTargetAggregateType<T>>

    /**
     * Group by YmqTarget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqTargetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends YmqTargetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqTargetGroupByArgs['orderBy'] }
        : { orderBy?: YmqTargetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, YmqTargetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqTargetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqTarget model
   */
  readonly fields: YmqTargetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqTarget.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqTargetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the YmqTarget model
   */
  interface YmqTargetFieldRefs {
    readonly id: FieldRef<"YmqTarget", 'String'>
    readonly userId: FieldRef<"YmqTarget", 'String'>
    readonly periodeBulan: FieldRef<"YmqTarget", 'Int'>
    readonly periodeTahun: FieldRef<"YmqTarget", 'Int'>
    readonly targetKhatam: FieldRef<"YmqTarget", 'Int'>
    readonly targetHafalanJuz: FieldRef<"YmqTarget", 'Int'>
    readonly createdAt: FieldRef<"YmqTarget", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqTarget findUnique
   */
  export type YmqTargetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * Filter, which YmqTarget to fetch.
     */
    where: YmqTargetWhereUniqueInput
  }

  /**
   * YmqTarget findUniqueOrThrow
   */
  export type YmqTargetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * Filter, which YmqTarget to fetch.
     */
    where: YmqTargetWhereUniqueInput
  }

  /**
   * YmqTarget findFirst
   */
  export type YmqTargetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * Filter, which YmqTarget to fetch.
     */
    where?: YmqTargetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqTargets to fetch.
     */
    orderBy?: YmqTargetOrderByWithRelationInput | YmqTargetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqTargets.
     */
    cursor?: YmqTargetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqTargets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqTargets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqTargets.
     */
    distinct?: YmqTargetScalarFieldEnum | YmqTargetScalarFieldEnum[]
  }

  /**
   * YmqTarget findFirstOrThrow
   */
  export type YmqTargetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * Filter, which YmqTarget to fetch.
     */
    where?: YmqTargetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqTargets to fetch.
     */
    orderBy?: YmqTargetOrderByWithRelationInput | YmqTargetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqTargets.
     */
    cursor?: YmqTargetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqTargets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqTargets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqTargets.
     */
    distinct?: YmqTargetScalarFieldEnum | YmqTargetScalarFieldEnum[]
  }

  /**
   * YmqTarget findMany
   */
  export type YmqTargetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * Filter, which YmqTargets to fetch.
     */
    where?: YmqTargetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqTargets to fetch.
     */
    orderBy?: YmqTargetOrderByWithRelationInput | YmqTargetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqTargets.
     */
    cursor?: YmqTargetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqTargets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqTargets.
     */
    skip?: number
    distinct?: YmqTargetScalarFieldEnum | YmqTargetScalarFieldEnum[]
  }

  /**
   * YmqTarget create
   */
  export type YmqTargetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqTarget.
     */
    data: XOR<YmqTargetCreateInput, YmqTargetUncheckedCreateInput>
  }

  /**
   * YmqTarget createMany
   */
  export type YmqTargetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqTargets.
     */
    data: YmqTargetCreateManyInput | YmqTargetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqTarget createManyAndReturn
   */
  export type YmqTargetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * The data used to create many YmqTargets.
     */
    data: YmqTargetCreateManyInput | YmqTargetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqTarget update
   */
  export type YmqTargetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqTarget.
     */
    data: XOR<YmqTargetUpdateInput, YmqTargetUncheckedUpdateInput>
    /**
     * Choose, which YmqTarget to update.
     */
    where: YmqTargetWhereUniqueInput
  }

  /**
   * YmqTarget updateMany
   */
  export type YmqTargetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqTargets.
     */
    data: XOR<YmqTargetUpdateManyMutationInput, YmqTargetUncheckedUpdateManyInput>
    /**
     * Filter which YmqTargets to update
     */
    where?: YmqTargetWhereInput
    /**
     * Limit how many YmqTargets to update.
     */
    limit?: number
  }

  /**
   * YmqTarget updateManyAndReturn
   */
  export type YmqTargetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * The data used to update YmqTargets.
     */
    data: XOR<YmqTargetUpdateManyMutationInput, YmqTargetUncheckedUpdateManyInput>
    /**
     * Filter which YmqTargets to update
     */
    where?: YmqTargetWhereInput
    /**
     * Limit how many YmqTargets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqTarget upsert
   */
  export type YmqTargetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqTarget to update in case it exists.
     */
    where: YmqTargetWhereUniqueInput
    /**
     * In case the YmqTarget found by the `where` argument doesn't exist, create a new YmqTarget with this data.
     */
    create: XOR<YmqTargetCreateInput, YmqTargetUncheckedCreateInput>
    /**
     * In case the YmqTarget was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqTargetUpdateInput, YmqTargetUncheckedUpdateInput>
  }

  /**
   * YmqTarget delete
   */
  export type YmqTargetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
    /**
     * Filter which YmqTarget to delete.
     */
    where: YmqTargetWhereUniqueInput
  }

  /**
   * YmqTarget deleteMany
   */
  export type YmqTargetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqTargets to delete
     */
    where?: YmqTargetWhereInput
    /**
     * Limit how many YmqTargets to delete.
     */
    limit?: number
  }

  /**
   * YmqTarget without action
   */
  export type YmqTargetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqTarget
     */
    select?: YmqTargetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqTarget
     */
    omit?: YmqTargetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqTargetInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    fullName: 'fullName',
    username: 'username',
    email: 'email',
    phone: 'phone',
    avatarUrl: 'avatarUrl',
    unitName: 'unitName',
    isActive: 'isActive',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const YmqGroupScalarFieldEnum: {
    id: 'id',
    name: 'name',
    musyrifId: 'musyrifId',
    description: 'description',
    scheduleDay: 'scheduleDay',
    scheduleTime: 'scheduleTime',
    whatsappLink: 'whatsappLink',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type YmqGroupScalarFieldEnum = (typeof YmqGroupScalarFieldEnum)[keyof typeof YmqGroupScalarFieldEnum]


  export const YmqMemberScalarFieldEnum: {
    id: 'id',
    groupId: 'groupId',
    userId: 'userId',
    joinedAt: 'joinedAt'
  };

  export type YmqMemberScalarFieldEnum = (typeof YmqMemberScalarFieldEnum)[keyof typeof YmqMemberScalarFieldEnum]


  export const YmqSetoranScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date',
    jenis: 'jenis',
    surahMulai: 'surahMulai',
    ayatMulai: 'ayatMulai',
    surahSelesai: 'surahSelesai',
    ayatSelesai: 'ayatSelesai',
    jumlahHalaman: 'jumlahHalaman',
    catatan: 'catatan',
    statusVerifikasi: 'statusVerifikasi',
    catatanMusyrif: 'catatanMusyrif',
    verifiedById: 'verifiedById',
    verifiedAt: 'verifiedAt',
    createdAt: 'createdAt'
  };

  export type YmqSetoranScalarFieldEnum = (typeof YmqSetoranScalarFieldEnum)[keyof typeof YmqSetoranScalarFieldEnum]


  export const YmqTargetScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    periodeBulan: 'periodeBulan',
    periodeTahun: 'periodeTahun',
    targetKhatam: 'targetKhatam',
    targetHafalanJuz: 'targetHafalanJuz',
    createdAt: 'createdAt'
  };

  export type YmqTargetScalarFieldEnum = (typeof YmqTargetScalarFieldEnum)[keyof typeof YmqTargetScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'SetoranType'
   */
  export type EnumSetoranTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SetoranType'>
    


  /**
   * Reference to a field of type 'SetoranType[]'
   */
  export type ListEnumSetoranTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SetoranType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'VerificationStatus'
   */
  export type EnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus'>
    


  /**
   * Reference to a field of type 'VerificationStatus[]'
   */
  export type ListEnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    fullName?: StringFilter<"User"> | string
    username?: StringNullableFilter<"User"> | string | null
    email?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    avatarUrl?: StringNullableFilter<"User"> | string | null
    unitName?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    groupsAsMusyrif?: YmqGroupListRelationFilter
    memberships?: YmqMemberListRelationFilter
    setoranList?: YmqSetoranListRelationFilter
    verifiedSetorans?: YmqSetoranListRelationFilter
    targets?: YmqTargetListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    fullName?: SortOrder
    username?: SortOrderInput | SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    unitName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    groupsAsMusyrif?: YmqGroupOrderByRelationAggregateInput
    memberships?: YmqMemberOrderByRelationAggregateInput
    setoranList?: YmqSetoranOrderByRelationAggregateInput
    verifiedSetorans?: YmqSetoranOrderByRelationAggregateInput
    targets?: YmqTargetOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    fullName?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    avatarUrl?: StringNullableFilter<"User"> | string | null
    unitName?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    groupsAsMusyrif?: YmqGroupListRelationFilter
    memberships?: YmqMemberListRelationFilter
    setoranList?: YmqSetoranListRelationFilter
    verifiedSetorans?: YmqSetoranListRelationFilter
    targets?: YmqTargetListRelationFilter
  }, "id" | "username" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    fullName?: SortOrder
    username?: SortOrderInput | SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    unitName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    fullName?: StringWithAggregatesFilter<"User"> | string
    username?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    unitName?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type YmqGroupWhereInput = {
    AND?: YmqGroupWhereInput | YmqGroupWhereInput[]
    OR?: YmqGroupWhereInput[]
    NOT?: YmqGroupWhereInput | YmqGroupWhereInput[]
    id?: UuidFilter<"YmqGroup"> | string
    name?: StringFilter<"YmqGroup"> | string
    musyrifId?: UuidFilter<"YmqGroup"> | string
    description?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleDay?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleTime?: StringNullableFilter<"YmqGroup"> | string | null
    whatsappLink?: StringNullableFilter<"YmqGroup"> | string | null
    createdAt?: DateTimeFilter<"YmqGroup"> | Date | string
    updatedAt?: DateTimeFilter<"YmqGroup"> | Date | string
    musyrif?: XOR<UserScalarRelationFilter, UserWhereInput>
    members?: YmqMemberListRelationFilter
  }

  export type YmqGroupOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    musyrifId?: SortOrder
    description?: SortOrderInput | SortOrder
    scheduleDay?: SortOrderInput | SortOrder
    scheduleTime?: SortOrderInput | SortOrder
    whatsappLink?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    musyrif?: UserOrderByWithRelationInput
    members?: YmqMemberOrderByRelationAggregateInput
  }

  export type YmqGroupWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: YmqGroupWhereInput | YmqGroupWhereInput[]
    OR?: YmqGroupWhereInput[]
    NOT?: YmqGroupWhereInput | YmqGroupWhereInput[]
    name?: StringFilter<"YmqGroup"> | string
    musyrifId?: UuidFilter<"YmqGroup"> | string
    description?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleDay?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleTime?: StringNullableFilter<"YmqGroup"> | string | null
    whatsappLink?: StringNullableFilter<"YmqGroup"> | string | null
    createdAt?: DateTimeFilter<"YmqGroup"> | Date | string
    updatedAt?: DateTimeFilter<"YmqGroup"> | Date | string
    musyrif?: XOR<UserScalarRelationFilter, UserWhereInput>
    members?: YmqMemberListRelationFilter
  }, "id">

  export type YmqGroupOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    musyrifId?: SortOrder
    description?: SortOrderInput | SortOrder
    scheduleDay?: SortOrderInput | SortOrder
    scheduleTime?: SortOrderInput | SortOrder
    whatsappLink?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: YmqGroupCountOrderByAggregateInput
    _max?: YmqGroupMaxOrderByAggregateInput
    _min?: YmqGroupMinOrderByAggregateInput
  }

  export type YmqGroupScalarWhereWithAggregatesInput = {
    AND?: YmqGroupScalarWhereWithAggregatesInput | YmqGroupScalarWhereWithAggregatesInput[]
    OR?: YmqGroupScalarWhereWithAggregatesInput[]
    NOT?: YmqGroupScalarWhereWithAggregatesInput | YmqGroupScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqGroup"> | string
    name?: StringWithAggregatesFilter<"YmqGroup"> | string
    musyrifId?: UuidWithAggregatesFilter<"YmqGroup"> | string
    description?: StringNullableWithAggregatesFilter<"YmqGroup"> | string | null
    scheduleDay?: StringNullableWithAggregatesFilter<"YmqGroup"> | string | null
    scheduleTime?: StringNullableWithAggregatesFilter<"YmqGroup"> | string | null
    whatsappLink?: StringNullableWithAggregatesFilter<"YmqGroup"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"YmqGroup"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"YmqGroup"> | Date | string
  }

  export type YmqMemberWhereInput = {
    AND?: YmqMemberWhereInput | YmqMemberWhereInput[]
    OR?: YmqMemberWhereInput[]
    NOT?: YmqMemberWhereInput | YmqMemberWhereInput[]
    id?: UuidFilter<"YmqMember"> | string
    groupId?: UuidFilter<"YmqMember"> | string
    userId?: UuidFilter<"YmqMember"> | string
    joinedAt?: DateTimeFilter<"YmqMember"> | Date | string
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type YmqMemberOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
    group?: YmqGroupOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type YmqMemberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    groupId_userId?: YmqMemberGroupIdUserIdCompoundUniqueInput
    AND?: YmqMemberWhereInput | YmqMemberWhereInput[]
    OR?: YmqMemberWhereInput[]
    NOT?: YmqMemberWhereInput | YmqMemberWhereInput[]
    groupId?: UuidFilter<"YmqMember"> | string
    userId?: UuidFilter<"YmqMember"> | string
    joinedAt?: DateTimeFilter<"YmqMember"> | Date | string
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "groupId_userId">

  export type YmqMemberOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
    _count?: YmqMemberCountOrderByAggregateInput
    _max?: YmqMemberMaxOrderByAggregateInput
    _min?: YmqMemberMinOrderByAggregateInput
  }

  export type YmqMemberScalarWhereWithAggregatesInput = {
    AND?: YmqMemberScalarWhereWithAggregatesInput | YmqMemberScalarWhereWithAggregatesInput[]
    OR?: YmqMemberScalarWhereWithAggregatesInput[]
    NOT?: YmqMemberScalarWhereWithAggregatesInput | YmqMemberScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqMember"> | string
    groupId?: UuidWithAggregatesFilter<"YmqMember"> | string
    userId?: UuidWithAggregatesFilter<"YmqMember"> | string
    joinedAt?: DateTimeWithAggregatesFilter<"YmqMember"> | Date | string
  }

  export type YmqSetoranWhereInput = {
    AND?: YmqSetoranWhereInput | YmqSetoranWhereInput[]
    OR?: YmqSetoranWhereInput[]
    NOT?: YmqSetoranWhereInput | YmqSetoranWhereInput[]
    id?: UuidFilter<"YmqSetoran"> | string
    userId?: UuidFilter<"YmqSetoran"> | string
    date?: DateTimeFilter<"YmqSetoran"> | Date | string
    jenis?: EnumSetoranTypeFilter<"YmqSetoran"> | $Enums.SetoranType
    surahMulai?: StringFilter<"YmqSetoran"> | string
    ayatMulai?: IntFilter<"YmqSetoran"> | number
    surahSelesai?: StringFilter<"YmqSetoran"> | string
    ayatSelesai?: IntFilter<"YmqSetoran"> | number
    jumlahHalaman?: IntFilter<"YmqSetoran"> | number
    catatan?: StringNullableFilter<"YmqSetoran"> | string | null
    statusVerifikasi?: EnumVerificationStatusFilter<"YmqSetoran"> | $Enums.VerificationStatus
    catatanMusyrif?: StringNullableFilter<"YmqSetoran"> | string | null
    verifiedById?: UuidNullableFilter<"YmqSetoran"> | string | null
    verifiedAt?: DateTimeNullableFilter<"YmqSetoran"> | Date | string | null
    createdAt?: DateTimeFilter<"YmqSetoran"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    verifiedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type YmqSetoranOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    jenis?: SortOrder
    surahMulai?: SortOrder
    ayatMulai?: SortOrder
    surahSelesai?: SortOrder
    ayatSelesai?: SortOrder
    jumlahHalaman?: SortOrder
    catatan?: SortOrderInput | SortOrder
    statusVerifikasi?: SortOrder
    catatanMusyrif?: SortOrderInput | SortOrder
    verifiedById?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    verifiedBy?: UserOrderByWithRelationInput
  }

  export type YmqSetoranWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: YmqSetoranWhereInput | YmqSetoranWhereInput[]
    OR?: YmqSetoranWhereInput[]
    NOT?: YmqSetoranWhereInput | YmqSetoranWhereInput[]
    userId?: UuidFilter<"YmqSetoran"> | string
    date?: DateTimeFilter<"YmqSetoran"> | Date | string
    jenis?: EnumSetoranTypeFilter<"YmqSetoran"> | $Enums.SetoranType
    surahMulai?: StringFilter<"YmqSetoran"> | string
    ayatMulai?: IntFilter<"YmqSetoran"> | number
    surahSelesai?: StringFilter<"YmqSetoran"> | string
    ayatSelesai?: IntFilter<"YmqSetoran"> | number
    jumlahHalaman?: IntFilter<"YmqSetoran"> | number
    catatan?: StringNullableFilter<"YmqSetoran"> | string | null
    statusVerifikasi?: EnumVerificationStatusFilter<"YmqSetoran"> | $Enums.VerificationStatus
    catatanMusyrif?: StringNullableFilter<"YmqSetoran"> | string | null
    verifiedById?: UuidNullableFilter<"YmqSetoran"> | string | null
    verifiedAt?: DateTimeNullableFilter<"YmqSetoran"> | Date | string | null
    createdAt?: DateTimeFilter<"YmqSetoran"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    verifiedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type YmqSetoranOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    jenis?: SortOrder
    surahMulai?: SortOrder
    ayatMulai?: SortOrder
    surahSelesai?: SortOrder
    ayatSelesai?: SortOrder
    jumlahHalaman?: SortOrder
    catatan?: SortOrderInput | SortOrder
    statusVerifikasi?: SortOrder
    catatanMusyrif?: SortOrderInput | SortOrder
    verifiedById?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: YmqSetoranCountOrderByAggregateInput
    _avg?: YmqSetoranAvgOrderByAggregateInput
    _max?: YmqSetoranMaxOrderByAggregateInput
    _min?: YmqSetoranMinOrderByAggregateInput
    _sum?: YmqSetoranSumOrderByAggregateInput
  }

  export type YmqSetoranScalarWhereWithAggregatesInput = {
    AND?: YmqSetoranScalarWhereWithAggregatesInput | YmqSetoranScalarWhereWithAggregatesInput[]
    OR?: YmqSetoranScalarWhereWithAggregatesInput[]
    NOT?: YmqSetoranScalarWhereWithAggregatesInput | YmqSetoranScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqSetoran"> | string
    userId?: UuidWithAggregatesFilter<"YmqSetoran"> | string
    date?: DateTimeWithAggregatesFilter<"YmqSetoran"> | Date | string
    jenis?: EnumSetoranTypeWithAggregatesFilter<"YmqSetoran"> | $Enums.SetoranType
    surahMulai?: StringWithAggregatesFilter<"YmqSetoran"> | string
    ayatMulai?: IntWithAggregatesFilter<"YmqSetoran"> | number
    surahSelesai?: StringWithAggregatesFilter<"YmqSetoran"> | string
    ayatSelesai?: IntWithAggregatesFilter<"YmqSetoran"> | number
    jumlahHalaman?: IntWithAggregatesFilter<"YmqSetoran"> | number
    catatan?: StringNullableWithAggregatesFilter<"YmqSetoran"> | string | null
    statusVerifikasi?: EnumVerificationStatusWithAggregatesFilter<"YmqSetoran"> | $Enums.VerificationStatus
    catatanMusyrif?: StringNullableWithAggregatesFilter<"YmqSetoran"> | string | null
    verifiedById?: UuidNullableWithAggregatesFilter<"YmqSetoran"> | string | null
    verifiedAt?: DateTimeNullableWithAggregatesFilter<"YmqSetoran"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"YmqSetoran"> | Date | string
  }

  export type YmqTargetWhereInput = {
    AND?: YmqTargetWhereInput | YmqTargetWhereInput[]
    OR?: YmqTargetWhereInput[]
    NOT?: YmqTargetWhereInput | YmqTargetWhereInput[]
    id?: UuidFilter<"YmqTarget"> | string
    userId?: UuidFilter<"YmqTarget"> | string
    periodeBulan?: IntFilter<"YmqTarget"> | number
    periodeTahun?: IntFilter<"YmqTarget"> | number
    targetKhatam?: IntFilter<"YmqTarget"> | number
    targetHafalanJuz?: IntFilter<"YmqTarget"> | number
    createdAt?: DateTimeFilter<"YmqTarget"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type YmqTargetOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    periodeBulan?: SortOrder
    periodeTahun?: SortOrder
    targetKhatam?: SortOrder
    targetHafalanJuz?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type YmqTargetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_periodeBulan_periodeTahun?: YmqTargetUserIdPeriodeBulanPeriodeTahunCompoundUniqueInput
    AND?: YmqTargetWhereInput | YmqTargetWhereInput[]
    OR?: YmqTargetWhereInput[]
    NOT?: YmqTargetWhereInput | YmqTargetWhereInput[]
    userId?: UuidFilter<"YmqTarget"> | string
    periodeBulan?: IntFilter<"YmqTarget"> | number
    periodeTahun?: IntFilter<"YmqTarget"> | number
    targetKhatam?: IntFilter<"YmqTarget"> | number
    targetHafalanJuz?: IntFilter<"YmqTarget"> | number
    createdAt?: DateTimeFilter<"YmqTarget"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_periodeBulan_periodeTahun">

  export type YmqTargetOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    periodeBulan?: SortOrder
    periodeTahun?: SortOrder
    targetKhatam?: SortOrder
    targetHafalanJuz?: SortOrder
    createdAt?: SortOrder
    _count?: YmqTargetCountOrderByAggregateInput
    _avg?: YmqTargetAvgOrderByAggregateInput
    _max?: YmqTargetMaxOrderByAggregateInput
    _min?: YmqTargetMinOrderByAggregateInput
    _sum?: YmqTargetSumOrderByAggregateInput
  }

  export type YmqTargetScalarWhereWithAggregatesInput = {
    AND?: YmqTargetScalarWhereWithAggregatesInput | YmqTargetScalarWhereWithAggregatesInput[]
    OR?: YmqTargetScalarWhereWithAggregatesInput[]
    NOT?: YmqTargetScalarWhereWithAggregatesInput | YmqTargetScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqTarget"> | string
    userId?: UuidWithAggregatesFilter<"YmqTarget"> | string
    periodeBulan?: IntWithAggregatesFilter<"YmqTarget"> | number
    periodeTahun?: IntWithAggregatesFilter<"YmqTarget"> | number
    targetKhatam?: IntWithAggregatesFilter<"YmqTarget"> | number
    targetHafalanJuz?: IntWithAggregatesFilter<"YmqTarget"> | number
    createdAt?: DateTimeWithAggregatesFilter<"YmqTarget"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupUncheckedCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUncheckedUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqGroupCreateInput = {
    id?: string
    name: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    musyrif: UserCreateNestedOneWithoutGroupsAsMusyrifInput
    members?: YmqMemberCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUncheckedCreateInput = {
    id?: string
    name: string
    musyrifId: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberUncheckedCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    musyrif?: UserUpdateOneRequiredWithoutGroupsAsMusyrifNestedInput
    members?: YmqMemberUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    musyrifId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupCreateManyInput = {
    id?: string
    name: string
    musyrifId: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqGroupUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqGroupUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    musyrifId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqMemberCreateInput = {
    id?: string
    joinedAt?: Date | string
    group: YmqGroupCreateNestedOneWithoutMembersInput
    user: UserCreateNestedOneWithoutMembershipsInput
  }

  export type YmqMemberUncheckedCreateInput = {
    id?: string
    groupId: string
    userId: string
    joinedAt?: Date | string
  }

  export type YmqMemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: YmqGroupUpdateOneRequiredWithoutMembersNestedInput
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type YmqMemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqMemberCreateManyInput = {
    id?: string
    groupId: string
    userId: string
    joinedAt?: Date | string
  }

  export type YmqMemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqMemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSetoranCreateInput = {
    id?: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutSetoranListInput
    verifiedBy?: UserCreateNestedOneWithoutVerifiedSetoransInput
  }

  export type YmqSetoranUncheckedCreateInput = {
    id?: string
    userId: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type YmqSetoranUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSetoranListNestedInput
    verifiedBy?: UserUpdateOneWithoutVerifiedSetoransNestedInput
  }

  export type YmqSetoranUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSetoranCreateManyInput = {
    id?: string
    userId: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type YmqSetoranUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSetoranUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqTargetCreateInput = {
    id?: string
    periodeBulan: number
    periodeTahun: number
    targetKhatam?: number
    targetHafalanJuz?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutTargetsInput
  }

  export type YmqTargetUncheckedCreateInput = {
    id?: string
    userId: string
    periodeBulan: number
    periodeTahun: number
    targetKhatam?: number
    targetHafalanJuz?: number
    createdAt?: Date | string
  }

  export type YmqTargetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodeBulan?: IntFieldUpdateOperationsInput | number
    periodeTahun?: IntFieldUpdateOperationsInput | number
    targetKhatam?: IntFieldUpdateOperationsInput | number
    targetHafalanJuz?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutTargetsNestedInput
  }

  export type YmqTargetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    periodeBulan?: IntFieldUpdateOperationsInput | number
    periodeTahun?: IntFieldUpdateOperationsInput | number
    targetKhatam?: IntFieldUpdateOperationsInput | number
    targetHafalanJuz?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqTargetCreateManyInput = {
    id?: string
    userId: string
    periodeBulan: number
    periodeTahun: number
    targetKhatam?: number
    targetHafalanJuz?: number
    createdAt?: Date | string
  }

  export type YmqTargetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodeBulan?: IntFieldUpdateOperationsInput | number
    periodeTahun?: IntFieldUpdateOperationsInput | number
    targetKhatam?: IntFieldUpdateOperationsInput | number
    targetHafalanJuz?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqTargetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    periodeBulan?: IntFieldUpdateOperationsInput | number
    periodeTahun?: IntFieldUpdateOperationsInput | number
    targetKhatam?: IntFieldUpdateOperationsInput | number
    targetHafalanJuz?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type YmqGroupListRelationFilter = {
    every?: YmqGroupWhereInput
    some?: YmqGroupWhereInput
    none?: YmqGroupWhereInput
  }

  export type YmqMemberListRelationFilter = {
    every?: YmqMemberWhereInput
    some?: YmqMemberWhereInput
    none?: YmqMemberWhereInput
  }

  export type YmqSetoranListRelationFilter = {
    every?: YmqSetoranWhereInput
    some?: YmqSetoranWhereInput
    none?: YmqSetoranWhereInput
  }

  export type YmqTargetListRelationFilter = {
    every?: YmqTargetWhereInput
    some?: YmqTargetWhereInput
    none?: YmqTargetWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type YmqGroupOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type YmqMemberOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type YmqSetoranOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type YmqTargetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    username?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    avatarUrl?: SortOrder
    unitName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    username?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    avatarUrl?: SortOrder
    unitName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    username?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    avatarUrl?: SortOrder
    unitName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type YmqGroupCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    musyrifId?: SortOrder
    description?: SortOrder
    scheduleDay?: SortOrder
    scheduleTime?: SortOrder
    whatsappLink?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqGroupMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    musyrifId?: SortOrder
    description?: SortOrder
    scheduleDay?: SortOrder
    scheduleTime?: SortOrder
    whatsappLink?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqGroupMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    musyrifId?: SortOrder
    description?: SortOrder
    scheduleDay?: SortOrder
    scheduleTime?: SortOrder
    whatsappLink?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqGroupScalarRelationFilter = {
    is?: YmqGroupWhereInput
    isNot?: YmqGroupWhereInput
  }

  export type YmqMemberGroupIdUserIdCompoundUniqueInput = {
    groupId: string
    userId: string
  }

  export type YmqMemberCountOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
  }

  export type YmqMemberMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
  }

  export type YmqMemberMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
  }

  export type EnumSetoranTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SetoranType | EnumSetoranTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSetoranTypeFilter<$PrismaModel> | $Enums.SetoranType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type YmqSetoranCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    jenis?: SortOrder
    surahMulai?: SortOrder
    ayatMulai?: SortOrder
    surahSelesai?: SortOrder
    ayatSelesai?: SortOrder
    jumlahHalaman?: SortOrder
    catatan?: SortOrder
    statusVerifikasi?: SortOrder
    catatanMusyrif?: SortOrder
    verifiedById?: SortOrder
    verifiedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqSetoranAvgOrderByAggregateInput = {
    ayatMulai?: SortOrder
    ayatSelesai?: SortOrder
    jumlahHalaman?: SortOrder
  }

  export type YmqSetoranMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    jenis?: SortOrder
    surahMulai?: SortOrder
    ayatMulai?: SortOrder
    surahSelesai?: SortOrder
    ayatSelesai?: SortOrder
    jumlahHalaman?: SortOrder
    catatan?: SortOrder
    statusVerifikasi?: SortOrder
    catatanMusyrif?: SortOrder
    verifiedById?: SortOrder
    verifiedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqSetoranMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    jenis?: SortOrder
    surahMulai?: SortOrder
    ayatMulai?: SortOrder
    surahSelesai?: SortOrder
    ayatSelesai?: SortOrder
    jumlahHalaman?: SortOrder
    catatan?: SortOrder
    statusVerifikasi?: SortOrder
    catatanMusyrif?: SortOrder
    verifiedById?: SortOrder
    verifiedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqSetoranSumOrderByAggregateInput = {
    ayatMulai?: SortOrder
    ayatSelesai?: SortOrder
    jumlahHalaman?: SortOrder
  }

  export type EnumSetoranTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SetoranType | EnumSetoranTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSetoranTypeWithAggregatesFilter<$PrismaModel> | $Enums.SetoranType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSetoranTypeFilter<$PrismaModel>
    _max?: NestedEnumSetoranTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type YmqTargetUserIdPeriodeBulanPeriodeTahunCompoundUniqueInput = {
    userId: string
    periodeBulan: number
    periodeTahun: number
  }

  export type YmqTargetCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    periodeBulan?: SortOrder
    periodeTahun?: SortOrder
    targetKhatam?: SortOrder
    targetHafalanJuz?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqTargetAvgOrderByAggregateInput = {
    periodeBulan?: SortOrder
    periodeTahun?: SortOrder
    targetKhatam?: SortOrder
    targetHafalanJuz?: SortOrder
  }

  export type YmqTargetMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    periodeBulan?: SortOrder
    periodeTahun?: SortOrder
    targetKhatam?: SortOrder
    targetHafalanJuz?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqTargetMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    periodeBulan?: SortOrder
    periodeTahun?: SortOrder
    targetKhatam?: SortOrder
    targetHafalanJuz?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqTargetSumOrderByAggregateInput = {
    periodeBulan?: SortOrder
    periodeTahun?: SortOrder
    targetKhatam?: SortOrder
    targetHafalanJuz?: SortOrder
  }

  export type YmqGroupCreateNestedManyWithoutMusyrifInput = {
    create?: XOR<YmqGroupCreateWithoutMusyrifInput, YmqGroupUncheckedCreateWithoutMusyrifInput> | YmqGroupCreateWithoutMusyrifInput[] | YmqGroupUncheckedCreateWithoutMusyrifInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutMusyrifInput | YmqGroupCreateOrConnectWithoutMusyrifInput[]
    createMany?: YmqGroupCreateManyMusyrifInputEnvelope
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
  }

  export type YmqMemberCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput> | YmqMemberCreateWithoutUserInput[] | YmqMemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutUserInput | YmqMemberCreateOrConnectWithoutUserInput[]
    createMany?: YmqMemberCreateManyUserInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type YmqSetoranCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqSetoranCreateWithoutUserInput, YmqSetoranUncheckedCreateWithoutUserInput> | YmqSetoranCreateWithoutUserInput[] | YmqSetoranUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutUserInput | YmqSetoranCreateOrConnectWithoutUserInput[]
    createMany?: YmqSetoranCreateManyUserInputEnvelope
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
  }

  export type YmqSetoranCreateNestedManyWithoutVerifiedByInput = {
    create?: XOR<YmqSetoranCreateWithoutVerifiedByInput, YmqSetoranUncheckedCreateWithoutVerifiedByInput> | YmqSetoranCreateWithoutVerifiedByInput[] | YmqSetoranUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutVerifiedByInput | YmqSetoranCreateOrConnectWithoutVerifiedByInput[]
    createMany?: YmqSetoranCreateManyVerifiedByInputEnvelope
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
  }

  export type YmqTargetCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqTargetCreateWithoutUserInput, YmqTargetUncheckedCreateWithoutUserInput> | YmqTargetCreateWithoutUserInput[] | YmqTargetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqTargetCreateOrConnectWithoutUserInput | YmqTargetCreateOrConnectWithoutUserInput[]
    createMany?: YmqTargetCreateManyUserInputEnvelope
    connect?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
  }

  export type YmqGroupUncheckedCreateNestedManyWithoutMusyrifInput = {
    create?: XOR<YmqGroupCreateWithoutMusyrifInput, YmqGroupUncheckedCreateWithoutMusyrifInput> | YmqGroupCreateWithoutMusyrifInput[] | YmqGroupUncheckedCreateWithoutMusyrifInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutMusyrifInput | YmqGroupCreateOrConnectWithoutMusyrifInput[]
    createMany?: YmqGroupCreateManyMusyrifInputEnvelope
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
  }

  export type YmqMemberUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput> | YmqMemberCreateWithoutUserInput[] | YmqMemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutUserInput | YmqMemberCreateOrConnectWithoutUserInput[]
    createMany?: YmqMemberCreateManyUserInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type YmqSetoranUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqSetoranCreateWithoutUserInput, YmqSetoranUncheckedCreateWithoutUserInput> | YmqSetoranCreateWithoutUserInput[] | YmqSetoranUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutUserInput | YmqSetoranCreateOrConnectWithoutUserInput[]
    createMany?: YmqSetoranCreateManyUserInputEnvelope
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
  }

  export type YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput = {
    create?: XOR<YmqSetoranCreateWithoutVerifiedByInput, YmqSetoranUncheckedCreateWithoutVerifiedByInput> | YmqSetoranCreateWithoutVerifiedByInput[] | YmqSetoranUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutVerifiedByInput | YmqSetoranCreateOrConnectWithoutVerifiedByInput[]
    createMany?: YmqSetoranCreateManyVerifiedByInputEnvelope
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
  }

  export type YmqTargetUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqTargetCreateWithoutUserInput, YmqTargetUncheckedCreateWithoutUserInput> | YmqTargetCreateWithoutUserInput[] | YmqTargetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqTargetCreateOrConnectWithoutUserInput | YmqTargetCreateOrConnectWithoutUserInput[]
    createMany?: YmqTargetCreateManyUserInputEnvelope
    connect?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type YmqGroupUpdateManyWithoutMusyrifNestedInput = {
    create?: XOR<YmqGroupCreateWithoutMusyrifInput, YmqGroupUncheckedCreateWithoutMusyrifInput> | YmqGroupCreateWithoutMusyrifInput[] | YmqGroupUncheckedCreateWithoutMusyrifInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutMusyrifInput | YmqGroupCreateOrConnectWithoutMusyrifInput[]
    upsert?: YmqGroupUpsertWithWhereUniqueWithoutMusyrifInput | YmqGroupUpsertWithWhereUniqueWithoutMusyrifInput[]
    createMany?: YmqGroupCreateManyMusyrifInputEnvelope
    set?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    disconnect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    delete?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    update?: YmqGroupUpdateWithWhereUniqueWithoutMusyrifInput | YmqGroupUpdateWithWhereUniqueWithoutMusyrifInput[]
    updateMany?: YmqGroupUpdateManyWithWhereWithoutMusyrifInput | YmqGroupUpdateManyWithWhereWithoutMusyrifInput[]
    deleteMany?: YmqGroupScalarWhereInput | YmqGroupScalarWhereInput[]
  }

  export type YmqMemberUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput> | YmqMemberCreateWithoutUserInput[] | YmqMemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutUserInput | YmqMemberCreateOrConnectWithoutUserInput[]
    upsert?: YmqMemberUpsertWithWhereUniqueWithoutUserInput | YmqMemberUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqMemberCreateManyUserInputEnvelope
    set?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    disconnect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    delete?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    update?: YmqMemberUpdateWithWhereUniqueWithoutUserInput | YmqMemberUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqMemberUpdateManyWithWhereWithoutUserInput | YmqMemberUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqMemberScalarWhereInput | YmqMemberScalarWhereInput[]
  }

  export type YmqSetoranUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqSetoranCreateWithoutUserInput, YmqSetoranUncheckedCreateWithoutUserInput> | YmqSetoranCreateWithoutUserInput[] | YmqSetoranUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutUserInput | YmqSetoranCreateOrConnectWithoutUserInput[]
    upsert?: YmqSetoranUpsertWithWhereUniqueWithoutUserInput | YmqSetoranUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqSetoranCreateManyUserInputEnvelope
    set?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    disconnect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    delete?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    update?: YmqSetoranUpdateWithWhereUniqueWithoutUserInput | YmqSetoranUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqSetoranUpdateManyWithWhereWithoutUserInput | YmqSetoranUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqSetoranScalarWhereInput | YmqSetoranScalarWhereInput[]
  }

  export type YmqSetoranUpdateManyWithoutVerifiedByNestedInput = {
    create?: XOR<YmqSetoranCreateWithoutVerifiedByInput, YmqSetoranUncheckedCreateWithoutVerifiedByInput> | YmqSetoranCreateWithoutVerifiedByInput[] | YmqSetoranUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutVerifiedByInput | YmqSetoranCreateOrConnectWithoutVerifiedByInput[]
    upsert?: YmqSetoranUpsertWithWhereUniqueWithoutVerifiedByInput | YmqSetoranUpsertWithWhereUniqueWithoutVerifiedByInput[]
    createMany?: YmqSetoranCreateManyVerifiedByInputEnvelope
    set?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    disconnect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    delete?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    update?: YmqSetoranUpdateWithWhereUniqueWithoutVerifiedByInput | YmqSetoranUpdateWithWhereUniqueWithoutVerifiedByInput[]
    updateMany?: YmqSetoranUpdateManyWithWhereWithoutVerifiedByInput | YmqSetoranUpdateManyWithWhereWithoutVerifiedByInput[]
    deleteMany?: YmqSetoranScalarWhereInput | YmqSetoranScalarWhereInput[]
  }

  export type YmqTargetUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqTargetCreateWithoutUserInput, YmqTargetUncheckedCreateWithoutUserInput> | YmqTargetCreateWithoutUserInput[] | YmqTargetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqTargetCreateOrConnectWithoutUserInput | YmqTargetCreateOrConnectWithoutUserInput[]
    upsert?: YmqTargetUpsertWithWhereUniqueWithoutUserInput | YmqTargetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqTargetCreateManyUserInputEnvelope
    set?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    disconnect?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    delete?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    connect?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    update?: YmqTargetUpdateWithWhereUniqueWithoutUserInput | YmqTargetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqTargetUpdateManyWithWhereWithoutUserInput | YmqTargetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqTargetScalarWhereInput | YmqTargetScalarWhereInput[]
  }

  export type YmqGroupUncheckedUpdateManyWithoutMusyrifNestedInput = {
    create?: XOR<YmqGroupCreateWithoutMusyrifInput, YmqGroupUncheckedCreateWithoutMusyrifInput> | YmqGroupCreateWithoutMusyrifInput[] | YmqGroupUncheckedCreateWithoutMusyrifInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutMusyrifInput | YmqGroupCreateOrConnectWithoutMusyrifInput[]
    upsert?: YmqGroupUpsertWithWhereUniqueWithoutMusyrifInput | YmqGroupUpsertWithWhereUniqueWithoutMusyrifInput[]
    createMany?: YmqGroupCreateManyMusyrifInputEnvelope
    set?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    disconnect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    delete?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    update?: YmqGroupUpdateWithWhereUniqueWithoutMusyrifInput | YmqGroupUpdateWithWhereUniqueWithoutMusyrifInput[]
    updateMany?: YmqGroupUpdateManyWithWhereWithoutMusyrifInput | YmqGroupUpdateManyWithWhereWithoutMusyrifInput[]
    deleteMany?: YmqGroupScalarWhereInput | YmqGroupScalarWhereInput[]
  }

  export type YmqMemberUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput> | YmqMemberCreateWithoutUserInput[] | YmqMemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutUserInput | YmqMemberCreateOrConnectWithoutUserInput[]
    upsert?: YmqMemberUpsertWithWhereUniqueWithoutUserInput | YmqMemberUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqMemberCreateManyUserInputEnvelope
    set?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    disconnect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    delete?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    update?: YmqMemberUpdateWithWhereUniqueWithoutUserInput | YmqMemberUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqMemberUpdateManyWithWhereWithoutUserInput | YmqMemberUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqMemberScalarWhereInput | YmqMemberScalarWhereInput[]
  }

  export type YmqSetoranUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqSetoranCreateWithoutUserInput, YmqSetoranUncheckedCreateWithoutUserInput> | YmqSetoranCreateWithoutUserInput[] | YmqSetoranUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutUserInput | YmqSetoranCreateOrConnectWithoutUserInput[]
    upsert?: YmqSetoranUpsertWithWhereUniqueWithoutUserInput | YmqSetoranUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqSetoranCreateManyUserInputEnvelope
    set?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    disconnect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    delete?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    update?: YmqSetoranUpdateWithWhereUniqueWithoutUserInput | YmqSetoranUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqSetoranUpdateManyWithWhereWithoutUserInput | YmqSetoranUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqSetoranScalarWhereInput | YmqSetoranScalarWhereInput[]
  }

  export type YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput = {
    create?: XOR<YmqSetoranCreateWithoutVerifiedByInput, YmqSetoranUncheckedCreateWithoutVerifiedByInput> | YmqSetoranCreateWithoutVerifiedByInput[] | YmqSetoranUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: YmqSetoranCreateOrConnectWithoutVerifiedByInput | YmqSetoranCreateOrConnectWithoutVerifiedByInput[]
    upsert?: YmqSetoranUpsertWithWhereUniqueWithoutVerifiedByInput | YmqSetoranUpsertWithWhereUniqueWithoutVerifiedByInput[]
    createMany?: YmqSetoranCreateManyVerifiedByInputEnvelope
    set?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    disconnect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    delete?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    connect?: YmqSetoranWhereUniqueInput | YmqSetoranWhereUniqueInput[]
    update?: YmqSetoranUpdateWithWhereUniqueWithoutVerifiedByInput | YmqSetoranUpdateWithWhereUniqueWithoutVerifiedByInput[]
    updateMany?: YmqSetoranUpdateManyWithWhereWithoutVerifiedByInput | YmqSetoranUpdateManyWithWhereWithoutVerifiedByInput[]
    deleteMany?: YmqSetoranScalarWhereInput | YmqSetoranScalarWhereInput[]
  }

  export type YmqTargetUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqTargetCreateWithoutUserInput, YmqTargetUncheckedCreateWithoutUserInput> | YmqTargetCreateWithoutUserInput[] | YmqTargetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqTargetCreateOrConnectWithoutUserInput | YmqTargetCreateOrConnectWithoutUserInput[]
    upsert?: YmqTargetUpsertWithWhereUniqueWithoutUserInput | YmqTargetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqTargetCreateManyUserInputEnvelope
    set?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    disconnect?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    delete?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    connect?: YmqTargetWhereUniqueInput | YmqTargetWhereUniqueInput[]
    update?: YmqTargetUpdateWithWhereUniqueWithoutUserInput | YmqTargetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqTargetUpdateManyWithWhereWithoutUserInput | YmqTargetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqTargetScalarWhereInput | YmqTargetScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutGroupsAsMusyrifInput = {
    create?: XOR<UserCreateWithoutGroupsAsMusyrifInput, UserUncheckedCreateWithoutGroupsAsMusyrifInput>
    connectOrCreate?: UserCreateOrConnectWithoutGroupsAsMusyrifInput
    connect?: UserWhereUniqueInput
  }

  export type YmqMemberCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput> | YmqMemberCreateWithoutGroupInput[] | YmqMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutGroupInput | YmqMemberCreateOrConnectWithoutGroupInput[]
    createMany?: YmqMemberCreateManyGroupInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type YmqMemberUncheckedCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput> | YmqMemberCreateWithoutGroupInput[] | YmqMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutGroupInput | YmqMemberCreateOrConnectWithoutGroupInput[]
    createMany?: YmqMemberCreateManyGroupInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutGroupsAsMusyrifNestedInput = {
    create?: XOR<UserCreateWithoutGroupsAsMusyrifInput, UserUncheckedCreateWithoutGroupsAsMusyrifInput>
    connectOrCreate?: UserCreateOrConnectWithoutGroupsAsMusyrifInput
    upsert?: UserUpsertWithoutGroupsAsMusyrifInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGroupsAsMusyrifInput, UserUpdateWithoutGroupsAsMusyrifInput>, UserUncheckedUpdateWithoutGroupsAsMusyrifInput>
  }

  export type YmqMemberUpdateManyWithoutGroupNestedInput = {
    create?: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput> | YmqMemberCreateWithoutGroupInput[] | YmqMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutGroupInput | YmqMemberCreateOrConnectWithoutGroupInput[]
    upsert?: YmqMemberUpsertWithWhereUniqueWithoutGroupInput | YmqMemberUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: YmqMemberCreateManyGroupInputEnvelope
    set?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    disconnect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    delete?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    update?: YmqMemberUpdateWithWhereUniqueWithoutGroupInput | YmqMemberUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: YmqMemberUpdateManyWithWhereWithoutGroupInput | YmqMemberUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: YmqMemberScalarWhereInput | YmqMemberScalarWhereInput[]
  }

  export type YmqMemberUncheckedUpdateManyWithoutGroupNestedInput = {
    create?: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput> | YmqMemberCreateWithoutGroupInput[] | YmqMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutGroupInput | YmqMemberCreateOrConnectWithoutGroupInput[]
    upsert?: YmqMemberUpsertWithWhereUniqueWithoutGroupInput | YmqMemberUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: YmqMemberCreateManyGroupInputEnvelope
    set?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    disconnect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    delete?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
    update?: YmqMemberUpdateWithWhereUniqueWithoutGroupInput | YmqMemberUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: YmqMemberUpdateManyWithWhereWithoutGroupInput | YmqMemberUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: YmqMemberScalarWhereInput | YmqMemberScalarWhereInput[]
  }

  export type YmqGroupCreateNestedOneWithoutMembersInput = {
    create?: XOR<YmqGroupCreateWithoutMembersInput, YmqGroupUncheckedCreateWithoutMembersInput>
    connectOrCreate?: YmqGroupCreateOrConnectWithoutMembersInput
    connect?: YmqGroupWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipsInput
    connect?: UserWhereUniqueInput
  }

  export type YmqGroupUpdateOneRequiredWithoutMembersNestedInput = {
    create?: XOR<YmqGroupCreateWithoutMembersInput, YmqGroupUncheckedCreateWithoutMembersInput>
    connectOrCreate?: YmqGroupCreateOrConnectWithoutMembersInput
    upsert?: YmqGroupUpsertWithoutMembersInput
    connect?: YmqGroupWhereUniqueInput
    update?: XOR<XOR<YmqGroupUpdateToOneWithWhereWithoutMembersInput, YmqGroupUpdateWithoutMembersInput>, YmqGroupUncheckedUpdateWithoutMembersInput>
  }

  export type UserUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipsInput
    upsert?: UserUpsertWithoutMembershipsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMembershipsInput, UserUpdateWithoutMembershipsInput>, UserUncheckedUpdateWithoutMembershipsInput>
  }

  export type UserCreateNestedOneWithoutSetoranListInput = {
    create?: XOR<UserCreateWithoutSetoranListInput, UserUncheckedCreateWithoutSetoranListInput>
    connectOrCreate?: UserCreateOrConnectWithoutSetoranListInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutVerifiedSetoransInput = {
    create?: XOR<UserCreateWithoutVerifiedSetoransInput, UserUncheckedCreateWithoutVerifiedSetoransInput>
    connectOrCreate?: UserCreateOrConnectWithoutVerifiedSetoransInput
    connect?: UserWhereUniqueInput
  }

  export type EnumSetoranTypeFieldUpdateOperationsInput = {
    set?: $Enums.SetoranType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumVerificationStatusFieldUpdateOperationsInput = {
    set?: $Enums.VerificationStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutSetoranListNestedInput = {
    create?: XOR<UserCreateWithoutSetoranListInput, UserUncheckedCreateWithoutSetoranListInput>
    connectOrCreate?: UserCreateOrConnectWithoutSetoranListInput
    upsert?: UserUpsertWithoutSetoranListInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSetoranListInput, UserUpdateWithoutSetoranListInput>, UserUncheckedUpdateWithoutSetoranListInput>
  }

  export type UserUpdateOneWithoutVerifiedSetoransNestedInput = {
    create?: XOR<UserCreateWithoutVerifiedSetoransInput, UserUncheckedCreateWithoutVerifiedSetoransInput>
    connectOrCreate?: UserCreateOrConnectWithoutVerifiedSetoransInput
    upsert?: UserUpsertWithoutVerifiedSetoransInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutVerifiedSetoransInput, UserUpdateWithoutVerifiedSetoransInput>, UserUncheckedUpdateWithoutVerifiedSetoransInput>
  }

  export type UserCreateNestedOneWithoutTargetsInput = {
    create?: XOR<UserCreateWithoutTargetsInput, UserUncheckedCreateWithoutTargetsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTargetsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTargetsNestedInput = {
    create?: XOR<UserCreateWithoutTargetsInput, UserUncheckedCreateWithoutTargetsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTargetsInput
    upsert?: UserUpsertWithoutTargetsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTargetsInput, UserUpdateWithoutTargetsInput>, UserUncheckedUpdateWithoutTargetsInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumSetoranTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SetoranType | EnumSetoranTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSetoranTypeFilter<$PrismaModel> | $Enums.SetoranType
  }

  export type NestedEnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumSetoranTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SetoranType | EnumSetoranTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SetoranType[] | ListEnumSetoranTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSetoranTypeWithAggregatesFilter<$PrismaModel> | $Enums.SetoranType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSetoranTypeFilter<$PrismaModel>
    _max?: NestedEnumSetoranTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type YmqGroupCreateWithoutMusyrifInput = {
    id?: string
    name: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUncheckedCreateWithoutMusyrifInput = {
    id?: string
    name: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberUncheckedCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupCreateOrConnectWithoutMusyrifInput = {
    where: YmqGroupWhereUniqueInput
    create: XOR<YmqGroupCreateWithoutMusyrifInput, YmqGroupUncheckedCreateWithoutMusyrifInput>
  }

  export type YmqGroupCreateManyMusyrifInputEnvelope = {
    data: YmqGroupCreateManyMusyrifInput | YmqGroupCreateManyMusyrifInput[]
    skipDuplicates?: boolean
  }

  export type YmqMemberCreateWithoutUserInput = {
    id?: string
    joinedAt?: Date | string
    group: YmqGroupCreateNestedOneWithoutMembersInput
  }

  export type YmqMemberUncheckedCreateWithoutUserInput = {
    id?: string
    groupId: string
    joinedAt?: Date | string
  }

  export type YmqMemberCreateOrConnectWithoutUserInput = {
    where: YmqMemberWhereUniqueInput
    create: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput>
  }

  export type YmqMemberCreateManyUserInputEnvelope = {
    data: YmqMemberCreateManyUserInput | YmqMemberCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type YmqSetoranCreateWithoutUserInput = {
    id?: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    verifiedBy?: UserCreateNestedOneWithoutVerifiedSetoransInput
  }

  export type YmqSetoranUncheckedCreateWithoutUserInput = {
    id?: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type YmqSetoranCreateOrConnectWithoutUserInput = {
    where: YmqSetoranWhereUniqueInput
    create: XOR<YmqSetoranCreateWithoutUserInput, YmqSetoranUncheckedCreateWithoutUserInput>
  }

  export type YmqSetoranCreateManyUserInputEnvelope = {
    data: YmqSetoranCreateManyUserInput | YmqSetoranCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type YmqSetoranCreateWithoutVerifiedByInput = {
    id?: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutSetoranListInput
  }

  export type YmqSetoranUncheckedCreateWithoutVerifiedByInput = {
    id?: string
    userId: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type YmqSetoranCreateOrConnectWithoutVerifiedByInput = {
    where: YmqSetoranWhereUniqueInput
    create: XOR<YmqSetoranCreateWithoutVerifiedByInput, YmqSetoranUncheckedCreateWithoutVerifiedByInput>
  }

  export type YmqSetoranCreateManyVerifiedByInputEnvelope = {
    data: YmqSetoranCreateManyVerifiedByInput | YmqSetoranCreateManyVerifiedByInput[]
    skipDuplicates?: boolean
  }

  export type YmqTargetCreateWithoutUserInput = {
    id?: string
    periodeBulan: number
    periodeTahun: number
    targetKhatam?: number
    targetHafalanJuz?: number
    createdAt?: Date | string
  }

  export type YmqTargetUncheckedCreateWithoutUserInput = {
    id?: string
    periodeBulan: number
    periodeTahun: number
    targetKhatam?: number
    targetHafalanJuz?: number
    createdAt?: Date | string
  }

  export type YmqTargetCreateOrConnectWithoutUserInput = {
    where: YmqTargetWhereUniqueInput
    create: XOR<YmqTargetCreateWithoutUserInput, YmqTargetUncheckedCreateWithoutUserInput>
  }

  export type YmqTargetCreateManyUserInputEnvelope = {
    data: YmqTargetCreateManyUserInput | YmqTargetCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type YmqGroupUpsertWithWhereUniqueWithoutMusyrifInput = {
    where: YmqGroupWhereUniqueInput
    update: XOR<YmqGroupUpdateWithoutMusyrifInput, YmqGroupUncheckedUpdateWithoutMusyrifInput>
    create: XOR<YmqGroupCreateWithoutMusyrifInput, YmqGroupUncheckedCreateWithoutMusyrifInput>
  }

  export type YmqGroupUpdateWithWhereUniqueWithoutMusyrifInput = {
    where: YmqGroupWhereUniqueInput
    data: XOR<YmqGroupUpdateWithoutMusyrifInput, YmqGroupUncheckedUpdateWithoutMusyrifInput>
  }

  export type YmqGroupUpdateManyWithWhereWithoutMusyrifInput = {
    where: YmqGroupScalarWhereInput
    data: XOR<YmqGroupUpdateManyMutationInput, YmqGroupUncheckedUpdateManyWithoutMusyrifInput>
  }

  export type YmqGroupScalarWhereInput = {
    AND?: YmqGroupScalarWhereInput | YmqGroupScalarWhereInput[]
    OR?: YmqGroupScalarWhereInput[]
    NOT?: YmqGroupScalarWhereInput | YmqGroupScalarWhereInput[]
    id?: UuidFilter<"YmqGroup"> | string
    name?: StringFilter<"YmqGroup"> | string
    musyrifId?: UuidFilter<"YmqGroup"> | string
    description?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleDay?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleTime?: StringNullableFilter<"YmqGroup"> | string | null
    whatsappLink?: StringNullableFilter<"YmqGroup"> | string | null
    createdAt?: DateTimeFilter<"YmqGroup"> | Date | string
    updatedAt?: DateTimeFilter<"YmqGroup"> | Date | string
  }

  export type YmqMemberUpsertWithWhereUniqueWithoutUserInput = {
    where: YmqMemberWhereUniqueInput
    update: XOR<YmqMemberUpdateWithoutUserInput, YmqMemberUncheckedUpdateWithoutUserInput>
    create: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput>
  }

  export type YmqMemberUpdateWithWhereUniqueWithoutUserInput = {
    where: YmqMemberWhereUniqueInput
    data: XOR<YmqMemberUpdateWithoutUserInput, YmqMemberUncheckedUpdateWithoutUserInput>
  }

  export type YmqMemberUpdateManyWithWhereWithoutUserInput = {
    where: YmqMemberScalarWhereInput
    data: XOR<YmqMemberUpdateManyMutationInput, YmqMemberUncheckedUpdateManyWithoutUserInput>
  }

  export type YmqMemberScalarWhereInput = {
    AND?: YmqMemberScalarWhereInput | YmqMemberScalarWhereInput[]
    OR?: YmqMemberScalarWhereInput[]
    NOT?: YmqMemberScalarWhereInput | YmqMemberScalarWhereInput[]
    id?: UuidFilter<"YmqMember"> | string
    groupId?: UuidFilter<"YmqMember"> | string
    userId?: UuidFilter<"YmqMember"> | string
    joinedAt?: DateTimeFilter<"YmqMember"> | Date | string
  }

  export type YmqSetoranUpsertWithWhereUniqueWithoutUserInput = {
    where: YmqSetoranWhereUniqueInput
    update: XOR<YmqSetoranUpdateWithoutUserInput, YmqSetoranUncheckedUpdateWithoutUserInput>
    create: XOR<YmqSetoranCreateWithoutUserInput, YmqSetoranUncheckedCreateWithoutUserInput>
  }

  export type YmqSetoranUpdateWithWhereUniqueWithoutUserInput = {
    where: YmqSetoranWhereUniqueInput
    data: XOR<YmqSetoranUpdateWithoutUserInput, YmqSetoranUncheckedUpdateWithoutUserInput>
  }

  export type YmqSetoranUpdateManyWithWhereWithoutUserInput = {
    where: YmqSetoranScalarWhereInput
    data: XOR<YmqSetoranUpdateManyMutationInput, YmqSetoranUncheckedUpdateManyWithoutUserInput>
  }

  export type YmqSetoranScalarWhereInput = {
    AND?: YmqSetoranScalarWhereInput | YmqSetoranScalarWhereInput[]
    OR?: YmqSetoranScalarWhereInput[]
    NOT?: YmqSetoranScalarWhereInput | YmqSetoranScalarWhereInput[]
    id?: UuidFilter<"YmqSetoran"> | string
    userId?: UuidFilter<"YmqSetoran"> | string
    date?: DateTimeFilter<"YmqSetoran"> | Date | string
    jenis?: EnumSetoranTypeFilter<"YmqSetoran"> | $Enums.SetoranType
    surahMulai?: StringFilter<"YmqSetoran"> | string
    ayatMulai?: IntFilter<"YmqSetoran"> | number
    surahSelesai?: StringFilter<"YmqSetoran"> | string
    ayatSelesai?: IntFilter<"YmqSetoran"> | number
    jumlahHalaman?: IntFilter<"YmqSetoran"> | number
    catatan?: StringNullableFilter<"YmqSetoran"> | string | null
    statusVerifikasi?: EnumVerificationStatusFilter<"YmqSetoran"> | $Enums.VerificationStatus
    catatanMusyrif?: StringNullableFilter<"YmqSetoran"> | string | null
    verifiedById?: UuidNullableFilter<"YmqSetoran"> | string | null
    verifiedAt?: DateTimeNullableFilter<"YmqSetoran"> | Date | string | null
    createdAt?: DateTimeFilter<"YmqSetoran"> | Date | string
  }

  export type YmqSetoranUpsertWithWhereUniqueWithoutVerifiedByInput = {
    where: YmqSetoranWhereUniqueInput
    update: XOR<YmqSetoranUpdateWithoutVerifiedByInput, YmqSetoranUncheckedUpdateWithoutVerifiedByInput>
    create: XOR<YmqSetoranCreateWithoutVerifiedByInput, YmqSetoranUncheckedCreateWithoutVerifiedByInput>
  }

  export type YmqSetoranUpdateWithWhereUniqueWithoutVerifiedByInput = {
    where: YmqSetoranWhereUniqueInput
    data: XOR<YmqSetoranUpdateWithoutVerifiedByInput, YmqSetoranUncheckedUpdateWithoutVerifiedByInput>
  }

  export type YmqSetoranUpdateManyWithWhereWithoutVerifiedByInput = {
    where: YmqSetoranScalarWhereInput
    data: XOR<YmqSetoranUpdateManyMutationInput, YmqSetoranUncheckedUpdateManyWithoutVerifiedByInput>
  }

  export type YmqTargetUpsertWithWhereUniqueWithoutUserInput = {
    where: YmqTargetWhereUniqueInput
    update: XOR<YmqTargetUpdateWithoutUserInput, YmqTargetUncheckedUpdateWithoutUserInput>
    create: XOR<YmqTargetCreateWithoutUserInput, YmqTargetUncheckedCreateWithoutUserInput>
  }

  export type YmqTargetUpdateWithWhereUniqueWithoutUserInput = {
    where: YmqTargetWhereUniqueInput
    data: XOR<YmqTargetUpdateWithoutUserInput, YmqTargetUncheckedUpdateWithoutUserInput>
  }

  export type YmqTargetUpdateManyWithWhereWithoutUserInput = {
    where: YmqTargetScalarWhereInput
    data: XOR<YmqTargetUpdateManyMutationInput, YmqTargetUncheckedUpdateManyWithoutUserInput>
  }

  export type YmqTargetScalarWhereInput = {
    AND?: YmqTargetScalarWhereInput | YmqTargetScalarWhereInput[]
    OR?: YmqTargetScalarWhereInput[]
    NOT?: YmqTargetScalarWhereInput | YmqTargetScalarWhereInput[]
    id?: UuidFilter<"YmqTarget"> | string
    userId?: UuidFilter<"YmqTarget"> | string
    periodeBulan?: IntFilter<"YmqTarget"> | number
    periodeTahun?: IntFilter<"YmqTarget"> | number
    targetKhatam?: IntFilter<"YmqTarget"> | number
    targetHafalanJuz?: IntFilter<"YmqTarget"> | number
    createdAt?: DateTimeFilter<"YmqTarget"> | Date | string
  }

  export type UserCreateWithoutGroupsAsMusyrifInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGroupsAsMusyrifInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGroupsAsMusyrifInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGroupsAsMusyrifInput, UserUncheckedCreateWithoutGroupsAsMusyrifInput>
  }

  export type YmqMemberCreateWithoutGroupInput = {
    id?: string
    joinedAt?: Date | string
    user: UserCreateNestedOneWithoutMembershipsInput
  }

  export type YmqMemberUncheckedCreateWithoutGroupInput = {
    id?: string
    userId: string
    joinedAt?: Date | string
  }

  export type YmqMemberCreateOrConnectWithoutGroupInput = {
    where: YmqMemberWhereUniqueInput
    create: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput>
  }

  export type YmqMemberCreateManyGroupInputEnvelope = {
    data: YmqMemberCreateManyGroupInput | YmqMemberCreateManyGroupInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutGroupsAsMusyrifInput = {
    update: XOR<UserUpdateWithoutGroupsAsMusyrifInput, UserUncheckedUpdateWithoutGroupsAsMusyrifInput>
    create: XOR<UserCreateWithoutGroupsAsMusyrifInput, UserUncheckedCreateWithoutGroupsAsMusyrifInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGroupsAsMusyrifInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGroupsAsMusyrifInput, UserUncheckedUpdateWithoutGroupsAsMusyrifInput>
  }

  export type UserUpdateWithoutGroupsAsMusyrifInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGroupsAsMusyrifInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type YmqMemberUpsertWithWhereUniqueWithoutGroupInput = {
    where: YmqMemberWhereUniqueInput
    update: XOR<YmqMemberUpdateWithoutGroupInput, YmqMemberUncheckedUpdateWithoutGroupInput>
    create: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput>
  }

  export type YmqMemberUpdateWithWhereUniqueWithoutGroupInput = {
    where: YmqMemberWhereUniqueInput
    data: XOR<YmqMemberUpdateWithoutGroupInput, YmqMemberUncheckedUpdateWithoutGroupInput>
  }

  export type YmqMemberUpdateManyWithWhereWithoutGroupInput = {
    where: YmqMemberScalarWhereInput
    data: XOR<YmqMemberUpdateManyMutationInput, YmqMemberUncheckedUpdateManyWithoutGroupInput>
  }

  export type YmqGroupCreateWithoutMembersInput = {
    id?: string
    name: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    musyrif: UserCreateNestedOneWithoutGroupsAsMusyrifInput
  }

  export type YmqGroupUncheckedCreateWithoutMembersInput = {
    id?: string
    name: string
    musyrifId: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqGroupCreateOrConnectWithoutMembersInput = {
    where: YmqGroupWhereUniqueInput
    create: XOR<YmqGroupCreateWithoutMembersInput, YmqGroupUncheckedCreateWithoutMembersInput>
  }

  export type UserCreateWithoutMembershipsInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupCreateNestedManyWithoutMusyrifInput
    setoranList?: YmqSetoranCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMembershipsInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupUncheckedCreateNestedManyWithoutMusyrifInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMembershipsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
  }

  export type YmqGroupUpsertWithoutMembersInput = {
    update: XOR<YmqGroupUpdateWithoutMembersInput, YmqGroupUncheckedUpdateWithoutMembersInput>
    create: XOR<YmqGroupCreateWithoutMembersInput, YmqGroupUncheckedCreateWithoutMembersInput>
    where?: YmqGroupWhereInput
  }

  export type YmqGroupUpdateToOneWithWhereWithoutMembersInput = {
    where?: YmqGroupWhereInput
    data: XOR<YmqGroupUpdateWithoutMembersInput, YmqGroupUncheckedUpdateWithoutMembersInput>
  }

  export type YmqGroupUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    musyrif?: UserUpdateOneRequiredWithoutGroupsAsMusyrifNestedInput
  }

  export type YmqGroupUncheckedUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    musyrifId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutMembershipsInput = {
    update: XOR<UserUpdateWithoutMembershipsInput, UserUncheckedUpdateWithoutMembershipsInput>
    create: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMembershipsInput, UserUncheckedUpdateWithoutMembershipsInput>
  }

  export type UserUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUpdateManyWithoutMusyrifNestedInput
    setoranList?: YmqSetoranUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUncheckedUpdateManyWithoutMusyrifNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutSetoranListInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSetoranListInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupUncheckedCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSetoranListInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSetoranListInput, UserUncheckedCreateWithoutSetoranListInput>
  }

  export type UserCreateWithoutVerifiedSetoransInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranCreateNestedManyWithoutUserInput
    targets?: YmqTargetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutVerifiedSetoransInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupUncheckedCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutVerifiedSetoransInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutVerifiedSetoransInput, UserUncheckedCreateWithoutVerifiedSetoransInput>
  }

  export type UserUpsertWithoutSetoranListInput = {
    update: XOR<UserUpdateWithoutSetoranListInput, UserUncheckedUpdateWithoutSetoranListInput>
    create: XOR<UserCreateWithoutSetoranListInput, UserUncheckedCreateWithoutSetoranListInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSetoranListInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSetoranListInput, UserUncheckedUpdateWithoutSetoranListInput>
  }

  export type UserUpdateWithoutSetoranListInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSetoranListInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUncheckedUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutVerifiedSetoransInput = {
    update: XOR<UserUpdateWithoutVerifiedSetoransInput, UserUncheckedUpdateWithoutVerifiedSetoransInput>
    create: XOR<UserCreateWithoutVerifiedSetoransInput, UserUncheckedCreateWithoutVerifiedSetoransInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutVerifiedSetoransInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutVerifiedSetoransInput, UserUncheckedUpdateWithoutVerifiedSetoransInput>
  }

  export type UserUpdateWithoutVerifiedSetoransInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUpdateManyWithoutUserNestedInput
    targets?: YmqTargetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutVerifiedSetoransInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUncheckedUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    targets?: YmqTargetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutTargetsInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranCreateNestedManyWithoutVerifiedByInput
  }

  export type UserUncheckedCreateWithoutTargetsInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsMusyrif?: YmqGroupUncheckedCreateNestedManyWithoutMusyrifInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
  }

  export type UserCreateOrConnectWithoutTargetsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTargetsInput, UserUncheckedCreateWithoutTargetsInput>
  }

  export type UserUpsertWithoutTargetsInput = {
    update: XOR<UserUpdateWithoutTargetsInput, UserUncheckedUpdateWithoutTargetsInput>
    create: XOR<UserCreateWithoutTargetsInput, UserUncheckedCreateWithoutTargetsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTargetsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTargetsInput, UserUncheckedUpdateWithoutTargetsInput>
  }

  export type UserUpdateWithoutTargetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUpdateManyWithoutVerifiedByNestedInput
  }

  export type UserUncheckedUpdateWithoutTargetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsMusyrif?: YmqGroupUncheckedUpdateManyWithoutMusyrifNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
  }

  export type YmqGroupCreateManyMusyrifInput = {
    id?: string
    name: string
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqMemberCreateManyUserInput = {
    id?: string
    groupId: string
    joinedAt?: Date | string
  }

  export type YmqSetoranCreateManyUserInput = {
    id?: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type YmqSetoranCreateManyVerifiedByInput = {
    id?: string
    userId: string
    date: Date | string
    jenis?: $Enums.SetoranType
    surahMulai: string
    ayatMulai: number
    surahSelesai: string
    ayatSelesai: number
    jumlahHalaman?: number
    catatan?: string | null
    statusVerifikasi?: $Enums.VerificationStatus
    catatanMusyrif?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type YmqTargetCreateManyUserInput = {
    id?: string
    periodeBulan: number
    periodeTahun: number
    targetKhatam?: number
    targetHafalanJuz?: number
    createdAt?: Date | string
  }

  export type YmqGroupUpdateWithoutMusyrifInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateWithoutMusyrifInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateManyWithoutMusyrifInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqMemberUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: YmqGroupUpdateOneRequiredWithoutMembersNestedInput
  }

  export type YmqMemberUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqMemberUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSetoranUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: UserUpdateOneWithoutVerifiedSetoransNestedInput
  }

  export type YmqSetoranUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSetoranUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSetoranUpdateWithoutVerifiedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSetoranListNestedInput
  }

  export type YmqSetoranUncheckedUpdateWithoutVerifiedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSetoranUncheckedUpdateManyWithoutVerifiedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    jenis?: EnumSetoranTypeFieldUpdateOperationsInput | $Enums.SetoranType
    surahMulai?: StringFieldUpdateOperationsInput | string
    ayatMulai?: IntFieldUpdateOperationsInput | number
    surahSelesai?: StringFieldUpdateOperationsInput | string
    ayatSelesai?: IntFieldUpdateOperationsInput | number
    jumlahHalaman?: IntFieldUpdateOperationsInput | number
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    statusVerifikasi?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    catatanMusyrif?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqTargetUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodeBulan?: IntFieldUpdateOperationsInput | number
    periodeTahun?: IntFieldUpdateOperationsInput | number
    targetKhatam?: IntFieldUpdateOperationsInput | number
    targetHafalanJuz?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqTargetUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodeBulan?: IntFieldUpdateOperationsInput | number
    periodeTahun?: IntFieldUpdateOperationsInput | number
    targetKhatam?: IntFieldUpdateOperationsInput | number
    targetHafalanJuz?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqTargetUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodeBulan?: IntFieldUpdateOperationsInput | number
    periodeTahun?: IntFieldUpdateOperationsInput | number
    targetKhatam?: IntFieldUpdateOperationsInput | number
    targetHafalanJuz?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqMemberCreateManyGroupInput = {
    id?: string
    userId: string
    joinedAt?: Date | string
  }

  export type YmqMemberUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type YmqMemberUncheckedUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqMemberUncheckedUpdateManyWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}