import { User as ExtendUser } from 'src/auth/entities/user.entity';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends ExtendUser {}

    interface Request {
      user: ExtendUser;
    }
  }
}
