export default {
  fetch: async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;

    // Simple routing for your API
    if (path === '/' || path === '') {
      return new Response(
        JSON.stringify({
          message: 'Welcome to Tianji Worker',
          status: 'running',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (path === '/api/status') {
      return new Response(
        JSON.stringify({
          service: 'tianji',
          status: 'active',
          uptime: 'ok',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Default 404 response
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        path: path,
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  },
} as ExportedHandler;
