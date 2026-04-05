const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ✅ FIXED CORS (allow all origins)
app.use(cors({
origin: "*",
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/skills', require('./routes/skill.routes'));
app.use('/api/endorsements', require('./routes/endorsement.routes'));

// Health check route
app.get('/', (req, res) => {
res.json({ message: 'SkillForge API running 🚀' });
});

// Global error handler
app.use((err, req, res, next) => {
console.error('❌ Error:', err.stack);
res.status(err.status || 500).json({
message: err.message || 'Internal Server Error',
});
});

// Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`✅ Server running on port ${PORT}`);
});
