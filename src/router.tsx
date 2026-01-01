import { createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen.ts";
import { QueryClient } from "@tanstack/react-query";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    defaultPreload: "intent",
    defaultNotFoundComponent: () => <div>Not Found</div>,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
