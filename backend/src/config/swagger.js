const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

let specs = {};
try {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'MISS REZANNA Enterprise API',
                version: '1.0.0',
                description: 'API documentation for the MISS REZANNA e-commerce platform',
            },
            servers: [
                {
                    url: '/api/v1',
                    description: 'Server',
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    }
                }
            },
            security: [{
                bearerAuth: []
            }]
        },
        apis: ['./src/routes/v1/*.js'],
    };
    specs = swaggerJsdoc(options);
} catch (e) {
    console.warn('Swagger docs initialization warning:', e.message);
}

module.exports = { swaggerUi, specs };
