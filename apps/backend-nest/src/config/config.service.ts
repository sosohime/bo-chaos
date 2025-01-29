import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string | number };

  constructor() {
    this.envConfig = {
      MAX_CONCURRENT_CONVERSIONS: parseInt(
        process.env.MAX_CONCURRENT_CONVERSIONS ?? '1',
        10,
      ),
    };
  }

  get maxConcurrentConversions(): number {
    return this.envConfig.MAX_CONCURRENT_CONVERSIONS as number;
  }
}
