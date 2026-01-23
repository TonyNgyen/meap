// src/providers/demo-provider.tsx
"use client";

import React, { createContext, useContext } from "react";

// ============================================
// CONTEXT SETUP
// ============================================
type DemoContextType = {
  isDemo: boolean;
};

const DemoContext = createContext<DemoContextType>({ isDemo: false });

// ============================================
// DEMO PROVIDER COMPONENT
// ============================================
// Wrap your demo pages with this to enable demo mode
export function DemoProvider({
  children,
  isDemo = false,
}: {
  children: React.ReactNode;
  isDemo?: boolean;
}) {
  return (
    <DemoContext.Provider value={{ isDemo }}>{children}</DemoContext.Provider>
  );
}

// ============================================
// USE DEMO HOOK
// ============================================
// Access demo state from any component
export function useDemo() {
  return useContext(DemoContext);
}

// ============================================
// USE FETCH HOOK
// ============================================
// Custom fetch hook that routes to demo services when in demo mode
export function useFetch() {
  const { isDemo } = useDemo();

  return {
    isDemo,

    // Custom fetch that routes to demo services in demo mode
    fetch: async (url: string, options?: RequestInit) => {
      if (isDemo) {
        // Route to demo services
        return handleDemoFetch(url, options);
      }

      // Normal fetch for production
      return fetch(url, options);
    },
  };
}

// ============================================
// DEMO FETCH HANDLER
// ============================================
// Routes demo fetch requests to appropriate demo services
async function handleDemoFetch(url: string, options?: RequestInit) {
  // Dynamically import demo services (avoids bundling in production)
  const {
    demoGetInventory,
    demoAddInventory,
    demoGetFoodLogs,
    demoAddFoodLog,
    demoGetGoals,
    demoAddGoal,
    demoUpdateGoal,
    demoGetIngredients,
    demoAddIngredient,
    demoSearchIngredients,
    demoGetRecipes,
    demoAddRecipe,
    demoSearchRecipes,
    demoGetRecentMeals,
  } = await import("@/services/demo-service");

  const method = options?.method || "GET";
  const body = options?.body ? JSON.parse(options.body as string) : null;

  // ============================================
  // INVENTORY ROUTES
  // ============================================
  if (url.startsWith("/api/inventory")) {
    if (method === "GET") {
      const data = await demoGetInventory();
      return createMockResponse(data);
    } else if (method === "POST") {
      const data = await demoAddInventory(body);
      return createMockResponse(data);
    }
  }

  // ============================================
  // FOOD LOGS ROUTES
  // ============================================
  else if (url.startsWith("/api/food-logs")) {
    if (method === "GET") {
      // Extract date from query string
      const urlObj = new URL(url, "http://localhost");
      const date =
        urlObj.searchParams.get("date") ||
        new Date().toISOString().split("T")[0];
      const data = await demoGetFoodLogs(date);
      console.log("Demo food logs data:", data);
      return createMockResponse(data);
    } else if (method === "POST") {
      const data = await demoAddFoodLog(body);
      return createMockResponse(data);
    }
  }

  // ============================================
  // GOALS ROUTES
  // ============================================
  else if (url.startsWith("/api/goals")) {
    if (method === "GET") {
      const data = await demoGetGoals();
      return createMockResponse(data);
    } else if (method === "POST") {
      const data = await demoAddGoal(body);
      return createMockResponse(data);
    } else if (method === "PUT") {
      const data = await demoUpdateGoal(body);
      return createMockResponse(data);
    }
  }

  // ============================================
  // INGREDIENTS ROUTES
  // ============================================
  else if (url.startsWith("/api/ingredients")) {
    // Check for search endpoint
    if (url.includes("/search")) {
      const urlObj = new URL(url, "http://localhost");
      const query = urlObj.searchParams.get("q") || "";
      const data = await demoSearchIngredients(query);
      return createMockResponse(data);
    } else if (method === "GET") {
      const data = await demoGetIngredients();
      return createMockResponse(data);
    } else if (method === "POST") {
      const data = await demoAddIngredient(body);
      return createMockResponse(data);
    }
  }

  // ============================================
  // RECIPES ROUTES
  // ============================================
  else if (url.startsWith("/api/recipes")) {
    // Check for search endpoint
    if (url.includes("/search")) {
      const urlObj = new URL(url, "http://localhost");
      const query = urlObj.searchParams.get("q") || "";
      const data = await demoSearchRecipes(query);
      return createMockResponse(data);
    } else if (method === "GET") {
      const data = await demoGetRecipes();
      return createMockResponse(data);
    } else if (method === "POST") {
      const data = await demoAddRecipe(body);
      return createMockResponse(data);
    }
  }

  // ============================================
  // RECENT MEALS ROUTE
  // ============================================
  else if (url.startsWith("/api/recent-meals")) {
    if (method === "GET") {
      const data = await demoGetRecentMeals();
      return createMockResponse(data);
    }
  }

  // ============================================
  // FALLBACK
  // ============================================
  console.warn(`Demo endpoint not implemented: ${method} ${url}`);
  return createMockResponse({
    success: false,
    message: `Demo endpoint not implemented: ${method} ${url}`,
  });
}

// ============================================
// MOCK RESPONSE HELPER
// ============================================
// Creates a mock Response object that looks like a real fetch response
function createMockResponse(data: any): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "Content-Type": "application/json" }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: false,
    redirected: false,
    type: "basic" as ResponseType,
    url: "",
  } as Response;
}
