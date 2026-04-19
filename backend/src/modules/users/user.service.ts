import { User } from './user.model';

export class UserService {
  static async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      const err = new Error('User not found') as any;
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return user;
  }

  static async updateMe(userId: string, data: any) {
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName: data.firstName, lastName: data.lastName },
      { new: true }
    );
    return user;
  }

  static async softDeleteMe(userId: string, confirmText: string) {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      const err = new Error('Confirm text mismatch') as any;
      err.statusCode = 400;
      err.code = 'CONFIRM_TEXT_MISMATCH';
      throw err;
    }

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found') as any;
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    // Check if user is org owner and org has other members
    if (user.role === 'owner') {
      const otherMembersCount = await User.countDocuments({
        orgId: user.orgId,
        _id: { $ne: user._id },
        isDeleted: false,
      });
      if (otherMembersCount > 0) {
        const err = new Error('Transfer ownership before deleting your account') as any;
        err.statusCode = 400;
        err.code = 'INVALID_REQUEST';
        throw err;
      }
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.refreshTokenHash = undefined;
    await user.save();
  }

  static async exportMe(userId: string) {
    const user = await User.findById(userId).populate('orgId');
    return user;
  }
}
