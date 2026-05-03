const { z } = require('zod');

const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(6), // Assuming password for admin login
});

const driverApprovalSchema = z.object({
  driverId: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
  rejectionReason: z.string().optional(),
});

const rideAssignSchema = z.object({
  rideId: z.string().uuid(),
  driverId: z.string().uuid(),
});

module.exports = {
  loginSchema,
  driverApprovalSchema,
  rideAssignSchema,
};
