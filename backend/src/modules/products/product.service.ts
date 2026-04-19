import { Product } from './product.model';
import { assertOwnership } from '../../utils/ownershipCheck';

export class ProductService {
  static async list(orgId: string, query: any) {
    const { page = 1, limit = 20, search, categoryId, supplierId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const filter: any = { orgId, isDeleted: false };
    if (search) filter.$text = { $search: search };
    if (categoryId) filter.categoryId = categoryId;
    if (supplierId) filter.supplierId = supplierId;
    // lowStock filter logic would require joining with Stock model, which I'll implement later.

    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    return {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(orgId: string, id: string) {
    return assertOwnership(Product, id, orgId);
  }

  static async create(orgId: string, userId: string, data: any) {
    const existing = await Product.findOne({ orgId, sku: data.sku, isDeleted: false });
    if (existing) {
      const err = new Error('SKU already exists in this organization') as any;
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }

    const product = new Product({
      ...data,
      orgId,
      createdBy: userId,
    });
    return product.save();
  }

  static async update(orgId: string, id: string, userId: string, data: any) {
    await assertOwnership(Product, id, orgId);
    return Product.findByIdAndUpdate(id, { ...data, updatedBy: userId }, { new: true });
  }

  static async softDelete(orgId: string, id: string) {
    await assertOwnership(Product, id, orgId);
    return Product.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
  }
}
