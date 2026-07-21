const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
                url: 'http://localhost:5005/api/v1',
                description: 'Development Server',
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
    apis: ['./src/routes/v1/*.js'], // Files containing annotations
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
