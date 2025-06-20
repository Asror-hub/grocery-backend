import { Request, Response } from 'express';
import { Order, Product, Category, Admin, User, OrderItem } from '../models';
import { Op } from 'sequelize';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Fetching dashboard statistics');

    // Get total counts
    const totalOrders = await Order.count();
    const totalProducts = await Product.count({ where: { isDeleted: false } });
    const totalCategories = await Category.count({ where: { isDeleted: false } });
    const totalAdmins = await Admin.count();
    const totalCustomers = await User.count();

    // Calculate total revenue from completed orders
    const completedOrders = await Order.findAll({
      where: {
        status: 'delivered',
        paymentStatus: 'paid'
      },
      attributes: ['totalAmount']
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Get recent orders (last 5)
    const recentOrders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get orders by status
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [Order.sequelize!.fn('COUNT', Order.sequelize!.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get top selling products (by order count) - simplified approach
    const topProducts = await Product.findAll({
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'price',
        'imageUrl'
      ],
      where: { isDeleted: false },
      limit: 5
    });

    // Calculate order count for each product
    const topProductsWithCount = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      orderCount: (product as any).orderItems?.length || 0
    })).sort((a, b) => b.orderCount - a.orderCount);

    const dashboardData = {
      summary: {
        totalOrders,
        totalProducts,
        totalCategories,
        totalAdmins,
        totalCustomers,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        customerName: (order as any).user?.name || 'Unknown',
        customerEmail: (order as any).user?.email || 'Unknown'
      })),
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.getDataValue('status'),
        count: parseInt(item.getDataValue('count') as string)
      })),
      topProducts: topProductsWithCount
    };

    console.log('✅ Dashboard statistics fetched successfully');
    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Error fetching dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get monthly revenue data for charts
export const getMonthlyRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyRevenue = await Order.findAll({
      where: {
        status: 'delivered',
        paymentStatus: 'paid',
        createdAt: {
          [Op.gte]: new Date(Number(year), 0, 1),
          [Op.lt]: new Date(Number(year) + 1, 0, 1)
        }
      },
      attributes: [
        [Order.sequelize!.fn('DATE_TRUNC', 'month', Order.sequelize!.col('createdAt')), 'month'],
        [Order.sequelize!.fn('SUM', Order.sequelize!.col('totalAmount')), 'revenue']
      ],
      group: [Order.sequelize!.fn('DATE_TRUNC', 'month', Order.sequelize!.col('createdAt'))],
      order: [[Order.sequelize!.fn('DATE_TRUNC', 'month', Order.sequelize!.col('createdAt')), 'ASC']]
    });

    res.json(monthlyRevenue);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ error: 'Failed to fetch monthly revenue' });
  }
}; 