const express = require('express');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

app.use(express.json());

// Load and serve Swagger docs
const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, '../docs/swagger.yaml'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);
app.use('/events', attendanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
