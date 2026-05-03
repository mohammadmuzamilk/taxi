const { z } = require('zod');

const settingsSchema = z.object({
  fare: z.object({
    baseFare: z.number().min(0).optional(),
    perKmRate: z.number().min(0).optional(),
    perMinuteRate: z.number().min(0).optional(),
    cancellationFee: z.number().min(0).optional(),
    surgeMultiplier: z.number().min(1).optional()
  }).optional(),
  commission: z.object({
    adminPercent: z.number().min(0).max(100).optional(),
    driverPercent: z.number().min(0).max(100).optional()
  }).optional(),
  driverRules: z.object({
    autoApprove: z.boolean().optional(),
    maxCancellation: z.number().min(0).optional(),
    minRating: z.number().min(0).max(5).optional()
  }).optional(),
  rideRules: z.object({
    maxDistance: z.number().min(1).optional(),
    rideTimeout: z.number().min(1).optional(),
    autoCancelTime: z.number().min(1).optional()
  }).optional(),
  payment: z.object({
    enableCash: z.boolean().optional(),
    enableUPI: z.boolean().optional(),
    enableCard: z.boolean().optional()
  }).optional(),
  features: z.object({
    surgeEnabled: z.boolean().optional(),
    schedulingEnabled: z.boolean().optional(),
    promocodeEnabled: z.boolean().optional()
  }).optional()
});

module.exports = { settingsSchema };
