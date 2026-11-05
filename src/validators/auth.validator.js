const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72), // bcrypt only uses the first 72 bytes
  name: z.string().trim().min(1).max(100),
});
// Fields not listed here (like "role") are dropped automatically.

module.exports = { signupSchema };
