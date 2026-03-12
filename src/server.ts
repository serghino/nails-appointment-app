import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext();

  // Pass /api/* requests through so the redirect rule can route them to the
  // Express serverless function. This is belt-and-suspenders alongside
  // excludedPath in netlify.toml — edge functions run before redirects.
  if (new URL(request.url).pathname.startsWith('/api/')) {
    return context.next();
  }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
