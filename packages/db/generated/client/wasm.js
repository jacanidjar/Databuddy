
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.5.0
 * Query Engine version: 173f8d54f8d52e692c7e27e72a88314ec7aeff60
 */
Prisma.prismaVersion = {
  client: "6.5.0",
  engine: "173f8d54f8d52e692c7e27e72a88314ec7aeff60"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.EmailScalarFieldEnum = {
  id: 'id',
  ipAddress: 'ipAddress',
  email: 'email',
  createdAt: 'createdAt'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  website: 'website',
  monthlyVisitors: 'monthlyVisitors',
  message: 'message',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  repliedAt: 'repliedAt',
  status: 'status'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  image: 'image',
  emailVerified: 'emailVerified',
  name: 'name',
  password: 'password',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  role: 'role',
  twoFactorEnabled: 'twoFactorEnabled'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  expiresAt: 'expiresAt',
  token: 'token',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId'
};

exports.Prisma.PostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  content: 'content',
  excerpt: 'excerpt',
  published: 'published',
  authorId: 'authorId',
  coverImage: 'coverImage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt',
  categoryId: 'categoryId'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyInfoScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  logo: 'logo',
  website: 'website',
  email: 'email',
  phone: 'phone',
  address: 'address',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobListingScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  requirements: 'requirements',
  location: 'location',
  salary: 'salary',
  type: 'type',
  published: 'published',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt',
  closedAt: 'closedAt'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  id: 'id',
  jobListingId: 'jobListingId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  resume: 'resume',
  coverLetter: 'coverLetter',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  reviewedAt: 'reviewedAt'
};

exports.Prisma.WebsiteScalarFieldEnum = {
  id: 'id',
  domain: 'domain',
  name: 'name',
  userId: 'userId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdByUserId: 'createdByUserId',
  subscriptionId: 'subscriptionId',
  subscriptionCustomerId: 'subscriptionCustomerId',
  subscriptionPriceId: 'subscriptionPriceId',
  subscriptionProductId: 'subscriptionProductId',
  subscriptionStatus: 'subscriptionStatus',
  subscriptionStartsAt: 'subscriptionStartsAt',
  subscriptionEndsAt: 'subscriptionEndsAt',
  subscriptionCanceledAt: 'subscriptionCanceledAt',
  subscriptionCreatedByUserId: 'subscriptionCreatedByUserId',
  subscriptionPeriodEventsCount: 'subscriptionPeriodEventsCount',
  subscriptionPeriodEventsCountExceededAt: 'subscriptionPeriodEventsCountExceededAt',
  subscriptionPeriodEventsLimit: 'subscriptionPeriodEventsLimit',
  subscriptionInterval: 'subscriptionInterval',
  deleteAt: 'deleteAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MemberScalarFieldEnum = {
  id: 'id',
  role: 'role',
  email: 'email',
  userId: 'userId',
  invitedById: 'invitedById',
  organizationId: 'organizationId',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectAccessScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  userId: 'userId',
  level: 'level',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InviteScalarFieldEnum = {
  id: 'id',
  email: 'email',
  organizationId: 'organizationId',
  role: 'role',
  token: 'token',
  expires: 'expires',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  acceptedAt: 'acceptedAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  type: 'type',
  organizationId: 'organizationId',
  clientId: 'clientId',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.EventMetaScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  name: 'name',
  description: 'description',
  data: 'data',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClientScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  type: 'type',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TwoFactorScalarFieldEnum = {
  id: 'id',
  secret: 'secret',
  backupCodes: 'backupCodes',
  userId: 'userId'
};

exports.Prisma.JwksScalarFieldEnum = {
  id: 'id',
  publicKey: 'publicKey',
  privateKey: 'privateKey',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE'
};

exports.Role = exports.$Enums.Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  AUTHOR: 'AUTHOR',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  OWNER: 'OWNER'
};

exports.ApplicationStatus = exports.$Enums.ApplicationStatus = {
  NEW: 'NEW',
  REVIEWED: 'REVIEWED',
  INTERVIEWING: 'INTERVIEWING',
  REJECTED: 'REJECTED',
  HIRED: 'HIRED'
};

exports.WebsiteStatus = exports.$Enums.WebsiteStatus = {
  ACTIVE: 'ACTIVE',
  HEALTHY: 'HEALTHY',
  UNHEALTHY: 'UNHEALTHY',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING'
};

exports.AccessLevel = exports.$Enums.AccessLevel = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER'
};

exports.ProjectType = exports.$Enums.ProjectType = {
  WEBSITE: 'WEBSITE',
  MOBILE_APP: 'MOBILE_APP',
  DESKTOP_APP: 'DESKTOP_APP',
  API: 'API'
};

exports.ClientType = exports.$Enums.ClientType = {
  INDIVIDUAL: 'INDIVIDUAL',
  COMPANY: 'COMPANY',
  NONPROFIT: 'NONPROFIT'
};

exports.Prisma.ModelName = {
  Email: 'Email',
  Contact: 'Contact',
  User: 'User',
  Verification: 'Verification',
  Session: 'Session',
  Post: 'Post',
  Category: 'Category',
  Tag: 'Tag',
  CompanyInfo: 'CompanyInfo',
  JobListing: 'JobListing',
  JobApplication: 'JobApplication',
  Website: 'Website',
  Account: 'Account',
  Organization: 'Organization',
  Member: 'Member',
  ProjectAccess: 'ProjectAccess',
  Invite: 'Invite',
  Project: 'Project',
  EventMeta: 'EventMeta',
  Client: 'Client',
  TwoFactor: 'TwoFactor',
  Jwks: 'Jwks'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
