globalThis.__nitro_main__ = import.meta.url;
import { H as HTTPError, a as H3Core } from "./_libs/h3.mjs";
import { N as NodeResponse } from "./_libs/srvx.mjs";
import "./_libs/rou3.mjs";
import "node:stream";
const services = {};
globalThis.__nitro_vite_envs__ = services;
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers = new Headers(unhandled ? {} : error.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const findRouteRules = (m, p) => {
  return [];
};
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function createNitroApp() {
  const hooks = void 0;
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    return errorHandler(error, event);
  } });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules();
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
const ISR_URL_PARAM = "__isr_route";
function isrRouteRewrite(reqUrl, xNowRouteMatches) {
  if (xNowRouteMatches) {
    const isrURL = new URLSearchParams(xNowRouteMatches).get(ISR_URL_PARAM);
    if (isrURL) {
      return [decodeURIComponent(isrURL), ""];
    }
  } else {
    const queryIndex = reqUrl.indexOf("?");
    if (queryIndex !== -1) {
      const params = new URLSearchParams(reqUrl.slice(queryIndex + 1));
      const isrURL = params.get(ISR_URL_PARAM);
      if (isrURL) {
        params.delete(ISR_URL_PARAM);
        return [decodeURIComponent(isrURL), params.toString()];
      }
    }
  }
}
const nitroApp = useNitroApp();
const vercel_web = { fetch(req, context) {
  const isrURL = isrRouteRewrite(req.url, req.headers.get("x-now-route-matches"));
  if (isrURL) {
    const { routeRules } = getRouteRules("", isrURL[0]);
    if (routeRules?.isr) {
      req = new Request(new URL(isrURL[0] + (isrURL[1] ? `?${isrURL[1]}` : ""), req.url).href, req);
    }
  }
  req.runtime ??= { name: "vercel" };
  req.runtime.vercel = { context };
  let ip;
  Object.defineProperty(req, "ip", { get() {
    const h = req.headers.get("x-forwarded-for");
    return ip ??= h?.split(",").shift()?.trim();
  } });
  req.waitUntil = context?.waitUntil;
  return nitroApp.fetch(req);
} };
export {
  vercel_web as default
};
