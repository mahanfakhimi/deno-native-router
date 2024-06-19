type Params = Record<string, string>;

type CallbackHandler = (
  req: Request,
  params: Params,
  query: Record<string, string>
) => Promise<Response>;

type Method = "GET" | "POST" | "PUT" | "DELETE";
type MethodValue = { pattern: URLPattern; handler: CallbackHandler };

type RouterWithDynamicMethods = Router & {
  [method in (typeof methods)[number]]: (
    pathname: string,
    handler: CallbackHandler
  ) => void;
};

const methods: Lowercase<Method>[] = ["get", "post", "put", "delete"];

class Router {
  private routes: Record<Method, MethodValue[]> = {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: [],
  };

  private add(method: Method, pathname: string, handler: CallbackHandler) {
    const pattern = new URLPattern({ pathname });

    if (
      this.routes[method].some((route) => route.pattern.pathname === pathname)
    )
      return;

    this.routes[method].push({
      pattern,
      handler,
    });
  }

  async route(req: Request): Promise<Response> {
    for (const route of this.routes[req.method as Method]) {
      if (route.pattern.test(req.url)) {
        const url = new URL(req.url);

        const query: Record<string, string> = {};

        url.searchParams.forEach((value, key) => (query[key] = value));

        const params = route.pattern.exec(req.url)?.pathname.groups ?? {};
        return await route.handler(req, params as Params, query);
      }
    }

    return new Response(
      JSON.stringify({ message: "Route Not Found!", status: 404 }),
      {
        status: 404,
      }
    );
  }

  static create(): RouterWithDynamicMethods {
    const router = new Router() as RouterWithDynamicMethods;

    methods.forEach((method) => {
      router[method] = function (pathname: string, handler: CallbackHandler) {
        this.add(method.toUpperCase() as Method, pathname, handler);
      };
    });

    return router;
  }
}

export default Router;
