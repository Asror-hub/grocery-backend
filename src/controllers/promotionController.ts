import { Request, Response } from 'express';
import { Promotion, Product, PromotionProduct } from '../models';
import { Op } from 'sequelize';
import { getIO } from '../config/socket';

// List all promotions
export const getAllPromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Fetching all promotions');
    const { type, isActive } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const promotions = await Promotion.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: Product, 
        as: 'products',
        attributes: ['id', 'name', 'description', 'price', 'imageUrl', 'stockQuantity', 'categoryId', 'isNew', 'isRecommended', 'createdAt', 'updatedAt', 'isDeleted']
      }],
    });

    console.log(`✅ Found ${promotions.length} promotions`);
    res.json(promotions);
  } catch (error) {
    console.error('❌ Error fetching promotions:', error);
    res.status(500).json({ error: 'Error fetching promotions' });
  }
};

// Get promotion by ID
export const getPromotionById = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('�� Fetching promotion by ID:', req.params.id);
    const promotion = await Promotion.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'products',
        through: { attributes: [] }
      }]
    });

    if (!promotion) {
      console.log('❌ Promotion not found:', req.params.id);
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }

    console.log('✅ Found promotion:', promotion.id);
    res.json(promotion);
  } catch (error) {
    console.error('❌ Error fetching promotion:', error);
    res.status(500).json({ error: 'Error fetching promotion' });
  }
};

// Create promotion
export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Creating new promotion');
    console.log('Request body:', req.body);

    const { 
      title, 
      description, 
      type, 
      discountValue, 
      price,
      startDate, 
      endDate, 
      isActive, 
      productIds, 
      quantityRequired, 
      quantityFree 
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !startDate || !endDate) {
      console.log('❌ Missing required fields');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      console.log('❌ Invalid date range');
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    // Validate product IDs
    if (!Array.isArray(productIds) || productIds.length === 0) {
      console.log('❌ No products selected');
      res.status(400).json({ error: 'At least one product must be selected' });
      return;
    }

    // Validate discount or bundle values
    if (type === 'discount' && (!discountValue || Number(discountValue) <= 0)) {
      console.log('❌ Invalid discount value');
      res.status(400).json({ error: 'Valid discount value is required' });
      return;
    }

    if (type === 'bundle' || type === '2+1') {
      if (!quantityRequired || Number(quantityRequired) <= 0) {
        console.log('❌ Invalid quantity required');
        res.status(400).json({ error: 'Valid quantity required is needed' });
        return;
      }
      if (!quantityFree || Number(quantityFree) <= 0) {
        console.log('❌ Invalid free quantity');
        res.status(400).json({ error: 'Valid free quantity is needed' });
        return;
      }
    }

    if (type === 'box' && (!price || Number(price) <= 0)) {
      console.log('❌ Invalid box price');
      res.status(400).json({ error: 'Valid box price is required' });
      return;
    }

    const promotion = await Promotion.create({
      title,
      description,
      type,
      discountValue: type === 'discount' ? Number(discountValue) : null,
      price: type === 'box' ? Number(price) : null,
      startDate,
      endDate,
      isActive: isActive ?? true,
      quantityRequired: (type === 'bundle' || type === '2+1') ? Number(quantityRequired) : null,
      quantityFree: (type === 'bundle' || type === '2+1') ? Number(quantityFree) : null,
    });

    // Assign products
    for (const productId of productIds) {
      await PromotionProduct.create({
        promotionId: promotion.id,
        productId,
        quantityRequired: (type === 'bundle' || type === '2+1') ? Number(quantityRequired) : null,
        quantityFree: (type === 'bundle' || type === '2+1') ? Number(quantityFree) : null,
      });
    }

    const promotionWithProducts = await Promotion.findByPk(promotion.id, { 
      include: [{ 
        model: Product, 
        as: 'products',
        attributes: ['id', 'name', 'description', 'price', 'imageUrl', 'stockQuantity', 'categoryId', 'isNew', 'isRecommended', 'createdAt', 'updatedAt', 'isDeleted']
      }] 
    });

    // Emit socket event for real-time updates
    const io = getIO();
    if (io) {
      console.log('🔍 Backend: Emitting promotion_updated event');
      io.emit('promotion_updated', {
        promotion: promotionWithProducts
      });
    }

    console.log('✅ Promotion created successfully:', promotion.id);
    res.status(201).json(promotionWithProducts);
  } catch (error) {
    console.error('❌ Error creating promotion:', error);
    res.status(500).json({ error: 'Error creating promotion' });
  }
};

// Update promotion
export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Updating promotion:', req.params.id);
    console.log('Request body:', req.body);

    const { id } = req.params;
    const { 
      title, 
      description, 
      type, 
      discountValue, 
      price,
      startDate, 
      endDate, 
      isActive, 
      productIds, 
      quantityRequired, 
      quantityFree 
    } = req.body;

    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      console.log('❌ Promotion not found:', id);
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }

    // Validate dates if provided
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      console.log('❌ Invalid date range');
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    // Update promotion
    await promotion.update({
      title: title || promotion.title,
      description: description || promotion.description,
      type: type || promotion.type,
      discountValue: type === 'discount' ? Number(discountValue) : null,
      price: type === 'box' ? Number(price) : null,
      startDate: startDate || promotion.startDate,
      endDate: endDate || promotion.endDate,
      isActive: isActive ?? promotion.isActive,
      quantityRequired: (type === 'bundle' || type === '2+1') ? Number(quantityRequired) : null,
      quantityFree: (type === 'bundle' || type === '2+1') ? Number(quantityFree) : null,
    });

    // Update product assignments if provided
    if (Array.isArray(productIds)) {
      await PromotionProduct.destroy({ where: { promotionId: id } });
      for (const productId of productIds) {
        await PromotionProduct.create({
          promotionId: promotion.id,
          productId,
          quantityRequired: (type === 'bundle' || type === '2+1') ? Number(quantityRequired) : null,
          quantityFree: (type === 'bundle' || type === '2+1') ? Number(quantityFree) : null,
        });
      }
    }

    const promotionWithProducts = await Promotion.findByPk(promotion.id, { 
      include: [{ 
        model: Product, 
        as: 'products',
        attributes: ['id', 'name', 'description', 'price', 'imageUrl', 'stockQuantity', 'categoryId', 'isNew', 'isRecommended', 'createdAt', 'updatedAt', 'isDeleted']
      }] 
    });

    // Emit socket event for real-time updates
    const io = getIO();
    if (io) {
      console.log('🔍 Backend: Emitting promotion_updated event');
      io.emit('promotion_updated', {
        promotion: promotionWithProducts
      });
    }

    console.log('✅ Promotion updated successfully:', id);
    res.json(promotionWithProducts);
  } catch (error) {
    console.error('❌ Error updating promotion:', error);
    res.status(500).json({ error: 'Error updating promotion' });
  }
};

// Delete promotion
export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Deleting promotion:', req.params.id);
    const { id } = req.params;

    // Delete associated product relationships first
    await PromotionProduct.destroy({ where: { promotionId: id } });
    
    // Delete the promotion
    const deleted = await Promotion.destroy({ where: { id } });
    if (!deleted) {
      console.log('❌ Promotion not found:', id);
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }

    // Emit socket event for real-time updates
    const io = getIO();
    if (io) {
      console.log('🔍 Backend: Emitting promotion_deleted event');
      io.emit('promotion_deleted', {
        promotionId: id
      });
    }

    console.log('✅ Promotion deleted successfully:', id);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting promotion:', error);
    res.status(500).json({ error: 'Error deleting promotion' });
  }
};

// Set products as new
export const setNewProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Setting new products');
    console.log('Request body:', req.body);

    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      console.log('❌ No products selected');
      res.status(400).json({ error: 'At least one product must be selected' });
      return;
    }

    // First, reset all products to not new
    await Product.update(
      { isNew: false },
      { where: {} }
    );

    // Then set selected products as new
    await Product.update(
      { isNew: true },
      { where: { id: { [Op.in]: productIds } } }
    );

    // Emit socket event for real-time updates
    const io = getIO();
    if (io) {
      console.log('🔍 Backend: Emitting promotion_updated event for new products');
      io.emit('promotion_updated', {
        type: 'new_products',
        productIds
      });
    }

    console.log('✅ New products set successfully');
    res.json({ message: 'New products set successfully' });
  } catch (error) {
    console.error('❌ Error setting new products:', error);
    res.status(500).json({ error: 'Error setting new products' });
  }
};

// Set products as recommended
export const setRecommendedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Setting recommended products');
    console.log('Request body:', req.body);

    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      console.log('❌ No products selected');
      res.status(400).json({ error: 'At least one product must be selected' });
      return;
    }

    // First, reset all products to not recommended
    await Product.update(
      { isRecommended: false },
      { where: {} }
    );

    // Then set selected products as recommended
    await Product.update(
      { isRecommended: true },
      { where: { id: { [Op.in]: productIds } } }
    );

    // Emit socket event for real-time updates
    const io = getIO();
    if (io) {
      console.log('🔍 Backend: Emitting promotion_updated event for recommended products');
      io.emit('promotion_updated', {
        type: 'recommended_products',
        productIds
      });
    }

    console.log('✅ Recommended products set successfully');
    res.json({ message: 'Recommended products set successfully' });
  } catch (error) {
    console.error('❌ Error setting recommended products:', error);
    res.status(500).json({ error: 'Error setting recommended products' });
  }
};

export const addProductsToPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!productIds || productIds.length === 0) {
      res.status(400).json({ error: 'At least one product must be selected' });
      return;
    }

    // ... rest of the function remains the same ...
  } catch (error) {
    console.error('Error adding products to promotion:', error);
    res.status(500).json({ error: 'Error adding products to promotion' });
  }
};

export const removeProductsFromPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!productIds || productIds.length === 0) {
      res.status(400).json({ error: 'At least one product must be selected' });
      return;
    }

    // ... rest of the function remains the same ...
  } catch (error) {
    console.error('Error removing products from promotion:', error);
    res.status(500).json({ error: 'Error removing products from promotion' });
  }
}; 