// src/app/demo/page.tsx
import DashboardClient from "@/components/dashboard/dashboard-client";

export default function DemoDashboard() {
  // Demo user data
  const demoUserData = {
    id: "demo-user-123",
    username: "demo_user",
    email: "demo@meap.app",
    first_name: "Demo",
    last_name: "User",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Initial recent meals (will be populated from demo store)
  const initialRecentMeals = [
    {
      id: "fl-1",
      log_datetime: new Date().toISOString(),
      ingredient: null,
      recipe: { name: "Scrambled Eggs" },
      nutrients: [
        { nutrient_key: "calories", amount: 203.5 },
        { nutrient_key: "protein", amount: 12 },
      ],
    },
    {
      id: "fl-2",
      log_datetime: new Date(Date.now() - 3600000).toISOString(),
      ingredient: null,
      recipe: { name: "Chicken & Rice Bowl" },
      nutrients: [
        { nutrient_key: "calories", amount: 415 },
        { nutrient_key: "protein", amount: 36.5 },
      ],
    },
  ];

  // Initial inventory items
  const initialInventoryItems = [
    {
      id: "inv-1",
      ingredient: { name: "Chicken Breast" },
      recipe: undefined,
      quantity: 800,
      unit: "g",
    },
    {
      id: "inv-2",
      ingredient: { name: "White Rice" },
      recipe: undefined,
      quantity: 2.5,
      unit: "cup",
    },
    {
      id: "inv-3",
      ingredient: { name: "Broccoli" },
      recipe: undefined,
      quantity: 5,
      unit: "servings",
    },
    {
      id: "inv-4",
      ingredient: { name: "Olive Oil" },
      recipe: undefined,
      quantity: 10,
      unit: "tbsp",
    },
    {
      id: "inv-5",
      ingredient: { name: "Eggs" },
      recipe: undefined,
      quantity: 8,
      unit: "piece",
    },
    {
      id: "inv-6",
      ingredient: undefined,
      recipe: { name: "Chicken & Rice Bowl" },
      quantity: 2,
      unit: "servings",
    },
  ];

  return (
    <DashboardClient
      userData={demoUserData}
      initialRecentMeals={initialRecentMeals}
      initialInventoryItems={initialInventoryItems}
    />
  );
}
