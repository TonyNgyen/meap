"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ALL_NUTRIENTS_DICT } from "@/constants/constants";
import AddLogForm from "../add-log-form";
import { useFetch } from "@/providers/demo-provider";

type FoodLog = {
  id: string;
  ingredient: Ingredient | null;
  recipe: Recipe | null;
  quantity: number;
  unit: string;
  logged_at: string;
  nutrients: Array<{
    nutrient_key: string;
    amount: number;
    unit: string;
  }>;
};

type Goal = {
  id: string;
  nutrient_key: string;
  target_amount: number;
  created_at: string;
};

type Ingredient = { id: string; name: string; brand: string | null };
type Recipe = { id: string; name: string };

// Expanded colors to include SVG stroke hex codes
const colorClasses = {
  blue: {
    text: "text-[#3A8F9E] dark:text-[#C9E6EA]",
    stroke: "#3A8F9E",
    bg: "stroke-zinc-100 dark:stroke-zinc-700",
  },
  green: {
    text: "text-green-600 dark:text-green-400",
    stroke: "#16a34a",
    bg: "stroke-green-100 dark:stroke-green-900/30",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    stroke: "#d97706",
    bg: "stroke-amber-100 dark:stroke-amber-900/30",
  },
  red: {
    text: "text-red-600 dark:text-red-400",
    stroke: "#dc2626",
    bg: "stroke-red-100 dark:stroke-red-900/30",
  },
  zinc: {
    text: "text-zinc-600 dark:text-zinc-400",
    stroke: "#52525b",
    bg: "stroke-zinc-100 dark:stroke-zinc-700",
  },
};

type NutrientCardProps = {
  title: string;
  value: string;
  subtitle: string;
  color: keyof typeof colorClasses;
  percent: number | null;
  compact?: boolean;
};

// Circular Dial Component
function CircularProgress({
  percent,
  colorKey,
  size = 70,
}: {
  percent: number;
  colorKey: keyof typeof colorClasses;
  size?: number;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  // Clamp progress between 0-100 for the visual ring
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset =
    circumference - (clampedPercent / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        className="transform -rotate-90"
      >
        <circle
          cx="22"
          cy="22"
          r={radius}
          strokeWidth="4"
          fill="transparent"
          className={colorClasses[colorKey].bg}
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          strokeWidth="4"
          fill="transparent"
          stroke={colorClasses[colorKey].stroke}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.8s ease-out",
            strokeLinecap: "round",
          }}
        />
      </svg>
    </div>
  );
}

function NutrientCard({
  title,
  value,
  subtitle,
  color,
  percent,
}: NutrientCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div
          className={`text-2xl font-bold truncate ${colorClasses[color].text}`}
        >
          {value}
        </div>
        <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1 truncate">
          {title}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 truncate">
          {subtitle}
        </div>
      </div>
      {percent !== null && (
        <div className="flex-shrink-0">
          <CircularProgress percent={percent} colorKey={color} />
        </div>
      )}
    </div>
  );
}

function NutrientCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 animate-pulse flex justify-between items-center">
      <div className="space-y-2 flex-1">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-20"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
      </div>
      <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded-full ml-4"></div>
    </div>
  );
}

const NutrientOverview = forwardRef(
  ({ onLogSuccess }: { onLogSuccess?: () => void }, ref) => {
    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [activeTab, setActiveTab] = useState("main");
    const [isLoading, setIsLoading] = useState(true);
    const { fetch: customFetch } = useFetch();

    const now = new Date();
    const selectedDate =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    const fetchFoodLogs = async (date: string) => {
      const res = await customFetch(`/api/food-logs?date=${date}`);
      const data = await res.json();
      if (data.success) setFoodLogs(data.food_logs || []);
    };

    const fetchGoals = async () => {
      try {
        const res = await customFetch("/api/goals");
        const data = await res.json();
        if (data.success) setGoals(data.goals);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    const refresh = async () => {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];
      await Promise.all([fetchFoodLogs(today), fetchGoals()]);
      setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
      refresh,
    }));

    useEffect(() => {
      const loadInitialData = async () => {
        setIsLoading(true);
        const today = new Date().toISOString().split("T")[0];
        await Promise.all([fetchFoodLogs(today), fetchGoals()]);
        setIsLoading(false);
      };
      loadInitialData();
    }, []);

    const getTotalNutrients = () => {
      const totals: { [key: string]: { amount: number; unit: string } } = {};
      foodLogs.forEach((log) => {
        log.nutrients?.forEach((nutrient) => {
          if (!totals[nutrient.nutrient_key]) {
            totals[nutrient.nutrient_key] = { amount: 0, unit: nutrient.unit };
          }
          totals[nutrient.nutrient_key].amount += nutrient.amount;
        });
      });
      return totals;
    };

    const combineGoalsAndTotals = () => {
      const totals = getTotalNutrients();
      const mergedKeys = new Set([
        ...Object.keys(totals),
        ...goals.map((g) => g.nutrient_key),
      ]);

      return Array.from(mergedKeys).map((key) => {
        const goal = goals.find((g) => g.nutrient_key === key);
        const consumed = totals[key]?.amount || 0;
        const unit = totals[key]?.unit || "g";
        const target = goal?.target_amount || null;
        const percent = target ? (consumed / target) * 100 : null;

        return {
          nutrient_key: key,
          consumed,
          unit,
          target,
          percent,
          hasGoal: !!goal,
        };
      });
    };

    const nutrientData = combineGoalsAndTotals();

    const categorizedNutrients = {
      main: nutrientData.filter((n) =>
        ["calories", "protein", "total_fat", "total_carbs"].includes(
          n.nutrient_key,
        ),
      ),
      macros: nutrientData.filter((n) =>
        [
          "saturated_fat",
          "trans_fat",
          "dietary_fiber",
          "sugars",
          "added_sugars",
        ].includes(n.nutrient_key),
      ),
      vitamins: nutrientData.filter(
        (n) =>
          n.nutrient_key.includes("vitamin") ||
          [
            "thiamin",
            "riboflavin",
            "niacin",
            "folate",
            "biotin",
            "pantothenic_acid",
          ].includes(n.nutrient_key),
      ),
      minerals: nutrientData.filter((n) =>
        [
          "cholesterol",
          "sodium",
          "potassium",
          "calcium",
          "iron",
          "magnesium",
          "zinc",
        ].includes(n.nutrient_key),
      ),
      other: nutrientData.filter(
        (n) =>
          ![
            "calories",
            "protein",
            "total_fat",
            "total_carbs",
            "saturated_fat",
            "trans_fat",
            "dietary_fiber",
            "sugars",
            "added_sugars",
          ].includes(n.nutrient_key) &&
          !n.nutrient_key.includes("vitamin") &&
          ![
            "thiamin",
            "riboflavin",
            "niacin",
            "folate",
            "biotin",
            "pantothenic_acid",
            "cholesterol",
            "sodium",
            "potassium",
            "calcium",
            "iron",
            "magnesium",
            "zinc",
          ].includes(n.nutrient_key),
      ),
    };

    const getColor = (
      percent: number | null,
      hasGoal: boolean,
    ): keyof typeof colorClasses => {
      if (!hasGoal) return "blue";
      if (percent === null) return "zinc";
      if (percent >= 90) return "green";
      if (percent >= 70) return "amber";
      return "red";
    };

    const hasNoFoodLogs = foodLogs.length === 0;
    const hasNoNutrients = nutrientData.length === 0;

    const handleLogSuccess = () => {
      refresh();
      onLogSuccess?.();
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            Nutrients
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              <div className="flex space-x-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-20 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <NutrientCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : hasNoFoodLogs ? (
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-10">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 text-center">
                No food logged today
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-4 text-center">
                Log food to see your daily nutrients
              </p>
              <div className="flex items-center justify-center">
                <AddLogForm
                  selectedDate={selectedDate}
                  onLogSuccess={handleLogSuccess}
                />
              </div>
            </div>
          ) : hasNoNutrients ? (
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 text-center">
              <div className="text-zinc-400 dark:text-zinc-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                No nutrient data available
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                The logged food items don&apos;t contain nutrient information
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-zinc-200 dark:border-zinc-700 mb-4">
                <nav className="flex space-x-4 overflow-x-auto no-scrollbar">
                  {Object.entries(categorizedNutrients)
                    .filter(([, nutrients]) => nutrients.length > 0)
                    .map(([category]) => (
                      <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`px-3 py-2 text-sm font-medium rounded-t whitespace-nowrap transition-colors ${
                          activeTab === category
                            ? "text-[#3A8F9E] dark:text-[#C9E6EA] border-b-2 border-[#3A8F9E] dark:border-[#C9E6EA]"
                            : "text-zinc-400 hover:text-[#3A8F9E] dark:hover:text-[#C9E6EA] border-b-2 border-transparent cursor-pointer"
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                </nav>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categorizedNutrients[
                  activeTab as keyof typeof categorizedNutrients
                ].map((nutrient) => (
                  <NutrientCard
                    key={nutrient.nutrient_key}
                    title={
                      ALL_NUTRIENTS_DICT[nutrient.nutrient_key]?.display_name ||
                      nutrient.nutrient_key
                    }
                    value={`${nutrient.consumed.toFixed(0)}${nutrient.unit}`}
                    subtitle={
                      nutrient.hasGoal
                        ? `${nutrient.percent?.toFixed(0)}% of goal`
                        : "No goal set"
                    }
                    color={getColor(nutrient.percent, nutrient.hasGoal)}
                    percent={nutrient.percent}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
);

NutrientOverview.displayName = "NutrientOverview";

export default NutrientOverview;
