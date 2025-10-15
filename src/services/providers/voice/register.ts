import { VoiceProvider } from './index';
import { voiceProviderRegistry } from './index';
import { RetellProvider } from './retell';
import { VapiProvider } from './vapi';
import { AwazProvider } from './awaz';
import { getEnv } from '@/lib/env';

export function registerProviders(): void {
  const env = getEnv();
  
  if (env.RETELL_API_KEY) {
    voiceProviderRegistry.register('retell', new RetellProvider(env.RETELL_API_KEY));
  }
  
  if (env.VAPI_API_KEY) {
    voiceProviderRegistry.register('vapi', new VapiProvider(env.VAPI_API_KEY));
  }
  
  if (env.AWAZ_API_KEY) {
    voiceProviderRegistry.register('awaz', new AwazProvider(env.AWAZ_API_KEY));
  }
}

export function getActiveProvider(): VoiceProvider {
  const env = getEnv();
  
  try {
    return voiceProviderRegistry.getProvider(env.VOICE_PROVIDER);
  } catch (error) {
    throw new Error(`Voice provider '${env.VOICE_PROVIDER}' not configured. Available providers: ${Array.from(voiceProviderRegistry['providers'].keys()).join(', ')}`);
  }
}

// Initialize providers on module load
registerProviders();


