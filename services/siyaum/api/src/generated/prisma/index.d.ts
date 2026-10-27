
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
 * Model YmqIwrCurriculumUnit
 * 
 */
export type YmqIwrCurriculumUnit = $Result.DefaultSelection<Prisma.$YmqIwrCurriculumUnitPayload>
/**
 * Model YmqGroupAdminAssignment
 * 
 */
export type YmqGroupAdminAssignment = $Result.DefaultSelection<Prisma.$YmqGroupAdminAssignmentPayload>
/**
 * Model YmqLearningSession
 * 
 */
export type YmqLearningSession = $Result.DefaultSelection<Prisma.$YmqLearningSessionPayload>
/**
 * Model YmqSessionAttendance
 * 
 */
export type YmqSessionAttendance = $Result.DefaultSelection<Prisma.$YmqSessionAttendancePayload>
/**
 * Model YmqLearningProgress
 * 
 */
export type YmqLearningProgress = $Result.DefaultSelection<Prisma.$YmqLearningProgressPayload>
/**
 * Model YmqProgressEvidence
 * 
 */
export type YmqProgressEvidence = $Result.DefaultSelection<Prisma.$YmqProgressEvidencePayload>

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


export const YmqGroupLevel: {
  pra_tahsin: 'pra_tahsin',
  tahsin: 'tahsin',
  tahfiz: 'tahfiz'
};

export type YmqGroupLevel = (typeof YmqGroupLevel)[keyof typeof YmqGroupLevel]


export const IwrLevel: {
  iwr_1: 'iwr_1',
  iwr_2: 'iwr_2'
};

export type IwrLevel = (typeof IwrLevel)[keyof typeof IwrLevel]


export const AttendanceStatus: {
  hadir: 'hadir',
  izin: 'izin',
  sakit: 'sakit',
  alpa: 'alpa'
};

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus]


export const LearningTrack: {
  pra_tahsin: 'pra_tahsin',
  tahsin: 'tahsin',
  ziyadah: 'ziyadah'
};

export type LearningTrack = (typeof LearningTrack)[keyof typeof LearningTrack]


export const YmqGroupStaffRole: {
  admin_kelompok: 'admin_kelompok'
};

export type YmqGroupStaffRole = (typeof YmqGroupStaffRole)[keyof typeof YmqGroupStaffRole]

}

export type SetoranType = $Enums.SetoranType

export const SetoranType: typeof $Enums.SetoranType

export type VerificationStatus = $Enums.VerificationStatus

export const VerificationStatus: typeof $Enums.VerificationStatus

export type YmqGroupLevel = $Enums.YmqGroupLevel

export const YmqGroupLevel: typeof $Enums.YmqGroupLevel

export type IwrLevel = $Enums.IwrLevel

export const IwrLevel: typeof $Enums.IwrLevel

export type AttendanceStatus = $Enums.AttendanceStatus

export const AttendanceStatus: typeof $Enums.AttendanceStatus

export type LearningTrack = $Enums.LearningTrack

export const LearningTrack: typeof $Enums.LearningTrack

export type YmqGroupStaffRole = $Enums.YmqGroupStaffRole

export const YmqGroupStaffRole: typeof $Enums.YmqGroupStaffRole

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

  /**
   * `prisma.ymqIwrCurriculumUnit`: Exposes CRUD operations for the **YmqIwrCurriculumUnit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqIwrCurriculumUnits
    * const ymqIwrCurriculumUnits = await prisma.ymqIwrCurriculumUnit.findMany()
    * ```
    */
  get ymqIwrCurriculumUnit(): Prisma.YmqIwrCurriculumUnitDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqGroupAdminAssignment`: Exposes CRUD operations for the **YmqGroupAdminAssignment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqGroupAdminAssignments
    * const ymqGroupAdminAssignments = await prisma.ymqGroupAdminAssignment.findMany()
    * ```
    */
  get ymqGroupAdminAssignment(): Prisma.YmqGroupAdminAssignmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqLearningSession`: Exposes CRUD operations for the **YmqLearningSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqLearningSessions
    * const ymqLearningSessions = await prisma.ymqLearningSession.findMany()
    * ```
    */
  get ymqLearningSession(): Prisma.YmqLearningSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqSessionAttendance`: Exposes CRUD operations for the **YmqSessionAttendance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqSessionAttendances
    * const ymqSessionAttendances = await prisma.ymqSessionAttendance.findMany()
    * ```
    */
  get ymqSessionAttendance(): Prisma.YmqSessionAttendanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqLearningProgress`: Exposes CRUD operations for the **YmqLearningProgress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqLearningProgresses
    * const ymqLearningProgresses = await prisma.ymqLearningProgress.findMany()
    * ```
    */
  get ymqLearningProgress(): Prisma.YmqLearningProgressDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ymqProgressEvidence`: Exposes CRUD operations for the **YmqProgressEvidence** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more YmqProgressEvidences
    * const ymqProgressEvidences = await prisma.ymqProgressEvidence.findMany()
    * ```
    */
  get ymqProgressEvidence(): Prisma.YmqProgressEvidenceDelegate<ExtArgs, ClientOptions>;
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
    YmqTarget: 'YmqTarget',
    YmqIwrCurriculumUnit: 'YmqIwrCurriculumUnit',
    YmqGroupAdminAssignment: 'YmqGroupAdminAssignment',
    YmqLearningSession: 'YmqLearningSession',
    YmqSessionAttendance: 'YmqSessionAttendance',
    YmqLearningProgress: 'YmqLearningProgress',
    YmqProgressEvidence: 'YmqProgressEvidence'
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
      modelProps: "user" | "ymqGroup" | "ymqMember" | "ymqSetoran" | "ymqTarget" | "ymqIwrCurriculumUnit" | "ymqGroupAdminAssignment" | "ymqLearningSession" | "ymqSessionAttendance" | "ymqLearningProgress" | "ymqProgressEvidence"
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
      YmqIwrCurriculumUnit: {
        payload: Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>
        fields: Prisma.YmqIwrCurriculumUnitFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqIwrCurriculumUnitFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqIwrCurriculumUnitFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>
          }
          findFirst: {
            args: Prisma.YmqIwrCurriculumUnitFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqIwrCurriculumUnitFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>
          }
          findMany: {
            args: Prisma.YmqIwrCurriculumUnitFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>[]
          }
          create: {
            args: Prisma.YmqIwrCurriculumUnitCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>
          }
          createMany: {
            args: Prisma.YmqIwrCurriculumUnitCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqIwrCurriculumUnitCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>[]
          }
          delete: {
            args: Prisma.YmqIwrCurriculumUnitDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>
          }
          update: {
            args: Prisma.YmqIwrCurriculumUnitUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>
          }
          deleteMany: {
            args: Prisma.YmqIwrCurriculumUnitDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqIwrCurriculumUnitUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqIwrCurriculumUnitUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>[]
          }
          upsert: {
            args: Prisma.YmqIwrCurriculumUnitUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqIwrCurriculumUnitPayload>
          }
          aggregate: {
            args: Prisma.YmqIwrCurriculumUnitAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqIwrCurriculumUnit>
          }
          groupBy: {
            args: Prisma.YmqIwrCurriculumUnitGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqIwrCurriculumUnitGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqIwrCurriculumUnitCountArgs<ExtArgs>
            result: $Utils.Optional<YmqIwrCurriculumUnitCountAggregateOutputType> | number
          }
        }
      }
      YmqGroupAdminAssignment: {
        payload: Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>
        fields: Prisma.YmqGroupAdminAssignmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqGroupAdminAssignmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqGroupAdminAssignmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>
          }
          findFirst: {
            args: Prisma.YmqGroupAdminAssignmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqGroupAdminAssignmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>
          }
          findMany: {
            args: Prisma.YmqGroupAdminAssignmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>[]
          }
          create: {
            args: Prisma.YmqGroupAdminAssignmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>
          }
          createMany: {
            args: Prisma.YmqGroupAdminAssignmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqGroupAdminAssignmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>[]
          }
          delete: {
            args: Prisma.YmqGroupAdminAssignmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>
          }
          update: {
            args: Prisma.YmqGroupAdminAssignmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>
          }
          deleteMany: {
            args: Prisma.YmqGroupAdminAssignmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqGroupAdminAssignmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqGroupAdminAssignmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>[]
          }
          upsert: {
            args: Prisma.YmqGroupAdminAssignmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqGroupAdminAssignmentPayload>
          }
          aggregate: {
            args: Prisma.YmqGroupAdminAssignmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqGroupAdminAssignment>
          }
          groupBy: {
            args: Prisma.YmqGroupAdminAssignmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqGroupAdminAssignmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqGroupAdminAssignmentCountArgs<ExtArgs>
            result: $Utils.Optional<YmqGroupAdminAssignmentCountAggregateOutputType> | number
          }
        }
      }
      YmqLearningSession: {
        payload: Prisma.$YmqLearningSessionPayload<ExtArgs>
        fields: Prisma.YmqLearningSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqLearningSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqLearningSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>
          }
          findFirst: {
            args: Prisma.YmqLearningSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqLearningSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>
          }
          findMany: {
            args: Prisma.YmqLearningSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>[]
          }
          create: {
            args: Prisma.YmqLearningSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>
          }
          createMany: {
            args: Prisma.YmqLearningSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqLearningSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>[]
          }
          delete: {
            args: Prisma.YmqLearningSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>
          }
          update: {
            args: Prisma.YmqLearningSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>
          }
          deleteMany: {
            args: Prisma.YmqLearningSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqLearningSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqLearningSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>[]
          }
          upsert: {
            args: Prisma.YmqLearningSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningSessionPayload>
          }
          aggregate: {
            args: Prisma.YmqLearningSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqLearningSession>
          }
          groupBy: {
            args: Prisma.YmqLearningSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqLearningSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqLearningSessionCountArgs<ExtArgs>
            result: $Utils.Optional<YmqLearningSessionCountAggregateOutputType> | number
          }
        }
      }
      YmqSessionAttendance: {
        payload: Prisma.$YmqSessionAttendancePayload<ExtArgs>
        fields: Prisma.YmqSessionAttendanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqSessionAttendanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqSessionAttendanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>
          }
          findFirst: {
            args: Prisma.YmqSessionAttendanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqSessionAttendanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>
          }
          findMany: {
            args: Prisma.YmqSessionAttendanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>[]
          }
          create: {
            args: Prisma.YmqSessionAttendanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>
          }
          createMany: {
            args: Prisma.YmqSessionAttendanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqSessionAttendanceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>[]
          }
          delete: {
            args: Prisma.YmqSessionAttendanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>
          }
          update: {
            args: Prisma.YmqSessionAttendanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>
          }
          deleteMany: {
            args: Prisma.YmqSessionAttendanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqSessionAttendanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqSessionAttendanceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>[]
          }
          upsert: {
            args: Prisma.YmqSessionAttendanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqSessionAttendancePayload>
          }
          aggregate: {
            args: Prisma.YmqSessionAttendanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqSessionAttendance>
          }
          groupBy: {
            args: Prisma.YmqSessionAttendanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqSessionAttendanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqSessionAttendanceCountArgs<ExtArgs>
            result: $Utils.Optional<YmqSessionAttendanceCountAggregateOutputType> | number
          }
        }
      }
      YmqLearningProgress: {
        payload: Prisma.$YmqLearningProgressPayload<ExtArgs>
        fields: Prisma.YmqLearningProgressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqLearningProgressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqLearningProgressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>
          }
          findFirst: {
            args: Prisma.YmqLearningProgressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqLearningProgressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>
          }
          findMany: {
            args: Prisma.YmqLearningProgressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>[]
          }
          create: {
            args: Prisma.YmqLearningProgressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>
          }
          createMany: {
            args: Prisma.YmqLearningProgressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqLearningProgressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>[]
          }
          delete: {
            args: Prisma.YmqLearningProgressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>
          }
          update: {
            args: Prisma.YmqLearningProgressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>
          }
          deleteMany: {
            args: Prisma.YmqLearningProgressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqLearningProgressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqLearningProgressUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>[]
          }
          upsert: {
            args: Prisma.YmqLearningProgressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqLearningProgressPayload>
          }
          aggregate: {
            args: Prisma.YmqLearningProgressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqLearningProgress>
          }
          groupBy: {
            args: Prisma.YmqLearningProgressGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqLearningProgressGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqLearningProgressCountArgs<ExtArgs>
            result: $Utils.Optional<YmqLearningProgressCountAggregateOutputType> | number
          }
        }
      }
      YmqProgressEvidence: {
        payload: Prisma.$YmqProgressEvidencePayload<ExtArgs>
        fields: Prisma.YmqProgressEvidenceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.YmqProgressEvidenceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.YmqProgressEvidenceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>
          }
          findFirst: {
            args: Prisma.YmqProgressEvidenceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.YmqProgressEvidenceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>
          }
          findMany: {
            args: Prisma.YmqProgressEvidenceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>[]
          }
          create: {
            args: Prisma.YmqProgressEvidenceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>
          }
          createMany: {
            args: Prisma.YmqProgressEvidenceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.YmqProgressEvidenceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>[]
          }
          delete: {
            args: Prisma.YmqProgressEvidenceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>
          }
          update: {
            args: Prisma.YmqProgressEvidenceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>
          }
          deleteMany: {
            args: Prisma.YmqProgressEvidenceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.YmqProgressEvidenceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.YmqProgressEvidenceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>[]
          }
          upsert: {
            args: Prisma.YmqProgressEvidenceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$YmqProgressEvidencePayload>
          }
          aggregate: {
            args: Prisma.YmqProgressEvidenceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateYmqProgressEvidence>
          }
          groupBy: {
            args: Prisma.YmqProgressEvidenceGroupByArgs<ExtArgs>
            result: $Utils.Optional<YmqProgressEvidenceGroupByOutputType>[]
          }
          count: {
            args: Prisma.YmqProgressEvidenceCountArgs<ExtArgs>
            result: $Utils.Optional<YmqProgressEvidenceCountAggregateOutputType> | number
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
    ymqIwrCurriculumUnit?: YmqIwrCurriculumUnitOmit
    ymqGroupAdminAssignment?: YmqGroupAdminAssignmentOmit
    ymqLearningSession?: YmqLearningSessionOmit
    ymqSessionAttendance?: YmqSessionAttendanceOmit
    ymqLearningProgress?: YmqLearningProgressOmit
    ymqProgressEvidence?: YmqProgressEvidenceOmit
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
    groupsAsPembina: number
    memberships: number
    groupAdminAssignments: number
    setoranList: number
    verifiedSetorans: number
    targets: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    groupsAsPembina?: boolean | UserCountOutputTypeCountGroupsAsPembinaArgs
    memberships?: boolean | UserCountOutputTypeCountMembershipsArgs
    groupAdminAssignments?: boolean | UserCountOutputTypeCountGroupAdminAssignmentsArgs
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
  export type UserCountOutputTypeCountGroupsAsPembinaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
  export type UserCountOutputTypeCountGroupAdminAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqGroupAdminAssignmentWhereInput
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
    groupAdmins: number
    learningSessions: number
  }

  export type YmqGroupCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | YmqGroupCountOutputTypeCountMembersArgs
    groupAdmins?: boolean | YmqGroupCountOutputTypeCountGroupAdminsArgs
    learningSessions?: boolean | YmqGroupCountOutputTypeCountLearningSessionsArgs
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
   * YmqGroupCountOutputType without action
   */
  export type YmqGroupCountOutputTypeCountGroupAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqGroupAdminAssignmentWhereInput
  }

  /**
   * YmqGroupCountOutputType without action
   */
  export type YmqGroupCountOutputTypeCountLearningSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqLearningSessionWhereInput
  }


  /**
   * Count Type YmqMemberCountOutputType
   */

  export type YmqMemberCountOutputType = {
    attendance: number
    progress: number
  }

  export type YmqMemberCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attendance?: boolean | YmqMemberCountOutputTypeCountAttendanceArgs
    progress?: boolean | YmqMemberCountOutputTypeCountProgressArgs
  }

  // Custom InputTypes
  /**
   * YmqMemberCountOutputType without action
   */
  export type YmqMemberCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqMemberCountOutputType
     */
    select?: YmqMemberCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * YmqMemberCountOutputType without action
   */
  export type YmqMemberCountOutputTypeCountAttendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqSessionAttendanceWhereInput
  }

  /**
   * YmqMemberCountOutputType without action
   */
  export type YmqMemberCountOutputTypeCountProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqLearningProgressWhereInput
  }


  /**
   * Count Type YmqIwrCurriculumUnitCountOutputType
   */

  export type YmqIwrCurriculumUnitCountOutputType = {
    progress: number
  }

  export type YmqIwrCurriculumUnitCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | YmqIwrCurriculumUnitCountOutputTypeCountProgressArgs
  }

  // Custom InputTypes
  /**
   * YmqIwrCurriculumUnitCountOutputType without action
   */
  export type YmqIwrCurriculumUnitCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnitCountOutputType
     */
    select?: YmqIwrCurriculumUnitCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * YmqIwrCurriculumUnitCountOutputType without action
   */
  export type YmqIwrCurriculumUnitCountOutputTypeCountProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqLearningProgressWhereInput
  }


  /**
   * Count Type YmqLearningSessionCountOutputType
   */

  export type YmqLearningSessionCountOutputType = {
    attendance: number
    progress: number
  }

  export type YmqLearningSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attendance?: boolean | YmqLearningSessionCountOutputTypeCountAttendanceArgs
    progress?: boolean | YmqLearningSessionCountOutputTypeCountProgressArgs
  }

  // Custom InputTypes
  /**
   * YmqLearningSessionCountOutputType without action
   */
  export type YmqLearningSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSessionCountOutputType
     */
    select?: YmqLearningSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * YmqLearningSessionCountOutputType without action
   */
  export type YmqLearningSessionCountOutputTypeCountAttendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqSessionAttendanceWhereInput
  }

  /**
   * YmqLearningSessionCountOutputType without action
   */
  export type YmqLearningSessionCountOutputTypeCountProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqLearningProgressWhereInput
  }


  /**
   * Count Type YmqLearningProgressCountOutputType
   */

  export type YmqLearningProgressCountOutputType = {
    evidence: number
  }

  export type YmqLearningProgressCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    evidence?: boolean | YmqLearningProgressCountOutputTypeCountEvidenceArgs
  }

  // Custom InputTypes
  /**
   * YmqLearningProgressCountOutputType without action
   */
  export type YmqLearningProgressCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgressCountOutputType
     */
    select?: YmqLearningProgressCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * YmqLearningProgressCountOutputType without action
   */
  export type YmqLearningProgressCountOutputTypeCountEvidenceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqProgressEvidenceWhereInput
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
    unitId: string | null
    sourceUpdatedAt: Date | null
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
    unitId: string | null
    sourceUpdatedAt: Date | null
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
    unitId: number
    sourceUpdatedAt: number
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
    unitId?: true
    sourceUpdatedAt?: true
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
    unitId?: true
    sourceUpdatedAt?: true
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
    unitId?: true
    sourceUpdatedAt?: true
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
    unitId: string | null
    sourceUpdatedAt: Date | null
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
    unitId?: boolean
    sourceUpdatedAt?: boolean
    isActive?: boolean
    createdAt?: boolean
    groupsAsPembina?: boolean | User$groupsAsPembinaArgs<ExtArgs>
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    groupAdminAssignments?: boolean | User$groupAdminAssignmentsArgs<ExtArgs>
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
    unitId?: boolean
    sourceUpdatedAt?: boolean
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
    unitId?: boolean
    sourceUpdatedAt?: boolean
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
    unitId?: boolean
    sourceUpdatedAt?: boolean
    isActive?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fullName" | "username" | "email" | "phone" | "avatarUrl" | "unitName" | "unitId" | "sourceUpdatedAt" | "isActive" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    groupsAsPembina?: boolean | User$groupsAsPembinaArgs<ExtArgs>
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    groupAdminAssignments?: boolean | User$groupAdminAssignmentsArgs<ExtArgs>
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
      groupsAsPembina: Prisma.$YmqGroupPayload<ExtArgs>[]
      memberships: Prisma.$YmqMemberPayload<ExtArgs>[]
      groupAdminAssignments: Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>[]
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
      unitId: string | null
      sourceUpdatedAt: Date | null
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
    groupsAsPembina<T extends User$groupsAsPembinaArgs<ExtArgs> = {}>(args?: Subset<T, User$groupsAsPembinaArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    memberships<T extends User$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, User$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    groupAdminAssignments<T extends User$groupAdminAssignmentsArgs<ExtArgs> = {}>(args?: Subset<T, User$groupAdminAssignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
    readonly unitId: FieldRef<"User", 'String'>
    readonly sourceUpdatedAt: FieldRef<"User", 'DateTime'>
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
   * User.groupsAsPembina
   */
  export type User$groupsAsPembinaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * User.groupAdminAssignments
   */
  export type User$groupAdminAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    where?: YmqGroupAdminAssignmentWhereInput
    orderBy?: YmqGroupAdminAssignmentOrderByWithRelationInput | YmqGroupAdminAssignmentOrderByWithRelationInput[]
    cursor?: YmqGroupAdminAssignmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqGroupAdminAssignmentScalarFieldEnum | YmqGroupAdminAssignmentScalarFieldEnum[]
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
    pembinaUserId: string | null
    level: $Enums.YmqGroupLevel | null
    unitId: string | null
    unitName: string | null
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
    pembinaUserId: string | null
    level: $Enums.YmqGroupLevel | null
    unitId: string | null
    unitName: string | null
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
    pembinaUserId: number
    level: number
    unitId: number
    unitName: number
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
    pembinaUserId?: true
    level?: true
    unitId?: true
    unitName?: true
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
    pembinaUserId?: true
    level?: true
    unitId?: true
    unitName?: true
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
    pembinaUserId?: true
    level?: true
    unitId?: true
    unitName?: true
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
    pembinaUserId: string | null
    level: $Enums.YmqGroupLevel | null
    unitId: string | null
    unitName: string | null
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
    pembinaUserId?: boolean
    level?: boolean
    unitId?: boolean
    unitName?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    pembina?: boolean | YmqGroup$pembinaArgs<ExtArgs>
    members?: boolean | YmqGroup$membersArgs<ExtArgs>
    groupAdmins?: boolean | YmqGroup$groupAdminsArgs<ExtArgs>
    learningSessions?: boolean | YmqGroup$learningSessionsArgs<ExtArgs>
    _count?: boolean | YmqGroupCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroup"]>

  export type YmqGroupSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    pembinaUserId?: boolean
    level?: boolean
    unitId?: boolean
    unitName?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    pembina?: boolean | YmqGroup$pembinaArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroup"]>

  export type YmqGroupSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    pembinaUserId?: boolean
    level?: boolean
    unitId?: boolean
    unitName?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    pembina?: boolean | YmqGroup$pembinaArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroup"]>

  export type YmqGroupSelectScalar = {
    id?: boolean
    name?: boolean
    pembinaUserId?: boolean
    level?: boolean
    unitId?: boolean
    unitName?: boolean
    description?: boolean
    scheduleDay?: boolean
    scheduleTime?: boolean
    whatsappLink?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type YmqGroupOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "pembinaUserId" | "level" | "unitId" | "unitName" | "description" | "scheduleDay" | "scheduleTime" | "whatsappLink" | "createdAt" | "updatedAt", ExtArgs["result"]["ymqGroup"]>
  export type YmqGroupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pembina?: boolean | YmqGroup$pembinaArgs<ExtArgs>
    members?: boolean | YmqGroup$membersArgs<ExtArgs>
    groupAdmins?: boolean | YmqGroup$groupAdminsArgs<ExtArgs>
    learningSessions?: boolean | YmqGroup$learningSessionsArgs<ExtArgs>
    _count?: boolean | YmqGroupCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type YmqGroupIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pembina?: boolean | YmqGroup$pembinaArgs<ExtArgs>
  }
  export type YmqGroupIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pembina?: boolean | YmqGroup$pembinaArgs<ExtArgs>
  }

  export type $YmqGroupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqGroup"
    objects: {
      pembina: Prisma.$UserPayload<ExtArgs> | null
      members: Prisma.$YmqMemberPayload<ExtArgs>[]
      groupAdmins: Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>[]
      learningSessions: Prisma.$YmqLearningSessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      pembinaUserId: string | null
      level: $Enums.YmqGroupLevel | null
      unitId: string | null
      unitName: string | null
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
    pembina<T extends YmqGroup$pembinaArgs<ExtArgs> = {}>(args?: Subset<T, YmqGroup$pembinaArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    members<T extends YmqGroup$membersArgs<ExtArgs> = {}>(args?: Subset<T, YmqGroup$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    groupAdmins<T extends YmqGroup$groupAdminsArgs<ExtArgs> = {}>(args?: Subset<T, YmqGroup$groupAdminsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    learningSessions<T extends YmqGroup$learningSessionsArgs<ExtArgs> = {}>(args?: Subset<T, YmqGroup$learningSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
    readonly pembinaUserId: FieldRef<"YmqGroup", 'String'>
    readonly level: FieldRef<"YmqGroup", 'YmqGroupLevel'>
    readonly unitId: FieldRef<"YmqGroup", 'String'>
    readonly unitName: FieldRef<"YmqGroup", 'String'>
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
   * YmqGroup.pembina
   */
  export type YmqGroup$pembinaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * YmqGroup.groupAdmins
   */
  export type YmqGroup$groupAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    where?: YmqGroupAdminAssignmentWhereInput
    orderBy?: YmqGroupAdminAssignmentOrderByWithRelationInput | YmqGroupAdminAssignmentOrderByWithRelationInput[]
    cursor?: YmqGroupAdminAssignmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqGroupAdminAssignmentScalarFieldEnum | YmqGroupAdminAssignmentScalarFieldEnum[]
  }

  /**
   * YmqGroup.learningSessions
   */
  export type YmqGroup$learningSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    where?: YmqLearningSessionWhereInput
    orderBy?: YmqLearningSessionOrderByWithRelationInput | YmqLearningSessionOrderByWithRelationInput[]
    cursor?: YmqLearningSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqLearningSessionScalarFieldEnum | YmqLearningSessionScalarFieldEnum[]
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
    leftAt: Date | null
  }

  export type YmqMemberMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    userId: string | null
    joinedAt: Date | null
    leftAt: Date | null
  }

  export type YmqMemberCountAggregateOutputType = {
    id: number
    groupId: number
    userId: number
    joinedAt: number
    leftAt: number
    _all: number
  }


  export type YmqMemberMinAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    joinedAt?: true
    leftAt?: true
  }

  export type YmqMemberMaxAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    joinedAt?: true
    leftAt?: true
  }

  export type YmqMemberCountAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    joinedAt?: true
    leftAt?: true
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
    leftAt: Date | null
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
    leftAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    attendance?: boolean | YmqMember$attendanceArgs<ExtArgs>
    progress?: boolean | YmqMember$progressArgs<ExtArgs>
    _count?: boolean | YmqMemberCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqMember"]>

  export type YmqMemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    joinedAt?: boolean
    leftAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqMember"]>

  export type YmqMemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    joinedAt?: boolean
    leftAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqMember"]>

  export type YmqMemberSelectScalar = {
    id?: boolean
    groupId?: boolean
    userId?: boolean
    joinedAt?: boolean
    leftAt?: boolean
  }

  export type YmqMemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "userId" | "joinedAt" | "leftAt", ExtArgs["result"]["ymqMember"]>
  export type YmqMemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    attendance?: boolean | YmqMember$attendanceArgs<ExtArgs>
    progress?: boolean | YmqMember$progressArgs<ExtArgs>
    _count?: boolean | YmqMemberCountOutputTypeDefaultArgs<ExtArgs>
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
      attendance: Prisma.$YmqSessionAttendancePayload<ExtArgs>[]
      progress: Prisma.$YmqLearningProgressPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      userId: string
      joinedAt: Date
      leftAt: Date | null
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
    attendance<T extends YmqMember$attendanceArgs<ExtArgs> = {}>(args?: Subset<T, YmqMember$attendanceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    progress<T extends YmqMember$progressArgs<ExtArgs> = {}>(args?: Subset<T, YmqMember$progressArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
    readonly leftAt: FieldRef<"YmqMember", 'DateTime'>
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
   * YmqMember.attendance
   */
  export type YmqMember$attendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    where?: YmqSessionAttendanceWhereInput
    orderBy?: YmqSessionAttendanceOrderByWithRelationInput | YmqSessionAttendanceOrderByWithRelationInput[]
    cursor?: YmqSessionAttendanceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqSessionAttendanceScalarFieldEnum | YmqSessionAttendanceScalarFieldEnum[]
  }

  /**
   * YmqMember.progress
   */
  export type YmqMember$progressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    where?: YmqLearningProgressWhereInput
    orderBy?: YmqLearningProgressOrderByWithRelationInput | YmqLearningProgressOrderByWithRelationInput[]
    cursor?: YmqLearningProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqLearningProgressScalarFieldEnum | YmqLearningProgressScalarFieldEnum[]
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
    catatanPembina: string | null
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
    catatanPembina: string | null
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
    catatanPembina: number
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
    catatanPembina?: true
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
    catatanPembina?: true
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
    catatanPembina?: true
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
    catatanPembina: string | null
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
    catatanPembina?: boolean
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
    catatanPembina?: boolean
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
    catatanPembina?: boolean
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
    catatanPembina?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
  }

  export type YmqSetoranOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "date" | "jenis" | "surahMulai" | "ayatMulai" | "surahSelesai" | "ayatSelesai" | "jumlahHalaman" | "catatan" | "statusVerifikasi" | "catatanPembina" | "verifiedById" | "verifiedAt" | "createdAt", ExtArgs["result"]["ymqSetoran"]>
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
      catatanPembina: string | null
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
    readonly catatanPembina: FieldRef<"YmqSetoran", 'String'>
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
   * Model YmqIwrCurriculumUnit
   */

  export type AggregateYmqIwrCurriculumUnit = {
    _count: YmqIwrCurriculumUnitCountAggregateOutputType | null
    _avg: YmqIwrCurriculumUnitAvgAggregateOutputType | null
    _sum: YmqIwrCurriculumUnitSumAggregateOutputType | null
    _min: YmqIwrCurriculumUnitMinAggregateOutputType | null
    _max: YmqIwrCurriculumUnitMaxAggregateOutputType | null
  }

  export type YmqIwrCurriculumUnitAvgAggregateOutputType = {
    pageStart: number | null
    pageEnd: number | null
  }

  export type YmqIwrCurriculumUnitSumAggregateOutputType = {
    pageStart: number | null
    pageEnd: number | null
  }

  export type YmqIwrCurriculumUnitMinAggregateOutputType = {
    id: string | null
    iwrLevel: $Enums.IwrLevel | null
    topicCode: string | null
    topicTitle: string | null
    pageStart: number | null
    pageEnd: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqIwrCurriculumUnitMaxAggregateOutputType = {
    id: string | null
    iwrLevel: $Enums.IwrLevel | null
    topicCode: string | null
    topicTitle: string | null
    pageStart: number | null
    pageEnd: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqIwrCurriculumUnitCountAggregateOutputType = {
    id: number
    iwrLevel: number
    topicCode: number
    topicTitle: number
    pageStart: number
    pageEnd: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type YmqIwrCurriculumUnitAvgAggregateInputType = {
    pageStart?: true
    pageEnd?: true
  }

  export type YmqIwrCurriculumUnitSumAggregateInputType = {
    pageStart?: true
    pageEnd?: true
  }

  export type YmqIwrCurriculumUnitMinAggregateInputType = {
    id?: true
    iwrLevel?: true
    topicCode?: true
    topicTitle?: true
    pageStart?: true
    pageEnd?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqIwrCurriculumUnitMaxAggregateInputType = {
    id?: true
    iwrLevel?: true
    topicCode?: true
    topicTitle?: true
    pageStart?: true
    pageEnd?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqIwrCurriculumUnitCountAggregateInputType = {
    id?: true
    iwrLevel?: true
    topicCode?: true
    topicTitle?: true
    pageStart?: true
    pageEnd?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type YmqIwrCurriculumUnitAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqIwrCurriculumUnit to aggregate.
     */
    where?: YmqIwrCurriculumUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqIwrCurriculumUnits to fetch.
     */
    orderBy?: YmqIwrCurriculumUnitOrderByWithRelationInput | YmqIwrCurriculumUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqIwrCurriculumUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqIwrCurriculumUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqIwrCurriculumUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqIwrCurriculumUnits
    **/
    _count?: true | YmqIwrCurriculumUnitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: YmqIwrCurriculumUnitAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: YmqIwrCurriculumUnitSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqIwrCurriculumUnitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqIwrCurriculumUnitMaxAggregateInputType
  }

  export type GetYmqIwrCurriculumUnitAggregateType<T extends YmqIwrCurriculumUnitAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqIwrCurriculumUnit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqIwrCurriculumUnit[P]>
      : GetScalarType<T[P], AggregateYmqIwrCurriculumUnit[P]>
  }




  export type YmqIwrCurriculumUnitGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqIwrCurriculumUnitWhereInput
    orderBy?: YmqIwrCurriculumUnitOrderByWithAggregationInput | YmqIwrCurriculumUnitOrderByWithAggregationInput[]
    by: YmqIwrCurriculumUnitScalarFieldEnum[] | YmqIwrCurriculumUnitScalarFieldEnum
    having?: YmqIwrCurriculumUnitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqIwrCurriculumUnitCountAggregateInputType | true
    _avg?: YmqIwrCurriculumUnitAvgAggregateInputType
    _sum?: YmqIwrCurriculumUnitSumAggregateInputType
    _min?: YmqIwrCurriculumUnitMinAggregateInputType
    _max?: YmqIwrCurriculumUnitMaxAggregateInputType
  }

  export type YmqIwrCurriculumUnitGroupByOutputType = {
    id: string
    iwrLevel: $Enums.IwrLevel
    topicCode: string
    topicTitle: string
    pageStart: number
    pageEnd: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: YmqIwrCurriculumUnitCountAggregateOutputType | null
    _avg: YmqIwrCurriculumUnitAvgAggregateOutputType | null
    _sum: YmqIwrCurriculumUnitSumAggregateOutputType | null
    _min: YmqIwrCurriculumUnitMinAggregateOutputType | null
    _max: YmqIwrCurriculumUnitMaxAggregateOutputType | null
  }

  type GetYmqIwrCurriculumUnitGroupByPayload<T extends YmqIwrCurriculumUnitGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqIwrCurriculumUnitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqIwrCurriculumUnitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqIwrCurriculumUnitGroupByOutputType[P]>
            : GetScalarType<T[P], YmqIwrCurriculumUnitGroupByOutputType[P]>
        }
      >
    >


  export type YmqIwrCurriculumUnitSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    iwrLevel?: boolean
    topicCode?: boolean
    topicTitle?: boolean
    pageStart?: boolean
    pageEnd?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    progress?: boolean | YmqIwrCurriculumUnit$progressArgs<ExtArgs>
    _count?: boolean | YmqIwrCurriculumUnitCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqIwrCurriculumUnit"]>

  export type YmqIwrCurriculumUnitSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    iwrLevel?: boolean
    topicCode?: boolean
    topicTitle?: boolean
    pageStart?: boolean
    pageEnd?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ymqIwrCurriculumUnit"]>

  export type YmqIwrCurriculumUnitSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    iwrLevel?: boolean
    topicCode?: boolean
    topicTitle?: boolean
    pageStart?: boolean
    pageEnd?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ymqIwrCurriculumUnit"]>

  export type YmqIwrCurriculumUnitSelectScalar = {
    id?: boolean
    iwrLevel?: boolean
    topicCode?: boolean
    topicTitle?: boolean
    pageStart?: boolean
    pageEnd?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type YmqIwrCurriculumUnitOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "iwrLevel" | "topicCode" | "topicTitle" | "pageStart" | "pageEnd" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["ymqIwrCurriculumUnit"]>
  export type YmqIwrCurriculumUnitInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | YmqIwrCurriculumUnit$progressArgs<ExtArgs>
    _count?: boolean | YmqIwrCurriculumUnitCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type YmqIwrCurriculumUnitIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type YmqIwrCurriculumUnitIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $YmqIwrCurriculumUnitPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqIwrCurriculumUnit"
    objects: {
      progress: Prisma.$YmqLearningProgressPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      iwrLevel: $Enums.IwrLevel
      topicCode: string
      topicTitle: string
      pageStart: number
      pageEnd: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ymqIwrCurriculumUnit"]>
    composites: {}
  }

  type YmqIwrCurriculumUnitGetPayload<S extends boolean | null | undefined | YmqIwrCurriculumUnitDefaultArgs> = $Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload, S>

  type YmqIwrCurriculumUnitCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqIwrCurriculumUnitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqIwrCurriculumUnitCountAggregateInputType | true
    }

  export interface YmqIwrCurriculumUnitDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqIwrCurriculumUnit'], meta: { name: 'YmqIwrCurriculumUnit' } }
    /**
     * Find zero or one YmqIwrCurriculumUnit that matches the filter.
     * @param {YmqIwrCurriculumUnitFindUniqueArgs} args - Arguments to find a YmqIwrCurriculumUnit
     * @example
     * // Get one YmqIwrCurriculumUnit
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqIwrCurriculumUnitFindUniqueArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitFindUniqueArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqIwrCurriculumUnit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqIwrCurriculumUnitFindUniqueOrThrowArgs} args - Arguments to find a YmqIwrCurriculumUnit
     * @example
     * // Get one YmqIwrCurriculumUnit
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqIwrCurriculumUnitFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqIwrCurriculumUnit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqIwrCurriculumUnitFindFirstArgs} args - Arguments to find a YmqIwrCurriculumUnit
     * @example
     * // Get one YmqIwrCurriculumUnit
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqIwrCurriculumUnitFindFirstArgs>(args?: SelectSubset<T, YmqIwrCurriculumUnitFindFirstArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqIwrCurriculumUnit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqIwrCurriculumUnitFindFirstOrThrowArgs} args - Arguments to find a YmqIwrCurriculumUnit
     * @example
     * // Get one YmqIwrCurriculumUnit
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqIwrCurriculumUnitFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqIwrCurriculumUnitFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqIwrCurriculumUnits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqIwrCurriculumUnitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqIwrCurriculumUnits
     * const ymqIwrCurriculumUnits = await prisma.ymqIwrCurriculumUnit.findMany()
     * 
     * // Get first 10 YmqIwrCurriculumUnits
     * const ymqIwrCurriculumUnits = await prisma.ymqIwrCurriculumUnit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqIwrCurriculumUnitWithIdOnly = await prisma.ymqIwrCurriculumUnit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqIwrCurriculumUnitFindManyArgs>(args?: SelectSubset<T, YmqIwrCurriculumUnitFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqIwrCurriculumUnit.
     * @param {YmqIwrCurriculumUnitCreateArgs} args - Arguments to create a YmqIwrCurriculumUnit.
     * @example
     * // Create one YmqIwrCurriculumUnit
     * const YmqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.create({
     *   data: {
     *     // ... data to create a YmqIwrCurriculumUnit
     *   }
     * })
     * 
     */
    create<T extends YmqIwrCurriculumUnitCreateArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitCreateArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqIwrCurriculumUnits.
     * @param {YmqIwrCurriculumUnitCreateManyArgs} args - Arguments to create many YmqIwrCurriculumUnits.
     * @example
     * // Create many YmqIwrCurriculumUnits
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqIwrCurriculumUnitCreateManyArgs>(args?: SelectSubset<T, YmqIwrCurriculumUnitCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqIwrCurriculumUnits and returns the data saved in the database.
     * @param {YmqIwrCurriculumUnitCreateManyAndReturnArgs} args - Arguments to create many YmqIwrCurriculumUnits.
     * @example
     * // Create many YmqIwrCurriculumUnits
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqIwrCurriculumUnits and only return the `id`
     * const ymqIwrCurriculumUnitWithIdOnly = await prisma.ymqIwrCurriculumUnit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqIwrCurriculumUnitCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqIwrCurriculumUnitCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqIwrCurriculumUnit.
     * @param {YmqIwrCurriculumUnitDeleteArgs} args - Arguments to delete one YmqIwrCurriculumUnit.
     * @example
     * // Delete one YmqIwrCurriculumUnit
     * const YmqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.delete({
     *   where: {
     *     // ... filter to delete one YmqIwrCurriculumUnit
     *   }
     * })
     * 
     */
    delete<T extends YmqIwrCurriculumUnitDeleteArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitDeleteArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqIwrCurriculumUnit.
     * @param {YmqIwrCurriculumUnitUpdateArgs} args - Arguments to update one YmqIwrCurriculumUnit.
     * @example
     * // Update one YmqIwrCurriculumUnit
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqIwrCurriculumUnitUpdateArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitUpdateArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqIwrCurriculumUnits.
     * @param {YmqIwrCurriculumUnitDeleteManyArgs} args - Arguments to filter YmqIwrCurriculumUnits to delete.
     * @example
     * // Delete a few YmqIwrCurriculumUnits
     * const { count } = await prisma.ymqIwrCurriculumUnit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqIwrCurriculumUnitDeleteManyArgs>(args?: SelectSubset<T, YmqIwrCurriculumUnitDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqIwrCurriculumUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqIwrCurriculumUnitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqIwrCurriculumUnits
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqIwrCurriculumUnitUpdateManyArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqIwrCurriculumUnits and returns the data updated in the database.
     * @param {YmqIwrCurriculumUnitUpdateManyAndReturnArgs} args - Arguments to update many YmqIwrCurriculumUnits.
     * @example
     * // Update many YmqIwrCurriculumUnits
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqIwrCurriculumUnits and only return the `id`
     * const ymqIwrCurriculumUnitWithIdOnly = await prisma.ymqIwrCurriculumUnit.updateManyAndReturn({
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
    updateManyAndReturn<T extends YmqIwrCurriculumUnitUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqIwrCurriculumUnit.
     * @param {YmqIwrCurriculumUnitUpsertArgs} args - Arguments to update or create a YmqIwrCurriculumUnit.
     * @example
     * // Update or create a YmqIwrCurriculumUnit
     * const ymqIwrCurriculumUnit = await prisma.ymqIwrCurriculumUnit.upsert({
     *   create: {
     *     // ... data to create a YmqIwrCurriculumUnit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqIwrCurriculumUnit we want to update
     *   }
     * })
     */
    upsert<T extends YmqIwrCurriculumUnitUpsertArgs>(args: SelectSubset<T, YmqIwrCurriculumUnitUpsertArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqIwrCurriculumUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqIwrCurriculumUnitCountArgs} args - Arguments to filter YmqIwrCurriculumUnits to count.
     * @example
     * // Count the number of YmqIwrCurriculumUnits
     * const count = await prisma.ymqIwrCurriculumUnit.count({
     *   where: {
     *     // ... the filter for the YmqIwrCurriculumUnits we want to count
     *   }
     * })
    **/
    count<T extends YmqIwrCurriculumUnitCountArgs>(
      args?: Subset<T, YmqIwrCurriculumUnitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqIwrCurriculumUnitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqIwrCurriculumUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqIwrCurriculumUnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YmqIwrCurriculumUnitAggregateArgs>(args: Subset<T, YmqIwrCurriculumUnitAggregateArgs>): Prisma.PrismaPromise<GetYmqIwrCurriculumUnitAggregateType<T>>

    /**
     * Group by YmqIwrCurriculumUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqIwrCurriculumUnitGroupByArgs} args - Group by arguments.
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
      T extends YmqIwrCurriculumUnitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqIwrCurriculumUnitGroupByArgs['orderBy'] }
        : { orderBy?: YmqIwrCurriculumUnitGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, YmqIwrCurriculumUnitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqIwrCurriculumUnitGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqIwrCurriculumUnit model
   */
  readonly fields: YmqIwrCurriculumUnitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqIwrCurriculumUnit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqIwrCurriculumUnitClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    progress<T extends YmqIwrCurriculumUnit$progressArgs<ExtArgs> = {}>(args?: Subset<T, YmqIwrCurriculumUnit$progressArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the YmqIwrCurriculumUnit model
   */
  interface YmqIwrCurriculumUnitFieldRefs {
    readonly id: FieldRef<"YmqIwrCurriculumUnit", 'String'>
    readonly iwrLevel: FieldRef<"YmqIwrCurriculumUnit", 'IwrLevel'>
    readonly topicCode: FieldRef<"YmqIwrCurriculumUnit", 'String'>
    readonly topicTitle: FieldRef<"YmqIwrCurriculumUnit", 'String'>
    readonly pageStart: FieldRef<"YmqIwrCurriculumUnit", 'Int'>
    readonly pageEnd: FieldRef<"YmqIwrCurriculumUnit", 'Int'>
    readonly isActive: FieldRef<"YmqIwrCurriculumUnit", 'Boolean'>
    readonly createdAt: FieldRef<"YmqIwrCurriculumUnit", 'DateTime'>
    readonly updatedAt: FieldRef<"YmqIwrCurriculumUnit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqIwrCurriculumUnit findUnique
   */
  export type YmqIwrCurriculumUnitFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * Filter, which YmqIwrCurriculumUnit to fetch.
     */
    where: YmqIwrCurriculumUnitWhereUniqueInput
  }

  /**
   * YmqIwrCurriculumUnit findUniqueOrThrow
   */
  export type YmqIwrCurriculumUnitFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * Filter, which YmqIwrCurriculumUnit to fetch.
     */
    where: YmqIwrCurriculumUnitWhereUniqueInput
  }

  /**
   * YmqIwrCurriculumUnit findFirst
   */
  export type YmqIwrCurriculumUnitFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * Filter, which YmqIwrCurriculumUnit to fetch.
     */
    where?: YmqIwrCurriculumUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqIwrCurriculumUnits to fetch.
     */
    orderBy?: YmqIwrCurriculumUnitOrderByWithRelationInput | YmqIwrCurriculumUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqIwrCurriculumUnits.
     */
    cursor?: YmqIwrCurriculumUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqIwrCurriculumUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqIwrCurriculumUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqIwrCurriculumUnits.
     */
    distinct?: YmqIwrCurriculumUnitScalarFieldEnum | YmqIwrCurriculumUnitScalarFieldEnum[]
  }

  /**
   * YmqIwrCurriculumUnit findFirstOrThrow
   */
  export type YmqIwrCurriculumUnitFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * Filter, which YmqIwrCurriculumUnit to fetch.
     */
    where?: YmqIwrCurriculumUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqIwrCurriculumUnits to fetch.
     */
    orderBy?: YmqIwrCurriculumUnitOrderByWithRelationInput | YmqIwrCurriculumUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqIwrCurriculumUnits.
     */
    cursor?: YmqIwrCurriculumUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqIwrCurriculumUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqIwrCurriculumUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqIwrCurriculumUnits.
     */
    distinct?: YmqIwrCurriculumUnitScalarFieldEnum | YmqIwrCurriculumUnitScalarFieldEnum[]
  }

  /**
   * YmqIwrCurriculumUnit findMany
   */
  export type YmqIwrCurriculumUnitFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * Filter, which YmqIwrCurriculumUnits to fetch.
     */
    where?: YmqIwrCurriculumUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqIwrCurriculumUnits to fetch.
     */
    orderBy?: YmqIwrCurriculumUnitOrderByWithRelationInput | YmqIwrCurriculumUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqIwrCurriculumUnits.
     */
    cursor?: YmqIwrCurriculumUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqIwrCurriculumUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqIwrCurriculumUnits.
     */
    skip?: number
    distinct?: YmqIwrCurriculumUnitScalarFieldEnum | YmqIwrCurriculumUnitScalarFieldEnum[]
  }

  /**
   * YmqIwrCurriculumUnit create
   */
  export type YmqIwrCurriculumUnitCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqIwrCurriculumUnit.
     */
    data: XOR<YmqIwrCurriculumUnitCreateInput, YmqIwrCurriculumUnitUncheckedCreateInput>
  }

  /**
   * YmqIwrCurriculumUnit createMany
   */
  export type YmqIwrCurriculumUnitCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqIwrCurriculumUnits.
     */
    data: YmqIwrCurriculumUnitCreateManyInput | YmqIwrCurriculumUnitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqIwrCurriculumUnit createManyAndReturn
   */
  export type YmqIwrCurriculumUnitCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * The data used to create many YmqIwrCurriculumUnits.
     */
    data: YmqIwrCurriculumUnitCreateManyInput | YmqIwrCurriculumUnitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqIwrCurriculumUnit update
   */
  export type YmqIwrCurriculumUnitUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqIwrCurriculumUnit.
     */
    data: XOR<YmqIwrCurriculumUnitUpdateInput, YmqIwrCurriculumUnitUncheckedUpdateInput>
    /**
     * Choose, which YmqIwrCurriculumUnit to update.
     */
    where: YmqIwrCurriculumUnitWhereUniqueInput
  }

  /**
   * YmqIwrCurriculumUnit updateMany
   */
  export type YmqIwrCurriculumUnitUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqIwrCurriculumUnits.
     */
    data: XOR<YmqIwrCurriculumUnitUpdateManyMutationInput, YmqIwrCurriculumUnitUncheckedUpdateManyInput>
    /**
     * Filter which YmqIwrCurriculumUnits to update
     */
    where?: YmqIwrCurriculumUnitWhereInput
    /**
     * Limit how many YmqIwrCurriculumUnits to update.
     */
    limit?: number
  }

  /**
   * YmqIwrCurriculumUnit updateManyAndReturn
   */
  export type YmqIwrCurriculumUnitUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * The data used to update YmqIwrCurriculumUnits.
     */
    data: XOR<YmqIwrCurriculumUnitUpdateManyMutationInput, YmqIwrCurriculumUnitUncheckedUpdateManyInput>
    /**
     * Filter which YmqIwrCurriculumUnits to update
     */
    where?: YmqIwrCurriculumUnitWhereInput
    /**
     * Limit how many YmqIwrCurriculumUnits to update.
     */
    limit?: number
  }

  /**
   * YmqIwrCurriculumUnit upsert
   */
  export type YmqIwrCurriculumUnitUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqIwrCurriculumUnit to update in case it exists.
     */
    where: YmqIwrCurriculumUnitWhereUniqueInput
    /**
     * In case the YmqIwrCurriculumUnit found by the `where` argument doesn't exist, create a new YmqIwrCurriculumUnit with this data.
     */
    create: XOR<YmqIwrCurriculumUnitCreateInput, YmqIwrCurriculumUnitUncheckedCreateInput>
    /**
     * In case the YmqIwrCurriculumUnit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqIwrCurriculumUnitUpdateInput, YmqIwrCurriculumUnitUncheckedUpdateInput>
  }

  /**
   * YmqIwrCurriculumUnit delete
   */
  export type YmqIwrCurriculumUnitDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    /**
     * Filter which YmqIwrCurriculumUnit to delete.
     */
    where: YmqIwrCurriculumUnitWhereUniqueInput
  }

  /**
   * YmqIwrCurriculumUnit deleteMany
   */
  export type YmqIwrCurriculumUnitDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqIwrCurriculumUnits to delete
     */
    where?: YmqIwrCurriculumUnitWhereInput
    /**
     * Limit how many YmqIwrCurriculumUnits to delete.
     */
    limit?: number
  }

  /**
   * YmqIwrCurriculumUnit.progress
   */
  export type YmqIwrCurriculumUnit$progressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    where?: YmqLearningProgressWhereInput
    orderBy?: YmqLearningProgressOrderByWithRelationInput | YmqLearningProgressOrderByWithRelationInput[]
    cursor?: YmqLearningProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqLearningProgressScalarFieldEnum | YmqLearningProgressScalarFieldEnum[]
  }

  /**
   * YmqIwrCurriculumUnit without action
   */
  export type YmqIwrCurriculumUnitDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
  }


  /**
   * Model YmqGroupAdminAssignment
   */

  export type AggregateYmqGroupAdminAssignment = {
    _count: YmqGroupAdminAssignmentCountAggregateOutputType | null
    _min: YmqGroupAdminAssignmentMinAggregateOutputType | null
    _max: YmqGroupAdminAssignmentMaxAggregateOutputType | null
  }

  export type YmqGroupAdminAssignmentMinAggregateOutputType = {
    id: string | null
    groupId: string | null
    userId: string | null
    role: $Enums.YmqGroupStaffRole | null
    assignedById: string | null
    assignedAt: Date | null
    revokedAt: Date | null
  }

  export type YmqGroupAdminAssignmentMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    userId: string | null
    role: $Enums.YmqGroupStaffRole | null
    assignedById: string | null
    assignedAt: Date | null
    revokedAt: Date | null
  }

  export type YmqGroupAdminAssignmentCountAggregateOutputType = {
    id: number
    groupId: number
    userId: number
    role: number
    assignedById: number
    assignedAt: number
    revokedAt: number
    _all: number
  }


  export type YmqGroupAdminAssignmentMinAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    role?: true
    assignedById?: true
    assignedAt?: true
    revokedAt?: true
  }

  export type YmqGroupAdminAssignmentMaxAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    role?: true
    assignedById?: true
    assignedAt?: true
    revokedAt?: true
  }

  export type YmqGroupAdminAssignmentCountAggregateInputType = {
    id?: true
    groupId?: true
    userId?: true
    role?: true
    assignedById?: true
    assignedAt?: true
    revokedAt?: true
    _all?: true
  }

  export type YmqGroupAdminAssignmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqGroupAdminAssignment to aggregate.
     */
    where?: YmqGroupAdminAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroupAdminAssignments to fetch.
     */
    orderBy?: YmqGroupAdminAssignmentOrderByWithRelationInput | YmqGroupAdminAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqGroupAdminAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroupAdminAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroupAdminAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqGroupAdminAssignments
    **/
    _count?: true | YmqGroupAdminAssignmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqGroupAdminAssignmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqGroupAdminAssignmentMaxAggregateInputType
  }

  export type GetYmqGroupAdminAssignmentAggregateType<T extends YmqGroupAdminAssignmentAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqGroupAdminAssignment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqGroupAdminAssignment[P]>
      : GetScalarType<T[P], AggregateYmqGroupAdminAssignment[P]>
  }




  export type YmqGroupAdminAssignmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqGroupAdminAssignmentWhereInput
    orderBy?: YmqGroupAdminAssignmentOrderByWithAggregationInput | YmqGroupAdminAssignmentOrderByWithAggregationInput[]
    by: YmqGroupAdminAssignmentScalarFieldEnum[] | YmqGroupAdminAssignmentScalarFieldEnum
    having?: YmqGroupAdminAssignmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqGroupAdminAssignmentCountAggregateInputType | true
    _min?: YmqGroupAdminAssignmentMinAggregateInputType
    _max?: YmqGroupAdminAssignmentMaxAggregateInputType
  }

  export type YmqGroupAdminAssignmentGroupByOutputType = {
    id: string
    groupId: string
    userId: string
    role: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt: Date
    revokedAt: Date | null
    _count: YmqGroupAdminAssignmentCountAggregateOutputType | null
    _min: YmqGroupAdminAssignmentMinAggregateOutputType | null
    _max: YmqGroupAdminAssignmentMaxAggregateOutputType | null
  }

  type GetYmqGroupAdminAssignmentGroupByPayload<T extends YmqGroupAdminAssignmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqGroupAdminAssignmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqGroupAdminAssignmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqGroupAdminAssignmentGroupByOutputType[P]>
            : GetScalarType<T[P], YmqGroupAdminAssignmentGroupByOutputType[P]>
        }
      >
    >


  export type YmqGroupAdminAssignmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    role?: boolean
    assignedById?: boolean
    assignedAt?: boolean
    revokedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroupAdminAssignment"]>

  export type YmqGroupAdminAssignmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    role?: boolean
    assignedById?: boolean
    assignedAt?: boolean
    revokedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroupAdminAssignment"]>

  export type YmqGroupAdminAssignmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    userId?: boolean
    role?: boolean
    assignedById?: boolean
    assignedAt?: boolean
    revokedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqGroupAdminAssignment"]>

  export type YmqGroupAdminAssignmentSelectScalar = {
    id?: boolean
    groupId?: boolean
    userId?: boolean
    role?: boolean
    assignedById?: boolean
    assignedAt?: boolean
    revokedAt?: boolean
  }

  export type YmqGroupAdminAssignmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "userId" | "role" | "assignedById" | "assignedAt" | "revokedAt", ExtArgs["result"]["ymqGroupAdminAssignment"]>
  export type YmqGroupAdminAssignmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type YmqGroupAdminAssignmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type YmqGroupAdminAssignmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $YmqGroupAdminAssignmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqGroupAdminAssignment"
    objects: {
      group: Prisma.$YmqGroupPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      userId: string
      role: $Enums.YmqGroupStaffRole
      assignedById: string
      assignedAt: Date
      revokedAt: Date | null
    }, ExtArgs["result"]["ymqGroupAdminAssignment"]>
    composites: {}
  }

  type YmqGroupAdminAssignmentGetPayload<S extends boolean | null | undefined | YmqGroupAdminAssignmentDefaultArgs> = $Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload, S>

  type YmqGroupAdminAssignmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqGroupAdminAssignmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqGroupAdminAssignmentCountAggregateInputType | true
    }

  export interface YmqGroupAdminAssignmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqGroupAdminAssignment'], meta: { name: 'YmqGroupAdminAssignment' } }
    /**
     * Find zero or one YmqGroupAdminAssignment that matches the filter.
     * @param {YmqGroupAdminAssignmentFindUniqueArgs} args - Arguments to find a YmqGroupAdminAssignment
     * @example
     * // Get one YmqGroupAdminAssignment
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqGroupAdminAssignmentFindUniqueArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentFindUniqueArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqGroupAdminAssignment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqGroupAdminAssignmentFindUniqueOrThrowArgs} args - Arguments to find a YmqGroupAdminAssignment
     * @example
     * // Get one YmqGroupAdminAssignment
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqGroupAdminAssignmentFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqGroupAdminAssignment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAdminAssignmentFindFirstArgs} args - Arguments to find a YmqGroupAdminAssignment
     * @example
     * // Get one YmqGroupAdminAssignment
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqGroupAdminAssignmentFindFirstArgs>(args?: SelectSubset<T, YmqGroupAdminAssignmentFindFirstArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqGroupAdminAssignment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAdminAssignmentFindFirstOrThrowArgs} args - Arguments to find a YmqGroupAdminAssignment
     * @example
     * // Get one YmqGroupAdminAssignment
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqGroupAdminAssignmentFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqGroupAdminAssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqGroupAdminAssignments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAdminAssignmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqGroupAdminAssignments
     * const ymqGroupAdminAssignments = await prisma.ymqGroupAdminAssignment.findMany()
     * 
     * // Get first 10 YmqGroupAdminAssignments
     * const ymqGroupAdminAssignments = await prisma.ymqGroupAdminAssignment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqGroupAdminAssignmentWithIdOnly = await prisma.ymqGroupAdminAssignment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqGroupAdminAssignmentFindManyArgs>(args?: SelectSubset<T, YmqGroupAdminAssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqGroupAdminAssignment.
     * @param {YmqGroupAdminAssignmentCreateArgs} args - Arguments to create a YmqGroupAdminAssignment.
     * @example
     * // Create one YmqGroupAdminAssignment
     * const YmqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.create({
     *   data: {
     *     // ... data to create a YmqGroupAdminAssignment
     *   }
     * })
     * 
     */
    create<T extends YmqGroupAdminAssignmentCreateArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentCreateArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqGroupAdminAssignments.
     * @param {YmqGroupAdminAssignmentCreateManyArgs} args - Arguments to create many YmqGroupAdminAssignments.
     * @example
     * // Create many YmqGroupAdminAssignments
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqGroupAdminAssignmentCreateManyArgs>(args?: SelectSubset<T, YmqGroupAdminAssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqGroupAdminAssignments and returns the data saved in the database.
     * @param {YmqGroupAdminAssignmentCreateManyAndReturnArgs} args - Arguments to create many YmqGroupAdminAssignments.
     * @example
     * // Create many YmqGroupAdminAssignments
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqGroupAdminAssignments and only return the `id`
     * const ymqGroupAdminAssignmentWithIdOnly = await prisma.ymqGroupAdminAssignment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqGroupAdminAssignmentCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqGroupAdminAssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqGroupAdminAssignment.
     * @param {YmqGroupAdminAssignmentDeleteArgs} args - Arguments to delete one YmqGroupAdminAssignment.
     * @example
     * // Delete one YmqGroupAdminAssignment
     * const YmqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.delete({
     *   where: {
     *     // ... filter to delete one YmqGroupAdminAssignment
     *   }
     * })
     * 
     */
    delete<T extends YmqGroupAdminAssignmentDeleteArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentDeleteArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqGroupAdminAssignment.
     * @param {YmqGroupAdminAssignmentUpdateArgs} args - Arguments to update one YmqGroupAdminAssignment.
     * @example
     * // Update one YmqGroupAdminAssignment
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqGroupAdminAssignmentUpdateArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentUpdateArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqGroupAdminAssignments.
     * @param {YmqGroupAdminAssignmentDeleteManyArgs} args - Arguments to filter YmqGroupAdminAssignments to delete.
     * @example
     * // Delete a few YmqGroupAdminAssignments
     * const { count } = await prisma.ymqGroupAdminAssignment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqGroupAdminAssignmentDeleteManyArgs>(args?: SelectSubset<T, YmqGroupAdminAssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqGroupAdminAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAdminAssignmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqGroupAdminAssignments
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqGroupAdminAssignmentUpdateManyArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqGroupAdminAssignments and returns the data updated in the database.
     * @param {YmqGroupAdminAssignmentUpdateManyAndReturnArgs} args - Arguments to update many YmqGroupAdminAssignments.
     * @example
     * // Update many YmqGroupAdminAssignments
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqGroupAdminAssignments and only return the `id`
     * const ymqGroupAdminAssignmentWithIdOnly = await prisma.ymqGroupAdminAssignment.updateManyAndReturn({
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
    updateManyAndReturn<T extends YmqGroupAdminAssignmentUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqGroupAdminAssignment.
     * @param {YmqGroupAdminAssignmentUpsertArgs} args - Arguments to update or create a YmqGroupAdminAssignment.
     * @example
     * // Update or create a YmqGroupAdminAssignment
     * const ymqGroupAdminAssignment = await prisma.ymqGroupAdminAssignment.upsert({
     *   create: {
     *     // ... data to create a YmqGroupAdminAssignment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqGroupAdminAssignment we want to update
     *   }
     * })
     */
    upsert<T extends YmqGroupAdminAssignmentUpsertArgs>(args: SelectSubset<T, YmqGroupAdminAssignmentUpsertArgs<ExtArgs>>): Prisma__YmqGroupAdminAssignmentClient<$Result.GetResult<Prisma.$YmqGroupAdminAssignmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqGroupAdminAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAdminAssignmentCountArgs} args - Arguments to filter YmqGroupAdminAssignments to count.
     * @example
     * // Count the number of YmqGroupAdminAssignments
     * const count = await prisma.ymqGroupAdminAssignment.count({
     *   where: {
     *     // ... the filter for the YmqGroupAdminAssignments we want to count
     *   }
     * })
    **/
    count<T extends YmqGroupAdminAssignmentCountArgs>(
      args?: Subset<T, YmqGroupAdminAssignmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqGroupAdminAssignmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqGroupAdminAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAdminAssignmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YmqGroupAdminAssignmentAggregateArgs>(args: Subset<T, YmqGroupAdminAssignmentAggregateArgs>): Prisma.PrismaPromise<GetYmqGroupAdminAssignmentAggregateType<T>>

    /**
     * Group by YmqGroupAdminAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqGroupAdminAssignmentGroupByArgs} args - Group by arguments.
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
      T extends YmqGroupAdminAssignmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqGroupAdminAssignmentGroupByArgs['orderBy'] }
        : { orderBy?: YmqGroupAdminAssignmentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, YmqGroupAdminAssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqGroupAdminAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqGroupAdminAssignment model
   */
  readonly fields: YmqGroupAdminAssignmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqGroupAdminAssignment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqGroupAdminAssignmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the YmqGroupAdminAssignment model
   */
  interface YmqGroupAdminAssignmentFieldRefs {
    readonly id: FieldRef<"YmqGroupAdminAssignment", 'String'>
    readonly groupId: FieldRef<"YmqGroupAdminAssignment", 'String'>
    readonly userId: FieldRef<"YmqGroupAdminAssignment", 'String'>
    readonly role: FieldRef<"YmqGroupAdminAssignment", 'YmqGroupStaffRole'>
    readonly assignedById: FieldRef<"YmqGroupAdminAssignment", 'String'>
    readonly assignedAt: FieldRef<"YmqGroupAdminAssignment", 'DateTime'>
    readonly revokedAt: FieldRef<"YmqGroupAdminAssignment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqGroupAdminAssignment findUnique
   */
  export type YmqGroupAdminAssignmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroupAdminAssignment to fetch.
     */
    where: YmqGroupAdminAssignmentWhereUniqueInput
  }

  /**
   * YmqGroupAdminAssignment findUniqueOrThrow
   */
  export type YmqGroupAdminAssignmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroupAdminAssignment to fetch.
     */
    where: YmqGroupAdminAssignmentWhereUniqueInput
  }

  /**
   * YmqGroupAdminAssignment findFirst
   */
  export type YmqGroupAdminAssignmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroupAdminAssignment to fetch.
     */
    where?: YmqGroupAdminAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroupAdminAssignments to fetch.
     */
    orderBy?: YmqGroupAdminAssignmentOrderByWithRelationInput | YmqGroupAdminAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqGroupAdminAssignments.
     */
    cursor?: YmqGroupAdminAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroupAdminAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroupAdminAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqGroupAdminAssignments.
     */
    distinct?: YmqGroupAdminAssignmentScalarFieldEnum | YmqGroupAdminAssignmentScalarFieldEnum[]
  }

  /**
   * YmqGroupAdminAssignment findFirstOrThrow
   */
  export type YmqGroupAdminAssignmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroupAdminAssignment to fetch.
     */
    where?: YmqGroupAdminAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroupAdminAssignments to fetch.
     */
    orderBy?: YmqGroupAdminAssignmentOrderByWithRelationInput | YmqGroupAdminAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqGroupAdminAssignments.
     */
    cursor?: YmqGroupAdminAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroupAdminAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroupAdminAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqGroupAdminAssignments.
     */
    distinct?: YmqGroupAdminAssignmentScalarFieldEnum | YmqGroupAdminAssignmentScalarFieldEnum[]
  }

  /**
   * YmqGroupAdminAssignment findMany
   */
  export type YmqGroupAdminAssignmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which YmqGroupAdminAssignments to fetch.
     */
    where?: YmqGroupAdminAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqGroupAdminAssignments to fetch.
     */
    orderBy?: YmqGroupAdminAssignmentOrderByWithRelationInput | YmqGroupAdminAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqGroupAdminAssignments.
     */
    cursor?: YmqGroupAdminAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqGroupAdminAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqGroupAdminAssignments.
     */
    skip?: number
    distinct?: YmqGroupAdminAssignmentScalarFieldEnum | YmqGroupAdminAssignmentScalarFieldEnum[]
  }

  /**
   * YmqGroupAdminAssignment create
   */
  export type YmqGroupAdminAssignmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqGroupAdminAssignment.
     */
    data: XOR<YmqGroupAdminAssignmentCreateInput, YmqGroupAdminAssignmentUncheckedCreateInput>
  }

  /**
   * YmqGroupAdminAssignment createMany
   */
  export type YmqGroupAdminAssignmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqGroupAdminAssignments.
     */
    data: YmqGroupAdminAssignmentCreateManyInput | YmqGroupAdminAssignmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqGroupAdminAssignment createManyAndReturn
   */
  export type YmqGroupAdminAssignmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * The data used to create many YmqGroupAdminAssignments.
     */
    data: YmqGroupAdminAssignmentCreateManyInput | YmqGroupAdminAssignmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqGroupAdminAssignment update
   */
  export type YmqGroupAdminAssignmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqGroupAdminAssignment.
     */
    data: XOR<YmqGroupAdminAssignmentUpdateInput, YmqGroupAdminAssignmentUncheckedUpdateInput>
    /**
     * Choose, which YmqGroupAdminAssignment to update.
     */
    where: YmqGroupAdminAssignmentWhereUniqueInput
  }

  /**
   * YmqGroupAdminAssignment updateMany
   */
  export type YmqGroupAdminAssignmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqGroupAdminAssignments.
     */
    data: XOR<YmqGroupAdminAssignmentUpdateManyMutationInput, YmqGroupAdminAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which YmqGroupAdminAssignments to update
     */
    where?: YmqGroupAdminAssignmentWhereInput
    /**
     * Limit how many YmqGroupAdminAssignments to update.
     */
    limit?: number
  }

  /**
   * YmqGroupAdminAssignment updateManyAndReturn
   */
  export type YmqGroupAdminAssignmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * The data used to update YmqGroupAdminAssignments.
     */
    data: XOR<YmqGroupAdminAssignmentUpdateManyMutationInput, YmqGroupAdminAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which YmqGroupAdminAssignments to update
     */
    where?: YmqGroupAdminAssignmentWhereInput
    /**
     * Limit how many YmqGroupAdminAssignments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqGroupAdminAssignment upsert
   */
  export type YmqGroupAdminAssignmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqGroupAdminAssignment to update in case it exists.
     */
    where: YmqGroupAdminAssignmentWhereUniqueInput
    /**
     * In case the YmqGroupAdminAssignment found by the `where` argument doesn't exist, create a new YmqGroupAdminAssignment with this data.
     */
    create: XOR<YmqGroupAdminAssignmentCreateInput, YmqGroupAdminAssignmentUncheckedCreateInput>
    /**
     * In case the YmqGroupAdminAssignment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqGroupAdminAssignmentUpdateInput, YmqGroupAdminAssignmentUncheckedUpdateInput>
  }

  /**
   * YmqGroupAdminAssignment delete
   */
  export type YmqGroupAdminAssignmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
    /**
     * Filter which YmqGroupAdminAssignment to delete.
     */
    where: YmqGroupAdminAssignmentWhereUniqueInput
  }

  /**
   * YmqGroupAdminAssignment deleteMany
   */
  export type YmqGroupAdminAssignmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqGroupAdminAssignments to delete
     */
    where?: YmqGroupAdminAssignmentWhereInput
    /**
     * Limit how many YmqGroupAdminAssignments to delete.
     */
    limit?: number
  }

  /**
   * YmqGroupAdminAssignment without action
   */
  export type YmqGroupAdminAssignmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqGroupAdminAssignment
     */
    select?: YmqGroupAdminAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqGroupAdminAssignment
     */
    omit?: YmqGroupAdminAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqGroupAdminAssignmentInclude<ExtArgs> | null
  }


  /**
   * Model YmqLearningSession
   */

  export type AggregateYmqLearningSession = {
    _count: YmqLearningSessionCountAggregateOutputType | null
    _min: YmqLearningSessionMinAggregateOutputType | null
    _max: YmqLearningSessionMaxAggregateOutputType | null
  }

  export type YmqLearningSessionMinAggregateOutputType = {
    id: string | null
    groupId: string | null
    sessionDate: Date | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqLearningSessionMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    sessionDate: Date | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqLearningSessionCountAggregateOutputType = {
    id: number
    groupId: number
    sessionDate: number
    notes: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type YmqLearningSessionMinAggregateInputType = {
    id?: true
    groupId?: true
    sessionDate?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqLearningSessionMaxAggregateInputType = {
    id?: true
    groupId?: true
    sessionDate?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqLearningSessionCountAggregateInputType = {
    id?: true
    groupId?: true
    sessionDate?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type YmqLearningSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqLearningSession to aggregate.
     */
    where?: YmqLearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningSessions to fetch.
     */
    orderBy?: YmqLearningSessionOrderByWithRelationInput | YmqLearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqLearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqLearningSessions
    **/
    _count?: true | YmqLearningSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqLearningSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqLearningSessionMaxAggregateInputType
  }

  export type GetYmqLearningSessionAggregateType<T extends YmqLearningSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqLearningSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqLearningSession[P]>
      : GetScalarType<T[P], AggregateYmqLearningSession[P]>
  }




  export type YmqLearningSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqLearningSessionWhereInput
    orderBy?: YmqLearningSessionOrderByWithAggregationInput | YmqLearningSessionOrderByWithAggregationInput[]
    by: YmqLearningSessionScalarFieldEnum[] | YmqLearningSessionScalarFieldEnum
    having?: YmqLearningSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqLearningSessionCountAggregateInputType | true
    _min?: YmqLearningSessionMinAggregateInputType
    _max?: YmqLearningSessionMaxAggregateInputType
  }

  export type YmqLearningSessionGroupByOutputType = {
    id: string
    groupId: string
    sessionDate: Date
    notes: string | null
    createdById: string
    createdAt: Date
    updatedAt: Date
    _count: YmqLearningSessionCountAggregateOutputType | null
    _min: YmqLearningSessionMinAggregateOutputType | null
    _max: YmqLearningSessionMaxAggregateOutputType | null
  }

  type GetYmqLearningSessionGroupByPayload<T extends YmqLearningSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqLearningSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqLearningSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqLearningSessionGroupByOutputType[P]>
            : GetScalarType<T[P], YmqLearningSessionGroupByOutputType[P]>
        }
      >
    >


  export type YmqLearningSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    sessionDate?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    attendance?: boolean | YmqLearningSession$attendanceArgs<ExtArgs>
    progress?: boolean | YmqLearningSession$progressArgs<ExtArgs>
    _count?: boolean | YmqLearningSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqLearningSession"]>

  export type YmqLearningSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    sessionDate?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqLearningSession"]>

  export type YmqLearningSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    sessionDate?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqLearningSession"]>

  export type YmqLearningSessionSelectScalar = {
    id?: boolean
    groupId?: boolean
    sessionDate?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type YmqLearningSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "sessionDate" | "notes" | "createdById" | "createdAt" | "updatedAt", ExtArgs["result"]["ymqLearningSession"]>
  export type YmqLearningSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
    attendance?: boolean | YmqLearningSession$attendanceArgs<ExtArgs>
    progress?: boolean | YmqLearningSession$progressArgs<ExtArgs>
    _count?: boolean | YmqLearningSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type YmqLearningSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
  }
  export type YmqLearningSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | YmqGroupDefaultArgs<ExtArgs>
  }

  export type $YmqLearningSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqLearningSession"
    objects: {
      group: Prisma.$YmqGroupPayload<ExtArgs>
      attendance: Prisma.$YmqSessionAttendancePayload<ExtArgs>[]
      progress: Prisma.$YmqLearningProgressPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      sessionDate: Date
      notes: string | null
      createdById: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ymqLearningSession"]>
    composites: {}
  }

  type YmqLearningSessionGetPayload<S extends boolean | null | undefined | YmqLearningSessionDefaultArgs> = $Result.GetResult<Prisma.$YmqLearningSessionPayload, S>

  type YmqLearningSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqLearningSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqLearningSessionCountAggregateInputType | true
    }

  export interface YmqLearningSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqLearningSession'], meta: { name: 'YmqLearningSession' } }
    /**
     * Find zero or one YmqLearningSession that matches the filter.
     * @param {YmqLearningSessionFindUniqueArgs} args - Arguments to find a YmqLearningSession
     * @example
     * // Get one YmqLearningSession
     * const ymqLearningSession = await prisma.ymqLearningSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqLearningSessionFindUniqueArgs>(args: SelectSubset<T, YmqLearningSessionFindUniqueArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqLearningSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqLearningSessionFindUniqueOrThrowArgs} args - Arguments to find a YmqLearningSession
     * @example
     * // Get one YmqLearningSession
     * const ymqLearningSession = await prisma.ymqLearningSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqLearningSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqLearningSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqLearningSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningSessionFindFirstArgs} args - Arguments to find a YmqLearningSession
     * @example
     * // Get one YmqLearningSession
     * const ymqLearningSession = await prisma.ymqLearningSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqLearningSessionFindFirstArgs>(args?: SelectSubset<T, YmqLearningSessionFindFirstArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqLearningSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningSessionFindFirstOrThrowArgs} args - Arguments to find a YmqLearningSession
     * @example
     * // Get one YmqLearningSession
     * const ymqLearningSession = await prisma.ymqLearningSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqLearningSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqLearningSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqLearningSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqLearningSessions
     * const ymqLearningSessions = await prisma.ymqLearningSession.findMany()
     * 
     * // Get first 10 YmqLearningSessions
     * const ymqLearningSessions = await prisma.ymqLearningSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqLearningSessionWithIdOnly = await prisma.ymqLearningSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqLearningSessionFindManyArgs>(args?: SelectSubset<T, YmqLearningSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqLearningSession.
     * @param {YmqLearningSessionCreateArgs} args - Arguments to create a YmqLearningSession.
     * @example
     * // Create one YmqLearningSession
     * const YmqLearningSession = await prisma.ymqLearningSession.create({
     *   data: {
     *     // ... data to create a YmqLearningSession
     *   }
     * })
     * 
     */
    create<T extends YmqLearningSessionCreateArgs>(args: SelectSubset<T, YmqLearningSessionCreateArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqLearningSessions.
     * @param {YmqLearningSessionCreateManyArgs} args - Arguments to create many YmqLearningSessions.
     * @example
     * // Create many YmqLearningSessions
     * const ymqLearningSession = await prisma.ymqLearningSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqLearningSessionCreateManyArgs>(args?: SelectSubset<T, YmqLearningSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqLearningSessions and returns the data saved in the database.
     * @param {YmqLearningSessionCreateManyAndReturnArgs} args - Arguments to create many YmqLearningSessions.
     * @example
     * // Create many YmqLearningSessions
     * const ymqLearningSession = await prisma.ymqLearningSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqLearningSessions and only return the `id`
     * const ymqLearningSessionWithIdOnly = await prisma.ymqLearningSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqLearningSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqLearningSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqLearningSession.
     * @param {YmqLearningSessionDeleteArgs} args - Arguments to delete one YmqLearningSession.
     * @example
     * // Delete one YmqLearningSession
     * const YmqLearningSession = await prisma.ymqLearningSession.delete({
     *   where: {
     *     // ... filter to delete one YmqLearningSession
     *   }
     * })
     * 
     */
    delete<T extends YmqLearningSessionDeleteArgs>(args: SelectSubset<T, YmqLearningSessionDeleteArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqLearningSession.
     * @param {YmqLearningSessionUpdateArgs} args - Arguments to update one YmqLearningSession.
     * @example
     * // Update one YmqLearningSession
     * const ymqLearningSession = await prisma.ymqLearningSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqLearningSessionUpdateArgs>(args: SelectSubset<T, YmqLearningSessionUpdateArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqLearningSessions.
     * @param {YmqLearningSessionDeleteManyArgs} args - Arguments to filter YmqLearningSessions to delete.
     * @example
     * // Delete a few YmqLearningSessions
     * const { count } = await prisma.ymqLearningSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqLearningSessionDeleteManyArgs>(args?: SelectSubset<T, YmqLearningSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqLearningSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqLearningSessions
     * const ymqLearningSession = await prisma.ymqLearningSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqLearningSessionUpdateManyArgs>(args: SelectSubset<T, YmqLearningSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqLearningSessions and returns the data updated in the database.
     * @param {YmqLearningSessionUpdateManyAndReturnArgs} args - Arguments to update many YmqLearningSessions.
     * @example
     * // Update many YmqLearningSessions
     * const ymqLearningSession = await prisma.ymqLearningSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqLearningSessions and only return the `id`
     * const ymqLearningSessionWithIdOnly = await prisma.ymqLearningSession.updateManyAndReturn({
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
    updateManyAndReturn<T extends YmqLearningSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqLearningSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqLearningSession.
     * @param {YmqLearningSessionUpsertArgs} args - Arguments to update or create a YmqLearningSession.
     * @example
     * // Update or create a YmqLearningSession
     * const ymqLearningSession = await prisma.ymqLearningSession.upsert({
     *   create: {
     *     // ... data to create a YmqLearningSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqLearningSession we want to update
     *   }
     * })
     */
    upsert<T extends YmqLearningSessionUpsertArgs>(args: SelectSubset<T, YmqLearningSessionUpsertArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqLearningSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningSessionCountArgs} args - Arguments to filter YmqLearningSessions to count.
     * @example
     * // Count the number of YmqLearningSessions
     * const count = await prisma.ymqLearningSession.count({
     *   where: {
     *     // ... the filter for the YmqLearningSessions we want to count
     *   }
     * })
    **/
    count<T extends YmqLearningSessionCountArgs>(
      args?: Subset<T, YmqLearningSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqLearningSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqLearningSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YmqLearningSessionAggregateArgs>(args: Subset<T, YmqLearningSessionAggregateArgs>): Prisma.PrismaPromise<GetYmqLearningSessionAggregateType<T>>

    /**
     * Group by YmqLearningSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningSessionGroupByArgs} args - Group by arguments.
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
      T extends YmqLearningSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqLearningSessionGroupByArgs['orderBy'] }
        : { orderBy?: YmqLearningSessionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, YmqLearningSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqLearningSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqLearningSession model
   */
  readonly fields: YmqLearningSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqLearningSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqLearningSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    group<T extends YmqGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, YmqGroupDefaultArgs<ExtArgs>>): Prisma__YmqGroupClient<$Result.GetResult<Prisma.$YmqGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attendance<T extends YmqLearningSession$attendanceArgs<ExtArgs> = {}>(args?: Subset<T, YmqLearningSession$attendanceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    progress<T extends YmqLearningSession$progressArgs<ExtArgs> = {}>(args?: Subset<T, YmqLearningSession$progressArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the YmqLearningSession model
   */
  interface YmqLearningSessionFieldRefs {
    readonly id: FieldRef<"YmqLearningSession", 'String'>
    readonly groupId: FieldRef<"YmqLearningSession", 'String'>
    readonly sessionDate: FieldRef<"YmqLearningSession", 'DateTime'>
    readonly notes: FieldRef<"YmqLearningSession", 'String'>
    readonly createdById: FieldRef<"YmqLearningSession", 'String'>
    readonly createdAt: FieldRef<"YmqLearningSession", 'DateTime'>
    readonly updatedAt: FieldRef<"YmqLearningSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqLearningSession findUnique
   */
  export type YmqLearningSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningSession to fetch.
     */
    where: YmqLearningSessionWhereUniqueInput
  }

  /**
   * YmqLearningSession findUniqueOrThrow
   */
  export type YmqLearningSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningSession to fetch.
     */
    where: YmqLearningSessionWhereUniqueInput
  }

  /**
   * YmqLearningSession findFirst
   */
  export type YmqLearningSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningSession to fetch.
     */
    where?: YmqLearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningSessions to fetch.
     */
    orderBy?: YmqLearningSessionOrderByWithRelationInput | YmqLearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqLearningSessions.
     */
    cursor?: YmqLearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqLearningSessions.
     */
    distinct?: YmqLearningSessionScalarFieldEnum | YmqLearningSessionScalarFieldEnum[]
  }

  /**
   * YmqLearningSession findFirstOrThrow
   */
  export type YmqLearningSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningSession to fetch.
     */
    where?: YmqLearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningSessions to fetch.
     */
    orderBy?: YmqLearningSessionOrderByWithRelationInput | YmqLearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqLearningSessions.
     */
    cursor?: YmqLearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqLearningSessions.
     */
    distinct?: YmqLearningSessionScalarFieldEnum | YmqLearningSessionScalarFieldEnum[]
  }

  /**
   * YmqLearningSession findMany
   */
  export type YmqLearningSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningSessions to fetch.
     */
    where?: YmqLearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningSessions to fetch.
     */
    orderBy?: YmqLearningSessionOrderByWithRelationInput | YmqLearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqLearningSessions.
     */
    cursor?: YmqLearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningSessions.
     */
    skip?: number
    distinct?: YmqLearningSessionScalarFieldEnum | YmqLearningSessionScalarFieldEnum[]
  }

  /**
   * YmqLearningSession create
   */
  export type YmqLearningSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqLearningSession.
     */
    data: XOR<YmqLearningSessionCreateInput, YmqLearningSessionUncheckedCreateInput>
  }

  /**
   * YmqLearningSession createMany
   */
  export type YmqLearningSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqLearningSessions.
     */
    data: YmqLearningSessionCreateManyInput | YmqLearningSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqLearningSession createManyAndReturn
   */
  export type YmqLearningSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * The data used to create many YmqLearningSessions.
     */
    data: YmqLearningSessionCreateManyInput | YmqLearningSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqLearningSession update
   */
  export type YmqLearningSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqLearningSession.
     */
    data: XOR<YmqLearningSessionUpdateInput, YmqLearningSessionUncheckedUpdateInput>
    /**
     * Choose, which YmqLearningSession to update.
     */
    where: YmqLearningSessionWhereUniqueInput
  }

  /**
   * YmqLearningSession updateMany
   */
  export type YmqLearningSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqLearningSessions.
     */
    data: XOR<YmqLearningSessionUpdateManyMutationInput, YmqLearningSessionUncheckedUpdateManyInput>
    /**
     * Filter which YmqLearningSessions to update
     */
    where?: YmqLearningSessionWhereInput
    /**
     * Limit how many YmqLearningSessions to update.
     */
    limit?: number
  }

  /**
   * YmqLearningSession updateManyAndReturn
   */
  export type YmqLearningSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * The data used to update YmqLearningSessions.
     */
    data: XOR<YmqLearningSessionUpdateManyMutationInput, YmqLearningSessionUncheckedUpdateManyInput>
    /**
     * Filter which YmqLearningSessions to update
     */
    where?: YmqLearningSessionWhereInput
    /**
     * Limit how many YmqLearningSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqLearningSession upsert
   */
  export type YmqLearningSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqLearningSession to update in case it exists.
     */
    where: YmqLearningSessionWhereUniqueInput
    /**
     * In case the YmqLearningSession found by the `where` argument doesn't exist, create a new YmqLearningSession with this data.
     */
    create: XOR<YmqLearningSessionCreateInput, YmqLearningSessionUncheckedCreateInput>
    /**
     * In case the YmqLearningSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqLearningSessionUpdateInput, YmqLearningSessionUncheckedUpdateInput>
  }

  /**
   * YmqLearningSession delete
   */
  export type YmqLearningSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
    /**
     * Filter which YmqLearningSession to delete.
     */
    where: YmqLearningSessionWhereUniqueInput
  }

  /**
   * YmqLearningSession deleteMany
   */
  export type YmqLearningSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqLearningSessions to delete
     */
    where?: YmqLearningSessionWhereInput
    /**
     * Limit how many YmqLearningSessions to delete.
     */
    limit?: number
  }

  /**
   * YmqLearningSession.attendance
   */
  export type YmqLearningSession$attendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    where?: YmqSessionAttendanceWhereInput
    orderBy?: YmqSessionAttendanceOrderByWithRelationInput | YmqSessionAttendanceOrderByWithRelationInput[]
    cursor?: YmqSessionAttendanceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqSessionAttendanceScalarFieldEnum | YmqSessionAttendanceScalarFieldEnum[]
  }

  /**
   * YmqLearningSession.progress
   */
  export type YmqLearningSession$progressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    where?: YmqLearningProgressWhereInput
    orderBy?: YmqLearningProgressOrderByWithRelationInput | YmqLearningProgressOrderByWithRelationInput[]
    cursor?: YmqLearningProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqLearningProgressScalarFieldEnum | YmqLearningProgressScalarFieldEnum[]
  }

  /**
   * YmqLearningSession without action
   */
  export type YmqLearningSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningSession
     */
    select?: YmqLearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningSession
     */
    omit?: YmqLearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningSessionInclude<ExtArgs> | null
  }


  /**
   * Model YmqSessionAttendance
   */

  export type AggregateYmqSessionAttendance = {
    _count: YmqSessionAttendanceCountAggregateOutputType | null
    _min: YmqSessionAttendanceMinAggregateOutputType | null
    _max: YmqSessionAttendanceMaxAggregateOutputType | null
  }

  export type YmqSessionAttendanceMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    memberId: string | null
    status: $Enums.AttendanceStatus | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqSessionAttendanceMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    memberId: string | null
    status: $Enums.AttendanceStatus | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqSessionAttendanceCountAggregateOutputType = {
    id: number
    sessionId: number
    memberId: number
    status: number
    note: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type YmqSessionAttendanceMinAggregateInputType = {
    id?: true
    sessionId?: true
    memberId?: true
    status?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqSessionAttendanceMaxAggregateInputType = {
    id?: true
    sessionId?: true
    memberId?: true
    status?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqSessionAttendanceCountAggregateInputType = {
    id?: true
    sessionId?: true
    memberId?: true
    status?: true
    note?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type YmqSessionAttendanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqSessionAttendance to aggregate.
     */
    where?: YmqSessionAttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSessionAttendances to fetch.
     */
    orderBy?: YmqSessionAttendanceOrderByWithRelationInput | YmqSessionAttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqSessionAttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSessionAttendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSessionAttendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqSessionAttendances
    **/
    _count?: true | YmqSessionAttendanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqSessionAttendanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqSessionAttendanceMaxAggregateInputType
  }

  export type GetYmqSessionAttendanceAggregateType<T extends YmqSessionAttendanceAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqSessionAttendance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqSessionAttendance[P]>
      : GetScalarType<T[P], AggregateYmqSessionAttendance[P]>
  }




  export type YmqSessionAttendanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqSessionAttendanceWhereInput
    orderBy?: YmqSessionAttendanceOrderByWithAggregationInput | YmqSessionAttendanceOrderByWithAggregationInput[]
    by: YmqSessionAttendanceScalarFieldEnum[] | YmqSessionAttendanceScalarFieldEnum
    having?: YmqSessionAttendanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqSessionAttendanceCountAggregateInputType | true
    _min?: YmqSessionAttendanceMinAggregateInputType
    _max?: YmqSessionAttendanceMaxAggregateInputType
  }

  export type YmqSessionAttendanceGroupByOutputType = {
    id: string
    sessionId: string
    memberId: string
    status: $Enums.AttendanceStatus
    note: string | null
    createdAt: Date
    updatedAt: Date
    _count: YmqSessionAttendanceCountAggregateOutputType | null
    _min: YmqSessionAttendanceMinAggregateOutputType | null
    _max: YmqSessionAttendanceMaxAggregateOutputType | null
  }

  type GetYmqSessionAttendanceGroupByPayload<T extends YmqSessionAttendanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqSessionAttendanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqSessionAttendanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqSessionAttendanceGroupByOutputType[P]>
            : GetScalarType<T[P], YmqSessionAttendanceGroupByOutputType[P]>
        }
      >
    >


  export type YmqSessionAttendanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    status?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqSessionAttendance"]>

  export type YmqSessionAttendanceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    status?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqSessionAttendance"]>

  export type YmqSessionAttendanceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    status?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqSessionAttendance"]>

  export type YmqSessionAttendanceSelectScalar = {
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    status?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type YmqSessionAttendanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "memberId" | "status" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["ymqSessionAttendance"]>
  export type YmqSessionAttendanceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
  }
  export type YmqSessionAttendanceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
  }
  export type YmqSessionAttendanceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
  }

  export type $YmqSessionAttendancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqSessionAttendance"
    objects: {
      session: Prisma.$YmqLearningSessionPayload<ExtArgs>
      member: Prisma.$YmqMemberPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      memberId: string
      status: $Enums.AttendanceStatus
      note: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ymqSessionAttendance"]>
    composites: {}
  }

  type YmqSessionAttendanceGetPayload<S extends boolean | null | undefined | YmqSessionAttendanceDefaultArgs> = $Result.GetResult<Prisma.$YmqSessionAttendancePayload, S>

  type YmqSessionAttendanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqSessionAttendanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqSessionAttendanceCountAggregateInputType | true
    }

  export interface YmqSessionAttendanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqSessionAttendance'], meta: { name: 'YmqSessionAttendance' } }
    /**
     * Find zero or one YmqSessionAttendance that matches the filter.
     * @param {YmqSessionAttendanceFindUniqueArgs} args - Arguments to find a YmqSessionAttendance
     * @example
     * // Get one YmqSessionAttendance
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqSessionAttendanceFindUniqueArgs>(args: SelectSubset<T, YmqSessionAttendanceFindUniqueArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqSessionAttendance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqSessionAttendanceFindUniqueOrThrowArgs} args - Arguments to find a YmqSessionAttendance
     * @example
     * // Get one YmqSessionAttendance
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqSessionAttendanceFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqSessionAttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqSessionAttendance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSessionAttendanceFindFirstArgs} args - Arguments to find a YmqSessionAttendance
     * @example
     * // Get one YmqSessionAttendance
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqSessionAttendanceFindFirstArgs>(args?: SelectSubset<T, YmqSessionAttendanceFindFirstArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqSessionAttendance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSessionAttendanceFindFirstOrThrowArgs} args - Arguments to find a YmqSessionAttendance
     * @example
     * // Get one YmqSessionAttendance
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqSessionAttendanceFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqSessionAttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqSessionAttendances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSessionAttendanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqSessionAttendances
     * const ymqSessionAttendances = await prisma.ymqSessionAttendance.findMany()
     * 
     * // Get first 10 YmqSessionAttendances
     * const ymqSessionAttendances = await prisma.ymqSessionAttendance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqSessionAttendanceWithIdOnly = await prisma.ymqSessionAttendance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqSessionAttendanceFindManyArgs>(args?: SelectSubset<T, YmqSessionAttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqSessionAttendance.
     * @param {YmqSessionAttendanceCreateArgs} args - Arguments to create a YmqSessionAttendance.
     * @example
     * // Create one YmqSessionAttendance
     * const YmqSessionAttendance = await prisma.ymqSessionAttendance.create({
     *   data: {
     *     // ... data to create a YmqSessionAttendance
     *   }
     * })
     * 
     */
    create<T extends YmqSessionAttendanceCreateArgs>(args: SelectSubset<T, YmqSessionAttendanceCreateArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqSessionAttendances.
     * @param {YmqSessionAttendanceCreateManyArgs} args - Arguments to create many YmqSessionAttendances.
     * @example
     * // Create many YmqSessionAttendances
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqSessionAttendanceCreateManyArgs>(args?: SelectSubset<T, YmqSessionAttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqSessionAttendances and returns the data saved in the database.
     * @param {YmqSessionAttendanceCreateManyAndReturnArgs} args - Arguments to create many YmqSessionAttendances.
     * @example
     * // Create many YmqSessionAttendances
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqSessionAttendances and only return the `id`
     * const ymqSessionAttendanceWithIdOnly = await prisma.ymqSessionAttendance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqSessionAttendanceCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqSessionAttendanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqSessionAttendance.
     * @param {YmqSessionAttendanceDeleteArgs} args - Arguments to delete one YmqSessionAttendance.
     * @example
     * // Delete one YmqSessionAttendance
     * const YmqSessionAttendance = await prisma.ymqSessionAttendance.delete({
     *   where: {
     *     // ... filter to delete one YmqSessionAttendance
     *   }
     * })
     * 
     */
    delete<T extends YmqSessionAttendanceDeleteArgs>(args: SelectSubset<T, YmqSessionAttendanceDeleteArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqSessionAttendance.
     * @param {YmqSessionAttendanceUpdateArgs} args - Arguments to update one YmqSessionAttendance.
     * @example
     * // Update one YmqSessionAttendance
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqSessionAttendanceUpdateArgs>(args: SelectSubset<T, YmqSessionAttendanceUpdateArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqSessionAttendances.
     * @param {YmqSessionAttendanceDeleteManyArgs} args - Arguments to filter YmqSessionAttendances to delete.
     * @example
     * // Delete a few YmqSessionAttendances
     * const { count } = await prisma.ymqSessionAttendance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqSessionAttendanceDeleteManyArgs>(args?: SelectSubset<T, YmqSessionAttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqSessionAttendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSessionAttendanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqSessionAttendances
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqSessionAttendanceUpdateManyArgs>(args: SelectSubset<T, YmqSessionAttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqSessionAttendances and returns the data updated in the database.
     * @param {YmqSessionAttendanceUpdateManyAndReturnArgs} args - Arguments to update many YmqSessionAttendances.
     * @example
     * // Update many YmqSessionAttendances
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqSessionAttendances and only return the `id`
     * const ymqSessionAttendanceWithIdOnly = await prisma.ymqSessionAttendance.updateManyAndReturn({
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
    updateManyAndReturn<T extends YmqSessionAttendanceUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqSessionAttendanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqSessionAttendance.
     * @param {YmqSessionAttendanceUpsertArgs} args - Arguments to update or create a YmqSessionAttendance.
     * @example
     * // Update or create a YmqSessionAttendance
     * const ymqSessionAttendance = await prisma.ymqSessionAttendance.upsert({
     *   create: {
     *     // ... data to create a YmqSessionAttendance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqSessionAttendance we want to update
     *   }
     * })
     */
    upsert<T extends YmqSessionAttendanceUpsertArgs>(args: SelectSubset<T, YmqSessionAttendanceUpsertArgs<ExtArgs>>): Prisma__YmqSessionAttendanceClient<$Result.GetResult<Prisma.$YmqSessionAttendancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqSessionAttendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSessionAttendanceCountArgs} args - Arguments to filter YmqSessionAttendances to count.
     * @example
     * // Count the number of YmqSessionAttendances
     * const count = await prisma.ymqSessionAttendance.count({
     *   where: {
     *     // ... the filter for the YmqSessionAttendances we want to count
     *   }
     * })
    **/
    count<T extends YmqSessionAttendanceCountArgs>(
      args?: Subset<T, YmqSessionAttendanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqSessionAttendanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqSessionAttendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSessionAttendanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YmqSessionAttendanceAggregateArgs>(args: Subset<T, YmqSessionAttendanceAggregateArgs>): Prisma.PrismaPromise<GetYmqSessionAttendanceAggregateType<T>>

    /**
     * Group by YmqSessionAttendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqSessionAttendanceGroupByArgs} args - Group by arguments.
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
      T extends YmqSessionAttendanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqSessionAttendanceGroupByArgs['orderBy'] }
        : { orderBy?: YmqSessionAttendanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, YmqSessionAttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqSessionAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqSessionAttendance model
   */
  readonly fields: YmqSessionAttendanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqSessionAttendance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqSessionAttendanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends YmqLearningSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, YmqLearningSessionDefaultArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    member<T extends YmqMemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, YmqMemberDefaultArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the YmqSessionAttendance model
   */
  interface YmqSessionAttendanceFieldRefs {
    readonly id: FieldRef<"YmqSessionAttendance", 'String'>
    readonly sessionId: FieldRef<"YmqSessionAttendance", 'String'>
    readonly memberId: FieldRef<"YmqSessionAttendance", 'String'>
    readonly status: FieldRef<"YmqSessionAttendance", 'AttendanceStatus'>
    readonly note: FieldRef<"YmqSessionAttendance", 'String'>
    readonly createdAt: FieldRef<"YmqSessionAttendance", 'DateTime'>
    readonly updatedAt: FieldRef<"YmqSessionAttendance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqSessionAttendance findUnique
   */
  export type YmqSessionAttendanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * Filter, which YmqSessionAttendance to fetch.
     */
    where: YmqSessionAttendanceWhereUniqueInput
  }

  /**
   * YmqSessionAttendance findUniqueOrThrow
   */
  export type YmqSessionAttendanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * Filter, which YmqSessionAttendance to fetch.
     */
    where: YmqSessionAttendanceWhereUniqueInput
  }

  /**
   * YmqSessionAttendance findFirst
   */
  export type YmqSessionAttendanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * Filter, which YmqSessionAttendance to fetch.
     */
    where?: YmqSessionAttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSessionAttendances to fetch.
     */
    orderBy?: YmqSessionAttendanceOrderByWithRelationInput | YmqSessionAttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqSessionAttendances.
     */
    cursor?: YmqSessionAttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSessionAttendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSessionAttendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqSessionAttendances.
     */
    distinct?: YmqSessionAttendanceScalarFieldEnum | YmqSessionAttendanceScalarFieldEnum[]
  }

  /**
   * YmqSessionAttendance findFirstOrThrow
   */
  export type YmqSessionAttendanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * Filter, which YmqSessionAttendance to fetch.
     */
    where?: YmqSessionAttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSessionAttendances to fetch.
     */
    orderBy?: YmqSessionAttendanceOrderByWithRelationInput | YmqSessionAttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqSessionAttendances.
     */
    cursor?: YmqSessionAttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSessionAttendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSessionAttendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqSessionAttendances.
     */
    distinct?: YmqSessionAttendanceScalarFieldEnum | YmqSessionAttendanceScalarFieldEnum[]
  }

  /**
   * YmqSessionAttendance findMany
   */
  export type YmqSessionAttendanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * Filter, which YmqSessionAttendances to fetch.
     */
    where?: YmqSessionAttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqSessionAttendances to fetch.
     */
    orderBy?: YmqSessionAttendanceOrderByWithRelationInput | YmqSessionAttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqSessionAttendances.
     */
    cursor?: YmqSessionAttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqSessionAttendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqSessionAttendances.
     */
    skip?: number
    distinct?: YmqSessionAttendanceScalarFieldEnum | YmqSessionAttendanceScalarFieldEnum[]
  }

  /**
   * YmqSessionAttendance create
   */
  export type YmqSessionAttendanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqSessionAttendance.
     */
    data: XOR<YmqSessionAttendanceCreateInput, YmqSessionAttendanceUncheckedCreateInput>
  }

  /**
   * YmqSessionAttendance createMany
   */
  export type YmqSessionAttendanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqSessionAttendances.
     */
    data: YmqSessionAttendanceCreateManyInput | YmqSessionAttendanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqSessionAttendance createManyAndReturn
   */
  export type YmqSessionAttendanceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * The data used to create many YmqSessionAttendances.
     */
    data: YmqSessionAttendanceCreateManyInput | YmqSessionAttendanceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqSessionAttendance update
   */
  export type YmqSessionAttendanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqSessionAttendance.
     */
    data: XOR<YmqSessionAttendanceUpdateInput, YmqSessionAttendanceUncheckedUpdateInput>
    /**
     * Choose, which YmqSessionAttendance to update.
     */
    where: YmqSessionAttendanceWhereUniqueInput
  }

  /**
   * YmqSessionAttendance updateMany
   */
  export type YmqSessionAttendanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqSessionAttendances.
     */
    data: XOR<YmqSessionAttendanceUpdateManyMutationInput, YmqSessionAttendanceUncheckedUpdateManyInput>
    /**
     * Filter which YmqSessionAttendances to update
     */
    where?: YmqSessionAttendanceWhereInput
    /**
     * Limit how many YmqSessionAttendances to update.
     */
    limit?: number
  }

  /**
   * YmqSessionAttendance updateManyAndReturn
   */
  export type YmqSessionAttendanceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * The data used to update YmqSessionAttendances.
     */
    data: XOR<YmqSessionAttendanceUpdateManyMutationInput, YmqSessionAttendanceUncheckedUpdateManyInput>
    /**
     * Filter which YmqSessionAttendances to update
     */
    where?: YmqSessionAttendanceWhereInput
    /**
     * Limit how many YmqSessionAttendances to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqSessionAttendance upsert
   */
  export type YmqSessionAttendanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqSessionAttendance to update in case it exists.
     */
    where: YmqSessionAttendanceWhereUniqueInput
    /**
     * In case the YmqSessionAttendance found by the `where` argument doesn't exist, create a new YmqSessionAttendance with this data.
     */
    create: XOR<YmqSessionAttendanceCreateInput, YmqSessionAttendanceUncheckedCreateInput>
    /**
     * In case the YmqSessionAttendance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqSessionAttendanceUpdateInput, YmqSessionAttendanceUncheckedUpdateInput>
  }

  /**
   * YmqSessionAttendance delete
   */
  export type YmqSessionAttendanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
    /**
     * Filter which YmqSessionAttendance to delete.
     */
    where: YmqSessionAttendanceWhereUniqueInput
  }

  /**
   * YmqSessionAttendance deleteMany
   */
  export type YmqSessionAttendanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqSessionAttendances to delete
     */
    where?: YmqSessionAttendanceWhereInput
    /**
     * Limit how many YmqSessionAttendances to delete.
     */
    limit?: number
  }

  /**
   * YmqSessionAttendance without action
   */
  export type YmqSessionAttendanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqSessionAttendance
     */
    select?: YmqSessionAttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqSessionAttendance
     */
    omit?: YmqSessionAttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqSessionAttendanceInclude<ExtArgs> | null
  }


  /**
   * Model YmqLearningProgress
   */

  export type AggregateYmqLearningProgress = {
    _count: YmqLearningProgressCountAggregateOutputType | null
    _avg: YmqLearningProgressAvgAggregateOutputType | null
    _sum: YmqLearningProgressSumAggregateOutputType | null
    _min: YmqLearningProgressMinAggregateOutputType | null
    _max: YmqLearningProgressMaxAggregateOutputType | null
  }

  export type YmqLearningProgressAvgAggregateOutputType = {
    sequence: number | null
    surahNumber: number | null
    ayahStart: number | null
    ayahEnd: number | null
  }

  export type YmqLearningProgressSumAggregateOutputType = {
    sequence: number | null
    surahNumber: number | null
    ayahStart: number | null
    ayahEnd: number | null
  }

  export type YmqLearningProgressMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    memberId: string | null
    track: $Enums.LearningTrack | null
    sequence: number | null
    iwrCurriculumUnitId: string | null
    surahNumber: number | null
    ayahStart: number | null
    ayahEnd: number | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqLearningProgressMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    memberId: string | null
    track: $Enums.LearningTrack | null
    sequence: number | null
    iwrCurriculumUnitId: string | null
    surahNumber: number | null
    ayahStart: number | null
    ayahEnd: number | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type YmqLearningProgressCountAggregateOutputType = {
    id: number
    sessionId: number
    memberId: number
    track: number
    sequence: number
    iwrCurriculumUnitId: number
    surahNumber: number
    ayahStart: number
    ayahEnd: number
    note: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type YmqLearningProgressAvgAggregateInputType = {
    sequence?: true
    surahNumber?: true
    ayahStart?: true
    ayahEnd?: true
  }

  export type YmqLearningProgressSumAggregateInputType = {
    sequence?: true
    surahNumber?: true
    ayahStart?: true
    ayahEnd?: true
  }

  export type YmqLearningProgressMinAggregateInputType = {
    id?: true
    sessionId?: true
    memberId?: true
    track?: true
    sequence?: true
    iwrCurriculumUnitId?: true
    surahNumber?: true
    ayahStart?: true
    ayahEnd?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqLearningProgressMaxAggregateInputType = {
    id?: true
    sessionId?: true
    memberId?: true
    track?: true
    sequence?: true
    iwrCurriculumUnitId?: true
    surahNumber?: true
    ayahStart?: true
    ayahEnd?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type YmqLearningProgressCountAggregateInputType = {
    id?: true
    sessionId?: true
    memberId?: true
    track?: true
    sequence?: true
    iwrCurriculumUnitId?: true
    surahNumber?: true
    ayahStart?: true
    ayahEnd?: true
    note?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type YmqLearningProgressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqLearningProgress to aggregate.
     */
    where?: YmqLearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningProgresses to fetch.
     */
    orderBy?: YmqLearningProgressOrderByWithRelationInput | YmqLearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqLearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqLearningProgresses
    **/
    _count?: true | YmqLearningProgressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: YmqLearningProgressAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: YmqLearningProgressSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqLearningProgressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqLearningProgressMaxAggregateInputType
  }

  export type GetYmqLearningProgressAggregateType<T extends YmqLearningProgressAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqLearningProgress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqLearningProgress[P]>
      : GetScalarType<T[P], AggregateYmqLearningProgress[P]>
  }




  export type YmqLearningProgressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqLearningProgressWhereInput
    orderBy?: YmqLearningProgressOrderByWithAggregationInput | YmqLearningProgressOrderByWithAggregationInput[]
    by: YmqLearningProgressScalarFieldEnum[] | YmqLearningProgressScalarFieldEnum
    having?: YmqLearningProgressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqLearningProgressCountAggregateInputType | true
    _avg?: YmqLearningProgressAvgAggregateInputType
    _sum?: YmqLearningProgressSumAggregateInputType
    _min?: YmqLearningProgressMinAggregateInputType
    _max?: YmqLearningProgressMaxAggregateInputType
  }

  export type YmqLearningProgressGroupByOutputType = {
    id: string
    sessionId: string
    memberId: string
    track: $Enums.LearningTrack
    sequence: number
    iwrCurriculumUnitId: string | null
    surahNumber: number | null
    ayahStart: number | null
    ayahEnd: number | null
    note: string | null
    createdAt: Date
    updatedAt: Date
    _count: YmqLearningProgressCountAggregateOutputType | null
    _avg: YmqLearningProgressAvgAggregateOutputType | null
    _sum: YmqLearningProgressSumAggregateOutputType | null
    _min: YmqLearningProgressMinAggregateOutputType | null
    _max: YmqLearningProgressMaxAggregateOutputType | null
  }

  type GetYmqLearningProgressGroupByPayload<T extends YmqLearningProgressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqLearningProgressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqLearningProgressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqLearningProgressGroupByOutputType[P]>
            : GetScalarType<T[P], YmqLearningProgressGroupByOutputType[P]>
        }
      >
    >


  export type YmqLearningProgressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    track?: boolean
    sequence?: boolean
    iwrCurriculumUnitId?: boolean
    surahNumber?: boolean
    ayahStart?: boolean
    ayahEnd?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
    iwrCurriculumUnit?: boolean | YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs>
    evidence?: boolean | YmqLearningProgress$evidenceArgs<ExtArgs>
    _count?: boolean | YmqLearningProgressCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqLearningProgress"]>

  export type YmqLearningProgressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    track?: boolean
    sequence?: boolean
    iwrCurriculumUnitId?: boolean
    surahNumber?: boolean
    ayahStart?: boolean
    ayahEnd?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
    iwrCurriculumUnit?: boolean | YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs>
  }, ExtArgs["result"]["ymqLearningProgress"]>

  export type YmqLearningProgressSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    track?: boolean
    sequence?: boolean
    iwrCurriculumUnitId?: boolean
    surahNumber?: boolean
    ayahStart?: boolean
    ayahEnd?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
    iwrCurriculumUnit?: boolean | YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs>
  }, ExtArgs["result"]["ymqLearningProgress"]>

  export type YmqLearningProgressSelectScalar = {
    id?: boolean
    sessionId?: boolean
    memberId?: boolean
    track?: boolean
    sequence?: boolean
    iwrCurriculumUnitId?: boolean
    surahNumber?: boolean
    ayahStart?: boolean
    ayahEnd?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type YmqLearningProgressOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "memberId" | "track" | "sequence" | "iwrCurriculumUnitId" | "surahNumber" | "ayahStart" | "ayahEnd" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["ymqLearningProgress"]>
  export type YmqLearningProgressInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
    iwrCurriculumUnit?: boolean | YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs>
    evidence?: boolean | YmqLearningProgress$evidenceArgs<ExtArgs>
    _count?: boolean | YmqLearningProgressCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type YmqLearningProgressIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
    iwrCurriculumUnit?: boolean | YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs>
  }
  export type YmqLearningProgressIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | YmqLearningSessionDefaultArgs<ExtArgs>
    member?: boolean | YmqMemberDefaultArgs<ExtArgs>
    iwrCurriculumUnit?: boolean | YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs>
  }

  export type $YmqLearningProgressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqLearningProgress"
    objects: {
      session: Prisma.$YmqLearningSessionPayload<ExtArgs>
      member: Prisma.$YmqMemberPayload<ExtArgs>
      iwrCurriculumUnit: Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs> | null
      evidence: Prisma.$YmqProgressEvidencePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      memberId: string
      track: $Enums.LearningTrack
      sequence: number
      iwrCurriculumUnitId: string | null
      surahNumber: number | null
      ayahStart: number | null
      ayahEnd: number | null
      note: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ymqLearningProgress"]>
    composites: {}
  }

  type YmqLearningProgressGetPayload<S extends boolean | null | undefined | YmqLearningProgressDefaultArgs> = $Result.GetResult<Prisma.$YmqLearningProgressPayload, S>

  type YmqLearningProgressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqLearningProgressFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqLearningProgressCountAggregateInputType | true
    }

  export interface YmqLearningProgressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqLearningProgress'], meta: { name: 'YmqLearningProgress' } }
    /**
     * Find zero or one YmqLearningProgress that matches the filter.
     * @param {YmqLearningProgressFindUniqueArgs} args - Arguments to find a YmqLearningProgress
     * @example
     * // Get one YmqLearningProgress
     * const ymqLearningProgress = await prisma.ymqLearningProgress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqLearningProgressFindUniqueArgs>(args: SelectSubset<T, YmqLearningProgressFindUniqueArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqLearningProgress that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqLearningProgressFindUniqueOrThrowArgs} args - Arguments to find a YmqLearningProgress
     * @example
     * // Get one YmqLearningProgress
     * const ymqLearningProgress = await prisma.ymqLearningProgress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqLearningProgressFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqLearningProgressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqLearningProgress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningProgressFindFirstArgs} args - Arguments to find a YmqLearningProgress
     * @example
     * // Get one YmqLearningProgress
     * const ymqLearningProgress = await prisma.ymqLearningProgress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqLearningProgressFindFirstArgs>(args?: SelectSubset<T, YmqLearningProgressFindFirstArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqLearningProgress that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningProgressFindFirstOrThrowArgs} args - Arguments to find a YmqLearningProgress
     * @example
     * // Get one YmqLearningProgress
     * const ymqLearningProgress = await prisma.ymqLearningProgress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqLearningProgressFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqLearningProgressFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqLearningProgresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningProgressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqLearningProgresses
     * const ymqLearningProgresses = await prisma.ymqLearningProgress.findMany()
     * 
     * // Get first 10 YmqLearningProgresses
     * const ymqLearningProgresses = await prisma.ymqLearningProgress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqLearningProgressWithIdOnly = await prisma.ymqLearningProgress.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqLearningProgressFindManyArgs>(args?: SelectSubset<T, YmqLearningProgressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqLearningProgress.
     * @param {YmqLearningProgressCreateArgs} args - Arguments to create a YmqLearningProgress.
     * @example
     * // Create one YmqLearningProgress
     * const YmqLearningProgress = await prisma.ymqLearningProgress.create({
     *   data: {
     *     // ... data to create a YmqLearningProgress
     *   }
     * })
     * 
     */
    create<T extends YmqLearningProgressCreateArgs>(args: SelectSubset<T, YmqLearningProgressCreateArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqLearningProgresses.
     * @param {YmqLearningProgressCreateManyArgs} args - Arguments to create many YmqLearningProgresses.
     * @example
     * // Create many YmqLearningProgresses
     * const ymqLearningProgress = await prisma.ymqLearningProgress.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqLearningProgressCreateManyArgs>(args?: SelectSubset<T, YmqLearningProgressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqLearningProgresses and returns the data saved in the database.
     * @param {YmqLearningProgressCreateManyAndReturnArgs} args - Arguments to create many YmqLearningProgresses.
     * @example
     * // Create many YmqLearningProgresses
     * const ymqLearningProgress = await prisma.ymqLearningProgress.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqLearningProgresses and only return the `id`
     * const ymqLearningProgressWithIdOnly = await prisma.ymqLearningProgress.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqLearningProgressCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqLearningProgressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqLearningProgress.
     * @param {YmqLearningProgressDeleteArgs} args - Arguments to delete one YmqLearningProgress.
     * @example
     * // Delete one YmqLearningProgress
     * const YmqLearningProgress = await prisma.ymqLearningProgress.delete({
     *   where: {
     *     // ... filter to delete one YmqLearningProgress
     *   }
     * })
     * 
     */
    delete<T extends YmqLearningProgressDeleteArgs>(args: SelectSubset<T, YmqLearningProgressDeleteArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqLearningProgress.
     * @param {YmqLearningProgressUpdateArgs} args - Arguments to update one YmqLearningProgress.
     * @example
     * // Update one YmqLearningProgress
     * const ymqLearningProgress = await prisma.ymqLearningProgress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqLearningProgressUpdateArgs>(args: SelectSubset<T, YmqLearningProgressUpdateArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqLearningProgresses.
     * @param {YmqLearningProgressDeleteManyArgs} args - Arguments to filter YmqLearningProgresses to delete.
     * @example
     * // Delete a few YmqLearningProgresses
     * const { count } = await prisma.ymqLearningProgress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqLearningProgressDeleteManyArgs>(args?: SelectSubset<T, YmqLearningProgressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqLearningProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningProgressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqLearningProgresses
     * const ymqLearningProgress = await prisma.ymqLearningProgress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqLearningProgressUpdateManyArgs>(args: SelectSubset<T, YmqLearningProgressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqLearningProgresses and returns the data updated in the database.
     * @param {YmqLearningProgressUpdateManyAndReturnArgs} args - Arguments to update many YmqLearningProgresses.
     * @example
     * // Update many YmqLearningProgresses
     * const ymqLearningProgress = await prisma.ymqLearningProgress.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqLearningProgresses and only return the `id`
     * const ymqLearningProgressWithIdOnly = await prisma.ymqLearningProgress.updateManyAndReturn({
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
    updateManyAndReturn<T extends YmqLearningProgressUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqLearningProgressUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqLearningProgress.
     * @param {YmqLearningProgressUpsertArgs} args - Arguments to update or create a YmqLearningProgress.
     * @example
     * // Update or create a YmqLearningProgress
     * const ymqLearningProgress = await prisma.ymqLearningProgress.upsert({
     *   create: {
     *     // ... data to create a YmqLearningProgress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqLearningProgress we want to update
     *   }
     * })
     */
    upsert<T extends YmqLearningProgressUpsertArgs>(args: SelectSubset<T, YmqLearningProgressUpsertArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqLearningProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningProgressCountArgs} args - Arguments to filter YmqLearningProgresses to count.
     * @example
     * // Count the number of YmqLearningProgresses
     * const count = await prisma.ymqLearningProgress.count({
     *   where: {
     *     // ... the filter for the YmqLearningProgresses we want to count
     *   }
     * })
    **/
    count<T extends YmqLearningProgressCountArgs>(
      args?: Subset<T, YmqLearningProgressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqLearningProgressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqLearningProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningProgressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YmqLearningProgressAggregateArgs>(args: Subset<T, YmqLearningProgressAggregateArgs>): Prisma.PrismaPromise<GetYmqLearningProgressAggregateType<T>>

    /**
     * Group by YmqLearningProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqLearningProgressGroupByArgs} args - Group by arguments.
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
      T extends YmqLearningProgressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqLearningProgressGroupByArgs['orderBy'] }
        : { orderBy?: YmqLearningProgressGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, YmqLearningProgressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqLearningProgressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqLearningProgress model
   */
  readonly fields: YmqLearningProgressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqLearningProgress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqLearningProgressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends YmqLearningSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, YmqLearningSessionDefaultArgs<ExtArgs>>): Prisma__YmqLearningSessionClient<$Result.GetResult<Prisma.$YmqLearningSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    member<T extends YmqMemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, YmqMemberDefaultArgs<ExtArgs>>): Prisma__YmqMemberClient<$Result.GetResult<Prisma.$YmqMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    iwrCurriculumUnit<T extends YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs> = {}>(args?: Subset<T, YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs>>): Prisma__YmqIwrCurriculumUnitClient<$Result.GetResult<Prisma.$YmqIwrCurriculumUnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    evidence<T extends YmqLearningProgress$evidenceArgs<ExtArgs> = {}>(args?: Subset<T, YmqLearningProgress$evidenceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the YmqLearningProgress model
   */
  interface YmqLearningProgressFieldRefs {
    readonly id: FieldRef<"YmqLearningProgress", 'String'>
    readonly sessionId: FieldRef<"YmqLearningProgress", 'String'>
    readonly memberId: FieldRef<"YmqLearningProgress", 'String'>
    readonly track: FieldRef<"YmqLearningProgress", 'LearningTrack'>
    readonly sequence: FieldRef<"YmqLearningProgress", 'Int'>
    readonly iwrCurriculumUnitId: FieldRef<"YmqLearningProgress", 'String'>
    readonly surahNumber: FieldRef<"YmqLearningProgress", 'Int'>
    readonly ayahStart: FieldRef<"YmqLearningProgress", 'Int'>
    readonly ayahEnd: FieldRef<"YmqLearningProgress", 'Int'>
    readonly note: FieldRef<"YmqLearningProgress", 'String'>
    readonly createdAt: FieldRef<"YmqLearningProgress", 'DateTime'>
    readonly updatedAt: FieldRef<"YmqLearningProgress", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqLearningProgress findUnique
   */
  export type YmqLearningProgressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningProgress to fetch.
     */
    where: YmqLearningProgressWhereUniqueInput
  }

  /**
   * YmqLearningProgress findUniqueOrThrow
   */
  export type YmqLearningProgressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningProgress to fetch.
     */
    where: YmqLearningProgressWhereUniqueInput
  }

  /**
   * YmqLearningProgress findFirst
   */
  export type YmqLearningProgressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningProgress to fetch.
     */
    where?: YmqLearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningProgresses to fetch.
     */
    orderBy?: YmqLearningProgressOrderByWithRelationInput | YmqLearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqLearningProgresses.
     */
    cursor?: YmqLearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqLearningProgresses.
     */
    distinct?: YmqLearningProgressScalarFieldEnum | YmqLearningProgressScalarFieldEnum[]
  }

  /**
   * YmqLearningProgress findFirstOrThrow
   */
  export type YmqLearningProgressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningProgress to fetch.
     */
    where?: YmqLearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningProgresses to fetch.
     */
    orderBy?: YmqLearningProgressOrderByWithRelationInput | YmqLearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqLearningProgresses.
     */
    cursor?: YmqLearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqLearningProgresses.
     */
    distinct?: YmqLearningProgressScalarFieldEnum | YmqLearningProgressScalarFieldEnum[]
  }

  /**
   * YmqLearningProgress findMany
   */
  export type YmqLearningProgressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which YmqLearningProgresses to fetch.
     */
    where?: YmqLearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqLearningProgresses to fetch.
     */
    orderBy?: YmqLearningProgressOrderByWithRelationInput | YmqLearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqLearningProgresses.
     */
    cursor?: YmqLearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqLearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqLearningProgresses.
     */
    skip?: number
    distinct?: YmqLearningProgressScalarFieldEnum | YmqLearningProgressScalarFieldEnum[]
  }

  /**
   * YmqLearningProgress create
   */
  export type YmqLearningProgressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqLearningProgress.
     */
    data: XOR<YmqLearningProgressCreateInput, YmqLearningProgressUncheckedCreateInput>
  }

  /**
   * YmqLearningProgress createMany
   */
  export type YmqLearningProgressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqLearningProgresses.
     */
    data: YmqLearningProgressCreateManyInput | YmqLearningProgressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqLearningProgress createManyAndReturn
   */
  export type YmqLearningProgressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * The data used to create many YmqLearningProgresses.
     */
    data: YmqLearningProgressCreateManyInput | YmqLearningProgressCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqLearningProgress update
   */
  export type YmqLearningProgressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqLearningProgress.
     */
    data: XOR<YmqLearningProgressUpdateInput, YmqLearningProgressUncheckedUpdateInput>
    /**
     * Choose, which YmqLearningProgress to update.
     */
    where: YmqLearningProgressWhereUniqueInput
  }

  /**
   * YmqLearningProgress updateMany
   */
  export type YmqLearningProgressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqLearningProgresses.
     */
    data: XOR<YmqLearningProgressUpdateManyMutationInput, YmqLearningProgressUncheckedUpdateManyInput>
    /**
     * Filter which YmqLearningProgresses to update
     */
    where?: YmqLearningProgressWhereInput
    /**
     * Limit how many YmqLearningProgresses to update.
     */
    limit?: number
  }

  /**
   * YmqLearningProgress updateManyAndReturn
   */
  export type YmqLearningProgressUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * The data used to update YmqLearningProgresses.
     */
    data: XOR<YmqLearningProgressUpdateManyMutationInput, YmqLearningProgressUncheckedUpdateManyInput>
    /**
     * Filter which YmqLearningProgresses to update
     */
    where?: YmqLearningProgressWhereInput
    /**
     * Limit how many YmqLearningProgresses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqLearningProgress upsert
   */
  export type YmqLearningProgressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqLearningProgress to update in case it exists.
     */
    where: YmqLearningProgressWhereUniqueInput
    /**
     * In case the YmqLearningProgress found by the `where` argument doesn't exist, create a new YmqLearningProgress with this data.
     */
    create: XOR<YmqLearningProgressCreateInput, YmqLearningProgressUncheckedCreateInput>
    /**
     * In case the YmqLearningProgress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqLearningProgressUpdateInput, YmqLearningProgressUncheckedUpdateInput>
  }

  /**
   * YmqLearningProgress delete
   */
  export type YmqLearningProgressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
    /**
     * Filter which YmqLearningProgress to delete.
     */
    where: YmqLearningProgressWhereUniqueInput
  }

  /**
   * YmqLearningProgress deleteMany
   */
  export type YmqLearningProgressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqLearningProgresses to delete
     */
    where?: YmqLearningProgressWhereInput
    /**
     * Limit how many YmqLearningProgresses to delete.
     */
    limit?: number
  }

  /**
   * YmqLearningProgress.iwrCurriculumUnit
   */
  export type YmqLearningProgress$iwrCurriculumUnitArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqIwrCurriculumUnit
     */
    select?: YmqIwrCurriculumUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqIwrCurriculumUnit
     */
    omit?: YmqIwrCurriculumUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqIwrCurriculumUnitInclude<ExtArgs> | null
    where?: YmqIwrCurriculumUnitWhereInput
  }

  /**
   * YmqLearningProgress.evidence
   */
  export type YmqLearningProgress$evidenceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    where?: YmqProgressEvidenceWhereInput
    orderBy?: YmqProgressEvidenceOrderByWithRelationInput | YmqProgressEvidenceOrderByWithRelationInput[]
    cursor?: YmqProgressEvidenceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: YmqProgressEvidenceScalarFieldEnum | YmqProgressEvidenceScalarFieldEnum[]
  }

  /**
   * YmqLearningProgress without action
   */
  export type YmqLearningProgressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqLearningProgress
     */
    select?: YmqLearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqLearningProgress
     */
    omit?: YmqLearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqLearningProgressInclude<ExtArgs> | null
  }


  /**
   * Model YmqProgressEvidence
   */

  export type AggregateYmqProgressEvidence = {
    _count: YmqProgressEvidenceCountAggregateOutputType | null
    _avg: YmqProgressEvidenceAvgAggregateOutputType | null
    _sum: YmqProgressEvidenceSumAggregateOutputType | null
    _min: YmqProgressEvidenceMinAggregateOutputType | null
    _max: YmqProgressEvidenceMaxAggregateOutputType | null
  }

  export type YmqProgressEvidenceAvgAggregateOutputType = {
    bytes: number | null
  }

  export type YmqProgressEvidenceSumAggregateOutputType = {
    bytes: number | null
  }

  export type YmqProgressEvidenceMinAggregateOutputType = {
    id: string | null
    progressId: string | null
    cloudinaryPublicId: string | null
    secureUrl: string | null
    resourceType: string | null
    originalFilename: string | null
    bytes: number | null
    uploadedById: string | null
    createdAt: Date | null
  }

  export type YmqProgressEvidenceMaxAggregateOutputType = {
    id: string | null
    progressId: string | null
    cloudinaryPublicId: string | null
    secureUrl: string | null
    resourceType: string | null
    originalFilename: string | null
    bytes: number | null
    uploadedById: string | null
    createdAt: Date | null
  }

  export type YmqProgressEvidenceCountAggregateOutputType = {
    id: number
    progressId: number
    cloudinaryPublicId: number
    secureUrl: number
    resourceType: number
    originalFilename: number
    bytes: number
    uploadedById: number
    createdAt: number
    _all: number
  }


  export type YmqProgressEvidenceAvgAggregateInputType = {
    bytes?: true
  }

  export type YmqProgressEvidenceSumAggregateInputType = {
    bytes?: true
  }

  export type YmqProgressEvidenceMinAggregateInputType = {
    id?: true
    progressId?: true
    cloudinaryPublicId?: true
    secureUrl?: true
    resourceType?: true
    originalFilename?: true
    bytes?: true
    uploadedById?: true
    createdAt?: true
  }

  export type YmqProgressEvidenceMaxAggregateInputType = {
    id?: true
    progressId?: true
    cloudinaryPublicId?: true
    secureUrl?: true
    resourceType?: true
    originalFilename?: true
    bytes?: true
    uploadedById?: true
    createdAt?: true
  }

  export type YmqProgressEvidenceCountAggregateInputType = {
    id?: true
    progressId?: true
    cloudinaryPublicId?: true
    secureUrl?: true
    resourceType?: true
    originalFilename?: true
    bytes?: true
    uploadedById?: true
    createdAt?: true
    _all?: true
  }

  export type YmqProgressEvidenceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqProgressEvidence to aggregate.
     */
    where?: YmqProgressEvidenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqProgressEvidences to fetch.
     */
    orderBy?: YmqProgressEvidenceOrderByWithRelationInput | YmqProgressEvidenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: YmqProgressEvidenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqProgressEvidences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqProgressEvidences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned YmqProgressEvidences
    **/
    _count?: true | YmqProgressEvidenceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: YmqProgressEvidenceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: YmqProgressEvidenceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: YmqProgressEvidenceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: YmqProgressEvidenceMaxAggregateInputType
  }

  export type GetYmqProgressEvidenceAggregateType<T extends YmqProgressEvidenceAggregateArgs> = {
        [P in keyof T & keyof AggregateYmqProgressEvidence]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateYmqProgressEvidence[P]>
      : GetScalarType<T[P], AggregateYmqProgressEvidence[P]>
  }




  export type YmqProgressEvidenceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: YmqProgressEvidenceWhereInput
    orderBy?: YmqProgressEvidenceOrderByWithAggregationInput | YmqProgressEvidenceOrderByWithAggregationInput[]
    by: YmqProgressEvidenceScalarFieldEnum[] | YmqProgressEvidenceScalarFieldEnum
    having?: YmqProgressEvidenceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: YmqProgressEvidenceCountAggregateInputType | true
    _avg?: YmqProgressEvidenceAvgAggregateInputType
    _sum?: YmqProgressEvidenceSumAggregateInputType
    _min?: YmqProgressEvidenceMinAggregateInputType
    _max?: YmqProgressEvidenceMaxAggregateInputType
  }

  export type YmqProgressEvidenceGroupByOutputType = {
    id: string
    progressId: string
    cloudinaryPublicId: string
    secureUrl: string
    resourceType: string
    originalFilename: string | null
    bytes: number | null
    uploadedById: string
    createdAt: Date
    _count: YmqProgressEvidenceCountAggregateOutputType | null
    _avg: YmqProgressEvidenceAvgAggregateOutputType | null
    _sum: YmqProgressEvidenceSumAggregateOutputType | null
    _min: YmqProgressEvidenceMinAggregateOutputType | null
    _max: YmqProgressEvidenceMaxAggregateOutputType | null
  }

  type GetYmqProgressEvidenceGroupByPayload<T extends YmqProgressEvidenceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<YmqProgressEvidenceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof YmqProgressEvidenceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], YmqProgressEvidenceGroupByOutputType[P]>
            : GetScalarType<T[P], YmqProgressEvidenceGroupByOutputType[P]>
        }
      >
    >


  export type YmqProgressEvidenceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    progressId?: boolean
    cloudinaryPublicId?: boolean
    secureUrl?: boolean
    resourceType?: boolean
    originalFilename?: boolean
    bytes?: boolean
    uploadedById?: boolean
    createdAt?: boolean
    progress?: boolean | YmqLearningProgressDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqProgressEvidence"]>

  export type YmqProgressEvidenceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    progressId?: boolean
    cloudinaryPublicId?: boolean
    secureUrl?: boolean
    resourceType?: boolean
    originalFilename?: boolean
    bytes?: boolean
    uploadedById?: boolean
    createdAt?: boolean
    progress?: boolean | YmqLearningProgressDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqProgressEvidence"]>

  export type YmqProgressEvidenceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    progressId?: boolean
    cloudinaryPublicId?: boolean
    secureUrl?: boolean
    resourceType?: boolean
    originalFilename?: boolean
    bytes?: boolean
    uploadedById?: boolean
    createdAt?: boolean
    progress?: boolean | YmqLearningProgressDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ymqProgressEvidence"]>

  export type YmqProgressEvidenceSelectScalar = {
    id?: boolean
    progressId?: boolean
    cloudinaryPublicId?: boolean
    secureUrl?: boolean
    resourceType?: boolean
    originalFilename?: boolean
    bytes?: boolean
    uploadedById?: boolean
    createdAt?: boolean
  }

  export type YmqProgressEvidenceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "progressId" | "cloudinaryPublicId" | "secureUrl" | "resourceType" | "originalFilename" | "bytes" | "uploadedById" | "createdAt", ExtArgs["result"]["ymqProgressEvidence"]>
  export type YmqProgressEvidenceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | YmqLearningProgressDefaultArgs<ExtArgs>
  }
  export type YmqProgressEvidenceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | YmqLearningProgressDefaultArgs<ExtArgs>
  }
  export type YmqProgressEvidenceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | YmqLearningProgressDefaultArgs<ExtArgs>
  }

  export type $YmqProgressEvidencePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "YmqProgressEvidence"
    objects: {
      progress: Prisma.$YmqLearningProgressPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      progressId: string
      cloudinaryPublicId: string
      secureUrl: string
      resourceType: string
      originalFilename: string | null
      bytes: number | null
      uploadedById: string
      createdAt: Date
    }, ExtArgs["result"]["ymqProgressEvidence"]>
    composites: {}
  }

  type YmqProgressEvidenceGetPayload<S extends boolean | null | undefined | YmqProgressEvidenceDefaultArgs> = $Result.GetResult<Prisma.$YmqProgressEvidencePayload, S>

  type YmqProgressEvidenceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<YmqProgressEvidenceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: YmqProgressEvidenceCountAggregateInputType | true
    }

  export interface YmqProgressEvidenceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['YmqProgressEvidence'], meta: { name: 'YmqProgressEvidence' } }
    /**
     * Find zero or one YmqProgressEvidence that matches the filter.
     * @param {YmqProgressEvidenceFindUniqueArgs} args - Arguments to find a YmqProgressEvidence
     * @example
     * // Get one YmqProgressEvidence
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YmqProgressEvidenceFindUniqueArgs>(args: SelectSubset<T, YmqProgressEvidenceFindUniqueArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one YmqProgressEvidence that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YmqProgressEvidenceFindUniqueOrThrowArgs} args - Arguments to find a YmqProgressEvidence
     * @example
     * // Get one YmqProgressEvidence
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YmqProgressEvidenceFindUniqueOrThrowArgs>(args: SelectSubset<T, YmqProgressEvidenceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqProgressEvidence that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqProgressEvidenceFindFirstArgs} args - Arguments to find a YmqProgressEvidence
     * @example
     * // Get one YmqProgressEvidence
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YmqProgressEvidenceFindFirstArgs>(args?: SelectSubset<T, YmqProgressEvidenceFindFirstArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first YmqProgressEvidence that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqProgressEvidenceFindFirstOrThrowArgs} args - Arguments to find a YmqProgressEvidence
     * @example
     * // Get one YmqProgressEvidence
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YmqProgressEvidenceFindFirstOrThrowArgs>(args?: SelectSubset<T, YmqProgressEvidenceFindFirstOrThrowArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more YmqProgressEvidences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqProgressEvidenceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YmqProgressEvidences
     * const ymqProgressEvidences = await prisma.ymqProgressEvidence.findMany()
     * 
     * // Get first 10 YmqProgressEvidences
     * const ymqProgressEvidences = await prisma.ymqProgressEvidence.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ymqProgressEvidenceWithIdOnly = await prisma.ymqProgressEvidence.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends YmqProgressEvidenceFindManyArgs>(args?: SelectSubset<T, YmqProgressEvidenceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a YmqProgressEvidence.
     * @param {YmqProgressEvidenceCreateArgs} args - Arguments to create a YmqProgressEvidence.
     * @example
     * // Create one YmqProgressEvidence
     * const YmqProgressEvidence = await prisma.ymqProgressEvidence.create({
     *   data: {
     *     // ... data to create a YmqProgressEvidence
     *   }
     * })
     * 
     */
    create<T extends YmqProgressEvidenceCreateArgs>(args: SelectSubset<T, YmqProgressEvidenceCreateArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many YmqProgressEvidences.
     * @param {YmqProgressEvidenceCreateManyArgs} args - Arguments to create many YmqProgressEvidences.
     * @example
     * // Create many YmqProgressEvidences
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends YmqProgressEvidenceCreateManyArgs>(args?: SelectSubset<T, YmqProgressEvidenceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many YmqProgressEvidences and returns the data saved in the database.
     * @param {YmqProgressEvidenceCreateManyAndReturnArgs} args - Arguments to create many YmqProgressEvidences.
     * @example
     * // Create many YmqProgressEvidences
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many YmqProgressEvidences and only return the `id`
     * const ymqProgressEvidenceWithIdOnly = await prisma.ymqProgressEvidence.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends YmqProgressEvidenceCreateManyAndReturnArgs>(args?: SelectSubset<T, YmqProgressEvidenceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a YmqProgressEvidence.
     * @param {YmqProgressEvidenceDeleteArgs} args - Arguments to delete one YmqProgressEvidence.
     * @example
     * // Delete one YmqProgressEvidence
     * const YmqProgressEvidence = await prisma.ymqProgressEvidence.delete({
     *   where: {
     *     // ... filter to delete one YmqProgressEvidence
     *   }
     * })
     * 
     */
    delete<T extends YmqProgressEvidenceDeleteArgs>(args: SelectSubset<T, YmqProgressEvidenceDeleteArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one YmqProgressEvidence.
     * @param {YmqProgressEvidenceUpdateArgs} args - Arguments to update one YmqProgressEvidence.
     * @example
     * // Update one YmqProgressEvidence
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends YmqProgressEvidenceUpdateArgs>(args: SelectSubset<T, YmqProgressEvidenceUpdateArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more YmqProgressEvidences.
     * @param {YmqProgressEvidenceDeleteManyArgs} args - Arguments to filter YmqProgressEvidences to delete.
     * @example
     * // Delete a few YmqProgressEvidences
     * const { count } = await prisma.ymqProgressEvidence.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends YmqProgressEvidenceDeleteManyArgs>(args?: SelectSubset<T, YmqProgressEvidenceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqProgressEvidences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqProgressEvidenceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YmqProgressEvidences
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends YmqProgressEvidenceUpdateManyArgs>(args: SelectSubset<T, YmqProgressEvidenceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more YmqProgressEvidences and returns the data updated in the database.
     * @param {YmqProgressEvidenceUpdateManyAndReturnArgs} args - Arguments to update many YmqProgressEvidences.
     * @example
     * // Update many YmqProgressEvidences
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more YmqProgressEvidences and only return the `id`
     * const ymqProgressEvidenceWithIdOnly = await prisma.ymqProgressEvidence.updateManyAndReturn({
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
    updateManyAndReturn<T extends YmqProgressEvidenceUpdateManyAndReturnArgs>(args: SelectSubset<T, YmqProgressEvidenceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one YmqProgressEvidence.
     * @param {YmqProgressEvidenceUpsertArgs} args - Arguments to update or create a YmqProgressEvidence.
     * @example
     * // Update or create a YmqProgressEvidence
     * const ymqProgressEvidence = await prisma.ymqProgressEvidence.upsert({
     *   create: {
     *     // ... data to create a YmqProgressEvidence
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YmqProgressEvidence we want to update
     *   }
     * })
     */
    upsert<T extends YmqProgressEvidenceUpsertArgs>(args: SelectSubset<T, YmqProgressEvidenceUpsertArgs<ExtArgs>>): Prisma__YmqProgressEvidenceClient<$Result.GetResult<Prisma.$YmqProgressEvidencePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of YmqProgressEvidences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqProgressEvidenceCountArgs} args - Arguments to filter YmqProgressEvidences to count.
     * @example
     * // Count the number of YmqProgressEvidences
     * const count = await prisma.ymqProgressEvidence.count({
     *   where: {
     *     // ... the filter for the YmqProgressEvidences we want to count
     *   }
     * })
    **/
    count<T extends YmqProgressEvidenceCountArgs>(
      args?: Subset<T, YmqProgressEvidenceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], YmqProgressEvidenceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a YmqProgressEvidence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqProgressEvidenceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YmqProgressEvidenceAggregateArgs>(args: Subset<T, YmqProgressEvidenceAggregateArgs>): Prisma.PrismaPromise<GetYmqProgressEvidenceAggregateType<T>>

    /**
     * Group by YmqProgressEvidence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YmqProgressEvidenceGroupByArgs} args - Group by arguments.
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
      T extends YmqProgressEvidenceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: YmqProgressEvidenceGroupByArgs['orderBy'] }
        : { orderBy?: YmqProgressEvidenceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, YmqProgressEvidenceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYmqProgressEvidenceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the YmqProgressEvidence model
   */
  readonly fields: YmqProgressEvidenceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for YmqProgressEvidence.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__YmqProgressEvidenceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    progress<T extends YmqLearningProgressDefaultArgs<ExtArgs> = {}>(args?: Subset<T, YmqLearningProgressDefaultArgs<ExtArgs>>): Prisma__YmqLearningProgressClient<$Result.GetResult<Prisma.$YmqLearningProgressPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the YmqProgressEvidence model
   */
  interface YmqProgressEvidenceFieldRefs {
    readonly id: FieldRef<"YmqProgressEvidence", 'String'>
    readonly progressId: FieldRef<"YmqProgressEvidence", 'String'>
    readonly cloudinaryPublicId: FieldRef<"YmqProgressEvidence", 'String'>
    readonly secureUrl: FieldRef<"YmqProgressEvidence", 'String'>
    readonly resourceType: FieldRef<"YmqProgressEvidence", 'String'>
    readonly originalFilename: FieldRef<"YmqProgressEvidence", 'String'>
    readonly bytes: FieldRef<"YmqProgressEvidence", 'Int'>
    readonly uploadedById: FieldRef<"YmqProgressEvidence", 'String'>
    readonly createdAt: FieldRef<"YmqProgressEvidence", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * YmqProgressEvidence findUnique
   */
  export type YmqProgressEvidenceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * Filter, which YmqProgressEvidence to fetch.
     */
    where: YmqProgressEvidenceWhereUniqueInput
  }

  /**
   * YmqProgressEvidence findUniqueOrThrow
   */
  export type YmqProgressEvidenceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * Filter, which YmqProgressEvidence to fetch.
     */
    where: YmqProgressEvidenceWhereUniqueInput
  }

  /**
   * YmqProgressEvidence findFirst
   */
  export type YmqProgressEvidenceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * Filter, which YmqProgressEvidence to fetch.
     */
    where?: YmqProgressEvidenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqProgressEvidences to fetch.
     */
    orderBy?: YmqProgressEvidenceOrderByWithRelationInput | YmqProgressEvidenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqProgressEvidences.
     */
    cursor?: YmqProgressEvidenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqProgressEvidences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqProgressEvidences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqProgressEvidences.
     */
    distinct?: YmqProgressEvidenceScalarFieldEnum | YmqProgressEvidenceScalarFieldEnum[]
  }

  /**
   * YmqProgressEvidence findFirstOrThrow
   */
  export type YmqProgressEvidenceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * Filter, which YmqProgressEvidence to fetch.
     */
    where?: YmqProgressEvidenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqProgressEvidences to fetch.
     */
    orderBy?: YmqProgressEvidenceOrderByWithRelationInput | YmqProgressEvidenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for YmqProgressEvidences.
     */
    cursor?: YmqProgressEvidenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqProgressEvidences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqProgressEvidences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of YmqProgressEvidences.
     */
    distinct?: YmqProgressEvidenceScalarFieldEnum | YmqProgressEvidenceScalarFieldEnum[]
  }

  /**
   * YmqProgressEvidence findMany
   */
  export type YmqProgressEvidenceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * Filter, which YmqProgressEvidences to fetch.
     */
    where?: YmqProgressEvidenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of YmqProgressEvidences to fetch.
     */
    orderBy?: YmqProgressEvidenceOrderByWithRelationInput | YmqProgressEvidenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing YmqProgressEvidences.
     */
    cursor?: YmqProgressEvidenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` YmqProgressEvidences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` YmqProgressEvidences.
     */
    skip?: number
    distinct?: YmqProgressEvidenceScalarFieldEnum | YmqProgressEvidenceScalarFieldEnum[]
  }

  /**
   * YmqProgressEvidence create
   */
  export type YmqProgressEvidenceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * The data needed to create a YmqProgressEvidence.
     */
    data: XOR<YmqProgressEvidenceCreateInput, YmqProgressEvidenceUncheckedCreateInput>
  }

  /**
   * YmqProgressEvidence createMany
   */
  export type YmqProgressEvidenceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many YmqProgressEvidences.
     */
    data: YmqProgressEvidenceCreateManyInput | YmqProgressEvidenceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * YmqProgressEvidence createManyAndReturn
   */
  export type YmqProgressEvidenceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * The data used to create many YmqProgressEvidences.
     */
    data: YmqProgressEvidenceCreateManyInput | YmqProgressEvidenceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqProgressEvidence update
   */
  export type YmqProgressEvidenceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * The data needed to update a YmqProgressEvidence.
     */
    data: XOR<YmqProgressEvidenceUpdateInput, YmqProgressEvidenceUncheckedUpdateInput>
    /**
     * Choose, which YmqProgressEvidence to update.
     */
    where: YmqProgressEvidenceWhereUniqueInput
  }

  /**
   * YmqProgressEvidence updateMany
   */
  export type YmqProgressEvidenceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update YmqProgressEvidences.
     */
    data: XOR<YmqProgressEvidenceUpdateManyMutationInput, YmqProgressEvidenceUncheckedUpdateManyInput>
    /**
     * Filter which YmqProgressEvidences to update
     */
    where?: YmqProgressEvidenceWhereInput
    /**
     * Limit how many YmqProgressEvidences to update.
     */
    limit?: number
  }

  /**
   * YmqProgressEvidence updateManyAndReturn
   */
  export type YmqProgressEvidenceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * The data used to update YmqProgressEvidences.
     */
    data: XOR<YmqProgressEvidenceUpdateManyMutationInput, YmqProgressEvidenceUncheckedUpdateManyInput>
    /**
     * Filter which YmqProgressEvidences to update
     */
    where?: YmqProgressEvidenceWhereInput
    /**
     * Limit how many YmqProgressEvidences to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * YmqProgressEvidence upsert
   */
  export type YmqProgressEvidenceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * The filter to search for the YmqProgressEvidence to update in case it exists.
     */
    where: YmqProgressEvidenceWhereUniqueInput
    /**
     * In case the YmqProgressEvidence found by the `where` argument doesn't exist, create a new YmqProgressEvidence with this data.
     */
    create: XOR<YmqProgressEvidenceCreateInput, YmqProgressEvidenceUncheckedCreateInput>
    /**
     * In case the YmqProgressEvidence was found with the provided `where` argument, update it with this data.
     */
    update: XOR<YmqProgressEvidenceUpdateInput, YmqProgressEvidenceUncheckedUpdateInput>
  }

  /**
   * YmqProgressEvidence delete
   */
  export type YmqProgressEvidenceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
    /**
     * Filter which YmqProgressEvidence to delete.
     */
    where: YmqProgressEvidenceWhereUniqueInput
  }

  /**
   * YmqProgressEvidence deleteMany
   */
  export type YmqProgressEvidenceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which YmqProgressEvidences to delete
     */
    where?: YmqProgressEvidenceWhereInput
    /**
     * Limit how many YmqProgressEvidences to delete.
     */
    limit?: number
  }

  /**
   * YmqProgressEvidence without action
   */
  export type YmqProgressEvidenceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YmqProgressEvidence
     */
    select?: YmqProgressEvidenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the YmqProgressEvidence
     */
    omit?: YmqProgressEvidenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: YmqProgressEvidenceInclude<ExtArgs> | null
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
    unitId: 'unitId',
    sourceUpdatedAt: 'sourceUpdatedAt',
    isActive: 'isActive',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const YmqGroupScalarFieldEnum: {
    id: 'id',
    name: 'name',
    pembinaUserId: 'pembinaUserId',
    level: 'level',
    unitId: 'unitId',
    unitName: 'unitName',
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
    joinedAt: 'joinedAt',
    leftAt: 'leftAt'
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
    catatanPembina: 'catatanPembina',
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


  export const YmqIwrCurriculumUnitScalarFieldEnum: {
    id: 'id',
    iwrLevel: 'iwrLevel',
    topicCode: 'topicCode',
    topicTitle: 'topicTitle',
    pageStart: 'pageStart',
    pageEnd: 'pageEnd',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type YmqIwrCurriculumUnitScalarFieldEnum = (typeof YmqIwrCurriculumUnitScalarFieldEnum)[keyof typeof YmqIwrCurriculumUnitScalarFieldEnum]


  export const YmqGroupAdminAssignmentScalarFieldEnum: {
    id: 'id',
    groupId: 'groupId',
    userId: 'userId',
    role: 'role',
    assignedById: 'assignedById',
    assignedAt: 'assignedAt',
    revokedAt: 'revokedAt'
  };

  export type YmqGroupAdminAssignmentScalarFieldEnum = (typeof YmqGroupAdminAssignmentScalarFieldEnum)[keyof typeof YmqGroupAdminAssignmentScalarFieldEnum]


  export const YmqLearningSessionScalarFieldEnum: {
    id: 'id',
    groupId: 'groupId',
    sessionDate: 'sessionDate',
    notes: 'notes',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type YmqLearningSessionScalarFieldEnum = (typeof YmqLearningSessionScalarFieldEnum)[keyof typeof YmqLearningSessionScalarFieldEnum]


  export const YmqSessionAttendanceScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    memberId: 'memberId',
    status: 'status',
    note: 'note',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type YmqSessionAttendanceScalarFieldEnum = (typeof YmqSessionAttendanceScalarFieldEnum)[keyof typeof YmqSessionAttendanceScalarFieldEnum]


  export const YmqLearningProgressScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    memberId: 'memberId',
    track: 'track',
    sequence: 'sequence',
    iwrCurriculumUnitId: 'iwrCurriculumUnitId',
    surahNumber: 'surahNumber',
    ayahStart: 'ayahStart',
    ayahEnd: 'ayahEnd',
    note: 'note',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type YmqLearningProgressScalarFieldEnum = (typeof YmqLearningProgressScalarFieldEnum)[keyof typeof YmqLearningProgressScalarFieldEnum]


  export const YmqProgressEvidenceScalarFieldEnum: {
    id: 'id',
    progressId: 'progressId',
    cloudinaryPublicId: 'cloudinaryPublicId',
    secureUrl: 'secureUrl',
    resourceType: 'resourceType',
    originalFilename: 'originalFilename',
    bytes: 'bytes',
    uploadedById: 'uploadedById',
    createdAt: 'createdAt'
  };

  export type YmqProgressEvidenceScalarFieldEnum = (typeof YmqProgressEvidenceScalarFieldEnum)[keyof typeof YmqProgressEvidenceScalarFieldEnum]


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
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'YmqGroupLevel'
   */
  export type EnumYmqGroupLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'YmqGroupLevel'>
    


  /**
   * Reference to a field of type 'YmqGroupLevel[]'
   */
  export type ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'YmqGroupLevel[]'>
    


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
   * Reference to a field of type 'IwrLevel'
   */
  export type EnumIwrLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IwrLevel'>
    


  /**
   * Reference to a field of type 'IwrLevel[]'
   */
  export type ListEnumIwrLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IwrLevel[]'>
    


  /**
   * Reference to a field of type 'YmqGroupStaffRole'
   */
  export type EnumYmqGroupStaffRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'YmqGroupStaffRole'>
    


  /**
   * Reference to a field of type 'YmqGroupStaffRole[]'
   */
  export type ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'YmqGroupStaffRole[]'>
    


  /**
   * Reference to a field of type 'AttendanceStatus'
   */
  export type EnumAttendanceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AttendanceStatus'>
    


  /**
   * Reference to a field of type 'AttendanceStatus[]'
   */
  export type ListEnumAttendanceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AttendanceStatus[]'>
    


  /**
   * Reference to a field of type 'LearningTrack'
   */
  export type EnumLearningTrackFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LearningTrack'>
    


  /**
   * Reference to a field of type 'LearningTrack[]'
   */
  export type ListEnumLearningTrackFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LearningTrack[]'>
    


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
    unitId?: UuidNullableFilter<"User"> | string | null
    sourceUpdatedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    groupsAsPembina?: YmqGroupListRelationFilter
    memberships?: YmqMemberListRelationFilter
    groupAdminAssignments?: YmqGroupAdminAssignmentListRelationFilter
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
    unitId?: SortOrderInput | SortOrder
    sourceUpdatedAt?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    groupsAsPembina?: YmqGroupOrderByRelationAggregateInput
    memberships?: YmqMemberOrderByRelationAggregateInput
    groupAdminAssignments?: YmqGroupAdminAssignmentOrderByRelationAggregateInput
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
    unitId?: UuidNullableFilter<"User"> | string | null
    sourceUpdatedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    groupsAsPembina?: YmqGroupListRelationFilter
    memberships?: YmqMemberListRelationFilter
    groupAdminAssignments?: YmqGroupAdminAssignmentListRelationFilter
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
    unitId?: SortOrderInput | SortOrder
    sourceUpdatedAt?: SortOrderInput | SortOrder
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
    unitId?: UuidNullableWithAggregatesFilter<"User"> | string | null
    sourceUpdatedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type YmqGroupWhereInput = {
    AND?: YmqGroupWhereInput | YmqGroupWhereInput[]
    OR?: YmqGroupWhereInput[]
    NOT?: YmqGroupWhereInput | YmqGroupWhereInput[]
    id?: UuidFilter<"YmqGroup"> | string
    name?: StringFilter<"YmqGroup"> | string
    pembinaUserId?: UuidNullableFilter<"YmqGroup"> | string | null
    level?: EnumYmqGroupLevelNullableFilter<"YmqGroup"> | $Enums.YmqGroupLevel | null
    unitId?: UuidNullableFilter<"YmqGroup"> | string | null
    unitName?: StringNullableFilter<"YmqGroup"> | string | null
    description?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleDay?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleTime?: StringNullableFilter<"YmqGroup"> | string | null
    whatsappLink?: StringNullableFilter<"YmqGroup"> | string | null
    createdAt?: DateTimeFilter<"YmqGroup"> | Date | string
    updatedAt?: DateTimeFilter<"YmqGroup"> | Date | string
    pembina?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    members?: YmqMemberListRelationFilter
    groupAdmins?: YmqGroupAdminAssignmentListRelationFilter
    learningSessions?: YmqLearningSessionListRelationFilter
  }

  export type YmqGroupOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    pembinaUserId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    unitId?: SortOrderInput | SortOrder
    unitName?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    scheduleDay?: SortOrderInput | SortOrder
    scheduleTime?: SortOrderInput | SortOrder
    whatsappLink?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    pembina?: UserOrderByWithRelationInput
    members?: YmqMemberOrderByRelationAggregateInput
    groupAdmins?: YmqGroupAdminAssignmentOrderByRelationAggregateInput
    learningSessions?: YmqLearningSessionOrderByRelationAggregateInput
  }

  export type YmqGroupWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: YmqGroupWhereInput | YmqGroupWhereInput[]
    OR?: YmqGroupWhereInput[]
    NOT?: YmqGroupWhereInput | YmqGroupWhereInput[]
    name?: StringFilter<"YmqGroup"> | string
    pembinaUserId?: UuidNullableFilter<"YmqGroup"> | string | null
    level?: EnumYmqGroupLevelNullableFilter<"YmqGroup"> | $Enums.YmqGroupLevel | null
    unitId?: UuidNullableFilter<"YmqGroup"> | string | null
    unitName?: StringNullableFilter<"YmqGroup"> | string | null
    description?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleDay?: StringNullableFilter<"YmqGroup"> | string | null
    scheduleTime?: StringNullableFilter<"YmqGroup"> | string | null
    whatsappLink?: StringNullableFilter<"YmqGroup"> | string | null
    createdAt?: DateTimeFilter<"YmqGroup"> | Date | string
    updatedAt?: DateTimeFilter<"YmqGroup"> | Date | string
    pembina?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    members?: YmqMemberListRelationFilter
    groupAdmins?: YmqGroupAdminAssignmentListRelationFilter
    learningSessions?: YmqLearningSessionListRelationFilter
  }, "id">

  export type YmqGroupOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    pembinaUserId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    unitId?: SortOrderInput | SortOrder
    unitName?: SortOrderInput | SortOrder
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
    pembinaUserId?: UuidNullableWithAggregatesFilter<"YmqGroup"> | string | null
    level?: EnumYmqGroupLevelNullableWithAggregatesFilter<"YmqGroup"> | $Enums.YmqGroupLevel | null
    unitId?: UuidNullableWithAggregatesFilter<"YmqGroup"> | string | null
    unitName?: StringNullableWithAggregatesFilter<"YmqGroup"> | string | null
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
    leftAt?: DateTimeNullableFilter<"YmqMember"> | Date | string | null
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    attendance?: YmqSessionAttendanceListRelationFilter
    progress?: YmqLearningProgressListRelationFilter
  }

  export type YmqMemberOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrderInput | SortOrder
    group?: YmqGroupOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    attendance?: YmqSessionAttendanceOrderByRelationAggregateInput
    progress?: YmqLearningProgressOrderByRelationAggregateInput
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
    leftAt?: DateTimeNullableFilter<"YmqMember"> | Date | string | null
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    attendance?: YmqSessionAttendanceListRelationFilter
    progress?: YmqLearningProgressListRelationFilter
  }, "id" | "groupId_userId">

  export type YmqMemberOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrderInput | SortOrder
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
    leftAt?: DateTimeNullableWithAggregatesFilter<"YmqMember"> | Date | string | null
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
    catatanPembina?: StringNullableFilter<"YmqSetoran"> | string | null
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
    catatanPembina?: SortOrderInput | SortOrder
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
    catatanPembina?: StringNullableFilter<"YmqSetoran"> | string | null
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
    catatanPembina?: SortOrderInput | SortOrder
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
    catatanPembina?: StringNullableWithAggregatesFilter<"YmqSetoran"> | string | null
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

  export type YmqIwrCurriculumUnitWhereInput = {
    AND?: YmqIwrCurriculumUnitWhereInput | YmqIwrCurriculumUnitWhereInput[]
    OR?: YmqIwrCurriculumUnitWhereInput[]
    NOT?: YmqIwrCurriculumUnitWhereInput | YmqIwrCurriculumUnitWhereInput[]
    id?: UuidFilter<"YmqIwrCurriculumUnit"> | string
    iwrLevel?: EnumIwrLevelFilter<"YmqIwrCurriculumUnit"> | $Enums.IwrLevel
    topicCode?: StringFilter<"YmqIwrCurriculumUnit"> | string
    topicTitle?: StringFilter<"YmqIwrCurriculumUnit"> | string
    pageStart?: IntFilter<"YmqIwrCurriculumUnit"> | number
    pageEnd?: IntFilter<"YmqIwrCurriculumUnit"> | number
    isActive?: BoolFilter<"YmqIwrCurriculumUnit"> | boolean
    createdAt?: DateTimeFilter<"YmqIwrCurriculumUnit"> | Date | string
    updatedAt?: DateTimeFilter<"YmqIwrCurriculumUnit"> | Date | string
    progress?: YmqLearningProgressListRelationFilter
  }

  export type YmqIwrCurriculumUnitOrderByWithRelationInput = {
    id?: SortOrder
    iwrLevel?: SortOrder
    topicCode?: SortOrder
    topicTitle?: SortOrder
    pageStart?: SortOrder
    pageEnd?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    progress?: YmqLearningProgressOrderByRelationAggregateInput
  }

  export type YmqIwrCurriculumUnitWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    iwrLevel_topicCode?: YmqIwrCurriculumUnitIwrLevelTopicCodeCompoundUniqueInput
    AND?: YmqIwrCurriculumUnitWhereInput | YmqIwrCurriculumUnitWhereInput[]
    OR?: YmqIwrCurriculumUnitWhereInput[]
    NOT?: YmqIwrCurriculumUnitWhereInput | YmqIwrCurriculumUnitWhereInput[]
    iwrLevel?: EnumIwrLevelFilter<"YmqIwrCurriculumUnit"> | $Enums.IwrLevel
    topicCode?: StringFilter<"YmqIwrCurriculumUnit"> | string
    topicTitle?: StringFilter<"YmqIwrCurriculumUnit"> | string
    pageStart?: IntFilter<"YmqIwrCurriculumUnit"> | number
    pageEnd?: IntFilter<"YmqIwrCurriculumUnit"> | number
    isActive?: BoolFilter<"YmqIwrCurriculumUnit"> | boolean
    createdAt?: DateTimeFilter<"YmqIwrCurriculumUnit"> | Date | string
    updatedAt?: DateTimeFilter<"YmqIwrCurriculumUnit"> | Date | string
    progress?: YmqLearningProgressListRelationFilter
  }, "id" | "iwrLevel_topicCode">

  export type YmqIwrCurriculumUnitOrderByWithAggregationInput = {
    id?: SortOrder
    iwrLevel?: SortOrder
    topicCode?: SortOrder
    topicTitle?: SortOrder
    pageStart?: SortOrder
    pageEnd?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: YmqIwrCurriculumUnitCountOrderByAggregateInput
    _avg?: YmqIwrCurriculumUnitAvgOrderByAggregateInput
    _max?: YmqIwrCurriculumUnitMaxOrderByAggregateInput
    _min?: YmqIwrCurriculumUnitMinOrderByAggregateInput
    _sum?: YmqIwrCurriculumUnitSumOrderByAggregateInput
  }

  export type YmqIwrCurriculumUnitScalarWhereWithAggregatesInput = {
    AND?: YmqIwrCurriculumUnitScalarWhereWithAggregatesInput | YmqIwrCurriculumUnitScalarWhereWithAggregatesInput[]
    OR?: YmqIwrCurriculumUnitScalarWhereWithAggregatesInput[]
    NOT?: YmqIwrCurriculumUnitScalarWhereWithAggregatesInput | YmqIwrCurriculumUnitScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqIwrCurriculumUnit"> | string
    iwrLevel?: EnumIwrLevelWithAggregatesFilter<"YmqIwrCurriculumUnit"> | $Enums.IwrLevel
    topicCode?: StringWithAggregatesFilter<"YmqIwrCurriculumUnit"> | string
    topicTitle?: StringWithAggregatesFilter<"YmqIwrCurriculumUnit"> | string
    pageStart?: IntWithAggregatesFilter<"YmqIwrCurriculumUnit"> | number
    pageEnd?: IntWithAggregatesFilter<"YmqIwrCurriculumUnit"> | number
    isActive?: BoolWithAggregatesFilter<"YmqIwrCurriculumUnit"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"YmqIwrCurriculumUnit"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"YmqIwrCurriculumUnit"> | Date | string
  }

  export type YmqGroupAdminAssignmentWhereInput = {
    AND?: YmqGroupAdminAssignmentWhereInput | YmqGroupAdminAssignmentWhereInput[]
    OR?: YmqGroupAdminAssignmentWhereInput[]
    NOT?: YmqGroupAdminAssignmentWhereInput | YmqGroupAdminAssignmentWhereInput[]
    id?: UuidFilter<"YmqGroupAdminAssignment"> | string
    groupId?: UuidFilter<"YmqGroupAdminAssignment"> | string
    userId?: UuidFilter<"YmqGroupAdminAssignment"> | string
    role?: EnumYmqGroupStaffRoleFilter<"YmqGroupAdminAssignment"> | $Enums.YmqGroupStaffRole
    assignedById?: UuidFilter<"YmqGroupAdminAssignment"> | string
    assignedAt?: DateTimeFilter<"YmqGroupAdminAssignment"> | Date | string
    revokedAt?: DateTimeNullableFilter<"YmqGroupAdminAssignment"> | Date | string | null
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type YmqGroupAdminAssignmentOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    assignedById?: SortOrder
    assignedAt?: SortOrder
    revokedAt?: SortOrderInput | SortOrder
    group?: YmqGroupOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type YmqGroupAdminAssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: YmqGroupAdminAssignmentWhereInput | YmqGroupAdminAssignmentWhereInput[]
    OR?: YmqGroupAdminAssignmentWhereInput[]
    NOT?: YmqGroupAdminAssignmentWhereInput | YmqGroupAdminAssignmentWhereInput[]
    groupId?: UuidFilter<"YmqGroupAdminAssignment"> | string
    userId?: UuidFilter<"YmqGroupAdminAssignment"> | string
    role?: EnumYmqGroupStaffRoleFilter<"YmqGroupAdminAssignment"> | $Enums.YmqGroupStaffRole
    assignedById?: UuidFilter<"YmqGroupAdminAssignment"> | string
    assignedAt?: DateTimeFilter<"YmqGroupAdminAssignment"> | Date | string
    revokedAt?: DateTimeNullableFilter<"YmqGroupAdminAssignment"> | Date | string | null
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type YmqGroupAdminAssignmentOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    assignedById?: SortOrder
    assignedAt?: SortOrder
    revokedAt?: SortOrderInput | SortOrder
    _count?: YmqGroupAdminAssignmentCountOrderByAggregateInput
    _max?: YmqGroupAdminAssignmentMaxOrderByAggregateInput
    _min?: YmqGroupAdminAssignmentMinOrderByAggregateInput
  }

  export type YmqGroupAdminAssignmentScalarWhereWithAggregatesInput = {
    AND?: YmqGroupAdminAssignmentScalarWhereWithAggregatesInput | YmqGroupAdminAssignmentScalarWhereWithAggregatesInput[]
    OR?: YmqGroupAdminAssignmentScalarWhereWithAggregatesInput[]
    NOT?: YmqGroupAdminAssignmentScalarWhereWithAggregatesInput | YmqGroupAdminAssignmentScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqGroupAdminAssignment"> | string
    groupId?: UuidWithAggregatesFilter<"YmqGroupAdminAssignment"> | string
    userId?: UuidWithAggregatesFilter<"YmqGroupAdminAssignment"> | string
    role?: EnumYmqGroupStaffRoleWithAggregatesFilter<"YmqGroupAdminAssignment"> | $Enums.YmqGroupStaffRole
    assignedById?: UuidWithAggregatesFilter<"YmqGroupAdminAssignment"> | string
    assignedAt?: DateTimeWithAggregatesFilter<"YmqGroupAdminAssignment"> | Date | string
    revokedAt?: DateTimeNullableWithAggregatesFilter<"YmqGroupAdminAssignment"> | Date | string | null
  }

  export type YmqLearningSessionWhereInput = {
    AND?: YmqLearningSessionWhereInput | YmqLearningSessionWhereInput[]
    OR?: YmqLearningSessionWhereInput[]
    NOT?: YmqLearningSessionWhereInput | YmqLearningSessionWhereInput[]
    id?: UuidFilter<"YmqLearningSession"> | string
    groupId?: UuidFilter<"YmqLearningSession"> | string
    sessionDate?: DateTimeFilter<"YmqLearningSession"> | Date | string
    notes?: StringNullableFilter<"YmqLearningSession"> | string | null
    createdById?: UuidFilter<"YmqLearningSession"> | string
    createdAt?: DateTimeFilter<"YmqLearningSession"> | Date | string
    updatedAt?: DateTimeFilter<"YmqLearningSession"> | Date | string
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    attendance?: YmqSessionAttendanceListRelationFilter
    progress?: YmqLearningProgressListRelationFilter
  }

  export type YmqLearningSessionOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    sessionDate?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    group?: YmqGroupOrderByWithRelationInput
    attendance?: YmqSessionAttendanceOrderByRelationAggregateInput
    progress?: YmqLearningProgressOrderByRelationAggregateInput
  }

  export type YmqLearningSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    groupId_sessionDate?: YmqLearningSessionGroupIdSessionDateCompoundUniqueInput
    AND?: YmqLearningSessionWhereInput | YmqLearningSessionWhereInput[]
    OR?: YmqLearningSessionWhereInput[]
    NOT?: YmqLearningSessionWhereInput | YmqLearningSessionWhereInput[]
    groupId?: UuidFilter<"YmqLearningSession"> | string
    sessionDate?: DateTimeFilter<"YmqLearningSession"> | Date | string
    notes?: StringNullableFilter<"YmqLearningSession"> | string | null
    createdById?: UuidFilter<"YmqLearningSession"> | string
    createdAt?: DateTimeFilter<"YmqLearningSession"> | Date | string
    updatedAt?: DateTimeFilter<"YmqLearningSession"> | Date | string
    group?: XOR<YmqGroupScalarRelationFilter, YmqGroupWhereInput>
    attendance?: YmqSessionAttendanceListRelationFilter
    progress?: YmqLearningProgressListRelationFilter
  }, "id" | "groupId_sessionDate">

  export type YmqLearningSessionOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    sessionDate?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: YmqLearningSessionCountOrderByAggregateInput
    _max?: YmqLearningSessionMaxOrderByAggregateInput
    _min?: YmqLearningSessionMinOrderByAggregateInput
  }

  export type YmqLearningSessionScalarWhereWithAggregatesInput = {
    AND?: YmqLearningSessionScalarWhereWithAggregatesInput | YmqLearningSessionScalarWhereWithAggregatesInput[]
    OR?: YmqLearningSessionScalarWhereWithAggregatesInput[]
    NOT?: YmqLearningSessionScalarWhereWithAggregatesInput | YmqLearningSessionScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqLearningSession"> | string
    groupId?: UuidWithAggregatesFilter<"YmqLearningSession"> | string
    sessionDate?: DateTimeWithAggregatesFilter<"YmqLearningSession"> | Date | string
    notes?: StringNullableWithAggregatesFilter<"YmqLearningSession"> | string | null
    createdById?: UuidWithAggregatesFilter<"YmqLearningSession"> | string
    createdAt?: DateTimeWithAggregatesFilter<"YmqLearningSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"YmqLearningSession"> | Date | string
  }

  export type YmqSessionAttendanceWhereInput = {
    AND?: YmqSessionAttendanceWhereInput | YmqSessionAttendanceWhereInput[]
    OR?: YmqSessionAttendanceWhereInput[]
    NOT?: YmqSessionAttendanceWhereInput | YmqSessionAttendanceWhereInput[]
    id?: UuidFilter<"YmqSessionAttendance"> | string
    sessionId?: UuidFilter<"YmqSessionAttendance"> | string
    memberId?: UuidFilter<"YmqSessionAttendance"> | string
    status?: EnumAttendanceStatusFilter<"YmqSessionAttendance"> | $Enums.AttendanceStatus
    note?: StringNullableFilter<"YmqSessionAttendance"> | string | null
    createdAt?: DateTimeFilter<"YmqSessionAttendance"> | Date | string
    updatedAt?: DateTimeFilter<"YmqSessionAttendance"> | Date | string
    session?: XOR<YmqLearningSessionScalarRelationFilter, YmqLearningSessionWhereInput>
    member?: XOR<YmqMemberScalarRelationFilter, YmqMemberWhereInput>
  }

  export type YmqSessionAttendanceOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    status?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    session?: YmqLearningSessionOrderByWithRelationInput
    member?: YmqMemberOrderByWithRelationInput
  }

  export type YmqSessionAttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionId_memberId?: YmqSessionAttendanceSessionIdMemberIdCompoundUniqueInput
    AND?: YmqSessionAttendanceWhereInput | YmqSessionAttendanceWhereInput[]
    OR?: YmqSessionAttendanceWhereInput[]
    NOT?: YmqSessionAttendanceWhereInput | YmqSessionAttendanceWhereInput[]
    sessionId?: UuidFilter<"YmqSessionAttendance"> | string
    memberId?: UuidFilter<"YmqSessionAttendance"> | string
    status?: EnumAttendanceStatusFilter<"YmqSessionAttendance"> | $Enums.AttendanceStatus
    note?: StringNullableFilter<"YmqSessionAttendance"> | string | null
    createdAt?: DateTimeFilter<"YmqSessionAttendance"> | Date | string
    updatedAt?: DateTimeFilter<"YmqSessionAttendance"> | Date | string
    session?: XOR<YmqLearningSessionScalarRelationFilter, YmqLearningSessionWhereInput>
    member?: XOR<YmqMemberScalarRelationFilter, YmqMemberWhereInput>
  }, "id" | "sessionId_memberId">

  export type YmqSessionAttendanceOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    status?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: YmqSessionAttendanceCountOrderByAggregateInput
    _max?: YmqSessionAttendanceMaxOrderByAggregateInput
    _min?: YmqSessionAttendanceMinOrderByAggregateInput
  }

  export type YmqSessionAttendanceScalarWhereWithAggregatesInput = {
    AND?: YmqSessionAttendanceScalarWhereWithAggregatesInput | YmqSessionAttendanceScalarWhereWithAggregatesInput[]
    OR?: YmqSessionAttendanceScalarWhereWithAggregatesInput[]
    NOT?: YmqSessionAttendanceScalarWhereWithAggregatesInput | YmqSessionAttendanceScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqSessionAttendance"> | string
    sessionId?: UuidWithAggregatesFilter<"YmqSessionAttendance"> | string
    memberId?: UuidWithAggregatesFilter<"YmqSessionAttendance"> | string
    status?: EnumAttendanceStatusWithAggregatesFilter<"YmqSessionAttendance"> | $Enums.AttendanceStatus
    note?: StringNullableWithAggregatesFilter<"YmqSessionAttendance"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"YmqSessionAttendance"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"YmqSessionAttendance"> | Date | string
  }

  export type YmqLearningProgressWhereInput = {
    AND?: YmqLearningProgressWhereInput | YmqLearningProgressWhereInput[]
    OR?: YmqLearningProgressWhereInput[]
    NOT?: YmqLearningProgressWhereInput | YmqLearningProgressWhereInput[]
    id?: UuidFilter<"YmqLearningProgress"> | string
    sessionId?: UuidFilter<"YmqLearningProgress"> | string
    memberId?: UuidFilter<"YmqLearningProgress"> | string
    track?: EnumLearningTrackFilter<"YmqLearningProgress"> | $Enums.LearningTrack
    sequence?: IntFilter<"YmqLearningProgress"> | number
    iwrCurriculumUnitId?: UuidNullableFilter<"YmqLearningProgress"> | string | null
    surahNumber?: IntNullableFilter<"YmqLearningProgress"> | number | null
    ayahStart?: IntNullableFilter<"YmqLearningProgress"> | number | null
    ayahEnd?: IntNullableFilter<"YmqLearningProgress"> | number | null
    note?: StringNullableFilter<"YmqLearningProgress"> | string | null
    createdAt?: DateTimeFilter<"YmqLearningProgress"> | Date | string
    updatedAt?: DateTimeFilter<"YmqLearningProgress"> | Date | string
    session?: XOR<YmqLearningSessionScalarRelationFilter, YmqLearningSessionWhereInput>
    member?: XOR<YmqMemberScalarRelationFilter, YmqMemberWhereInput>
    iwrCurriculumUnit?: XOR<YmqIwrCurriculumUnitNullableScalarRelationFilter, YmqIwrCurriculumUnitWhereInput> | null
    evidence?: YmqProgressEvidenceListRelationFilter
  }

  export type YmqLearningProgressOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    track?: SortOrder
    sequence?: SortOrder
    iwrCurriculumUnitId?: SortOrderInput | SortOrder
    surahNumber?: SortOrderInput | SortOrder
    ayahStart?: SortOrderInput | SortOrder
    ayahEnd?: SortOrderInput | SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    session?: YmqLearningSessionOrderByWithRelationInput
    member?: YmqMemberOrderByWithRelationInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitOrderByWithRelationInput
    evidence?: YmqProgressEvidenceOrderByRelationAggregateInput
  }

  export type YmqLearningProgressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionId_memberId_track_sequence?: YmqLearningProgressSessionIdMemberIdTrackSequenceCompoundUniqueInput
    AND?: YmqLearningProgressWhereInput | YmqLearningProgressWhereInput[]
    OR?: YmqLearningProgressWhereInput[]
    NOT?: YmqLearningProgressWhereInput | YmqLearningProgressWhereInput[]
    sessionId?: UuidFilter<"YmqLearningProgress"> | string
    memberId?: UuidFilter<"YmqLearningProgress"> | string
    track?: EnumLearningTrackFilter<"YmqLearningProgress"> | $Enums.LearningTrack
    sequence?: IntFilter<"YmqLearningProgress"> | number
    iwrCurriculumUnitId?: UuidNullableFilter<"YmqLearningProgress"> | string | null
    surahNumber?: IntNullableFilter<"YmqLearningProgress"> | number | null
    ayahStart?: IntNullableFilter<"YmqLearningProgress"> | number | null
    ayahEnd?: IntNullableFilter<"YmqLearningProgress"> | number | null
    note?: StringNullableFilter<"YmqLearningProgress"> | string | null
    createdAt?: DateTimeFilter<"YmqLearningProgress"> | Date | string
    updatedAt?: DateTimeFilter<"YmqLearningProgress"> | Date | string
    session?: XOR<YmqLearningSessionScalarRelationFilter, YmqLearningSessionWhereInput>
    member?: XOR<YmqMemberScalarRelationFilter, YmqMemberWhereInput>
    iwrCurriculumUnit?: XOR<YmqIwrCurriculumUnitNullableScalarRelationFilter, YmqIwrCurriculumUnitWhereInput> | null
    evidence?: YmqProgressEvidenceListRelationFilter
  }, "id" | "sessionId_memberId_track_sequence">

  export type YmqLearningProgressOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    track?: SortOrder
    sequence?: SortOrder
    iwrCurriculumUnitId?: SortOrderInput | SortOrder
    surahNumber?: SortOrderInput | SortOrder
    ayahStart?: SortOrderInput | SortOrder
    ayahEnd?: SortOrderInput | SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: YmqLearningProgressCountOrderByAggregateInput
    _avg?: YmqLearningProgressAvgOrderByAggregateInput
    _max?: YmqLearningProgressMaxOrderByAggregateInput
    _min?: YmqLearningProgressMinOrderByAggregateInput
    _sum?: YmqLearningProgressSumOrderByAggregateInput
  }

  export type YmqLearningProgressScalarWhereWithAggregatesInput = {
    AND?: YmqLearningProgressScalarWhereWithAggregatesInput | YmqLearningProgressScalarWhereWithAggregatesInput[]
    OR?: YmqLearningProgressScalarWhereWithAggregatesInput[]
    NOT?: YmqLearningProgressScalarWhereWithAggregatesInput | YmqLearningProgressScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqLearningProgress"> | string
    sessionId?: UuidWithAggregatesFilter<"YmqLearningProgress"> | string
    memberId?: UuidWithAggregatesFilter<"YmqLearningProgress"> | string
    track?: EnumLearningTrackWithAggregatesFilter<"YmqLearningProgress"> | $Enums.LearningTrack
    sequence?: IntWithAggregatesFilter<"YmqLearningProgress"> | number
    iwrCurriculumUnitId?: UuidNullableWithAggregatesFilter<"YmqLearningProgress"> | string | null
    surahNumber?: IntNullableWithAggregatesFilter<"YmqLearningProgress"> | number | null
    ayahStart?: IntNullableWithAggregatesFilter<"YmqLearningProgress"> | number | null
    ayahEnd?: IntNullableWithAggregatesFilter<"YmqLearningProgress"> | number | null
    note?: StringNullableWithAggregatesFilter<"YmqLearningProgress"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"YmqLearningProgress"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"YmqLearningProgress"> | Date | string
  }

  export type YmqProgressEvidenceWhereInput = {
    AND?: YmqProgressEvidenceWhereInput | YmqProgressEvidenceWhereInput[]
    OR?: YmqProgressEvidenceWhereInput[]
    NOT?: YmqProgressEvidenceWhereInput | YmqProgressEvidenceWhereInput[]
    id?: UuidFilter<"YmqProgressEvidence"> | string
    progressId?: UuidFilter<"YmqProgressEvidence"> | string
    cloudinaryPublicId?: StringFilter<"YmqProgressEvidence"> | string
    secureUrl?: StringFilter<"YmqProgressEvidence"> | string
    resourceType?: StringFilter<"YmqProgressEvidence"> | string
    originalFilename?: StringNullableFilter<"YmqProgressEvidence"> | string | null
    bytes?: IntNullableFilter<"YmqProgressEvidence"> | number | null
    uploadedById?: UuidFilter<"YmqProgressEvidence"> | string
    createdAt?: DateTimeFilter<"YmqProgressEvidence"> | Date | string
    progress?: XOR<YmqLearningProgressScalarRelationFilter, YmqLearningProgressWhereInput>
  }

  export type YmqProgressEvidenceOrderByWithRelationInput = {
    id?: SortOrder
    progressId?: SortOrder
    cloudinaryPublicId?: SortOrder
    secureUrl?: SortOrder
    resourceType?: SortOrder
    originalFilename?: SortOrderInput | SortOrder
    bytes?: SortOrderInput | SortOrder
    uploadedById?: SortOrder
    createdAt?: SortOrder
    progress?: YmqLearningProgressOrderByWithRelationInput
  }

  export type YmqProgressEvidenceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    progressId_cloudinaryPublicId?: YmqProgressEvidenceProgressIdCloudinaryPublicIdCompoundUniqueInput
    AND?: YmqProgressEvidenceWhereInput | YmqProgressEvidenceWhereInput[]
    OR?: YmqProgressEvidenceWhereInput[]
    NOT?: YmqProgressEvidenceWhereInput | YmqProgressEvidenceWhereInput[]
    progressId?: UuidFilter<"YmqProgressEvidence"> | string
    cloudinaryPublicId?: StringFilter<"YmqProgressEvidence"> | string
    secureUrl?: StringFilter<"YmqProgressEvidence"> | string
    resourceType?: StringFilter<"YmqProgressEvidence"> | string
    originalFilename?: StringNullableFilter<"YmqProgressEvidence"> | string | null
    bytes?: IntNullableFilter<"YmqProgressEvidence"> | number | null
    uploadedById?: UuidFilter<"YmqProgressEvidence"> | string
    createdAt?: DateTimeFilter<"YmqProgressEvidence"> | Date | string
    progress?: XOR<YmqLearningProgressScalarRelationFilter, YmqLearningProgressWhereInput>
  }, "id" | "progressId_cloudinaryPublicId">

  export type YmqProgressEvidenceOrderByWithAggregationInput = {
    id?: SortOrder
    progressId?: SortOrder
    cloudinaryPublicId?: SortOrder
    secureUrl?: SortOrder
    resourceType?: SortOrder
    originalFilename?: SortOrderInput | SortOrder
    bytes?: SortOrderInput | SortOrder
    uploadedById?: SortOrder
    createdAt?: SortOrder
    _count?: YmqProgressEvidenceCountOrderByAggregateInput
    _avg?: YmqProgressEvidenceAvgOrderByAggregateInput
    _max?: YmqProgressEvidenceMaxOrderByAggregateInput
    _min?: YmqProgressEvidenceMinOrderByAggregateInput
    _sum?: YmqProgressEvidenceSumOrderByAggregateInput
  }

  export type YmqProgressEvidenceScalarWhereWithAggregatesInput = {
    AND?: YmqProgressEvidenceScalarWhereWithAggregatesInput | YmqProgressEvidenceScalarWhereWithAggregatesInput[]
    OR?: YmqProgressEvidenceScalarWhereWithAggregatesInput[]
    NOT?: YmqProgressEvidenceScalarWhereWithAggregatesInput | YmqProgressEvidenceScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"YmqProgressEvidence"> | string
    progressId?: UuidWithAggregatesFilter<"YmqProgressEvidence"> | string
    cloudinaryPublicId?: StringWithAggregatesFilter<"YmqProgressEvidence"> | string
    secureUrl?: StringWithAggregatesFilter<"YmqProgressEvidence"> | string
    resourceType?: StringWithAggregatesFilter<"YmqProgressEvidence"> | string
    originalFilename?: StringNullableWithAggregatesFilter<"YmqProgressEvidence"> | string | null
    bytes?: IntNullableWithAggregatesFilter<"YmqProgressEvidence"> | number | null
    uploadedById?: UuidWithAggregatesFilter<"YmqProgressEvidence"> | string
    createdAt?: DateTimeWithAggregatesFilter<"YmqProgressEvidence"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentCreateNestedManyWithoutUserInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupUncheckedCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutUserInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUpdateManyWithoutUserNestedInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUncheckedUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserNestedInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqGroupCreateInput = {
    id?: string
    name: string
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pembina?: UserCreateNestedOneWithoutGroupsAsPembinaInput
    members?: YmqMemberCreateNestedManyWithoutGroupInput
    groupAdmins?: YmqGroupAdminAssignmentCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUncheckedCreateInput = {
    id?: string
    name: string
    pembinaUserId?: string | null
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberUncheckedCreateNestedManyWithoutGroupInput
    groupAdmins?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionUncheckedCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pembina?: UserUpdateOneWithoutGroupsAsPembinaNestedInput
    members?: YmqMemberUpdateManyWithoutGroupNestedInput
    groupAdmins?: YmqGroupAdminAssignmentUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    pembinaUserId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUncheckedUpdateManyWithoutGroupNestedInput
    groupAdmins?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupCreateManyInput = {
    id?: string
    name: string
    pembinaUserId?: string | null
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
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
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
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
    pembinaUserId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
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
    leftAt?: Date | string | null
    group: YmqGroupCreateNestedOneWithoutMembersInput
    user: UserCreateNestedOneWithoutMembershipsInput
    attendance?: YmqSessionAttendanceCreateNestedManyWithoutMemberInput
    progress?: YmqLearningProgressCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberUncheckedCreateInput = {
    id?: string
    groupId: string
    userId: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    attendance?: YmqSessionAttendanceUncheckedCreateNestedManyWithoutMemberInput
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    group?: YmqGroupUpdateOneRequiredWithoutMembersNestedInput
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
    attendance?: YmqSessionAttendanceUpdateManyWithoutMemberNestedInput
    progress?: YmqLearningProgressUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attendance?: YmqSessionAttendanceUncheckedUpdateManyWithoutMemberNestedInput
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberCreateManyInput = {
    id?: string
    groupId: string
    userId: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
  }

  export type YmqMemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqMemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
    catatanPembina?: string | null
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
    catatanPembina?: string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type YmqIwrCurriculumUnitCreateInput = {
    id?: string
    iwrLevel: $Enums.IwrLevel
    topicCode: string
    topicTitle: string
    pageStart: number
    pageEnd: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    progress?: YmqLearningProgressCreateNestedManyWithoutIwrCurriculumUnitInput
  }

  export type YmqIwrCurriculumUnitUncheckedCreateInput = {
    id?: string
    iwrLevel: $Enums.IwrLevel
    topicCode: string
    topicTitle: string
    pageStart: number
    pageEnd: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutIwrCurriculumUnitInput
  }

  export type YmqIwrCurriculumUnitUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    iwrLevel?: EnumIwrLevelFieldUpdateOperationsInput | $Enums.IwrLevel
    topicCode?: StringFieldUpdateOperationsInput | string
    topicTitle?: StringFieldUpdateOperationsInput | string
    pageStart?: IntFieldUpdateOperationsInput | number
    pageEnd?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: YmqLearningProgressUpdateManyWithoutIwrCurriculumUnitNestedInput
  }

  export type YmqIwrCurriculumUnitUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    iwrLevel?: EnumIwrLevelFieldUpdateOperationsInput | $Enums.IwrLevel
    topicCode?: StringFieldUpdateOperationsInput | string
    topicTitle?: StringFieldUpdateOperationsInput | string
    pageStart?: IntFieldUpdateOperationsInput | number
    pageEnd?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutIwrCurriculumUnitNestedInput
  }

  export type YmqIwrCurriculumUnitCreateManyInput = {
    id?: string
    iwrLevel: $Enums.IwrLevel
    topicCode: string
    topicTitle: string
    pageStart: number
    pageEnd: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqIwrCurriculumUnitUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    iwrLevel?: EnumIwrLevelFieldUpdateOperationsInput | $Enums.IwrLevel
    topicCode?: StringFieldUpdateOperationsInput | string
    topicTitle?: StringFieldUpdateOperationsInput | string
    pageStart?: IntFieldUpdateOperationsInput | number
    pageEnd?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqIwrCurriculumUnitUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    iwrLevel?: EnumIwrLevelFieldUpdateOperationsInput | $Enums.IwrLevel
    topicCode?: StringFieldUpdateOperationsInput | string
    topicTitle?: StringFieldUpdateOperationsInput | string
    pageStart?: IntFieldUpdateOperationsInput | number
    pageEnd?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqGroupAdminAssignmentCreateInput = {
    id?: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
    group: YmqGroupCreateNestedOneWithoutGroupAdminsInput
    user: UserCreateNestedOneWithoutGroupAdminAssignmentsInput
  }

  export type YmqGroupAdminAssignmentUncheckedCreateInput = {
    id?: string
    groupId: string
    userId: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type YmqGroupAdminAssignmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    group?: YmqGroupUpdateOneRequiredWithoutGroupAdminsNestedInput
    user?: UserUpdateOneRequiredWithoutGroupAdminAssignmentsNestedInput
  }

  export type YmqGroupAdminAssignmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqGroupAdminAssignmentCreateManyInput = {
    id?: string
    groupId: string
    userId: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type YmqGroupAdminAssignmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqGroupAdminAssignmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqLearningSessionCreateInput = {
    id?: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    group: YmqGroupCreateNestedOneWithoutLearningSessionsInput
    attendance?: YmqSessionAttendanceCreateNestedManyWithoutSessionInput
    progress?: YmqLearningProgressCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionUncheckedCreateInput = {
    id?: string
    groupId: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    attendance?: YmqSessionAttendanceUncheckedCreateNestedManyWithoutSessionInput
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: YmqGroupUpdateOneRequiredWithoutLearningSessionsNestedInput
    attendance?: YmqSessionAttendanceUpdateManyWithoutSessionNestedInput
    progress?: YmqLearningProgressUpdateManyWithoutSessionNestedInput
  }

  export type YmqLearningSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attendance?: YmqSessionAttendanceUncheckedUpdateManyWithoutSessionNestedInput
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type YmqLearningSessionCreateManyInput = {
    id?: string
    groupId: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqLearningSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqLearningSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSessionAttendanceCreateInput = {
    id?: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: YmqLearningSessionCreateNestedOneWithoutAttendanceInput
    member: YmqMemberCreateNestedOneWithoutAttendanceInput
  }

  export type YmqSessionAttendanceUncheckedCreateInput = {
    id?: string
    sessionId: string
    memberId: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqSessionAttendanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: YmqLearningSessionUpdateOneRequiredWithoutAttendanceNestedInput
    member?: YmqMemberUpdateOneRequiredWithoutAttendanceNestedInput
  }

  export type YmqSessionAttendanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSessionAttendanceCreateManyInput = {
    id?: string
    sessionId: string
    memberId: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqSessionAttendanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSessionAttendanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqLearningProgressCreateInput = {
    id?: string
    track: $Enums.LearningTrack
    sequence?: number
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: YmqLearningSessionCreateNestedOneWithoutProgressInput
    member: YmqMemberCreateNestedOneWithoutProgressInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitCreateNestedOneWithoutProgressInput
    evidence?: YmqProgressEvidenceCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressUncheckedCreateInput = {
    id?: string
    sessionId: string
    memberId: string
    track: $Enums.LearningTrack
    sequence?: number
    iwrCurriculumUnitId?: string | null
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    evidence?: YmqProgressEvidenceUncheckedCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: YmqLearningSessionUpdateOneRequiredWithoutProgressNestedInput
    member?: YmqMemberUpdateOneRequiredWithoutProgressNestedInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitUpdateOneWithoutProgressNestedInput
    evidence?: YmqProgressEvidenceUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    iwrCurriculumUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    evidence?: YmqProgressEvidenceUncheckedUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressCreateManyInput = {
    id?: string
    sessionId: string
    memberId: string
    track: $Enums.LearningTrack
    sequence?: number
    iwrCurriculumUnitId?: string | null
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqLearningProgressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqLearningProgressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    iwrCurriculumUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqProgressEvidenceCreateInput = {
    id?: string
    cloudinaryPublicId: string
    secureUrl: string
    resourceType: string
    originalFilename?: string | null
    bytes?: number | null
    uploadedById: string
    createdAt?: Date | string
    progress: YmqLearningProgressCreateNestedOneWithoutEvidenceInput
  }

  export type YmqProgressEvidenceUncheckedCreateInput = {
    id?: string
    progressId: string
    cloudinaryPublicId: string
    secureUrl: string
    resourceType: string
    originalFilename?: string | null
    bytes?: number | null
    uploadedById: string
    createdAt?: Date | string
  }

  export type YmqProgressEvidenceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cloudinaryPublicId?: StringFieldUpdateOperationsInput | string
    secureUrl?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    bytes?: NullableIntFieldUpdateOperationsInput | number | null
    uploadedById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: YmqLearningProgressUpdateOneRequiredWithoutEvidenceNestedInput
  }

  export type YmqProgressEvidenceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    progressId?: StringFieldUpdateOperationsInput | string
    cloudinaryPublicId?: StringFieldUpdateOperationsInput | string
    secureUrl?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    bytes?: NullableIntFieldUpdateOperationsInput | number | null
    uploadedById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqProgressEvidenceCreateManyInput = {
    id?: string
    progressId: string
    cloudinaryPublicId: string
    secureUrl: string
    resourceType: string
    originalFilename?: string | null
    bytes?: number | null
    uploadedById: string
    createdAt?: Date | string
  }

  export type YmqProgressEvidenceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    cloudinaryPublicId?: StringFieldUpdateOperationsInput | string
    secureUrl?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    bytes?: NullableIntFieldUpdateOperationsInput | number | null
    uploadedById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqProgressEvidenceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    progressId?: StringFieldUpdateOperationsInput | string
    cloudinaryPublicId?: StringFieldUpdateOperationsInput | string
    secureUrl?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    bytes?: NullableIntFieldUpdateOperationsInput | number | null
    uploadedById?: StringFieldUpdateOperationsInput | string
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

  export type YmqGroupAdminAssignmentListRelationFilter = {
    every?: YmqGroupAdminAssignmentWhereInput
    some?: YmqGroupAdminAssignmentWhereInput
    none?: YmqGroupAdminAssignmentWhereInput
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

  export type YmqGroupAdminAssignmentOrderByRelationAggregateInput = {
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
    unitId?: SortOrder
    sourceUpdatedAt?: SortOrder
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
    unitId?: SortOrder
    sourceUpdatedAt?: SortOrder
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
    unitId?: SortOrder
    sourceUpdatedAt?: SortOrder
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

  export type EnumYmqGroupLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupLevel | EnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumYmqGroupLevelNullableFilter<$PrismaModel> | $Enums.YmqGroupLevel | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type YmqLearningSessionListRelationFilter = {
    every?: YmqLearningSessionWhereInput
    some?: YmqLearningSessionWhereInput
    none?: YmqLearningSessionWhereInput
  }

  export type YmqLearningSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type YmqGroupCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    pembinaUserId?: SortOrder
    level?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrder
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
    pembinaUserId?: SortOrder
    level?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrder
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
    pembinaUserId?: SortOrder
    level?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrder
    description?: SortOrder
    scheduleDay?: SortOrder
    scheduleTime?: SortOrder
    whatsappLink?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumYmqGroupLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupLevel | EnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumYmqGroupLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.YmqGroupLevel | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumYmqGroupLevelNullableFilter<$PrismaModel>
    _max?: NestedEnumYmqGroupLevelNullableFilter<$PrismaModel>
  }

  export type YmqGroupScalarRelationFilter = {
    is?: YmqGroupWhereInput
    isNot?: YmqGroupWhereInput
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type YmqSessionAttendanceListRelationFilter = {
    every?: YmqSessionAttendanceWhereInput
    some?: YmqSessionAttendanceWhereInput
    none?: YmqSessionAttendanceWhereInput
  }

  export type YmqLearningProgressListRelationFilter = {
    every?: YmqLearningProgressWhereInput
    some?: YmqLearningProgressWhereInput
    none?: YmqLearningProgressWhereInput
  }

  export type YmqSessionAttendanceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type YmqLearningProgressOrderByRelationAggregateInput = {
    _count?: SortOrder
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
    leftAt?: SortOrder
  }

  export type YmqMemberMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrder
  }

  export type YmqMemberMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrder
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
    catatanPembina?: SortOrder
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
    catatanPembina?: SortOrder
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
    catatanPembina?: SortOrder
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

  export type EnumIwrLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.IwrLevel | EnumIwrLevelFieldRefInput<$PrismaModel>
    in?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumIwrLevelFilter<$PrismaModel> | $Enums.IwrLevel
  }

  export type YmqIwrCurriculumUnitIwrLevelTopicCodeCompoundUniqueInput = {
    iwrLevel: $Enums.IwrLevel
    topicCode: string
  }

  export type YmqIwrCurriculumUnitCountOrderByAggregateInput = {
    id?: SortOrder
    iwrLevel?: SortOrder
    topicCode?: SortOrder
    topicTitle?: SortOrder
    pageStart?: SortOrder
    pageEnd?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqIwrCurriculumUnitAvgOrderByAggregateInput = {
    pageStart?: SortOrder
    pageEnd?: SortOrder
  }

  export type YmqIwrCurriculumUnitMaxOrderByAggregateInput = {
    id?: SortOrder
    iwrLevel?: SortOrder
    topicCode?: SortOrder
    topicTitle?: SortOrder
    pageStart?: SortOrder
    pageEnd?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqIwrCurriculumUnitMinOrderByAggregateInput = {
    id?: SortOrder
    iwrLevel?: SortOrder
    topicCode?: SortOrder
    topicTitle?: SortOrder
    pageStart?: SortOrder
    pageEnd?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqIwrCurriculumUnitSumOrderByAggregateInput = {
    pageStart?: SortOrder
    pageEnd?: SortOrder
  }

  export type EnumIwrLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IwrLevel | EnumIwrLevelFieldRefInput<$PrismaModel>
    in?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumIwrLevelWithAggregatesFilter<$PrismaModel> | $Enums.IwrLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIwrLevelFilter<$PrismaModel>
    _max?: NestedEnumIwrLevelFilter<$PrismaModel>
  }

  export type EnumYmqGroupStaffRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupStaffRole | EnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumYmqGroupStaffRoleFilter<$PrismaModel> | $Enums.YmqGroupStaffRole
  }

  export type YmqGroupAdminAssignmentCountOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    assignedById?: SortOrder
    assignedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type YmqGroupAdminAssignmentMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    assignedById?: SortOrder
    assignedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type YmqGroupAdminAssignmentMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    assignedById?: SortOrder
    assignedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type EnumYmqGroupStaffRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupStaffRole | EnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumYmqGroupStaffRoleWithAggregatesFilter<$PrismaModel> | $Enums.YmqGroupStaffRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumYmqGroupStaffRoleFilter<$PrismaModel>
    _max?: NestedEnumYmqGroupStaffRoleFilter<$PrismaModel>
  }

  export type YmqLearningSessionGroupIdSessionDateCompoundUniqueInput = {
    groupId: string
    sessionDate: Date | string
  }

  export type YmqLearningSessionCountOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    sessionDate?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqLearningSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    sessionDate?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqLearningSessionMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    sessionDate?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumAttendanceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AttendanceStatus | EnumAttendanceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttendanceStatusFilter<$PrismaModel> | $Enums.AttendanceStatus
  }

  export type YmqLearningSessionScalarRelationFilter = {
    is?: YmqLearningSessionWhereInput
    isNot?: YmqLearningSessionWhereInput
  }

  export type YmqMemberScalarRelationFilter = {
    is?: YmqMemberWhereInput
    isNot?: YmqMemberWhereInput
  }

  export type YmqSessionAttendanceSessionIdMemberIdCompoundUniqueInput = {
    sessionId: string
    memberId: string
  }

  export type YmqSessionAttendanceCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    status?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqSessionAttendanceMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    status?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqSessionAttendanceMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    status?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumAttendanceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AttendanceStatus | EnumAttendanceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttendanceStatusWithAggregatesFilter<$PrismaModel> | $Enums.AttendanceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAttendanceStatusFilter<$PrismaModel>
    _max?: NestedEnumAttendanceStatusFilter<$PrismaModel>
  }

  export type EnumLearningTrackFilter<$PrismaModel = never> = {
    equals?: $Enums.LearningTrack | EnumLearningTrackFieldRefInput<$PrismaModel>
    in?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    notIn?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    not?: NestedEnumLearningTrackFilter<$PrismaModel> | $Enums.LearningTrack
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type YmqIwrCurriculumUnitNullableScalarRelationFilter = {
    is?: YmqIwrCurriculumUnitWhereInput | null
    isNot?: YmqIwrCurriculumUnitWhereInput | null
  }

  export type YmqProgressEvidenceListRelationFilter = {
    every?: YmqProgressEvidenceWhereInput
    some?: YmqProgressEvidenceWhereInput
    none?: YmqProgressEvidenceWhereInput
  }

  export type YmqProgressEvidenceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type YmqLearningProgressSessionIdMemberIdTrackSequenceCompoundUniqueInput = {
    sessionId: string
    memberId: string
    track: $Enums.LearningTrack
    sequence: number
  }

  export type YmqLearningProgressCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    track?: SortOrder
    sequence?: SortOrder
    iwrCurriculumUnitId?: SortOrder
    surahNumber?: SortOrder
    ayahStart?: SortOrder
    ayahEnd?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqLearningProgressAvgOrderByAggregateInput = {
    sequence?: SortOrder
    surahNumber?: SortOrder
    ayahStart?: SortOrder
    ayahEnd?: SortOrder
  }

  export type YmqLearningProgressMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    track?: SortOrder
    sequence?: SortOrder
    iwrCurriculumUnitId?: SortOrder
    surahNumber?: SortOrder
    ayahStart?: SortOrder
    ayahEnd?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqLearningProgressMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    memberId?: SortOrder
    track?: SortOrder
    sequence?: SortOrder
    iwrCurriculumUnitId?: SortOrder
    surahNumber?: SortOrder
    ayahStart?: SortOrder
    ayahEnd?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type YmqLearningProgressSumOrderByAggregateInput = {
    sequence?: SortOrder
    surahNumber?: SortOrder
    ayahStart?: SortOrder
    ayahEnd?: SortOrder
  }

  export type EnumLearningTrackWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LearningTrack | EnumLearningTrackFieldRefInput<$PrismaModel>
    in?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    notIn?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    not?: NestedEnumLearningTrackWithAggregatesFilter<$PrismaModel> | $Enums.LearningTrack
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLearningTrackFilter<$PrismaModel>
    _max?: NestedEnumLearningTrackFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type YmqLearningProgressScalarRelationFilter = {
    is?: YmqLearningProgressWhereInput
    isNot?: YmqLearningProgressWhereInput
  }

  export type YmqProgressEvidenceProgressIdCloudinaryPublicIdCompoundUniqueInput = {
    progressId: string
    cloudinaryPublicId: string
  }

  export type YmqProgressEvidenceCountOrderByAggregateInput = {
    id?: SortOrder
    progressId?: SortOrder
    cloudinaryPublicId?: SortOrder
    secureUrl?: SortOrder
    resourceType?: SortOrder
    originalFilename?: SortOrder
    bytes?: SortOrder
    uploadedById?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqProgressEvidenceAvgOrderByAggregateInput = {
    bytes?: SortOrder
  }

  export type YmqProgressEvidenceMaxOrderByAggregateInput = {
    id?: SortOrder
    progressId?: SortOrder
    cloudinaryPublicId?: SortOrder
    secureUrl?: SortOrder
    resourceType?: SortOrder
    originalFilename?: SortOrder
    bytes?: SortOrder
    uploadedById?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqProgressEvidenceMinOrderByAggregateInput = {
    id?: SortOrder
    progressId?: SortOrder
    cloudinaryPublicId?: SortOrder
    secureUrl?: SortOrder
    resourceType?: SortOrder
    originalFilename?: SortOrder
    bytes?: SortOrder
    uploadedById?: SortOrder
    createdAt?: SortOrder
  }

  export type YmqProgressEvidenceSumOrderByAggregateInput = {
    bytes?: SortOrder
  }

  export type YmqGroupCreateNestedManyWithoutPembinaInput = {
    create?: XOR<YmqGroupCreateWithoutPembinaInput, YmqGroupUncheckedCreateWithoutPembinaInput> | YmqGroupCreateWithoutPembinaInput[] | YmqGroupUncheckedCreateWithoutPembinaInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutPembinaInput | YmqGroupCreateOrConnectWithoutPembinaInput[]
    createMany?: YmqGroupCreateManyPembinaInputEnvelope
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
  }

  export type YmqMemberCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput> | YmqMemberCreateWithoutUserInput[] | YmqMemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutUserInput | YmqMemberCreateOrConnectWithoutUserInput[]
    createMany?: YmqMemberCreateManyUserInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type YmqGroupAdminAssignmentCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutUserInput, YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput> | YmqGroupAdminAssignmentCreateWithoutUserInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput | YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyUserInputEnvelope
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
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

  export type YmqGroupUncheckedCreateNestedManyWithoutPembinaInput = {
    create?: XOR<YmqGroupCreateWithoutPembinaInput, YmqGroupUncheckedCreateWithoutPembinaInput> | YmqGroupCreateWithoutPembinaInput[] | YmqGroupUncheckedCreateWithoutPembinaInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutPembinaInput | YmqGroupCreateOrConnectWithoutPembinaInput[]
    createMany?: YmqGroupCreateManyPembinaInputEnvelope
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
  }

  export type YmqMemberUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput> | YmqMemberCreateWithoutUserInput[] | YmqMemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutUserInput | YmqMemberCreateOrConnectWithoutUserInput[]
    createMany?: YmqMemberCreateManyUserInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutUserInput, YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput> | YmqGroupAdminAssignmentCreateWithoutUserInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput | YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyUserInputEnvelope
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
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

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type YmqGroupUpdateManyWithoutPembinaNestedInput = {
    create?: XOR<YmqGroupCreateWithoutPembinaInput, YmqGroupUncheckedCreateWithoutPembinaInput> | YmqGroupCreateWithoutPembinaInput[] | YmqGroupUncheckedCreateWithoutPembinaInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutPembinaInput | YmqGroupCreateOrConnectWithoutPembinaInput[]
    upsert?: YmqGroupUpsertWithWhereUniqueWithoutPembinaInput | YmqGroupUpsertWithWhereUniqueWithoutPembinaInput[]
    createMany?: YmqGroupCreateManyPembinaInputEnvelope
    set?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    disconnect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    delete?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    update?: YmqGroupUpdateWithWhereUniqueWithoutPembinaInput | YmqGroupUpdateWithWhereUniqueWithoutPembinaInput[]
    updateMany?: YmqGroupUpdateManyWithWhereWithoutPembinaInput | YmqGroupUpdateManyWithWhereWithoutPembinaInput[]
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

  export type YmqGroupAdminAssignmentUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutUserInput, YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput> | YmqGroupAdminAssignmentCreateWithoutUserInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput | YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput[]
    upsert?: YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutUserInput | YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyUserInputEnvelope
    set?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    disconnect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    delete?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    update?: YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutUserInput | YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqGroupAdminAssignmentUpdateManyWithWhereWithoutUserInput | YmqGroupAdminAssignmentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqGroupAdminAssignmentScalarWhereInput | YmqGroupAdminAssignmentScalarWhereInput[]
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

  export type YmqGroupUncheckedUpdateManyWithoutPembinaNestedInput = {
    create?: XOR<YmqGroupCreateWithoutPembinaInput, YmqGroupUncheckedCreateWithoutPembinaInput> | YmqGroupCreateWithoutPembinaInput[] | YmqGroupUncheckedCreateWithoutPembinaInput[]
    connectOrCreate?: YmqGroupCreateOrConnectWithoutPembinaInput | YmqGroupCreateOrConnectWithoutPembinaInput[]
    upsert?: YmqGroupUpsertWithWhereUniqueWithoutPembinaInput | YmqGroupUpsertWithWhereUniqueWithoutPembinaInput[]
    createMany?: YmqGroupCreateManyPembinaInputEnvelope
    set?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    disconnect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    delete?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    connect?: YmqGroupWhereUniqueInput | YmqGroupWhereUniqueInput[]
    update?: YmqGroupUpdateWithWhereUniqueWithoutPembinaInput | YmqGroupUpdateWithWhereUniqueWithoutPembinaInput[]
    updateMany?: YmqGroupUpdateManyWithWhereWithoutPembinaInput | YmqGroupUpdateManyWithWhereWithoutPembinaInput[]
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

  export type YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutUserInput, YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput> | YmqGroupAdminAssignmentCreateWithoutUserInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput | YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput[]
    upsert?: YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutUserInput | YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyUserInputEnvelope
    set?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    disconnect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    delete?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    update?: YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutUserInput | YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: YmqGroupAdminAssignmentUpdateManyWithWhereWithoutUserInput | YmqGroupAdminAssignmentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: YmqGroupAdminAssignmentScalarWhereInput | YmqGroupAdminAssignmentScalarWhereInput[]
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

  export type UserCreateNestedOneWithoutGroupsAsPembinaInput = {
    create?: XOR<UserCreateWithoutGroupsAsPembinaInput, UserUncheckedCreateWithoutGroupsAsPembinaInput>
    connectOrCreate?: UserCreateOrConnectWithoutGroupsAsPembinaInput
    connect?: UserWhereUniqueInput
  }

  export type YmqMemberCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput> | YmqMemberCreateWithoutGroupInput[] | YmqMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutGroupInput | YmqMemberCreateOrConnectWithoutGroupInput[]
    createMany?: YmqMemberCreateManyGroupInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type YmqGroupAdminAssignmentCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput> | YmqGroupAdminAssignmentCreateWithoutGroupInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput | YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyGroupInputEnvelope
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
  }

  export type YmqLearningSessionCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqLearningSessionCreateWithoutGroupInput, YmqLearningSessionUncheckedCreateWithoutGroupInput> | YmqLearningSessionCreateWithoutGroupInput[] | YmqLearningSessionUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutGroupInput | YmqLearningSessionCreateOrConnectWithoutGroupInput[]
    createMany?: YmqLearningSessionCreateManyGroupInputEnvelope
    connect?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
  }

  export type YmqMemberUncheckedCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput> | YmqMemberCreateWithoutGroupInput[] | YmqMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqMemberCreateOrConnectWithoutGroupInput | YmqMemberCreateOrConnectWithoutGroupInput[]
    createMany?: YmqMemberCreateManyGroupInputEnvelope
    connect?: YmqMemberWhereUniqueInput | YmqMemberWhereUniqueInput[]
  }

  export type YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput> | YmqGroupAdminAssignmentCreateWithoutGroupInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput | YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyGroupInputEnvelope
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
  }

  export type YmqLearningSessionUncheckedCreateNestedManyWithoutGroupInput = {
    create?: XOR<YmqLearningSessionCreateWithoutGroupInput, YmqLearningSessionUncheckedCreateWithoutGroupInput> | YmqLearningSessionCreateWithoutGroupInput[] | YmqLearningSessionUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutGroupInput | YmqLearningSessionCreateOrConnectWithoutGroupInput[]
    createMany?: YmqLearningSessionCreateManyGroupInputEnvelope
    connect?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
  }

  export type NullableEnumYmqGroupLevelFieldUpdateOperationsInput = {
    set?: $Enums.YmqGroupLevel | null
  }

  export type UserUpdateOneWithoutGroupsAsPembinaNestedInput = {
    create?: XOR<UserCreateWithoutGroupsAsPembinaInput, UserUncheckedCreateWithoutGroupsAsPembinaInput>
    connectOrCreate?: UserCreateOrConnectWithoutGroupsAsPembinaInput
    upsert?: UserUpsertWithoutGroupsAsPembinaInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGroupsAsPembinaInput, UserUpdateWithoutGroupsAsPembinaInput>, UserUncheckedUpdateWithoutGroupsAsPembinaInput>
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

  export type YmqGroupAdminAssignmentUpdateManyWithoutGroupNestedInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput> | YmqGroupAdminAssignmentCreateWithoutGroupInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput | YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput[]
    upsert?: YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutGroupInput | YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyGroupInputEnvelope
    set?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    disconnect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    delete?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    update?: YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutGroupInput | YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: YmqGroupAdminAssignmentUpdateManyWithWhereWithoutGroupInput | YmqGroupAdminAssignmentUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: YmqGroupAdminAssignmentScalarWhereInput | YmqGroupAdminAssignmentScalarWhereInput[]
  }

  export type YmqLearningSessionUpdateManyWithoutGroupNestedInput = {
    create?: XOR<YmqLearningSessionCreateWithoutGroupInput, YmqLearningSessionUncheckedCreateWithoutGroupInput> | YmqLearningSessionCreateWithoutGroupInput[] | YmqLearningSessionUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutGroupInput | YmqLearningSessionCreateOrConnectWithoutGroupInput[]
    upsert?: YmqLearningSessionUpsertWithWhereUniqueWithoutGroupInput | YmqLearningSessionUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: YmqLearningSessionCreateManyGroupInputEnvelope
    set?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    disconnect?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    delete?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    connect?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    update?: YmqLearningSessionUpdateWithWhereUniqueWithoutGroupInput | YmqLearningSessionUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: YmqLearningSessionUpdateManyWithWhereWithoutGroupInput | YmqLearningSessionUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: YmqLearningSessionScalarWhereInput | YmqLearningSessionScalarWhereInput[]
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

  export type YmqGroupAdminAssignmentUncheckedUpdateManyWithoutGroupNestedInput = {
    create?: XOR<YmqGroupAdminAssignmentCreateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput> | YmqGroupAdminAssignmentCreateWithoutGroupInput[] | YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput | YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput[]
    upsert?: YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutGroupInput | YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: YmqGroupAdminAssignmentCreateManyGroupInputEnvelope
    set?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    disconnect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    delete?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    connect?: YmqGroupAdminAssignmentWhereUniqueInput | YmqGroupAdminAssignmentWhereUniqueInput[]
    update?: YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutGroupInput | YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: YmqGroupAdminAssignmentUpdateManyWithWhereWithoutGroupInput | YmqGroupAdminAssignmentUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: YmqGroupAdminAssignmentScalarWhereInput | YmqGroupAdminAssignmentScalarWhereInput[]
  }

  export type YmqLearningSessionUncheckedUpdateManyWithoutGroupNestedInput = {
    create?: XOR<YmqLearningSessionCreateWithoutGroupInput, YmqLearningSessionUncheckedCreateWithoutGroupInput> | YmqLearningSessionCreateWithoutGroupInput[] | YmqLearningSessionUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutGroupInput | YmqLearningSessionCreateOrConnectWithoutGroupInput[]
    upsert?: YmqLearningSessionUpsertWithWhereUniqueWithoutGroupInput | YmqLearningSessionUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: YmqLearningSessionCreateManyGroupInputEnvelope
    set?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    disconnect?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    delete?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    connect?: YmqLearningSessionWhereUniqueInput | YmqLearningSessionWhereUniqueInput[]
    update?: YmqLearningSessionUpdateWithWhereUniqueWithoutGroupInput | YmqLearningSessionUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: YmqLearningSessionUpdateManyWithWhereWithoutGroupInput | YmqLearningSessionUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: YmqLearningSessionScalarWhereInput | YmqLearningSessionScalarWhereInput[]
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

  export type YmqSessionAttendanceCreateNestedManyWithoutMemberInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutMemberInput, YmqSessionAttendanceUncheckedCreateWithoutMemberInput> | YmqSessionAttendanceCreateWithoutMemberInput[] | YmqSessionAttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutMemberInput | YmqSessionAttendanceCreateOrConnectWithoutMemberInput[]
    createMany?: YmqSessionAttendanceCreateManyMemberInputEnvelope
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
  }

  export type YmqLearningProgressCreateNestedManyWithoutMemberInput = {
    create?: XOR<YmqLearningProgressCreateWithoutMemberInput, YmqLearningProgressUncheckedCreateWithoutMemberInput> | YmqLearningProgressCreateWithoutMemberInput[] | YmqLearningProgressUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutMemberInput | YmqLearningProgressCreateOrConnectWithoutMemberInput[]
    createMany?: YmqLearningProgressCreateManyMemberInputEnvelope
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
  }

  export type YmqSessionAttendanceUncheckedCreateNestedManyWithoutMemberInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutMemberInput, YmqSessionAttendanceUncheckedCreateWithoutMemberInput> | YmqSessionAttendanceCreateWithoutMemberInput[] | YmqSessionAttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutMemberInput | YmqSessionAttendanceCreateOrConnectWithoutMemberInput[]
    createMany?: YmqSessionAttendanceCreateManyMemberInputEnvelope
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
  }

  export type YmqLearningProgressUncheckedCreateNestedManyWithoutMemberInput = {
    create?: XOR<YmqLearningProgressCreateWithoutMemberInput, YmqLearningProgressUncheckedCreateWithoutMemberInput> | YmqLearningProgressCreateWithoutMemberInput[] | YmqLearningProgressUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutMemberInput | YmqLearningProgressCreateOrConnectWithoutMemberInput[]
    createMany?: YmqLearningProgressCreateManyMemberInputEnvelope
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
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

  export type YmqSessionAttendanceUpdateManyWithoutMemberNestedInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutMemberInput, YmqSessionAttendanceUncheckedCreateWithoutMemberInput> | YmqSessionAttendanceCreateWithoutMemberInput[] | YmqSessionAttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutMemberInput | YmqSessionAttendanceCreateOrConnectWithoutMemberInput[]
    upsert?: YmqSessionAttendanceUpsertWithWhereUniqueWithoutMemberInput | YmqSessionAttendanceUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: YmqSessionAttendanceCreateManyMemberInputEnvelope
    set?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    disconnect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    delete?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    update?: YmqSessionAttendanceUpdateWithWhereUniqueWithoutMemberInput | YmqSessionAttendanceUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: YmqSessionAttendanceUpdateManyWithWhereWithoutMemberInput | YmqSessionAttendanceUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: YmqSessionAttendanceScalarWhereInput | YmqSessionAttendanceScalarWhereInput[]
  }

  export type YmqLearningProgressUpdateManyWithoutMemberNestedInput = {
    create?: XOR<YmqLearningProgressCreateWithoutMemberInput, YmqLearningProgressUncheckedCreateWithoutMemberInput> | YmqLearningProgressCreateWithoutMemberInput[] | YmqLearningProgressUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutMemberInput | YmqLearningProgressCreateOrConnectWithoutMemberInput[]
    upsert?: YmqLearningProgressUpsertWithWhereUniqueWithoutMemberInput | YmqLearningProgressUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: YmqLearningProgressCreateManyMemberInputEnvelope
    set?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    disconnect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    delete?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    update?: YmqLearningProgressUpdateWithWhereUniqueWithoutMemberInput | YmqLearningProgressUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: YmqLearningProgressUpdateManyWithWhereWithoutMemberInput | YmqLearningProgressUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
  }

  export type YmqSessionAttendanceUncheckedUpdateManyWithoutMemberNestedInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutMemberInput, YmqSessionAttendanceUncheckedCreateWithoutMemberInput> | YmqSessionAttendanceCreateWithoutMemberInput[] | YmqSessionAttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutMemberInput | YmqSessionAttendanceCreateOrConnectWithoutMemberInput[]
    upsert?: YmqSessionAttendanceUpsertWithWhereUniqueWithoutMemberInput | YmqSessionAttendanceUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: YmqSessionAttendanceCreateManyMemberInputEnvelope
    set?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    disconnect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    delete?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    update?: YmqSessionAttendanceUpdateWithWhereUniqueWithoutMemberInput | YmqSessionAttendanceUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: YmqSessionAttendanceUpdateManyWithWhereWithoutMemberInput | YmqSessionAttendanceUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: YmqSessionAttendanceScalarWhereInput | YmqSessionAttendanceScalarWhereInput[]
  }

  export type YmqLearningProgressUncheckedUpdateManyWithoutMemberNestedInput = {
    create?: XOR<YmqLearningProgressCreateWithoutMemberInput, YmqLearningProgressUncheckedCreateWithoutMemberInput> | YmqLearningProgressCreateWithoutMemberInput[] | YmqLearningProgressUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutMemberInput | YmqLearningProgressCreateOrConnectWithoutMemberInput[]
    upsert?: YmqLearningProgressUpsertWithWhereUniqueWithoutMemberInput | YmqLearningProgressUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: YmqLearningProgressCreateManyMemberInputEnvelope
    set?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    disconnect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    delete?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    update?: YmqLearningProgressUpdateWithWhereUniqueWithoutMemberInput | YmqLearningProgressUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: YmqLearningProgressUpdateManyWithWhereWithoutMemberInput | YmqLearningProgressUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
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

  export type YmqLearningProgressCreateNestedManyWithoutIwrCurriculumUnitInput = {
    create?: XOR<YmqLearningProgressCreateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput> | YmqLearningProgressCreateWithoutIwrCurriculumUnitInput[] | YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput | YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput[]
    createMany?: YmqLearningProgressCreateManyIwrCurriculumUnitInputEnvelope
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
  }

  export type YmqLearningProgressUncheckedCreateNestedManyWithoutIwrCurriculumUnitInput = {
    create?: XOR<YmqLearningProgressCreateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput> | YmqLearningProgressCreateWithoutIwrCurriculumUnitInput[] | YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput | YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput[]
    createMany?: YmqLearningProgressCreateManyIwrCurriculumUnitInputEnvelope
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
  }

  export type EnumIwrLevelFieldUpdateOperationsInput = {
    set?: $Enums.IwrLevel
  }

  export type YmqLearningProgressUpdateManyWithoutIwrCurriculumUnitNestedInput = {
    create?: XOR<YmqLearningProgressCreateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput> | YmqLearningProgressCreateWithoutIwrCurriculumUnitInput[] | YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput | YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput[]
    upsert?: YmqLearningProgressUpsertWithWhereUniqueWithoutIwrCurriculumUnitInput | YmqLearningProgressUpsertWithWhereUniqueWithoutIwrCurriculumUnitInput[]
    createMany?: YmqLearningProgressCreateManyIwrCurriculumUnitInputEnvelope
    set?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    disconnect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    delete?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    update?: YmqLearningProgressUpdateWithWhereUniqueWithoutIwrCurriculumUnitInput | YmqLearningProgressUpdateWithWhereUniqueWithoutIwrCurriculumUnitInput[]
    updateMany?: YmqLearningProgressUpdateManyWithWhereWithoutIwrCurriculumUnitInput | YmqLearningProgressUpdateManyWithWhereWithoutIwrCurriculumUnitInput[]
    deleteMany?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
  }

  export type YmqLearningProgressUncheckedUpdateManyWithoutIwrCurriculumUnitNestedInput = {
    create?: XOR<YmqLearningProgressCreateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput> | YmqLearningProgressCreateWithoutIwrCurriculumUnitInput[] | YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput | YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput[]
    upsert?: YmqLearningProgressUpsertWithWhereUniqueWithoutIwrCurriculumUnitInput | YmqLearningProgressUpsertWithWhereUniqueWithoutIwrCurriculumUnitInput[]
    createMany?: YmqLearningProgressCreateManyIwrCurriculumUnitInputEnvelope
    set?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    disconnect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    delete?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    update?: YmqLearningProgressUpdateWithWhereUniqueWithoutIwrCurriculumUnitInput | YmqLearningProgressUpdateWithWhereUniqueWithoutIwrCurriculumUnitInput[]
    updateMany?: YmqLearningProgressUpdateManyWithWhereWithoutIwrCurriculumUnitInput | YmqLearningProgressUpdateManyWithWhereWithoutIwrCurriculumUnitInput[]
    deleteMany?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
  }

  export type YmqGroupCreateNestedOneWithoutGroupAdminsInput = {
    create?: XOR<YmqGroupCreateWithoutGroupAdminsInput, YmqGroupUncheckedCreateWithoutGroupAdminsInput>
    connectOrCreate?: YmqGroupCreateOrConnectWithoutGroupAdminsInput
    connect?: YmqGroupWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutGroupAdminAssignmentsInput = {
    create?: XOR<UserCreateWithoutGroupAdminAssignmentsInput, UserUncheckedCreateWithoutGroupAdminAssignmentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGroupAdminAssignmentsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumYmqGroupStaffRoleFieldUpdateOperationsInput = {
    set?: $Enums.YmqGroupStaffRole
  }

  export type YmqGroupUpdateOneRequiredWithoutGroupAdminsNestedInput = {
    create?: XOR<YmqGroupCreateWithoutGroupAdminsInput, YmqGroupUncheckedCreateWithoutGroupAdminsInput>
    connectOrCreate?: YmqGroupCreateOrConnectWithoutGroupAdminsInput
    upsert?: YmqGroupUpsertWithoutGroupAdminsInput
    connect?: YmqGroupWhereUniqueInput
    update?: XOR<XOR<YmqGroupUpdateToOneWithWhereWithoutGroupAdminsInput, YmqGroupUpdateWithoutGroupAdminsInput>, YmqGroupUncheckedUpdateWithoutGroupAdminsInput>
  }

  export type UserUpdateOneRequiredWithoutGroupAdminAssignmentsNestedInput = {
    create?: XOR<UserCreateWithoutGroupAdminAssignmentsInput, UserUncheckedCreateWithoutGroupAdminAssignmentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGroupAdminAssignmentsInput
    upsert?: UserUpsertWithoutGroupAdminAssignmentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGroupAdminAssignmentsInput, UserUpdateWithoutGroupAdminAssignmentsInput>, UserUncheckedUpdateWithoutGroupAdminAssignmentsInput>
  }

  export type YmqGroupCreateNestedOneWithoutLearningSessionsInput = {
    create?: XOR<YmqGroupCreateWithoutLearningSessionsInput, YmqGroupUncheckedCreateWithoutLearningSessionsInput>
    connectOrCreate?: YmqGroupCreateOrConnectWithoutLearningSessionsInput
    connect?: YmqGroupWhereUniqueInput
  }

  export type YmqSessionAttendanceCreateNestedManyWithoutSessionInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutSessionInput, YmqSessionAttendanceUncheckedCreateWithoutSessionInput> | YmqSessionAttendanceCreateWithoutSessionInput[] | YmqSessionAttendanceUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutSessionInput | YmqSessionAttendanceCreateOrConnectWithoutSessionInput[]
    createMany?: YmqSessionAttendanceCreateManySessionInputEnvelope
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
  }

  export type YmqLearningProgressCreateNestedManyWithoutSessionInput = {
    create?: XOR<YmqLearningProgressCreateWithoutSessionInput, YmqLearningProgressUncheckedCreateWithoutSessionInput> | YmqLearningProgressCreateWithoutSessionInput[] | YmqLearningProgressUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutSessionInput | YmqLearningProgressCreateOrConnectWithoutSessionInput[]
    createMany?: YmqLearningProgressCreateManySessionInputEnvelope
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
  }

  export type YmqSessionAttendanceUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutSessionInput, YmqSessionAttendanceUncheckedCreateWithoutSessionInput> | YmqSessionAttendanceCreateWithoutSessionInput[] | YmqSessionAttendanceUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutSessionInput | YmqSessionAttendanceCreateOrConnectWithoutSessionInput[]
    createMany?: YmqSessionAttendanceCreateManySessionInputEnvelope
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
  }

  export type YmqLearningProgressUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<YmqLearningProgressCreateWithoutSessionInput, YmqLearningProgressUncheckedCreateWithoutSessionInput> | YmqLearningProgressCreateWithoutSessionInput[] | YmqLearningProgressUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutSessionInput | YmqLearningProgressCreateOrConnectWithoutSessionInput[]
    createMany?: YmqLearningProgressCreateManySessionInputEnvelope
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
  }

  export type YmqGroupUpdateOneRequiredWithoutLearningSessionsNestedInput = {
    create?: XOR<YmqGroupCreateWithoutLearningSessionsInput, YmqGroupUncheckedCreateWithoutLearningSessionsInput>
    connectOrCreate?: YmqGroupCreateOrConnectWithoutLearningSessionsInput
    upsert?: YmqGroupUpsertWithoutLearningSessionsInput
    connect?: YmqGroupWhereUniqueInput
    update?: XOR<XOR<YmqGroupUpdateToOneWithWhereWithoutLearningSessionsInput, YmqGroupUpdateWithoutLearningSessionsInput>, YmqGroupUncheckedUpdateWithoutLearningSessionsInput>
  }

  export type YmqSessionAttendanceUpdateManyWithoutSessionNestedInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutSessionInput, YmqSessionAttendanceUncheckedCreateWithoutSessionInput> | YmqSessionAttendanceCreateWithoutSessionInput[] | YmqSessionAttendanceUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutSessionInput | YmqSessionAttendanceCreateOrConnectWithoutSessionInput[]
    upsert?: YmqSessionAttendanceUpsertWithWhereUniqueWithoutSessionInput | YmqSessionAttendanceUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: YmqSessionAttendanceCreateManySessionInputEnvelope
    set?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    disconnect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    delete?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    update?: YmqSessionAttendanceUpdateWithWhereUniqueWithoutSessionInput | YmqSessionAttendanceUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: YmqSessionAttendanceUpdateManyWithWhereWithoutSessionInput | YmqSessionAttendanceUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: YmqSessionAttendanceScalarWhereInput | YmqSessionAttendanceScalarWhereInput[]
  }

  export type YmqLearningProgressUpdateManyWithoutSessionNestedInput = {
    create?: XOR<YmqLearningProgressCreateWithoutSessionInput, YmqLearningProgressUncheckedCreateWithoutSessionInput> | YmqLearningProgressCreateWithoutSessionInput[] | YmqLearningProgressUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutSessionInput | YmqLearningProgressCreateOrConnectWithoutSessionInput[]
    upsert?: YmqLearningProgressUpsertWithWhereUniqueWithoutSessionInput | YmqLearningProgressUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: YmqLearningProgressCreateManySessionInputEnvelope
    set?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    disconnect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    delete?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    update?: YmqLearningProgressUpdateWithWhereUniqueWithoutSessionInput | YmqLearningProgressUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: YmqLearningProgressUpdateManyWithWhereWithoutSessionInput | YmqLearningProgressUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
  }

  export type YmqSessionAttendanceUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<YmqSessionAttendanceCreateWithoutSessionInput, YmqSessionAttendanceUncheckedCreateWithoutSessionInput> | YmqSessionAttendanceCreateWithoutSessionInput[] | YmqSessionAttendanceUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqSessionAttendanceCreateOrConnectWithoutSessionInput | YmqSessionAttendanceCreateOrConnectWithoutSessionInput[]
    upsert?: YmqSessionAttendanceUpsertWithWhereUniqueWithoutSessionInput | YmqSessionAttendanceUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: YmqSessionAttendanceCreateManySessionInputEnvelope
    set?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    disconnect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    delete?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    connect?: YmqSessionAttendanceWhereUniqueInput | YmqSessionAttendanceWhereUniqueInput[]
    update?: YmqSessionAttendanceUpdateWithWhereUniqueWithoutSessionInput | YmqSessionAttendanceUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: YmqSessionAttendanceUpdateManyWithWhereWithoutSessionInput | YmqSessionAttendanceUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: YmqSessionAttendanceScalarWhereInput | YmqSessionAttendanceScalarWhereInput[]
  }

  export type YmqLearningProgressUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<YmqLearningProgressCreateWithoutSessionInput, YmqLearningProgressUncheckedCreateWithoutSessionInput> | YmqLearningProgressCreateWithoutSessionInput[] | YmqLearningProgressUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutSessionInput | YmqLearningProgressCreateOrConnectWithoutSessionInput[]
    upsert?: YmqLearningProgressUpsertWithWhereUniqueWithoutSessionInput | YmqLearningProgressUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: YmqLearningProgressCreateManySessionInputEnvelope
    set?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    disconnect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    delete?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    connect?: YmqLearningProgressWhereUniqueInput | YmqLearningProgressWhereUniqueInput[]
    update?: YmqLearningProgressUpdateWithWhereUniqueWithoutSessionInput | YmqLearningProgressUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: YmqLearningProgressUpdateManyWithWhereWithoutSessionInput | YmqLearningProgressUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
  }

  export type YmqLearningSessionCreateNestedOneWithoutAttendanceInput = {
    create?: XOR<YmqLearningSessionCreateWithoutAttendanceInput, YmqLearningSessionUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutAttendanceInput
    connect?: YmqLearningSessionWhereUniqueInput
  }

  export type YmqMemberCreateNestedOneWithoutAttendanceInput = {
    create?: XOR<YmqMemberCreateWithoutAttendanceInput, YmqMemberUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: YmqMemberCreateOrConnectWithoutAttendanceInput
    connect?: YmqMemberWhereUniqueInput
  }

  export type EnumAttendanceStatusFieldUpdateOperationsInput = {
    set?: $Enums.AttendanceStatus
  }

  export type YmqLearningSessionUpdateOneRequiredWithoutAttendanceNestedInput = {
    create?: XOR<YmqLearningSessionCreateWithoutAttendanceInput, YmqLearningSessionUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutAttendanceInput
    upsert?: YmqLearningSessionUpsertWithoutAttendanceInput
    connect?: YmqLearningSessionWhereUniqueInput
    update?: XOR<XOR<YmqLearningSessionUpdateToOneWithWhereWithoutAttendanceInput, YmqLearningSessionUpdateWithoutAttendanceInput>, YmqLearningSessionUncheckedUpdateWithoutAttendanceInput>
  }

  export type YmqMemberUpdateOneRequiredWithoutAttendanceNestedInput = {
    create?: XOR<YmqMemberCreateWithoutAttendanceInput, YmqMemberUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: YmqMemberCreateOrConnectWithoutAttendanceInput
    upsert?: YmqMemberUpsertWithoutAttendanceInput
    connect?: YmqMemberWhereUniqueInput
    update?: XOR<XOR<YmqMemberUpdateToOneWithWhereWithoutAttendanceInput, YmqMemberUpdateWithoutAttendanceInput>, YmqMemberUncheckedUpdateWithoutAttendanceInput>
  }

  export type YmqLearningSessionCreateNestedOneWithoutProgressInput = {
    create?: XOR<YmqLearningSessionCreateWithoutProgressInput, YmqLearningSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutProgressInput
    connect?: YmqLearningSessionWhereUniqueInput
  }

  export type YmqMemberCreateNestedOneWithoutProgressInput = {
    create?: XOR<YmqMemberCreateWithoutProgressInput, YmqMemberUncheckedCreateWithoutProgressInput>
    connectOrCreate?: YmqMemberCreateOrConnectWithoutProgressInput
    connect?: YmqMemberWhereUniqueInput
  }

  export type YmqIwrCurriculumUnitCreateNestedOneWithoutProgressInput = {
    create?: XOR<YmqIwrCurriculumUnitCreateWithoutProgressInput, YmqIwrCurriculumUnitUncheckedCreateWithoutProgressInput>
    connectOrCreate?: YmqIwrCurriculumUnitCreateOrConnectWithoutProgressInput
    connect?: YmqIwrCurriculumUnitWhereUniqueInput
  }

  export type YmqProgressEvidenceCreateNestedManyWithoutProgressInput = {
    create?: XOR<YmqProgressEvidenceCreateWithoutProgressInput, YmqProgressEvidenceUncheckedCreateWithoutProgressInput> | YmqProgressEvidenceCreateWithoutProgressInput[] | YmqProgressEvidenceUncheckedCreateWithoutProgressInput[]
    connectOrCreate?: YmqProgressEvidenceCreateOrConnectWithoutProgressInput | YmqProgressEvidenceCreateOrConnectWithoutProgressInput[]
    createMany?: YmqProgressEvidenceCreateManyProgressInputEnvelope
    connect?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
  }

  export type YmqProgressEvidenceUncheckedCreateNestedManyWithoutProgressInput = {
    create?: XOR<YmqProgressEvidenceCreateWithoutProgressInput, YmqProgressEvidenceUncheckedCreateWithoutProgressInput> | YmqProgressEvidenceCreateWithoutProgressInput[] | YmqProgressEvidenceUncheckedCreateWithoutProgressInput[]
    connectOrCreate?: YmqProgressEvidenceCreateOrConnectWithoutProgressInput | YmqProgressEvidenceCreateOrConnectWithoutProgressInput[]
    createMany?: YmqProgressEvidenceCreateManyProgressInputEnvelope
    connect?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
  }

  export type EnumLearningTrackFieldUpdateOperationsInput = {
    set?: $Enums.LearningTrack
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type YmqLearningSessionUpdateOneRequiredWithoutProgressNestedInput = {
    create?: XOR<YmqLearningSessionCreateWithoutProgressInput, YmqLearningSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: YmqLearningSessionCreateOrConnectWithoutProgressInput
    upsert?: YmqLearningSessionUpsertWithoutProgressInput
    connect?: YmqLearningSessionWhereUniqueInput
    update?: XOR<XOR<YmqLearningSessionUpdateToOneWithWhereWithoutProgressInput, YmqLearningSessionUpdateWithoutProgressInput>, YmqLearningSessionUncheckedUpdateWithoutProgressInput>
  }

  export type YmqMemberUpdateOneRequiredWithoutProgressNestedInput = {
    create?: XOR<YmqMemberCreateWithoutProgressInput, YmqMemberUncheckedCreateWithoutProgressInput>
    connectOrCreate?: YmqMemberCreateOrConnectWithoutProgressInput
    upsert?: YmqMemberUpsertWithoutProgressInput
    connect?: YmqMemberWhereUniqueInput
    update?: XOR<XOR<YmqMemberUpdateToOneWithWhereWithoutProgressInput, YmqMemberUpdateWithoutProgressInput>, YmqMemberUncheckedUpdateWithoutProgressInput>
  }

  export type YmqIwrCurriculumUnitUpdateOneWithoutProgressNestedInput = {
    create?: XOR<YmqIwrCurriculumUnitCreateWithoutProgressInput, YmqIwrCurriculumUnitUncheckedCreateWithoutProgressInput>
    connectOrCreate?: YmqIwrCurriculumUnitCreateOrConnectWithoutProgressInput
    upsert?: YmqIwrCurriculumUnitUpsertWithoutProgressInput
    disconnect?: YmqIwrCurriculumUnitWhereInput | boolean
    delete?: YmqIwrCurriculumUnitWhereInput | boolean
    connect?: YmqIwrCurriculumUnitWhereUniqueInput
    update?: XOR<XOR<YmqIwrCurriculumUnitUpdateToOneWithWhereWithoutProgressInput, YmqIwrCurriculumUnitUpdateWithoutProgressInput>, YmqIwrCurriculumUnitUncheckedUpdateWithoutProgressInput>
  }

  export type YmqProgressEvidenceUpdateManyWithoutProgressNestedInput = {
    create?: XOR<YmqProgressEvidenceCreateWithoutProgressInput, YmqProgressEvidenceUncheckedCreateWithoutProgressInput> | YmqProgressEvidenceCreateWithoutProgressInput[] | YmqProgressEvidenceUncheckedCreateWithoutProgressInput[]
    connectOrCreate?: YmqProgressEvidenceCreateOrConnectWithoutProgressInput | YmqProgressEvidenceCreateOrConnectWithoutProgressInput[]
    upsert?: YmqProgressEvidenceUpsertWithWhereUniqueWithoutProgressInput | YmqProgressEvidenceUpsertWithWhereUniqueWithoutProgressInput[]
    createMany?: YmqProgressEvidenceCreateManyProgressInputEnvelope
    set?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    disconnect?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    delete?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    connect?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    update?: YmqProgressEvidenceUpdateWithWhereUniqueWithoutProgressInput | YmqProgressEvidenceUpdateWithWhereUniqueWithoutProgressInput[]
    updateMany?: YmqProgressEvidenceUpdateManyWithWhereWithoutProgressInput | YmqProgressEvidenceUpdateManyWithWhereWithoutProgressInput[]
    deleteMany?: YmqProgressEvidenceScalarWhereInput | YmqProgressEvidenceScalarWhereInput[]
  }

  export type YmqProgressEvidenceUncheckedUpdateManyWithoutProgressNestedInput = {
    create?: XOR<YmqProgressEvidenceCreateWithoutProgressInput, YmqProgressEvidenceUncheckedCreateWithoutProgressInput> | YmqProgressEvidenceCreateWithoutProgressInput[] | YmqProgressEvidenceUncheckedCreateWithoutProgressInput[]
    connectOrCreate?: YmqProgressEvidenceCreateOrConnectWithoutProgressInput | YmqProgressEvidenceCreateOrConnectWithoutProgressInput[]
    upsert?: YmqProgressEvidenceUpsertWithWhereUniqueWithoutProgressInput | YmqProgressEvidenceUpsertWithWhereUniqueWithoutProgressInput[]
    createMany?: YmqProgressEvidenceCreateManyProgressInputEnvelope
    set?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    disconnect?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    delete?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    connect?: YmqProgressEvidenceWhereUniqueInput | YmqProgressEvidenceWhereUniqueInput[]
    update?: YmqProgressEvidenceUpdateWithWhereUniqueWithoutProgressInput | YmqProgressEvidenceUpdateWithWhereUniqueWithoutProgressInput[]
    updateMany?: YmqProgressEvidenceUpdateManyWithWhereWithoutProgressInput | YmqProgressEvidenceUpdateManyWithWhereWithoutProgressInput[]
    deleteMany?: YmqProgressEvidenceScalarWhereInput | YmqProgressEvidenceScalarWhereInput[]
  }

  export type YmqLearningProgressCreateNestedOneWithoutEvidenceInput = {
    create?: XOR<YmqLearningProgressCreateWithoutEvidenceInput, YmqLearningProgressUncheckedCreateWithoutEvidenceInput>
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutEvidenceInput
    connect?: YmqLearningProgressWhereUniqueInput
  }

  export type YmqLearningProgressUpdateOneRequiredWithoutEvidenceNestedInput = {
    create?: XOR<YmqLearningProgressCreateWithoutEvidenceInput, YmqLearningProgressUncheckedCreateWithoutEvidenceInput>
    connectOrCreate?: YmqLearningProgressCreateOrConnectWithoutEvidenceInput
    upsert?: YmqLearningProgressUpsertWithoutEvidenceInput
    connect?: YmqLearningProgressWhereUniqueInput
    update?: XOR<XOR<YmqLearningProgressUpdateToOneWithWhereWithoutEvidenceInput, YmqLearningProgressUpdateWithoutEvidenceInput>, YmqLearningProgressUncheckedUpdateWithoutEvidenceInput>
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

  export type NestedEnumYmqGroupLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupLevel | EnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumYmqGroupLevelNullableFilter<$PrismaModel> | $Enums.YmqGroupLevel | null
  }

  export type NestedEnumYmqGroupLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupLevel | EnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.YmqGroupLevel[] | ListEnumYmqGroupLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumYmqGroupLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.YmqGroupLevel | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumYmqGroupLevelNullableFilter<$PrismaModel>
    _max?: NestedEnumYmqGroupLevelNullableFilter<$PrismaModel>
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

  export type NestedEnumIwrLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.IwrLevel | EnumIwrLevelFieldRefInput<$PrismaModel>
    in?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumIwrLevelFilter<$PrismaModel> | $Enums.IwrLevel
  }

  export type NestedEnumIwrLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IwrLevel | EnumIwrLevelFieldRefInput<$PrismaModel>
    in?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.IwrLevel[] | ListEnumIwrLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumIwrLevelWithAggregatesFilter<$PrismaModel> | $Enums.IwrLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIwrLevelFilter<$PrismaModel>
    _max?: NestedEnumIwrLevelFilter<$PrismaModel>
  }

  export type NestedEnumYmqGroupStaffRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupStaffRole | EnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumYmqGroupStaffRoleFilter<$PrismaModel> | $Enums.YmqGroupStaffRole
  }

  export type NestedEnumYmqGroupStaffRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.YmqGroupStaffRole | EnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.YmqGroupStaffRole[] | ListEnumYmqGroupStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumYmqGroupStaffRoleWithAggregatesFilter<$PrismaModel> | $Enums.YmqGroupStaffRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumYmqGroupStaffRoleFilter<$PrismaModel>
    _max?: NestedEnumYmqGroupStaffRoleFilter<$PrismaModel>
  }

  export type NestedEnumAttendanceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AttendanceStatus | EnumAttendanceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttendanceStatusFilter<$PrismaModel> | $Enums.AttendanceStatus
  }

  export type NestedEnumAttendanceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AttendanceStatus | EnumAttendanceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttendanceStatus[] | ListEnumAttendanceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttendanceStatusWithAggregatesFilter<$PrismaModel> | $Enums.AttendanceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAttendanceStatusFilter<$PrismaModel>
    _max?: NestedEnumAttendanceStatusFilter<$PrismaModel>
  }

  export type NestedEnumLearningTrackFilter<$PrismaModel = never> = {
    equals?: $Enums.LearningTrack | EnumLearningTrackFieldRefInput<$PrismaModel>
    in?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    notIn?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    not?: NestedEnumLearningTrackFilter<$PrismaModel> | $Enums.LearningTrack
  }

  export type NestedEnumLearningTrackWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LearningTrack | EnumLearningTrackFieldRefInput<$PrismaModel>
    in?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    notIn?: $Enums.LearningTrack[] | ListEnumLearningTrackFieldRefInput<$PrismaModel>
    not?: NestedEnumLearningTrackWithAggregatesFilter<$PrismaModel> | $Enums.LearningTrack
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLearningTrackFilter<$PrismaModel>
    _max?: NestedEnumLearningTrackFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type YmqGroupCreateWithoutPembinaInput = {
    id?: string
    name: string
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberCreateNestedManyWithoutGroupInput
    groupAdmins?: YmqGroupAdminAssignmentCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUncheckedCreateWithoutPembinaInput = {
    id?: string
    name: string
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberUncheckedCreateNestedManyWithoutGroupInput
    groupAdmins?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionUncheckedCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupCreateOrConnectWithoutPembinaInput = {
    where: YmqGroupWhereUniqueInput
    create: XOR<YmqGroupCreateWithoutPembinaInput, YmqGroupUncheckedCreateWithoutPembinaInput>
  }

  export type YmqGroupCreateManyPembinaInputEnvelope = {
    data: YmqGroupCreateManyPembinaInput | YmqGroupCreateManyPembinaInput[]
    skipDuplicates?: boolean
  }

  export type YmqMemberCreateWithoutUserInput = {
    id?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    group: YmqGroupCreateNestedOneWithoutMembersInput
    attendance?: YmqSessionAttendanceCreateNestedManyWithoutMemberInput
    progress?: YmqLearningProgressCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberUncheckedCreateWithoutUserInput = {
    id?: string
    groupId: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    attendance?: YmqSessionAttendanceUncheckedCreateNestedManyWithoutMemberInput
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberCreateOrConnectWithoutUserInput = {
    where: YmqMemberWhereUniqueInput
    create: XOR<YmqMemberCreateWithoutUserInput, YmqMemberUncheckedCreateWithoutUserInput>
  }

  export type YmqMemberCreateManyUserInputEnvelope = {
    data: YmqMemberCreateManyUserInput | YmqMemberCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type YmqGroupAdminAssignmentCreateWithoutUserInput = {
    id?: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
    group: YmqGroupCreateNestedOneWithoutGroupAdminsInput
  }

  export type YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput = {
    id?: string
    groupId: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type YmqGroupAdminAssignmentCreateOrConnectWithoutUserInput = {
    where: YmqGroupAdminAssignmentWhereUniqueInput
    create: XOR<YmqGroupAdminAssignmentCreateWithoutUserInput, YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput>
  }

  export type YmqGroupAdminAssignmentCreateManyUserInputEnvelope = {
    data: YmqGroupAdminAssignmentCreateManyUserInput | YmqGroupAdminAssignmentCreateManyUserInput[]
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
    catatanPembina?: string | null
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
    catatanPembina?: string | null
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
    catatanPembina?: string | null
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
    catatanPembina?: string | null
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

  export type YmqGroupUpsertWithWhereUniqueWithoutPembinaInput = {
    where: YmqGroupWhereUniqueInput
    update: XOR<YmqGroupUpdateWithoutPembinaInput, YmqGroupUncheckedUpdateWithoutPembinaInput>
    create: XOR<YmqGroupCreateWithoutPembinaInput, YmqGroupUncheckedCreateWithoutPembinaInput>
  }

  export type YmqGroupUpdateWithWhereUniqueWithoutPembinaInput = {
    where: YmqGroupWhereUniqueInput
    data: XOR<YmqGroupUpdateWithoutPembinaInput, YmqGroupUncheckedUpdateWithoutPembinaInput>
  }

  export type YmqGroupUpdateManyWithWhereWithoutPembinaInput = {
    where: YmqGroupScalarWhereInput
    data: XOR<YmqGroupUpdateManyMutationInput, YmqGroupUncheckedUpdateManyWithoutPembinaInput>
  }

  export type YmqGroupScalarWhereInput = {
    AND?: YmqGroupScalarWhereInput | YmqGroupScalarWhereInput[]
    OR?: YmqGroupScalarWhereInput[]
    NOT?: YmqGroupScalarWhereInput | YmqGroupScalarWhereInput[]
    id?: UuidFilter<"YmqGroup"> | string
    name?: StringFilter<"YmqGroup"> | string
    pembinaUserId?: UuidNullableFilter<"YmqGroup"> | string | null
    level?: EnumYmqGroupLevelNullableFilter<"YmqGroup"> | $Enums.YmqGroupLevel | null
    unitId?: UuidNullableFilter<"YmqGroup"> | string | null
    unitName?: StringNullableFilter<"YmqGroup"> | string | null
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
    leftAt?: DateTimeNullableFilter<"YmqMember"> | Date | string | null
  }

  export type YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutUserInput = {
    where: YmqGroupAdminAssignmentWhereUniqueInput
    update: XOR<YmqGroupAdminAssignmentUpdateWithoutUserInput, YmqGroupAdminAssignmentUncheckedUpdateWithoutUserInput>
    create: XOR<YmqGroupAdminAssignmentCreateWithoutUserInput, YmqGroupAdminAssignmentUncheckedCreateWithoutUserInput>
  }

  export type YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutUserInput = {
    where: YmqGroupAdminAssignmentWhereUniqueInput
    data: XOR<YmqGroupAdminAssignmentUpdateWithoutUserInput, YmqGroupAdminAssignmentUncheckedUpdateWithoutUserInput>
  }

  export type YmqGroupAdminAssignmentUpdateManyWithWhereWithoutUserInput = {
    where: YmqGroupAdminAssignmentScalarWhereInput
    data: XOR<YmqGroupAdminAssignmentUpdateManyMutationInput, YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserInput>
  }

  export type YmqGroupAdminAssignmentScalarWhereInput = {
    AND?: YmqGroupAdminAssignmentScalarWhereInput | YmqGroupAdminAssignmentScalarWhereInput[]
    OR?: YmqGroupAdminAssignmentScalarWhereInput[]
    NOT?: YmqGroupAdminAssignmentScalarWhereInput | YmqGroupAdminAssignmentScalarWhereInput[]
    id?: UuidFilter<"YmqGroupAdminAssignment"> | string
    groupId?: UuidFilter<"YmqGroupAdminAssignment"> | string
    userId?: UuidFilter<"YmqGroupAdminAssignment"> | string
    role?: EnumYmqGroupStaffRoleFilter<"YmqGroupAdminAssignment"> | $Enums.YmqGroupStaffRole
    assignedById?: UuidFilter<"YmqGroupAdminAssignment"> | string
    assignedAt?: DateTimeFilter<"YmqGroupAdminAssignment"> | Date | string
    revokedAt?: DateTimeNullableFilter<"YmqGroupAdminAssignment"> | Date | string | null
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
    catatanPembina?: StringNullableFilter<"YmqSetoran"> | string | null
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

  export type UserCreateWithoutGroupsAsPembinaInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGroupsAsPembinaInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGroupsAsPembinaInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGroupsAsPembinaInput, UserUncheckedCreateWithoutGroupsAsPembinaInput>
  }

  export type YmqMemberCreateWithoutGroupInput = {
    id?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    user: UserCreateNestedOneWithoutMembershipsInput
    attendance?: YmqSessionAttendanceCreateNestedManyWithoutMemberInput
    progress?: YmqLearningProgressCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberUncheckedCreateWithoutGroupInput = {
    id?: string
    userId: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    attendance?: YmqSessionAttendanceUncheckedCreateNestedManyWithoutMemberInput
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberCreateOrConnectWithoutGroupInput = {
    where: YmqMemberWhereUniqueInput
    create: XOR<YmqMemberCreateWithoutGroupInput, YmqMemberUncheckedCreateWithoutGroupInput>
  }

  export type YmqMemberCreateManyGroupInputEnvelope = {
    data: YmqMemberCreateManyGroupInput | YmqMemberCreateManyGroupInput[]
    skipDuplicates?: boolean
  }

  export type YmqGroupAdminAssignmentCreateWithoutGroupInput = {
    id?: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
    user: UserCreateNestedOneWithoutGroupAdminAssignmentsInput
  }

  export type YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput = {
    id?: string
    userId: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type YmqGroupAdminAssignmentCreateOrConnectWithoutGroupInput = {
    where: YmqGroupAdminAssignmentWhereUniqueInput
    create: XOR<YmqGroupAdminAssignmentCreateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput>
  }

  export type YmqGroupAdminAssignmentCreateManyGroupInputEnvelope = {
    data: YmqGroupAdminAssignmentCreateManyGroupInput | YmqGroupAdminAssignmentCreateManyGroupInput[]
    skipDuplicates?: boolean
  }

  export type YmqLearningSessionCreateWithoutGroupInput = {
    id?: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    attendance?: YmqSessionAttendanceCreateNestedManyWithoutSessionInput
    progress?: YmqLearningProgressCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionUncheckedCreateWithoutGroupInput = {
    id?: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    attendance?: YmqSessionAttendanceUncheckedCreateNestedManyWithoutSessionInput
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionCreateOrConnectWithoutGroupInput = {
    where: YmqLearningSessionWhereUniqueInput
    create: XOR<YmqLearningSessionCreateWithoutGroupInput, YmqLearningSessionUncheckedCreateWithoutGroupInput>
  }

  export type YmqLearningSessionCreateManyGroupInputEnvelope = {
    data: YmqLearningSessionCreateManyGroupInput | YmqLearningSessionCreateManyGroupInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutGroupsAsPembinaInput = {
    update: XOR<UserUpdateWithoutGroupsAsPembinaInput, UserUncheckedUpdateWithoutGroupsAsPembinaInput>
    create: XOR<UserCreateWithoutGroupsAsPembinaInput, UserUncheckedCreateWithoutGroupsAsPembinaInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGroupsAsPembinaInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGroupsAsPembinaInput, UserUncheckedUpdateWithoutGroupsAsPembinaInput>
  }

  export type UserUpdateWithoutGroupsAsPembinaInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGroupsAsPembinaInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserNestedInput
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

  export type YmqGroupAdminAssignmentUpsertWithWhereUniqueWithoutGroupInput = {
    where: YmqGroupAdminAssignmentWhereUniqueInput
    update: XOR<YmqGroupAdminAssignmentUpdateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedUpdateWithoutGroupInput>
    create: XOR<YmqGroupAdminAssignmentCreateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedCreateWithoutGroupInput>
  }

  export type YmqGroupAdminAssignmentUpdateWithWhereUniqueWithoutGroupInput = {
    where: YmqGroupAdminAssignmentWhereUniqueInput
    data: XOR<YmqGroupAdminAssignmentUpdateWithoutGroupInput, YmqGroupAdminAssignmentUncheckedUpdateWithoutGroupInput>
  }

  export type YmqGroupAdminAssignmentUpdateManyWithWhereWithoutGroupInput = {
    where: YmqGroupAdminAssignmentScalarWhereInput
    data: XOR<YmqGroupAdminAssignmentUpdateManyMutationInput, YmqGroupAdminAssignmentUncheckedUpdateManyWithoutGroupInput>
  }

  export type YmqLearningSessionUpsertWithWhereUniqueWithoutGroupInput = {
    where: YmqLearningSessionWhereUniqueInput
    update: XOR<YmqLearningSessionUpdateWithoutGroupInput, YmqLearningSessionUncheckedUpdateWithoutGroupInput>
    create: XOR<YmqLearningSessionCreateWithoutGroupInput, YmqLearningSessionUncheckedCreateWithoutGroupInput>
  }

  export type YmqLearningSessionUpdateWithWhereUniqueWithoutGroupInput = {
    where: YmqLearningSessionWhereUniqueInput
    data: XOR<YmqLearningSessionUpdateWithoutGroupInput, YmqLearningSessionUncheckedUpdateWithoutGroupInput>
  }

  export type YmqLearningSessionUpdateManyWithWhereWithoutGroupInput = {
    where: YmqLearningSessionScalarWhereInput
    data: XOR<YmqLearningSessionUpdateManyMutationInput, YmqLearningSessionUncheckedUpdateManyWithoutGroupInput>
  }

  export type YmqLearningSessionScalarWhereInput = {
    AND?: YmqLearningSessionScalarWhereInput | YmqLearningSessionScalarWhereInput[]
    OR?: YmqLearningSessionScalarWhereInput[]
    NOT?: YmqLearningSessionScalarWhereInput | YmqLearningSessionScalarWhereInput[]
    id?: UuidFilter<"YmqLearningSession"> | string
    groupId?: UuidFilter<"YmqLearningSession"> | string
    sessionDate?: DateTimeFilter<"YmqLearningSession"> | Date | string
    notes?: StringNullableFilter<"YmqLearningSession"> | string | null
    createdById?: UuidFilter<"YmqLearningSession"> | string
    createdAt?: DateTimeFilter<"YmqLearningSession"> | Date | string
    updatedAt?: DateTimeFilter<"YmqLearningSession"> | Date | string
  }

  export type YmqGroupCreateWithoutMembersInput = {
    id?: string
    name: string
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pembina?: UserCreateNestedOneWithoutGroupsAsPembinaInput
    groupAdmins?: YmqGroupAdminAssignmentCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUncheckedCreateWithoutMembersInput = {
    id?: string
    name: string
    pembinaUserId?: string | null
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    groupAdmins?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionUncheckedCreateNestedManyWithoutGroupInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupCreateNestedManyWithoutPembinaInput
    groupAdminAssignments?: YmqGroupAdminAssignmentCreateNestedManyWithoutUserInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupUncheckedCreateNestedManyWithoutPembinaInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMembershipsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
  }

  export type YmqSessionAttendanceCreateWithoutMemberInput = {
    id?: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: YmqLearningSessionCreateNestedOneWithoutAttendanceInput
  }

  export type YmqSessionAttendanceUncheckedCreateWithoutMemberInput = {
    id?: string
    sessionId: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqSessionAttendanceCreateOrConnectWithoutMemberInput = {
    where: YmqSessionAttendanceWhereUniqueInput
    create: XOR<YmqSessionAttendanceCreateWithoutMemberInput, YmqSessionAttendanceUncheckedCreateWithoutMemberInput>
  }

  export type YmqSessionAttendanceCreateManyMemberInputEnvelope = {
    data: YmqSessionAttendanceCreateManyMemberInput | YmqSessionAttendanceCreateManyMemberInput[]
    skipDuplicates?: boolean
  }

  export type YmqLearningProgressCreateWithoutMemberInput = {
    id?: string
    track: $Enums.LearningTrack
    sequence?: number
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: YmqLearningSessionCreateNestedOneWithoutProgressInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitCreateNestedOneWithoutProgressInput
    evidence?: YmqProgressEvidenceCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressUncheckedCreateWithoutMemberInput = {
    id?: string
    sessionId: string
    track: $Enums.LearningTrack
    sequence?: number
    iwrCurriculumUnitId?: string | null
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    evidence?: YmqProgressEvidenceUncheckedCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressCreateOrConnectWithoutMemberInput = {
    where: YmqLearningProgressWhereUniqueInput
    create: XOR<YmqLearningProgressCreateWithoutMemberInput, YmqLearningProgressUncheckedCreateWithoutMemberInput>
  }

  export type YmqLearningProgressCreateManyMemberInputEnvelope = {
    data: YmqLearningProgressCreateManyMemberInput | YmqLearningProgressCreateManyMemberInput[]
    skipDuplicates?: boolean
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
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pembina?: UserUpdateOneWithoutGroupsAsPembinaNestedInput
    groupAdmins?: YmqGroupAdminAssignmentUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    pembinaUserId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupAdmins?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUncheckedUpdateManyWithoutGroupNestedInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUpdateManyWithoutPembinaNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUpdateManyWithoutUserNestedInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUncheckedUpdateManyWithoutPembinaNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type YmqSessionAttendanceUpsertWithWhereUniqueWithoutMemberInput = {
    where: YmqSessionAttendanceWhereUniqueInput
    update: XOR<YmqSessionAttendanceUpdateWithoutMemberInput, YmqSessionAttendanceUncheckedUpdateWithoutMemberInput>
    create: XOR<YmqSessionAttendanceCreateWithoutMemberInput, YmqSessionAttendanceUncheckedCreateWithoutMemberInput>
  }

  export type YmqSessionAttendanceUpdateWithWhereUniqueWithoutMemberInput = {
    where: YmqSessionAttendanceWhereUniqueInput
    data: XOR<YmqSessionAttendanceUpdateWithoutMemberInput, YmqSessionAttendanceUncheckedUpdateWithoutMemberInput>
  }

  export type YmqSessionAttendanceUpdateManyWithWhereWithoutMemberInput = {
    where: YmqSessionAttendanceScalarWhereInput
    data: XOR<YmqSessionAttendanceUpdateManyMutationInput, YmqSessionAttendanceUncheckedUpdateManyWithoutMemberInput>
  }

  export type YmqSessionAttendanceScalarWhereInput = {
    AND?: YmqSessionAttendanceScalarWhereInput | YmqSessionAttendanceScalarWhereInput[]
    OR?: YmqSessionAttendanceScalarWhereInput[]
    NOT?: YmqSessionAttendanceScalarWhereInput | YmqSessionAttendanceScalarWhereInput[]
    id?: UuidFilter<"YmqSessionAttendance"> | string
    sessionId?: UuidFilter<"YmqSessionAttendance"> | string
    memberId?: UuidFilter<"YmqSessionAttendance"> | string
    status?: EnumAttendanceStatusFilter<"YmqSessionAttendance"> | $Enums.AttendanceStatus
    note?: StringNullableFilter<"YmqSessionAttendance"> | string | null
    createdAt?: DateTimeFilter<"YmqSessionAttendance"> | Date | string
    updatedAt?: DateTimeFilter<"YmqSessionAttendance"> | Date | string
  }

  export type YmqLearningProgressUpsertWithWhereUniqueWithoutMemberInput = {
    where: YmqLearningProgressWhereUniqueInput
    update: XOR<YmqLearningProgressUpdateWithoutMemberInput, YmqLearningProgressUncheckedUpdateWithoutMemberInput>
    create: XOR<YmqLearningProgressCreateWithoutMemberInput, YmqLearningProgressUncheckedCreateWithoutMemberInput>
  }

  export type YmqLearningProgressUpdateWithWhereUniqueWithoutMemberInput = {
    where: YmqLearningProgressWhereUniqueInput
    data: XOR<YmqLearningProgressUpdateWithoutMemberInput, YmqLearningProgressUncheckedUpdateWithoutMemberInput>
  }

  export type YmqLearningProgressUpdateManyWithWhereWithoutMemberInput = {
    where: YmqLearningProgressScalarWhereInput
    data: XOR<YmqLearningProgressUpdateManyMutationInput, YmqLearningProgressUncheckedUpdateManyWithoutMemberInput>
  }

  export type YmqLearningProgressScalarWhereInput = {
    AND?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
    OR?: YmqLearningProgressScalarWhereInput[]
    NOT?: YmqLearningProgressScalarWhereInput | YmqLearningProgressScalarWhereInput[]
    id?: UuidFilter<"YmqLearningProgress"> | string
    sessionId?: UuidFilter<"YmqLearningProgress"> | string
    memberId?: UuidFilter<"YmqLearningProgress"> | string
    track?: EnumLearningTrackFilter<"YmqLearningProgress"> | $Enums.LearningTrack
    sequence?: IntFilter<"YmqLearningProgress"> | number
    iwrCurriculumUnitId?: UuidNullableFilter<"YmqLearningProgress"> | string | null
    surahNumber?: IntNullableFilter<"YmqLearningProgress"> | number | null
    ayahStart?: IntNullableFilter<"YmqLearningProgress"> | number | null
    ayahEnd?: IntNullableFilter<"YmqLearningProgress"> | number | null
    note?: StringNullableFilter<"YmqLearningProgress"> | string | null
    createdAt?: DateTimeFilter<"YmqLearningProgress"> | Date | string
    updatedAt?: DateTimeFilter<"YmqLearningProgress"> | Date | string
  }

  export type UserCreateWithoutSetoranListInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentCreateNestedManyWithoutUserInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupUncheckedCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutUserInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentCreateNestedManyWithoutUserInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupUncheckedCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutUserInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUpdateManyWithoutUserNestedInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUncheckedUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserNestedInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUpdateManyWithoutUserNestedInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUncheckedUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserNestedInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentCreateNestedManyWithoutUserInput
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
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupUncheckedCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutUserInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUpdateManyWithoutUserNestedInput
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
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUncheckedUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    groupAdminAssignments?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
  }

  export type YmqLearningProgressCreateWithoutIwrCurriculumUnitInput = {
    id?: string
    track: $Enums.LearningTrack
    sequence?: number
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: YmqLearningSessionCreateNestedOneWithoutProgressInput
    member: YmqMemberCreateNestedOneWithoutProgressInput
    evidence?: YmqProgressEvidenceCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput = {
    id?: string
    sessionId: string
    memberId: string
    track: $Enums.LearningTrack
    sequence?: number
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    evidence?: YmqProgressEvidenceUncheckedCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressCreateOrConnectWithoutIwrCurriculumUnitInput = {
    where: YmqLearningProgressWhereUniqueInput
    create: XOR<YmqLearningProgressCreateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput>
  }

  export type YmqLearningProgressCreateManyIwrCurriculumUnitInputEnvelope = {
    data: YmqLearningProgressCreateManyIwrCurriculumUnitInput | YmqLearningProgressCreateManyIwrCurriculumUnitInput[]
    skipDuplicates?: boolean
  }

  export type YmqLearningProgressUpsertWithWhereUniqueWithoutIwrCurriculumUnitInput = {
    where: YmqLearningProgressWhereUniqueInput
    update: XOR<YmqLearningProgressUpdateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedUpdateWithoutIwrCurriculumUnitInput>
    create: XOR<YmqLearningProgressCreateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedCreateWithoutIwrCurriculumUnitInput>
  }

  export type YmqLearningProgressUpdateWithWhereUniqueWithoutIwrCurriculumUnitInput = {
    where: YmqLearningProgressWhereUniqueInput
    data: XOR<YmqLearningProgressUpdateWithoutIwrCurriculumUnitInput, YmqLearningProgressUncheckedUpdateWithoutIwrCurriculumUnitInput>
  }

  export type YmqLearningProgressUpdateManyWithWhereWithoutIwrCurriculumUnitInput = {
    where: YmqLearningProgressScalarWhereInput
    data: XOR<YmqLearningProgressUpdateManyMutationInput, YmqLearningProgressUncheckedUpdateManyWithoutIwrCurriculumUnitInput>
  }

  export type YmqGroupCreateWithoutGroupAdminsInput = {
    id?: string
    name: string
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pembina?: UserCreateNestedOneWithoutGroupsAsPembinaInput
    members?: YmqMemberCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUncheckedCreateWithoutGroupAdminsInput = {
    id?: string
    name: string
    pembinaUserId?: string | null
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberUncheckedCreateNestedManyWithoutGroupInput
    learningSessions?: YmqLearningSessionUncheckedCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupCreateOrConnectWithoutGroupAdminsInput = {
    where: YmqGroupWhereUniqueInput
    create: XOR<YmqGroupCreateWithoutGroupAdminsInput, YmqGroupUncheckedCreateWithoutGroupAdminsInput>
  }

  export type UserCreateWithoutGroupAdminAssignmentsInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGroupAdminAssignmentsInput = {
    id?: string
    fullName: string
    username?: string | null
    email: string
    phone?: string | null
    avatarUrl?: string | null
    unitName?: string | null
    unitId?: string | null
    sourceUpdatedAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    groupsAsPembina?: YmqGroupUncheckedCreateNestedManyWithoutPembinaInput
    memberships?: YmqMemberUncheckedCreateNestedManyWithoutUserInput
    setoranList?: YmqSetoranUncheckedCreateNestedManyWithoutUserInput
    verifiedSetorans?: YmqSetoranUncheckedCreateNestedManyWithoutVerifiedByInput
    targets?: YmqTargetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGroupAdminAssignmentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGroupAdminAssignmentsInput, UserUncheckedCreateWithoutGroupAdminAssignmentsInput>
  }

  export type YmqGroupUpsertWithoutGroupAdminsInput = {
    update: XOR<YmqGroupUpdateWithoutGroupAdminsInput, YmqGroupUncheckedUpdateWithoutGroupAdminsInput>
    create: XOR<YmqGroupCreateWithoutGroupAdminsInput, YmqGroupUncheckedCreateWithoutGroupAdminsInput>
    where?: YmqGroupWhereInput
  }

  export type YmqGroupUpdateToOneWithWhereWithoutGroupAdminsInput = {
    where?: YmqGroupWhereInput
    data: XOR<YmqGroupUpdateWithoutGroupAdminsInput, YmqGroupUncheckedUpdateWithoutGroupAdminsInput>
  }

  export type YmqGroupUpdateWithoutGroupAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pembina?: UserUpdateOneWithoutGroupsAsPembinaNestedInput
    members?: YmqMemberUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateWithoutGroupAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    pembinaUserId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUncheckedUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type UserUpsertWithoutGroupAdminAssignmentsInput = {
    update: XOR<UserUpdateWithoutGroupAdminAssignmentsInput, UserUncheckedUpdateWithoutGroupAdminAssignmentsInput>
    create: XOR<UserCreateWithoutGroupAdminAssignmentsInput, UserUncheckedCreateWithoutGroupAdminAssignmentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGroupAdminAssignmentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGroupAdminAssignmentsInput, UserUncheckedUpdateWithoutGroupAdminAssignmentsInput>
  }

  export type UserUpdateWithoutGroupAdminAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGroupAdminAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    sourceUpdatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupsAsPembina?: YmqGroupUncheckedUpdateManyWithoutPembinaNestedInput
    memberships?: YmqMemberUncheckedUpdateManyWithoutUserNestedInput
    setoranList?: YmqSetoranUncheckedUpdateManyWithoutUserNestedInput
    verifiedSetorans?: YmqSetoranUncheckedUpdateManyWithoutVerifiedByNestedInput
    targets?: YmqTargetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type YmqGroupCreateWithoutLearningSessionsInput = {
    id?: string
    name: string
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pembina?: UserCreateNestedOneWithoutGroupsAsPembinaInput
    members?: YmqMemberCreateNestedManyWithoutGroupInput
    groupAdmins?: YmqGroupAdminAssignmentCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupUncheckedCreateWithoutLearningSessionsInput = {
    id?: string
    name: string
    pembinaUserId?: string | null
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
    description?: string | null
    scheduleDay?: string | null
    scheduleTime?: string | null
    whatsappLink?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: YmqMemberUncheckedCreateNestedManyWithoutGroupInput
    groupAdmins?: YmqGroupAdminAssignmentUncheckedCreateNestedManyWithoutGroupInput
  }

  export type YmqGroupCreateOrConnectWithoutLearningSessionsInput = {
    where: YmqGroupWhereUniqueInput
    create: XOR<YmqGroupCreateWithoutLearningSessionsInput, YmqGroupUncheckedCreateWithoutLearningSessionsInput>
  }

  export type YmqSessionAttendanceCreateWithoutSessionInput = {
    id?: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    member: YmqMemberCreateNestedOneWithoutAttendanceInput
  }

  export type YmqSessionAttendanceUncheckedCreateWithoutSessionInput = {
    id?: string
    memberId: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqSessionAttendanceCreateOrConnectWithoutSessionInput = {
    where: YmqSessionAttendanceWhereUniqueInput
    create: XOR<YmqSessionAttendanceCreateWithoutSessionInput, YmqSessionAttendanceUncheckedCreateWithoutSessionInput>
  }

  export type YmqSessionAttendanceCreateManySessionInputEnvelope = {
    data: YmqSessionAttendanceCreateManySessionInput | YmqSessionAttendanceCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type YmqLearningProgressCreateWithoutSessionInput = {
    id?: string
    track: $Enums.LearningTrack
    sequence?: number
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    member: YmqMemberCreateNestedOneWithoutProgressInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitCreateNestedOneWithoutProgressInput
    evidence?: YmqProgressEvidenceCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressUncheckedCreateWithoutSessionInput = {
    id?: string
    memberId: string
    track: $Enums.LearningTrack
    sequence?: number
    iwrCurriculumUnitId?: string | null
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    evidence?: YmqProgressEvidenceUncheckedCreateNestedManyWithoutProgressInput
  }

  export type YmqLearningProgressCreateOrConnectWithoutSessionInput = {
    where: YmqLearningProgressWhereUniqueInput
    create: XOR<YmqLearningProgressCreateWithoutSessionInput, YmqLearningProgressUncheckedCreateWithoutSessionInput>
  }

  export type YmqLearningProgressCreateManySessionInputEnvelope = {
    data: YmqLearningProgressCreateManySessionInput | YmqLearningProgressCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type YmqGroupUpsertWithoutLearningSessionsInput = {
    update: XOR<YmqGroupUpdateWithoutLearningSessionsInput, YmqGroupUncheckedUpdateWithoutLearningSessionsInput>
    create: XOR<YmqGroupCreateWithoutLearningSessionsInput, YmqGroupUncheckedCreateWithoutLearningSessionsInput>
    where?: YmqGroupWhereInput
  }

  export type YmqGroupUpdateToOneWithWhereWithoutLearningSessionsInput = {
    where?: YmqGroupWhereInput
    data: XOR<YmqGroupUpdateWithoutLearningSessionsInput, YmqGroupUncheckedUpdateWithoutLearningSessionsInput>
  }

  export type YmqGroupUpdateWithoutLearningSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pembina?: UserUpdateOneWithoutGroupsAsPembinaNestedInput
    members?: YmqMemberUpdateManyWithoutGroupNestedInput
    groupAdmins?: YmqGroupAdminAssignmentUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateWithoutLearningSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    pembinaUserId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUncheckedUpdateManyWithoutGroupNestedInput
    groupAdmins?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type YmqSessionAttendanceUpsertWithWhereUniqueWithoutSessionInput = {
    where: YmqSessionAttendanceWhereUniqueInput
    update: XOR<YmqSessionAttendanceUpdateWithoutSessionInput, YmqSessionAttendanceUncheckedUpdateWithoutSessionInput>
    create: XOR<YmqSessionAttendanceCreateWithoutSessionInput, YmqSessionAttendanceUncheckedCreateWithoutSessionInput>
  }

  export type YmqSessionAttendanceUpdateWithWhereUniqueWithoutSessionInput = {
    where: YmqSessionAttendanceWhereUniqueInput
    data: XOR<YmqSessionAttendanceUpdateWithoutSessionInput, YmqSessionAttendanceUncheckedUpdateWithoutSessionInput>
  }

  export type YmqSessionAttendanceUpdateManyWithWhereWithoutSessionInput = {
    where: YmqSessionAttendanceScalarWhereInput
    data: XOR<YmqSessionAttendanceUpdateManyMutationInput, YmqSessionAttendanceUncheckedUpdateManyWithoutSessionInput>
  }

  export type YmqLearningProgressUpsertWithWhereUniqueWithoutSessionInput = {
    where: YmqLearningProgressWhereUniqueInput
    update: XOR<YmqLearningProgressUpdateWithoutSessionInput, YmqLearningProgressUncheckedUpdateWithoutSessionInput>
    create: XOR<YmqLearningProgressCreateWithoutSessionInput, YmqLearningProgressUncheckedCreateWithoutSessionInput>
  }

  export type YmqLearningProgressUpdateWithWhereUniqueWithoutSessionInput = {
    where: YmqLearningProgressWhereUniqueInput
    data: XOR<YmqLearningProgressUpdateWithoutSessionInput, YmqLearningProgressUncheckedUpdateWithoutSessionInput>
  }

  export type YmqLearningProgressUpdateManyWithWhereWithoutSessionInput = {
    where: YmqLearningProgressScalarWhereInput
    data: XOR<YmqLearningProgressUpdateManyMutationInput, YmqLearningProgressUncheckedUpdateManyWithoutSessionInput>
  }

  export type YmqLearningSessionCreateWithoutAttendanceInput = {
    id?: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    group: YmqGroupCreateNestedOneWithoutLearningSessionsInput
    progress?: YmqLearningProgressCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionUncheckedCreateWithoutAttendanceInput = {
    id?: string
    groupId: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionCreateOrConnectWithoutAttendanceInput = {
    where: YmqLearningSessionWhereUniqueInput
    create: XOR<YmqLearningSessionCreateWithoutAttendanceInput, YmqLearningSessionUncheckedCreateWithoutAttendanceInput>
  }

  export type YmqMemberCreateWithoutAttendanceInput = {
    id?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    group: YmqGroupCreateNestedOneWithoutMembersInput
    user: UserCreateNestedOneWithoutMembershipsInput
    progress?: YmqLearningProgressCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberUncheckedCreateWithoutAttendanceInput = {
    id?: string
    groupId: string
    userId: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    progress?: YmqLearningProgressUncheckedCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberCreateOrConnectWithoutAttendanceInput = {
    where: YmqMemberWhereUniqueInput
    create: XOR<YmqMemberCreateWithoutAttendanceInput, YmqMemberUncheckedCreateWithoutAttendanceInput>
  }

  export type YmqLearningSessionUpsertWithoutAttendanceInput = {
    update: XOR<YmqLearningSessionUpdateWithoutAttendanceInput, YmqLearningSessionUncheckedUpdateWithoutAttendanceInput>
    create: XOR<YmqLearningSessionCreateWithoutAttendanceInput, YmqLearningSessionUncheckedCreateWithoutAttendanceInput>
    where?: YmqLearningSessionWhereInput
  }

  export type YmqLearningSessionUpdateToOneWithWhereWithoutAttendanceInput = {
    where?: YmqLearningSessionWhereInput
    data: XOR<YmqLearningSessionUpdateWithoutAttendanceInput, YmqLearningSessionUncheckedUpdateWithoutAttendanceInput>
  }

  export type YmqLearningSessionUpdateWithoutAttendanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: YmqGroupUpdateOneRequiredWithoutLearningSessionsNestedInput
    progress?: YmqLearningProgressUpdateManyWithoutSessionNestedInput
  }

  export type YmqLearningSessionUncheckedUpdateWithoutAttendanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type YmqMemberUpsertWithoutAttendanceInput = {
    update: XOR<YmqMemberUpdateWithoutAttendanceInput, YmqMemberUncheckedUpdateWithoutAttendanceInput>
    create: XOR<YmqMemberCreateWithoutAttendanceInput, YmqMemberUncheckedCreateWithoutAttendanceInput>
    where?: YmqMemberWhereInput
  }

  export type YmqMemberUpdateToOneWithWhereWithoutAttendanceInput = {
    where?: YmqMemberWhereInput
    data: XOR<YmqMemberUpdateWithoutAttendanceInput, YmqMemberUncheckedUpdateWithoutAttendanceInput>
  }

  export type YmqMemberUpdateWithoutAttendanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    group?: YmqGroupUpdateOneRequiredWithoutMembersNestedInput
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
    progress?: YmqLearningProgressUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberUncheckedUpdateWithoutAttendanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type YmqLearningSessionCreateWithoutProgressInput = {
    id?: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    group: YmqGroupCreateNestedOneWithoutLearningSessionsInput
    attendance?: YmqSessionAttendanceCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionUncheckedCreateWithoutProgressInput = {
    id?: string
    groupId: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    attendance?: YmqSessionAttendanceUncheckedCreateNestedManyWithoutSessionInput
  }

  export type YmqLearningSessionCreateOrConnectWithoutProgressInput = {
    where: YmqLearningSessionWhereUniqueInput
    create: XOR<YmqLearningSessionCreateWithoutProgressInput, YmqLearningSessionUncheckedCreateWithoutProgressInput>
  }

  export type YmqMemberCreateWithoutProgressInput = {
    id?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    group: YmqGroupCreateNestedOneWithoutMembersInput
    user: UserCreateNestedOneWithoutMembershipsInput
    attendance?: YmqSessionAttendanceCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberUncheckedCreateWithoutProgressInput = {
    id?: string
    groupId: string
    userId: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    attendance?: YmqSessionAttendanceUncheckedCreateNestedManyWithoutMemberInput
  }

  export type YmqMemberCreateOrConnectWithoutProgressInput = {
    where: YmqMemberWhereUniqueInput
    create: XOR<YmqMemberCreateWithoutProgressInput, YmqMemberUncheckedCreateWithoutProgressInput>
  }

  export type YmqIwrCurriculumUnitCreateWithoutProgressInput = {
    id?: string
    iwrLevel: $Enums.IwrLevel
    topicCode: string
    topicTitle: string
    pageStart: number
    pageEnd: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqIwrCurriculumUnitUncheckedCreateWithoutProgressInput = {
    id?: string
    iwrLevel: $Enums.IwrLevel
    topicCode: string
    topicTitle: string
    pageStart: number
    pageEnd: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqIwrCurriculumUnitCreateOrConnectWithoutProgressInput = {
    where: YmqIwrCurriculumUnitWhereUniqueInput
    create: XOR<YmqIwrCurriculumUnitCreateWithoutProgressInput, YmqIwrCurriculumUnitUncheckedCreateWithoutProgressInput>
  }

  export type YmqProgressEvidenceCreateWithoutProgressInput = {
    id?: string
    cloudinaryPublicId: string
    secureUrl: string
    resourceType: string
    originalFilename?: string | null
    bytes?: number | null
    uploadedById: string
    createdAt?: Date | string
  }

  export type YmqProgressEvidenceUncheckedCreateWithoutProgressInput = {
    id?: string
    cloudinaryPublicId: string
    secureUrl: string
    resourceType: string
    originalFilename?: string | null
    bytes?: number | null
    uploadedById: string
    createdAt?: Date | string
  }

  export type YmqProgressEvidenceCreateOrConnectWithoutProgressInput = {
    where: YmqProgressEvidenceWhereUniqueInput
    create: XOR<YmqProgressEvidenceCreateWithoutProgressInput, YmqProgressEvidenceUncheckedCreateWithoutProgressInput>
  }

  export type YmqProgressEvidenceCreateManyProgressInputEnvelope = {
    data: YmqProgressEvidenceCreateManyProgressInput | YmqProgressEvidenceCreateManyProgressInput[]
    skipDuplicates?: boolean
  }

  export type YmqLearningSessionUpsertWithoutProgressInput = {
    update: XOR<YmqLearningSessionUpdateWithoutProgressInput, YmqLearningSessionUncheckedUpdateWithoutProgressInput>
    create: XOR<YmqLearningSessionCreateWithoutProgressInput, YmqLearningSessionUncheckedCreateWithoutProgressInput>
    where?: YmqLearningSessionWhereInput
  }

  export type YmqLearningSessionUpdateToOneWithWhereWithoutProgressInput = {
    where?: YmqLearningSessionWhereInput
    data: XOR<YmqLearningSessionUpdateWithoutProgressInput, YmqLearningSessionUncheckedUpdateWithoutProgressInput>
  }

  export type YmqLearningSessionUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: YmqGroupUpdateOneRequiredWithoutLearningSessionsNestedInput
    attendance?: YmqSessionAttendanceUpdateManyWithoutSessionNestedInput
  }

  export type YmqLearningSessionUncheckedUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attendance?: YmqSessionAttendanceUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type YmqMemberUpsertWithoutProgressInput = {
    update: XOR<YmqMemberUpdateWithoutProgressInput, YmqMemberUncheckedUpdateWithoutProgressInput>
    create: XOR<YmqMemberCreateWithoutProgressInput, YmqMemberUncheckedCreateWithoutProgressInput>
    where?: YmqMemberWhereInput
  }

  export type YmqMemberUpdateToOneWithWhereWithoutProgressInput = {
    where?: YmqMemberWhereInput
    data: XOR<YmqMemberUpdateWithoutProgressInput, YmqMemberUncheckedUpdateWithoutProgressInput>
  }

  export type YmqMemberUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    group?: YmqGroupUpdateOneRequiredWithoutMembersNestedInput
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
    attendance?: YmqSessionAttendanceUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberUncheckedUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attendance?: YmqSessionAttendanceUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type YmqIwrCurriculumUnitUpsertWithoutProgressInput = {
    update: XOR<YmqIwrCurriculumUnitUpdateWithoutProgressInput, YmqIwrCurriculumUnitUncheckedUpdateWithoutProgressInput>
    create: XOR<YmqIwrCurriculumUnitCreateWithoutProgressInput, YmqIwrCurriculumUnitUncheckedCreateWithoutProgressInput>
    where?: YmqIwrCurriculumUnitWhereInput
  }

  export type YmqIwrCurriculumUnitUpdateToOneWithWhereWithoutProgressInput = {
    where?: YmqIwrCurriculumUnitWhereInput
    data: XOR<YmqIwrCurriculumUnitUpdateWithoutProgressInput, YmqIwrCurriculumUnitUncheckedUpdateWithoutProgressInput>
  }

  export type YmqIwrCurriculumUnitUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    iwrLevel?: EnumIwrLevelFieldUpdateOperationsInput | $Enums.IwrLevel
    topicCode?: StringFieldUpdateOperationsInput | string
    topicTitle?: StringFieldUpdateOperationsInput | string
    pageStart?: IntFieldUpdateOperationsInput | number
    pageEnd?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqIwrCurriculumUnitUncheckedUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    iwrLevel?: EnumIwrLevelFieldUpdateOperationsInput | $Enums.IwrLevel
    topicCode?: StringFieldUpdateOperationsInput | string
    topicTitle?: StringFieldUpdateOperationsInput | string
    pageStart?: IntFieldUpdateOperationsInput | number
    pageEnd?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqProgressEvidenceUpsertWithWhereUniqueWithoutProgressInput = {
    where: YmqProgressEvidenceWhereUniqueInput
    update: XOR<YmqProgressEvidenceUpdateWithoutProgressInput, YmqProgressEvidenceUncheckedUpdateWithoutProgressInput>
    create: XOR<YmqProgressEvidenceCreateWithoutProgressInput, YmqProgressEvidenceUncheckedCreateWithoutProgressInput>
  }

  export type YmqProgressEvidenceUpdateWithWhereUniqueWithoutProgressInput = {
    where: YmqProgressEvidenceWhereUniqueInput
    data: XOR<YmqProgressEvidenceUpdateWithoutProgressInput, YmqProgressEvidenceUncheckedUpdateWithoutProgressInput>
  }

  export type YmqProgressEvidenceUpdateManyWithWhereWithoutProgressInput = {
    where: YmqProgressEvidenceScalarWhereInput
    data: XOR<YmqProgressEvidenceUpdateManyMutationInput, YmqProgressEvidenceUncheckedUpdateManyWithoutProgressInput>
  }

  export type YmqProgressEvidenceScalarWhereInput = {
    AND?: YmqProgressEvidenceScalarWhereInput | YmqProgressEvidenceScalarWhereInput[]
    OR?: YmqProgressEvidenceScalarWhereInput[]
    NOT?: YmqProgressEvidenceScalarWhereInput | YmqProgressEvidenceScalarWhereInput[]
    id?: UuidFilter<"YmqProgressEvidence"> | string
    progressId?: UuidFilter<"YmqProgressEvidence"> | string
    cloudinaryPublicId?: StringFilter<"YmqProgressEvidence"> | string
    secureUrl?: StringFilter<"YmqProgressEvidence"> | string
    resourceType?: StringFilter<"YmqProgressEvidence"> | string
    originalFilename?: StringNullableFilter<"YmqProgressEvidence"> | string | null
    bytes?: IntNullableFilter<"YmqProgressEvidence"> | number | null
    uploadedById?: UuidFilter<"YmqProgressEvidence"> | string
    createdAt?: DateTimeFilter<"YmqProgressEvidence"> | Date | string
  }

  export type YmqLearningProgressCreateWithoutEvidenceInput = {
    id?: string
    track: $Enums.LearningTrack
    sequence?: number
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: YmqLearningSessionCreateNestedOneWithoutProgressInput
    member: YmqMemberCreateNestedOneWithoutProgressInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitCreateNestedOneWithoutProgressInput
  }

  export type YmqLearningProgressUncheckedCreateWithoutEvidenceInput = {
    id?: string
    sessionId: string
    memberId: string
    track: $Enums.LearningTrack
    sequence?: number
    iwrCurriculumUnitId?: string | null
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqLearningProgressCreateOrConnectWithoutEvidenceInput = {
    where: YmqLearningProgressWhereUniqueInput
    create: XOR<YmqLearningProgressCreateWithoutEvidenceInput, YmqLearningProgressUncheckedCreateWithoutEvidenceInput>
  }

  export type YmqLearningProgressUpsertWithoutEvidenceInput = {
    update: XOR<YmqLearningProgressUpdateWithoutEvidenceInput, YmqLearningProgressUncheckedUpdateWithoutEvidenceInput>
    create: XOR<YmqLearningProgressCreateWithoutEvidenceInput, YmqLearningProgressUncheckedCreateWithoutEvidenceInput>
    where?: YmqLearningProgressWhereInput
  }

  export type YmqLearningProgressUpdateToOneWithWhereWithoutEvidenceInput = {
    where?: YmqLearningProgressWhereInput
    data: XOR<YmqLearningProgressUpdateWithoutEvidenceInput, YmqLearningProgressUncheckedUpdateWithoutEvidenceInput>
  }

  export type YmqLearningProgressUpdateWithoutEvidenceInput = {
    id?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: YmqLearningSessionUpdateOneRequiredWithoutProgressNestedInput
    member?: YmqMemberUpdateOneRequiredWithoutProgressNestedInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitUpdateOneWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateWithoutEvidenceInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    iwrCurriculumUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqGroupCreateManyPembinaInput = {
    id?: string
    name: string
    level?: $Enums.YmqGroupLevel | null
    unitId?: string | null
    unitName?: string | null
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
    leftAt?: Date | string | null
  }

  export type YmqGroupAdminAssignmentCreateManyUserInput = {
    id?: string
    groupId: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
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
    catatanPembina?: string | null
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
    catatanPembina?: string | null
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

  export type YmqGroupUpdateWithoutPembinaInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUpdateManyWithoutGroupNestedInput
    groupAdmins?: YmqGroupAdminAssignmentUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateWithoutPembinaInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleDay?: NullableStringFieldUpdateOperationsInput | string | null
    scheduleTime?: NullableStringFieldUpdateOperationsInput | string | null
    whatsappLink?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: YmqMemberUncheckedUpdateManyWithoutGroupNestedInput
    groupAdmins?: YmqGroupAdminAssignmentUncheckedUpdateManyWithoutGroupNestedInput
    learningSessions?: YmqLearningSessionUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type YmqGroupUncheckedUpdateManyWithoutPembinaInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    level?: NullableEnumYmqGroupLevelFieldUpdateOperationsInput | $Enums.YmqGroupLevel | null
    unitId?: NullableStringFieldUpdateOperationsInput | string | null
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
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
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    group?: YmqGroupUpdateOneRequiredWithoutMembersNestedInput
    attendance?: YmqSessionAttendanceUpdateManyWithoutMemberNestedInput
    progress?: YmqLearningProgressUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attendance?: YmqSessionAttendanceUncheckedUpdateManyWithoutMemberNestedInput
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqGroupAdminAssignmentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    group?: YmqGroupUpdateOneRequiredWithoutGroupAdminsNestedInput
  }

  export type YmqGroupAdminAssignmentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqGroupAdminAssignmentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    catatanPembina?: NullableStringFieldUpdateOperationsInput | string | null
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
    leftAt?: Date | string | null
  }

  export type YmqGroupAdminAssignmentCreateManyGroupInput = {
    id?: string
    userId: string
    role?: $Enums.YmqGroupStaffRole
    assignedById: string
    assignedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type YmqLearningSessionCreateManyGroupInput = {
    id?: string
    sessionDate: Date | string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqMemberUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
    attendance?: YmqSessionAttendanceUpdateManyWithoutMemberNestedInput
    progress?: YmqLearningProgressUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberUncheckedUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attendance?: YmqSessionAttendanceUncheckedUpdateManyWithoutMemberNestedInput
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type YmqMemberUncheckedUpdateManyWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqGroupAdminAssignmentUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutGroupAdminAssignmentsNestedInput
  }

  export type YmqGroupAdminAssignmentUncheckedUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqGroupAdminAssignmentUncheckedUpdateManyWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumYmqGroupStaffRoleFieldUpdateOperationsInput | $Enums.YmqGroupStaffRole
    assignedById?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type YmqLearningSessionUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attendance?: YmqSessionAttendanceUpdateManyWithoutSessionNestedInput
    progress?: YmqLearningProgressUpdateManyWithoutSessionNestedInput
  }

  export type YmqLearningSessionUncheckedUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attendance?: YmqSessionAttendanceUncheckedUpdateManyWithoutSessionNestedInput
    progress?: YmqLearningProgressUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type YmqLearningSessionUncheckedUpdateManyWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSessionAttendanceCreateManyMemberInput = {
    id?: string
    sessionId: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqLearningProgressCreateManyMemberInput = {
    id?: string
    sessionId: string
    track: $Enums.LearningTrack
    sequence?: number
    iwrCurriculumUnitId?: string | null
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqSessionAttendanceUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: YmqLearningSessionUpdateOneRequiredWithoutAttendanceNestedInput
  }

  export type YmqSessionAttendanceUncheckedUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSessionAttendanceUncheckedUpdateManyWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqLearningProgressUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: YmqLearningSessionUpdateOneRequiredWithoutProgressNestedInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitUpdateOneWithoutProgressNestedInput
    evidence?: YmqProgressEvidenceUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    iwrCurriculumUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    evidence?: YmqProgressEvidenceUncheckedUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateManyWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    iwrCurriculumUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqLearningProgressCreateManyIwrCurriculumUnitInput = {
    id?: string
    sessionId: string
    memberId: string
    track: $Enums.LearningTrack
    sequence?: number
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqLearningProgressUpdateWithoutIwrCurriculumUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: YmqLearningSessionUpdateOneRequiredWithoutProgressNestedInput
    member?: YmqMemberUpdateOneRequiredWithoutProgressNestedInput
    evidence?: YmqProgressEvidenceUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateWithoutIwrCurriculumUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    evidence?: YmqProgressEvidenceUncheckedUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateManyWithoutIwrCurriculumUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSessionAttendanceCreateManySessionInput = {
    id?: string
    memberId: string
    status: $Enums.AttendanceStatus
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqLearningProgressCreateManySessionInput = {
    id?: string
    memberId: string
    track: $Enums.LearningTrack
    sequence?: number
    iwrCurriculumUnitId?: string | null
    surahNumber?: number | null
    ayahStart?: number | null
    ayahEnd?: number | null
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type YmqSessionAttendanceUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    member?: YmqMemberUpdateOneRequiredWithoutAttendanceNestedInput
  }

  export type YmqSessionAttendanceUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqSessionAttendanceUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqLearningProgressUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    member?: YmqMemberUpdateOneRequiredWithoutProgressNestedInput
    iwrCurriculumUnit?: YmqIwrCurriculumUnitUpdateOneWithoutProgressNestedInput
    evidence?: YmqProgressEvidenceUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    iwrCurriculumUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    evidence?: YmqProgressEvidenceUncheckedUpdateManyWithoutProgressNestedInput
  }

  export type YmqLearningProgressUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    track?: EnumLearningTrackFieldUpdateOperationsInput | $Enums.LearningTrack
    sequence?: IntFieldUpdateOperationsInput | number
    iwrCurriculumUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    surahNumber?: NullableIntFieldUpdateOperationsInput | number | null
    ayahStart?: NullableIntFieldUpdateOperationsInput | number | null
    ayahEnd?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqProgressEvidenceCreateManyProgressInput = {
    id?: string
    cloudinaryPublicId: string
    secureUrl: string
    resourceType: string
    originalFilename?: string | null
    bytes?: number | null
    uploadedById: string
    createdAt?: Date | string
  }

  export type YmqProgressEvidenceUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    cloudinaryPublicId?: StringFieldUpdateOperationsInput | string
    secureUrl?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    bytes?: NullableIntFieldUpdateOperationsInput | number | null
    uploadedById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqProgressEvidenceUncheckedUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    cloudinaryPublicId?: StringFieldUpdateOperationsInput | string
    secureUrl?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    bytes?: NullableIntFieldUpdateOperationsInput | number | null
    uploadedById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type YmqProgressEvidenceUncheckedUpdateManyWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    cloudinaryPublicId?: StringFieldUpdateOperationsInput | string
    secureUrl?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    bytes?: NullableIntFieldUpdateOperationsInput | number | null
    uploadedById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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