import { Org } from './org.model';
import { User } from '../users/user.model';

export class OrgService {
  static async getMe(orgId: string) {
    return Org.findById(orgId);
  }

  static async updateMe(orgId: string, data: any) {
    return Org.findByIdAndUpdate(
      orgId,
      { name: data.name, timezone: data.timezone },
      { new: true }
    );
  }

  static async getMembers(orgId: string) {
    return User.find({ orgId, isDeleted: false });
  }

  static async updateMemberRole(orgId: string, userId: string, requesterId: string, role: string) {
    if (userId === requesterId) {
      const err = new Error('Cannot demote yourself') as any;
      err.statusCode = 403;
      err.code = 'CANNOT_SELF_DEMOTE';
      throw err;
    }

    const user = await User.findById(userId);
    if (!user || user.orgId.toString() !== orgId) {
      const err = new Error('Member not found') as any;
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    // Cannot change owner's role unless you are the owner (already covered by roleGuard mostly, but double check)
    if (user.role === 'owner') {
      const err = new Error('Cannot change owner role') as any;
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    user.role = role as any;
    await user.save();
    return user;
  }
}
