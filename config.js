import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
    PORT: process.env.PORT || 3100,
    PASS: process.env.PASS || '',
    USER: process.env.USER || '',
};

export default config;
