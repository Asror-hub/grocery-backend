import User from './User';
import Customer from './Customer';
import Product from './Product';
import Category from './Category';
import Order from './Order';
import OrderItem from './OrderItem';
import Promotion from './Promotion';
import PromotionProduct from './PromotionProduct';
import Notification from './Notification';
import Admin from './Admin';
import Settings from './Settings';

// Category - Product Association
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products',
});
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// User - Order Association
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Order - OrderItem Association
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'orderItems',
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

// Product - OrderItem Association
Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems',
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Promotion <-> Product Association (Many-to-Many via PromotionProduct)
Promotion.belongsToMany(Product, {
  through: PromotionProduct,
  foreignKey: 'promotionId',
  otherKey: 'productId',
  as: 'products',
});
Product.belongsToMany(Promotion, {
  through: PromotionProduct,
  foreignKey: 'productId',
  otherKey: 'promotionId',
  as: 'promotions',
});

export {
  User,
  Customer,
  Product,
  Category,
  Order,
  OrderItem,
  Promotion,
  PromotionProduct,
  Notification,
  Admin,
  Settings
}; 