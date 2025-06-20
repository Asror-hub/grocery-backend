import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { Order } from '../models';

export const createOrderNotification = async (orderId: number, userId: number, type: 'order_status' | 'order_accepted' | 'order_rejected', message: string) => {
  try {
    console.log(`Creating notification for order ${orderId}, user ${userId}: ${message}`);
    
    const notification = await Notification.create({
      orderId,
      userId,
      type,
      message,
      isRead: false
    });

    console.log('Notification created successfully:', notification.id);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log(`Fetching notifications for user ${userId}`);

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Order,
        attributes: ['id', 'status', 'totalAmount']
      }]
    });

    console.log(`Found ${notifications.length} notifications for user ${userId}`);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log(`Marking notification ${notificationId} as read for user ${userId}`);

    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    await notification.update({ isRead: true });
    console.log(`Notification ${notificationId} marked as read`);

    res.json({ 
      success: true,
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error updating notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 