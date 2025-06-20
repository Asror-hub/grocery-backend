import { Request, Response } from 'express';
import { Category, Product } from '../models';
import { Op } from 'sequelize';

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {
      isDeleted: false,
      ...(search ? {
        name: {
          [Op.iLike]: `%${search}%`
        }
      } : {})
    };

    const categories = await Category.findAndCountAll({
      where,
      include: [{
        model: Product,
        as: 'products',
        where: { isDeleted: false },
        required: false
      }],
      order: [['name', 'ASC']],
      limit: Number(limit),
      offset
    });

    res.json({
      categories: categories.rows,
      total: categories.count,
      currentPage: Number(page),
      totalPages: Math.ceil(categories.count / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

// Get category by ID with products
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        isDeleted: false
      },
      include: [{
        model: Product,
        as: 'products',
        where: { isDeleted: false },
        required: false
      }]
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Error fetching category' });
  }
};

// Create new category (admin only)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({
      where: {
        name,
        isDeleted: false
      }
    });

    if (existingCategory) {
      res.status(400).json({ error: 'Category with this name already exists' });
      return;
    }

    const category = await Category.create({
      name,
      description,
      isDeleted: false
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Error creating category' });
    }
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if new name conflicts with existing category
    if (name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          isDeleted: false,
          id: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        res.status(400).json({ error: 'Category with this name already exists' });
        return;
      }
    }

    await category.update({
      name,
      description
    });

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Error updating category' });
    }
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if category has products
    const productsCount = await Product.count({
      where: {
        categoryId: id,
        isDeleted: false
      }
    });

    if (productsCount > 0) {
      res.status(400).json({ 
        error: 'Cannot delete category with associated products' 
      });
      return;
    }

    await category.update({ isDeleted: true });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error deleting category' });
  }
}; 