const settingsService = require('../services/settingsService');
const { settingsSchema } = require('../validations/settingsValidation');

class SettingsController {
  async getSettings(req, res) {
    try {
      const settings = await settingsService.getSettings();
      return res.json({ success: true, data: settings });
    } catch (error) {
      console.error('getSettings error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
    }
  }

  async updateSettings(req, res) {
    try {
      // Validate input
      const validation = settingsSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid settings data', 
          errors: validation.error.format() 
        });
      }

      const updated = await settingsService.updateSettings(validation.data);
      return res.json({ success: true, message: 'Settings updated successfully', data: updated });
    } catch (error) {
      console.error('updateSettings error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
    }
  }
}

module.exports = new SettingsController();
