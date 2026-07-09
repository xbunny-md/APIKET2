import { Provider, ProviderAnalytics, Cache } from '../models/index.js';

export interface ProviderRequest {
  endpoint: string;
  category: string;
  params: any;
  executeParams: (provider: any) => Promise<any>; // Function that executes the actual fetch to the provider
  cacheTtl?: number; // Cache Time to live in seconds
}

export class ProviderEngine {
  static async execute(req: ProviderRequest) {
    const { endpoint, category, params, executeParams, cacheTtl = 3600 } = req;
    
    // 1. Check Cache first
    const cacheKey = `${category}:${endpoint}:${JSON.stringify(params)}`;
    const cachedData = await Cache.findOne({ key: cacheKey });
    
    if (cachedData && cachedData.expiresAt > new Date()) {
      return {
        success: true,
        data: cachedData.value,
        source: 'cache',
        latency: 0
      };
    }

    // 2. Fetch Active Providers
    const providers = await Provider.find({ 
      category, 
      enabled: true,
      supportedEndpoints: endpoint
    }).sort({ priority: -1, healthScore: -1 });

    if (!providers || providers.length === 0) {
      throw new Error(`No active providers found for ${category} ${endpoint}`);
    }

    let lastError = null;

    // 3. Iterate through providers (Fallback logic)
    for (const provider of providers) {
      if (provider.status === 'offline') {
        // Skip if recently marked offline, but we should periodically check.
        // For simplicity, we might still try if it's the only one, or skip based on lastFailure time
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (provider.lastFailure && provider.lastFailure > fiveMinsAgo) {
          continue; 
        }
      }

      let attempt = 0;
      const maxRetries = provider.retryCount || 1;

      while (attempt < maxRetries) {
        attempt++;
        const startTime = Date.now();
        
        try {
          // Execute with timeout wrapper
          const data = await Promise.race([
            executeParams(provider),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Provider timeout')), provider.timeout || 5000))
          ]);
          
          const latency = Date.now() - startTime;
          
          // Log Success Analytics
          await this.logAnalytics(provider._id, endpoint, true, latency);
          await this.updateProviderHealth(provider, true, latency);

          // Save to Cache
          const expiresAt = new Date(Date.now() + cacheTtl * 1000);
          await Cache.findOneAndUpdate(
            { key: cacheKey },
            { value: data, expiresAt },
            { upsert: true, new: true }
          );

          return {
            success: true,
            data,
            source: provider.name,
            latency
          };

        } catch (err: any) {
          lastError = err;
          // Log Failure Analytics
          const latency = Date.now() - startTime;
          await this.logAnalytics(provider._id, endpoint, false, latency);
          await this.updateProviderHealth(provider, false, latency);
          
          // Break retry loop on auth errors from provider? Or just retry. 
          // Usually we want to retry on 5xx or timeouts.
        }
      }
    }

    // 4. Exhausted all providers
    throw new Error(`All providers failed for ${category} ${endpoint}. Last error: ${lastError?.message}`);
  }

  private static async logAnalytics(providerId: any, endpoint: string, success: boolean, latency: number) {
    try {
      await ProviderAnalytics.create({
        providerId,
        endpoint,
        success,
        latency
      });
    } catch (e) {
      console.error('Failed to log provider analytics', e);
    }
  }

  private static async updateProviderHealth(provider: any, success: boolean, latency: number) {
    try {
      const now = new Date();
      let updateDoc: any = {};
      
      // Moving average for latency
      const oldLatency = provider.latency || 0;
      updateDoc.latency = oldLatency === 0 ? latency : (oldLatency * 0.9 + latency * 0.1);

      if (success) {
        updateDoc.lastSuccess = now;
        updateDoc.healthScore = Math.min(100, (provider.healthScore || 100) + 1);
        updateDoc.successRate = Math.min(100, ((provider.successRate || 100) * 9 + 100) / 10);
        updateDoc.status = updateDoc.healthScore > 50 ? 'healthy' : 'degraded';
      } else {
        updateDoc.lastFailure = now;
        updateDoc.healthScore = Math.max(0, (provider.healthScore || 100) - 10);
        updateDoc.successRate = Math.max(0, ((provider.successRate || 100) * 9 + 0) / 10);
        updateDoc.status = updateDoc.healthScore < 20 ? 'offline' : (updateDoc.healthScore < 70 ? 'degraded' : 'healthy');
      }

      await Provider.findByIdAndUpdate(provider._id, updateDoc);
    } catch (e) {
      console.error('Failed to update provider health', e);
    }
  }
}
