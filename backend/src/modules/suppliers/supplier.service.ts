import { Supplier } from './supplier.model';
import { assertOwnership } from '../../utils/ownershipCheck';

export class SupplierService {
  static async list(orgId: string) {
    return Supplier.find({ orgId, isDeleted: false });
  }

  static async getById(orgId: string, id: string) {
    return assertOwnership(Supplier, id, orgId);
  }

  static async create(orgId: string, userId: string, data: any) {
    const supplier = new Supplier({
      ...data,
      orgId,
      createdBy: userId,
    });
    return supplier.save();
  }

  static async update(orgId: string, id: string, data: any) {
    await assertOwnership(Supplier, id, orgId);
    return Supplier.findByIdAndUpdate(id, data, { new: true });
  }

  static async softDelete(orgId: string, id: string) {
    await assertOwnership(Supplier, id, orgId);
    return Supplier.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
  }
}
