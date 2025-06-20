import { Request, Response } from 'express';
import { Settings } from '../models';
import { getIO } from '../config/socket';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

const settingsController = {
  // Get all settings (admin only)
  getSettings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔧 Settings: getSettings called');
      if (!req.user?.id || req.user.role !== 'admin') {
        console.log('🔧 Settings: Access denied - not admin');
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const settings = await Settings.findAll();
      console.log('🔧 Settings: Found settings:', settings.length);
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      console.log('🔧 Settings: Returning settings map:', settingsMap);
      res.json(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  },

  // Update settings (admin only)
  updateSettings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.id || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const { settings } = req.body;

      for (const [key, value] of Object.entries(settings)) {
        await Settings.upsert({
          key,
          value: String(value),
        });
      }

      // Emit settings updated event to all connected clients
      const io = getIO();
      if (io) {
        io.emit('settings_updated', { 
          message: 'Shop hours updated',
          settings: settings 
        });
      }

      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  },

  // Get shop hours (public endpoint)
  getShopHours: async (req: Request, res: Response): Promise<void> => {
    try {
      const openingTime = await Settings.findOne({ where: { key: 'opening_time' } });
      const closingTime = await Settings.findOne({ where: { key: 'closing_time' } });

      res.json({
        openingTime: openingTime?.value || '07:00',
        closingTime: closingTime?.value || '22:00',
      });
    } catch (error) {
      console.error('Error fetching shop hours:', error);
      res.status(500).json({ message: 'Failed to fetch shop hours' });
    }
  },

  // Check if shop is open
  isShopOpen: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔧 Settings: isShopOpen called');
      const openingTime = await Settings.findOne({ where: { key: 'opening_time' } });
      const closingTime = await Settings.findOne({ where: { key: 'closing_time' } });
      const isOpen24_7 = await Settings.findOne({ where: { key: 'is_open_24_7' } });

      console.log('🔧 Settings: Opening time from DB:', openingTime?.value);
      console.log('🔧 Settings: Closing time from DB:', closingTime?.value);
      console.log('🔧 Settings: Is open 24/7 from DB:', isOpen24_7?.value);

      // If shop is set to be open 24/7, return true
      if (isOpen24_7?.value === 'true') {
        console.log('🔧 Settings: Shop is open 24/7');
        const now = new Date();
        res.json({
          isOpen: true,
          openingTime: '00:00',
          closingTime: '23:59',
          currentTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
          isOpen24_7: true,
        });
        return;
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

      // Parse time strings like "07:00" to minutes
      const parseTimeToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const openingMinutes = parseTimeToMinutes(openingTime?.value || '07:00');
      const closingMinutes = parseTimeToMinutes(closingTime?.value || '22:00');

      console.log('🔧 Settings: Current time (minutes):', currentTime);
      console.log('🔧 Settings: Opening minutes:', openingMinutes);
      console.log('🔧 Settings: Closing minutes:', closingMinutes);

      const isOpen = currentTime >= openingMinutes && currentTime <= closingMinutes;

      console.log('🔧 Settings: Shop is open:', isOpen);

      res.json({
        isOpen,
        openingTime: openingTime?.value || '07:00',
        closingTime: closingTime?.value || '22:00',
        currentTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        isOpen24_7: false,
      });
    } catch (error) {
      console.error('Error checking shop status:', error);
      res.status(500).json({ message: 'Failed to check shop status' });
    }
  },
};

export default settingsController; 