import { env } from '@/const/env';

export const jwtConstants = {
  secret: env.JWT_SECRET,
};
