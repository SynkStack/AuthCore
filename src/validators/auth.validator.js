const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72), // bcrypt only uses the first 72 bytes
  name: z.string().trim().min(1).max(100),
});

// No length rules on login: we only check the password isn't empty.
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

module.exports = { signupSchema, loginSchema };
