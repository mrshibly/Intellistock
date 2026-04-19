import { IUser } from '../modules/users/user.model';
import { IOrg } from '../modules/orgs/org.model';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      org: IOrg;
    }
  }
}
