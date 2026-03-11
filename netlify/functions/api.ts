import serverlessHttp from 'serverless-http';
import app from '../../api/server';

const serverlessHandler = serverlessHttp(app);

// Wrap the Express app as a Netlify Function handler
export const handler = async (event: any, context: any) => {
  // Rewrite /.netlify/functions/api/foo -> /api/foo so Express routes match
  if (event.path?.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api');
  }
  if (event.rawPath?.startsWith('/.netlify/functions/api')) {
    event.rawPath = event.rawPath.replace('/.netlify/functions/api', '/api');
  }

  console.log(`[api] ${event.httpMethod} ${event.path} | origin: ${event.headers?.['origin'] || 'none'}`);
  console.log(`[api] supabase configured: ${!!(process.env['SUPABASE_URL'] && process.env['SUPABASE_ANON_KEY'])}`);
  const result = await serverlessHandler(event, context);
  console.log(`[api] response status: ${(result as any)?.statusCode}`);
  return result;
};
