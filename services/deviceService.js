const { randomizeBusPositions } = require('../controllers/deviceController');
const logger = require('../config/logger');

class DeviceService {
  constructor() {
    this.updateInterval = null;
    this.intervalMs = process.env.POSITION_UPDATE_INTERVAL || 60000;
  }

  startPositionUpdater() {
    if (this.updateInterval) {
      logger.warn('Position updater already running');
      return;
    }

    logger.info(`Starting position updater with interval: ${this.intervalMs}ms`);
    this.updateInterval = setInterval(async () => {
      try {
        await randomizeBusPositions();
      } catch (error) {
        logger.error('Error in position updater:', error);
      }
    }, this.intervalMs);
  }

  stopPositionUpdater() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('Position updater stopped');
    }
  }

  updateInterval(newInterval) {
    this.stopPositionUpdater();
    this.intervalMs = newInterval;
    this.startPositionUpdater();
    logger.info(`Position updater interval changed to: ${newInterval}ms`);
  }
}

module.exports = new DeviceService();