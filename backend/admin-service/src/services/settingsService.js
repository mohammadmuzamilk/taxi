let prisma;
try {
  prisma = require('../prisma');
} catch (error) {
  console.warn('Prisma not available in settingsService');
  prisma = null;
}

const defaultSettings = {
  fare: { baseFare: 50, perKmRate: 12, perMinuteRate: 2, cancellationFee: 20, surgeMultiplier: 1.5 },
  commission: { adminPercent: 20, driverPercent: 80 },
  driverRules: { autoApprove: false, maxCancellation: 3, minRating: 4.0 },
  rideRules: { maxDistance: 50, rideTimeout: 30, autoCancelTime: 5 },
  payment: { enableCash: true, enableUPI: true, enableCard: true },
  features: { surgeEnabled: false, schedulingEnabled: false, promocodeEnabled: false }
};

class SettingsService {
  async getSettings() {
    try {
      if (!prisma) return defaultSettings;
      
      let settings = await prisma.systemSetting.findUnique({
        where: { id: 'default' }
      });

      if (!settings) {
        settings = await prisma.systemSetting.create({
          data: {
            id: 'default',
            ...defaultSettings
          }
        });
      }

      return settings;
    } catch (error) {
      console.error('SettingsService error:', error.message);
      return defaultSettings;
    }
  }

  async updateSettings(updateData) {
    if (!prisma) throw new Error('Database is currently unavailable');

    const currentSettings = await this.getSettings();

    // Safely merge partial updates
    const mergedData = {
      fare: { ...currentSettings.fare, ...updateData.fare },
      commission: { ...currentSettings.commission, ...updateData.commission },
      driverRules: { ...currentSettings.driverRules, ...updateData.driverRules },
      rideRules: { ...currentSettings.rideRules, ...updateData.rideRules },
      payment: { ...currentSettings.payment, ...updateData.payment },
      features: { ...currentSettings.features, ...updateData.features }
    };

    const updated = await prisma.systemSetting.update({
      where: { id: 'default' },
      data: mergedData
    });

    // Emit socket event if io is globally available
    if (global.io) {
      global.io.emit('settings:update', updated);
    }

    return updated;
  }
}

module.exports = new SettingsService();
