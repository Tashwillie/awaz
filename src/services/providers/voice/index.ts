import { VoiceProvider } from '@/types/webhook';
import { getEnv } from '@/lib/env';

export interface ProviderRegistry {
  getProvider(name: string): VoiceProvider;
}

class VoiceProviderRegistry implements ProviderRegistry {
  private providers = new Map<string, VoiceProvider>();

  register(name: string, provider: VoiceProvider): void {
    this.providers.set(name, provider);
  }

  getProvider(name: string): VoiceProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Voice provider '${name}' not found`);
    }
    return provider;
  }
}

export const voiceProviderRegistry = new VoiceProviderRegistry();

export function getActiveProvider(): VoiceProvider {
  const env = getEnv();
  return voiceProviderRegistry.getProvider(env.VOICE_PROVIDER);
}







