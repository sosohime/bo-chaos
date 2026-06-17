import chokidar from 'chokidar';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { env } from '@/const/env';

export function startWatchEnv() {
  console.log('start watching .env file change');
  chokidar.watch(path.resolve(__dirname, '../../.env')).on('change', () => {
    console.log('env file changed, write to process.env');
    const freshEnv = dotenv.config();
    if (freshEnv.parsed) {
      Object.assign(env, freshEnv.parsed);
    }
  });
}
