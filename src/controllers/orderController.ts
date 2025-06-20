import { Request, Response, NextFunction } from 'express';
import { Order, OrderItem, Product, User, Notification } from '../models';
import sequelize from '../config/database';
import { createOrderNotification } from './notificationController';
import { getIO } from '../config/socket';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

interface CreateOrderRequest extends AuthenticatedRequest {
  body: {
    items: Array<{
      productId: number;
      quantity: number;
    }>;
    deliveryAddress: string;
    totalAmount: number;
    paymentMethod: string;
  }
}

interface GetOrderRequest extends AuthenticatedRequest {
  params: {
    id: string;
  }
}

interface GetOrdersRequest extends AuthenticatedRequest {
  query: {
    page?: string;
    limit?: string;
    status?: string;
    userId?: string;
  }
}

interface UpdateOrderStatusRequest extends AuthenticatedRequest {
  params: {
    id: string;
  };
  body: {
    status: string;
  }
}

const orderController = {
  // Create new order
  createOrder: async (req: CreateOrderRequest, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('🔍 Backend: Creating order with data:', req.body);
      console.log('🔍 Backend: User ID:', req.user?.id);
      
      const { items, deliveryAddress, totalAmount, paymentMethod } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        console.log('❌ Backend: No user ID found');
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      console.log('🔍 Backend: Creating order in database...');
      const order = await Order.create({
        userId,
        deliveryAddress,
        totalAmount,
        paymentMethod,
        status: 'pending' as const,
        paymentStatus: 'pending' as const
      }, { transaction });
if (!order) {
  res.status(404).json({ message: 'Order not found' });
  return;
}


      console.log('🔍 Backend: Order created with ID:', order.id);

      console.log('🔍 Backend: Creating order items...');
      const orderItems = await Promise.all(
        items.map(async (item: any) => {
          const product = await Product.findByPk(item.productId);
          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }
          return OrderItem.create({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          }, { transaction });
        })
      );

      console.log('🔍 Backend: Order items created:', orderItems.length);

      await transaction.commit();
      console.log('🔍 Backend: Transaction committed successfully');

      // Create initial notification
      await Notification.create({
        userId,
        orderId: order.id,
        message: 'Your order has been submitted successfully. Waiting for shop approval.',
        type: 'order_status',
        read: false
      });

      console.log('🔍 Backend: Notification created');

      // Get the complete order with user and items
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          { model: User, as: 'user' },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [{ model: Product, as: 'product' }]
          }
        ]
      });

      console.log('🔍 Backend: Complete order fetched:', completeOrder?.id);

      // Emit new order event to admin
      const io = getIO();
      if (io) {
        console.log('🔍 Backend: Emitting new_order event to admin');
        io.emit('new_order', {
          order: completeOrder
        });
      }

      console.log('✅ Backend: Order created successfully');
      res.status(201).json({
        message: 'Order created successfully',
        order: {
          ...order.toJSON(),
          orderItems
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Backend: Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  },

  // Get customer's orders
  getCustomerOrders: async (req: GetOrdersRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const orders = await Order.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
            include: [{ model: Product, as: 'product' }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  },

  // Get all orders (admin only)
  getOrders: async (req: GetOrdersRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.id || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const orders = await Order.findAll({
        where: {
          deletedAt: null // Only show non-deleted orders to admin
        },
        include: [
          { model: User, as: 'user' },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [{ model: Product, as: 'product' }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  },

  // Get order by ID
  getOrderById: async (req: GetOrderRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'imageUrl']
            }]
          }
        ]
      });
if (!order) {
  res.status(404).json({ message: 'Order not found' });
  return;
}


      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      // Transform the response to match expected structure
      const orderResponse = {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: (order as any).user,
        orderItems: (order as any).orderItems?.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: item.product
        })) || []
      };

      res.json(orderResponse);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Error fetching order' });
    }
  },

  // Update order status
  updateOrderStatus: async (req: UpdateOrderStatusRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!req.user?.id || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'phone']
          },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price']
            }]
          }
        ]
      });

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      // Update order status
      order.status = status as any; // Type assertion to fix type issue
      await order.save();

      // Emit socket event for order status update
      const io = getIO();
      if (io) {
        // Emit to admin with complete order data
        io.emit('orderStatusUpdated', {
          orderId: order.id,
          status: order.status,
          updatedAt: order.updatedAt,
          order: {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            user: (order as any).user,
            orderItems: (order as any).orderItems?.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price
              }
            })) || []
          }
        });

        // Emit to specific customer
        io.to(`user_${order.userId}`).emit('orderStatusUpdated', {
          orderId: order.id,
          status: order.status,
          updatedAt: order.updatedAt,
          order: {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            orderItems: (order as any).orderItems?.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price
              }
            })) || []
          }
        });
      }

      res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Error updating order status' });
    }
  },

  // Delete order (soft delete - only hides from admin view)
  deleteOrder: async (req: GetOrderRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user?.id || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const order = await Order.findByPk(id);

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      // Only allow deletion of delivered or cancelled orders
      if (order.status !== 'delivered' && order.status !== 'cancelled') {
        res.status(400).json({ 
          message: 'Only delivered or cancelled orders can be deleted' 
        });
        return;
      }

      // Soft delete - set deletedAt timestamp
      order.deletedAt = new Date();
      await order.save();

      // Emit order deleted event (only for admin)
      const io = getIO();
      if (io) {
        io.emit('order_deleted', { orderId: id });
      }

      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: 'Failed to delete order' });
    }
  }
};

export default orderController; 