import swaggerJsdoc from 'swagger-jsdoc';
import { Env } from './Env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Next.js Boilerplate API',
    version: '1.0.0',
    description: 'API documentation for Next.js Boilerplate with Authentication, Stripe, and more',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: Env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'authjs.session-token',
        description: 'Session cookie from NextAuth.js',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
        },
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
          version: {
            type: 'string',
          },
          services: {
            type: 'object',
            properties: {
              database: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['up', 'down'],
                  },
                  responseTime: {
                    type: 'number',
                    description: 'Response time in milliseconds',
                  },
                },
              },
              auth: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['up', 'down'],
                  },
                },
              },
              stripe: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['configured', 'not_configured'],
                  },
                },
              },
            },
          },
        },
      },
      CheckoutSession: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'Stripe checkout session ID',
          },
          url: {
            type: 'string',
            description: 'URL to redirect user to Stripe checkout',
          },
        },
      },
      CheckoutRequest: {
        type: 'object',
        required: ['priceId', 'mode'],
        properties: {
          priceId: {
            type: 'string',
            description: 'Stripe price ID',
          },
          mode: {
            type: 'string',
            enum: ['payment', 'subscription'],
            description: 'Checkout mode',
          },
          quantity: {
            type: 'number',
            description: 'Quantity of items',
            default: 1,
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check endpoint',
        description: 'Returns the health status of the application and its dependencies',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Health check successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthCheck',
                },
              },
            },
          },
          '503': {
            description: 'Service unavailable',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthCheck',
                },
              },
            },
          },
        },
      },
    },
    '/api/stripe/checkout': {
      post: {
        summary: 'Create Stripe checkout session',
        description: 'Creates a new Stripe checkout session for payment or subscription',
        tags: ['Stripe'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CheckoutRequest',
              },
              examples: {
                payment: {
                  summary: 'One-time payment',
                  value: {
                    priceId: 'price_1234567890',
                    mode: 'payment',
                    quantity: 1,
                  },
                },
                subscription: {
                  summary: 'Subscription',
                  value: {
                    priceId: 'price_1234567890',
                    mode: 'subscription',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Checkout session created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CheckoutSession',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '502': {
            description: 'Stripe API error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/stripe/webhook': {
      post: {
        summary: 'Stripe webhook handler',
        description: 'Handles incoming Stripe webhook events',
        tags: ['Stripe'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Stripe event object',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Webhook processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    received: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid webhook signature',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'System',
      description: 'System health and monitoring endpoints',
    },
    {
      name: 'Stripe',
      description: 'Stripe payment and subscription endpoints',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
