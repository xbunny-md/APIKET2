import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  deviceID: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});
export const User = (mongoose.models.User || mongoose.model('User', userSchema)) as any;

// Admin Schema
const adminSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level: { type: Number, default: 1 },
  permissions: [String]
});
export const Admin = (mongoose.models.Admin || mongoose.model('Admin', adminSchema)) as any;

// Session Schema
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceHash: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});
export const Session = (mongoose.models.Session || mongoose.model('Session', sessionSchema)) as any;

// Settings Schema
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});
export const Settings = (mongoose.models.Settings || mongoose.model('Settings', settingsSchema)) as any;

// API Key Schema
const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  keyPrefix: { type: String, required: true }, // Store 'nx_ab12'
  keyHash: { type: String, required: true, unique: true }, // Store bcrypt hash of the key
  name: { type: String, default: 'Default Key' },
  status: { type: String, enum: ['active', 'disabled', 'revoked'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date },
  requestCount: { type: Number, default: 0 },
  expiresAt: { type: Date }
});
export const ApiKey = (mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema)) as any;

// Project Schema
const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  requestCount: { type: Number, default: 0 }
});
export const Project = (mongoose.models.Project || mongoose.model('Project', projectSchema)) as any;

// Favorite Schema
const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiCatalog', required: true },
  createdAt: { type: Date, default: Date.now }
});
export const Favorite = (mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema)) as any;

// ApiCatalog Schema
const apiCatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  version: { type: String, default: '1.0' },
  status: { type: String, enum: ['active', 'deprecated', 'beta'], default: 'active' },
  latency: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  requests: { type: Number, default: 0 },
  endpoint: { type: String, required: true },
  tags: [String]
});
export const ApiCatalog = (mongoose.models.ApiCatalog || mongoose.model('ApiCatalog', apiCatalogSchema)) as any;

// ApiDocumentation Schema
const apiDocumentationSchema = new mongoose.Schema({
  apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiCatalog', required: true },
  method: { type: String, required: true },
  headers: { type: mongoose.Schema.Types.Mixed },
  parameters: { type: mongoose.Schema.Types.Mixed },
  body: { type: mongoose.Schema.Types.Mixed },
  responseSuccess: { type: mongoose.Schema.Types.Mixed },
  responseError: { type: mongoose.Schema.Types.Mixed },
  rateLimits: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});
export const ApiDocumentation = (mongoose.models.ApiDocumentation || mongoose.model('ApiDocumentation', apiDocumentationSchema)) as any;

// Usage Analytics Schema
const usageAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey' },
  apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiCatalog' },
  timestamp: { type: Date, default: Date.now },
  requests: { type: Number, default: 1 },
  errors: { type: Number, default: 0 },
  latencyAvg: { type: Number, default: 0 }
});
export const UsageAnalytics = (mongoose.models.UsageAnalytics || mongoose.model('UsageAnalytics', usageAnalyticsSchema)) as any;

// Request History Schema (specific to API requests from users)
const requestHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey' },
  apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiCatalog' },
  ip: { type: String },
  result: { type: String }
});
export const RequestHistory = (mongoose.models.RequestHistory || mongoose.model('RequestHistory', requestHistorySchema)) as any;

// Request Schema
const requestSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String },
  deviceHash: { type: String }
});
export const RequestLog = (mongoose.models.RequestLog || mongoose.model('RequestLog', requestSchema)) as any;

// Log Schema (System logs)
const logSchema = new mongoose.Schema({
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  message: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});
export const SystemLog = (mongoose.models.SystemLog || mongoose.model('SystemLog', logSchema)) as any;

// Statistics Schema
const statSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});
export const Statistic = (mongoose.models.Statistic || mongoose.model('Statistic', statSchema)) as any;

// System Schema (for health, migrations, etc)
const systemSchema = new mongoose.Schema({
  version: { type: String, required: true },
  lastBoot: { type: Date, default: Date.now },
  status: { type: String, default: 'online' }
});
export const System = (mongoose.models.System || mongoose.model('System', systemSchema)) as any;

// Provider Schema
const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: Number, default: 1 },
  status: { type: String, enum: ['healthy', 'degraded', 'offline'], default: 'healthy' },
  timeout: { type: Number, default: 5000 },
  retryCount: { type: Number, default: 3 },
  latency: { type: Number, default: 0 },
  successRate: { type: Number, default: 100 },
  healthScore: { type: Number, default: 100 },
  lastSuccess: { type: Date },
  lastFailure: { type: Date },
  supportedEndpoints: [String],
  enabled: { type: Boolean, default: true },
  credentials: { type: mongoose.Schema.Types.Mixed },
  config: { type: mongoose.Schema.Types.Mixed }
});
export const Provider = (mongoose.models.Provider || mongoose.model('Provider', providerSchema)) as any;

// Provider Analytics Schema
const providerAnalyticsSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  endpoint: { type: String, required: true },
  success: { type: Boolean, required: true },
  latency: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
export const ProviderAnalytics = (mongoose.models.ProviderAnalytics || mongoose.model('ProviderAnalytics', providerAnalyticsSchema)) as any;

// Cache Schema
const cacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
// Create a TTL index
cacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Cache = (mongoose.models.Cache || mongoose.model('Cache', cacheSchema)) as any;


// ApiEndpoint Schema (for multi-endpoint APIs)
const apiEndpointSchema = new mongoose.Schema({
  apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiCatalog', required: true },
  name: { type: String, required: true },
  method: { type: String, required: true },
  route: { type: String, required: true },
  description: { type: String },
  parameters: { type: mongoose.Schema.Types.Mixed },
  headers: { type: mongoose.Schema.Types.Mixed },
  body: { type: mongoose.Schema.Types.Mixed },
  authRequired: { type: Boolean, default: true },
  rateLimits: { type: String },
  responseSuccess: { type: mongoose.Schema.Types.Mixed },
  responseError: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['active', 'deprecated', 'beta'], default: 'active' },
  visibility: { type: String, default: 'public' },
  tags: [String]
});
export const ApiEndpoint = (mongoose.models.ApiEndpoint || mongoose.model('ApiEndpoint', apiEndpointSchema)) as any;

// Plan Schema
const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dailyQuota: { type: Number, default: 1000 },
  weeklyQuota: { type: Number, default: 7000 },
  monthlyQuota: { type: Number, default: 30000 },
  requestsPerMinute: { type: Number, default: 60 },
  requestsPerSecond: { type: Number, default: 5 },
  maxApiKeys: { type: Number, default: 1 },
  maxProjects: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['active', 'hidden'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});
export const Plan = (mongoose.models.Plan || mongoose.model('Plan', planSchema)) as any;

// Google Key Schema
const googleKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, default: 'Google API Key' },
  priority: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'disabled', 'exhausted'], default: 'active' },
  usageCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  healthScore: { type: Number, default: 100 },
  lastUsedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
export const GoogleKey = (mongoose.models.GoogleKey || mongoose.model('GoogleKey', googleKeySchema)) as any;

// Message Storage Schema
const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});
export const Message = (mongoose.models.Message || mongoose.model('Message', messageSchema)) as any;

// Media Storage Schema
const mediaStorageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'audio', 'file'], required: true },
  provider: { type: String, required: true },
  publicId: { type: String }, // For Cloudinary or similar
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});
export const MediaStorage = (mongoose.models.MediaStorage || mongoose.model('MediaStorage', mediaStorageSchema)) as any;

// User Quota Tracker Schema
const userQuotaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  requestsCount: { type: Number, default: 0 },
  currentMinute: { type: String },
  minuteRequests: { type: Number, default: 0 },
  currentSecond: { type: String },
  secondRequests: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});
userQuotaSchema.index({ userId: 1, date: 1 }, { unique: true });
export const UserQuota = (mongoose.models.UserQuota || mongoose.model('UserQuota', userQuotaSchema)) as any;

