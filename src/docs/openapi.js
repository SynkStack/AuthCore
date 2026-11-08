const { version } = require('../../package.json');

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ 'application/json': { schema } });
const reply = (description, schema) =>
  schema ? { description, content: json(schema) } : { description };
const secured = [{ bearerAuth: [] }];

const invalidInput = reply('Invalid input', ref('ValidationError'));
const unauthorized = reply('Missing, invalid or expired token', ref('Error'));

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'AuthCore API',
    version,
    description:
      'Authentication service for NovaStack Technologies. Log in to get an access token ' +
      '(15 minutes) and a refresh token (7 days), then click "Authorize" and paste the access token.',
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string' } } },
      ValidationError: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Validation failed' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: { field: { type: 'string' }, message: { type: 'string' } },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['member', 'admin'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 72 },
          name: { type: 'string', minLength: 1, maxLength: 100 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          tokenType: { type: 'string', example: 'Bearer' },
        },
      },
      LoginResponse: {
        allOf: [ref('Tokens'), { type: 'object', properties: { user: ref('User') } }],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Service health check',
        responses: {
          200: reply('Service is running', {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              service: { type: 'string', example: 'authcore' },
              uptime: { type: 'number' },
            },
          }),
        },
      },
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create an account (always with the member role)',
        requestBody: { required: true, content: json(ref('SignupRequest')) },
        responses: {
          201: reply('Account created', {
            type: 'object',
            properties: { user: ref('User') },
          }),
          400: invalidInput,
          409: reply('Email already registered', ref('Error')),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive tokens',
        requestBody: { required: true, content: json(ref('LoginRequest')) },
        responses: {
          200: reply('Logged in', ref('LoginResponse')),
          400: invalidInput,
          401: reply('Invalid email or password (same message for both)', ref('Error')),
          429: reply('Too many failed attempts', ref('Error')),
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Exchange a refresh token for new tokens (the old one is revoked)',
        requestBody: { required: true, content: json(ref('RefreshRequest')) },
        responses: {
          200: reply('New tokens issued', ref('Tokens')),
          400: invalidInput,
          401: reply('Unknown, expired or already used token', ref('Error')),
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke a refresh token',
        requestBody: { required: true, content: json(ref('RefreshRequest')) },
        responses: {
          204: reply('Token revoked (also returned for unknown tokens)'),
          400: invalidInput,
        },
      },
    },
    '/me': {
      get: {
        tags: ['Users'],
        summary: "The current user's profile",
        security: secured,
        responses: {
          200: reply('Profile', { type: 'object', properties: { user: ref('User') } }),
          401: unauthorized,
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List users (admin only)',
        security: secured,
        responses: {
          200: reply('Users', {
            type: 'object',
            properties: { users: { type: 'array', items: ref('User') } },
          }),
          401: unauthorized,
          403: reply('Logged in, but not an admin', ref('Error')),
        },
      },
    },
  },
};