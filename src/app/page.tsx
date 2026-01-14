import AuthFooter from "@/components/auth-footer";
import DashboardClient from "@/components/dashboard/dashboard-client";
import Footer from "@/components/footer";
import RadialGradient from "@/components/radial-gradient";
import SidebarNav from "@/components/sidebar-nav";
import TopNav from "@/components/top-nav";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return (
      <>
        <div className="min-h-screen flex flex-col bg-[#F7F9FA] dark:bg-zinc-900">
          <TopNav />
          <div className="flex-1 flex flex-col justify-center items-center bg-[#F7F9FA] dark:bg-zinc-900 relative">
            <RadialGradient />
            <div className="text-center space-y-8 max-w-md z-10">
              <div className="space-y-4">
                <h1 className="font-sans font-medium text-6xl tracking-wide text-zinc-900 dark:text-white">
                  meap
                </h1>
                <div className="h-px w-16 bg-[#3A8F9E] mx-auto"></div>
                <p className="text-lg font-sans font-medium text-zinc-600 dark:text-zinc-300 tracking-wide uppercase letter-spacing: 0.05em;">
                  Meal Prep Made Simple
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/login"
                  className="px-8 py-3 rounded-sm border border-zinc-300 text-zinc-700 bg-white dark:bg-[#121212] hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all duration-300 font-semibold tracking-wide text-sm uppercase"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="px-8 py-3 rounded-sm bg-[#3A8F9E] text-white hover:bg-[#337E8D] transition-all duration-300 font-semibold tracking-wide text-sm uppercase"
                >
                  Sign up
                </a>
              </div>
            </div>

            <div className="absolute bottom-8 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-500 tracking-wide">
                Elevate your meal prep experience
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  const { data: userData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  const { data: recentMealsRaw } = await supabase
    .from("food_logs")
    .select(
      `id, log_datetime,
      ingredient:ingredients!left(name),
      recipe:recipes!left(name),
      nutrients:food_log_nutrients(nutrient_key, amount)`
    )
    .eq("user_id", data.user.id)
    .order("log_datetime", { ascending: false })
    .limit(3);

  const { data: inventoryItemsRaw } = await supabase
    .from("inventories")
    .select(
      `
        id,
        quantity,
        unit,
        created_at,
        ingredient:ingredient_id (
          id,
          name,
          brand,
          units:ingredient_units (
            id,
            unit_name,
            is_default,
            amount
          )
        ),
        recipe:recipe_id (
          id,
          name,
          servings
        )
      `
    )
    .eq("user_id", data.user.id);

  // Transform data
  const inventoryItems =
    inventoryItemsRaw?.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unit: item.unit,
      ingredient: Array.isArray(item.ingredient)
        ? item.ingredient[0]
        : item.ingredient,
      recipe: Array.isArray(item.recipe) ? item.recipe[0] : item.recipe,
    })) || [];

  const recentMeals =
    recentMealsRaw?.map((meal) => ({
      ...meal,
      ingredient: Array.isArray(meal.ingredient)
        ? meal.ingredient[0]
        : meal.ingredient,
      recipe: Array.isArray(meal.recipe) ? meal.recipe[0] : meal.recipe,
    })) || [];
  const user = data?.user;

  // Redirect to login if not authenticated
  const isAdmin = user?.id === process.env.ADMIN_USER_ID;

  // Pass to client component for state management
  return (
    <main className="flex h-screen">
      <SidebarNav isAdmin={isAdmin} isDemo={false} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-6 bg-[#F7F9FA] dark:bg-zinc-900">
          <DashboardClient
            userData={userData}
            initialRecentMeals={recentMeals}
            initialInventoryItems={inventoryItems}
          />
        </main>

        <AuthFooter />
      </div>
    </main>
  );
}
