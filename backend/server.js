const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection (Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection on startup
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Database connected successfully'))
    .catch(err => console.error('❌ Database connection failed:', err.message));

// API Endpoint to handle contact form submissions
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, service, address, message } = req.body;

        // Basic validation
        if (!name || !phone) {
            return res.status(400).json({ error: 'Họ tên và số điện thoại là bắt buộc.' });
        }

        // Execute INSERT query
        await pool.query(
            `INSERT INTO contacts (full_name, phone_number, service_required, address, message)
             VALUES ($1, $2, $3, $4, $5)`,
            [name, phone, service || '', address || '', message || '']
        );

        res.status(200).json({ success: true, message: 'Gửi yêu cầu thành công.' });
    } catch (err) {
        console.error('Database connection or query failed: ', err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lưu yêu cầu của bạn.' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
