import serverlessHttp from 'serverless-http';
import app from '../../api/server';

// Wrap the Express app as a Netlify Function handler
export const handler = serverlessHttp(app);
