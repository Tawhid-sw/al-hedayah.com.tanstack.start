import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    defaultStaleTime: 24 * 60 * 60 * 1000,
    defaultGcTime: 24 * 60 * 60 * 1000,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <div>Not Found</div>,
  });

  return router;
};
