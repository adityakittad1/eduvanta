import 'dotenv/config';
import { createApp } from '../src/app';

// Initialize the Express app
const app = createApp();

// Export the app for Vercel serverless function
export default app;
