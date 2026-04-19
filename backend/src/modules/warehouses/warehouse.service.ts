import { Warehouse } from './warehouse.model';
import { assertOwnership } from '../../utils/ownershipCheck';
import { IOrg } from '../orgs/org.model';

export class WarehouseService {
  static async list(orgId: string) {
    return Warehouse.find({ orgId, isActive: true });
  }

  static async getById(orgId: string, id: string) {
    return assertOwnership(Warehouse, id, orgId);
  }

  static async create(org: IOrg, userId: string, data: any) {
    // Plan limits
    const activeCount = await Warehouse.countDocuments({ orgId: org._id, isActive: true });
    const limits: Record<string, number> = { starter: 1, growth: 3, pro: Infinity };
    
    if (activeCount >= limits[org.plan]) {
      const err = new Error(`Warehouse limit reached for ${org.plan} plan`) as any;
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (data.isDefault) {
      await Warehouse.updateMany({ orgId: org._id }, { isDefault: false });
    }

    const warehouse = new Warehouse({
      ...data,
      orgId: org._id,
      createdBy: userId,
    });
    return warehouse.save();
  }

  static async update(orgId: string, id: string, data: any) {
    await assertOwnership(Warehouse, id, orgId);

    if (data.isDefault) {
      await Warehouse.updateMany({ orgId }, { isDefault: false });
    }

    return Warehouse.findByIdAndUpdate(id, data, { new: true });
  }

  static async softDelete(orgId: string, id: string) {
    await assertOwnership(Warehouse, id, orgId);
    // Block if warehouse has stock movements (simplified for Phase 1)
    // In a real app, we'd check the Movement model.
    return Warehouse.findByIdAndUpdate(id, { isActive: false });
  }
}
