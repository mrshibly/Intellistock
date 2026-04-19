import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import orgRoutes from './modules/orgs/org.routes';
import supplierRoutes from './modules/suppliers/supplier.routes';
import warehouseRoutes from './modules/warehouses/warehouse.routes';
import productRoutes from './modules/products/product.routes';
import movementRoutes from './modules/movements/movement.routes';
import purchaseOrderRoutes from './modules/purchaseOrders/purchaseOrder.routes';
import forecastRoutes from './modules/forecasts/forecast.routes';
import insightRoutes from './modules/insights/insight.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/orgs', orgRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/products', productRoutes);
router.use('/movements', movementRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/forecasts', forecastRoutes);
router.use('/insights', insightRoutes);

export default router;
