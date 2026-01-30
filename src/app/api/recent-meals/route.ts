// app/api/recent-meals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { data: recentMeals, error } = await supabase
      .from("food_logs")
      .select(
        `
        *,
        ingredient:ingredients(*),
        recipe:recipes(*),
        nutrients:food_log_nutrients(*)
      `
      ).eq("user_id", user.id)
      .order("log_datetime", { ascending: false })
      .limit(3);

    if (error) throw error;

    return NextResponse.json({ success: true, meals: recentMeals });
  } catch (error) {
    console.error("Recent meals error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
