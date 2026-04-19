import mongoose, { Types } from 'mongoose';

export async function assertOwnership<T>(
  Model: mongoose.Model<T>,
  resourceId: string,
  orgId: string
): Promise<T> {
  const doc = await Model.findOne({
    _id: new Types.ObjectId(resourceId),
    orgId: new Types.ObjectId(orgId)
  } as any);

  if (!doc) {
    const err = new Error('Resource not found') as any;
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return doc;
}
