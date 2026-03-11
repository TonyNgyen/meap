"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ALL_NUTRIENTS_DICT } from "@/constants/constants";
import AddLogForm from "../log/add-log-form";
import { useFetch } from "@/providers/demo-provider";
import Heading from "../nav/heading";

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
  amount: string; // Changed from 'value'
  unit: string; // Added
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
  amount,
  unit,
  subtitle,
  color,
  percent,
}: NutrientCardProps) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-800/80 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700/50 p-5 flex items-center justify-between transition-all hover:shadow-md">
      <div className="flex-1 min-w-0 z-10">
        <div className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1 truncate">
          {title}
        </div>
        <div className="flex items-baseline gap-1 mb-1">
          <span
            className={`text-2xl font-extrabold tracking-tight ${colorClasses[color].text}`}
          >
            {amount}
          </span>
          <span className="text-xs font-semibold text-zinc-400 uppercase">
            {unit}
          </span>
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 truncate">
          {subtitle}
        </div>
      </div>

      {percent !== null && (
        <div className="flex-shrink-0 z-10">
          <CircularProgress percent={percent} colorKey={color} size={56} />
        </div>
      )}

      {/* Subtle background glow based on the nutrient color */}
      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none bg-${colorClasses[color].stroke}`}
        style={{ backgroundColor: colorClasses[color].stroke }}
      />
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
      <div className="space-y-4">
        {/* Unified Header Style */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#3A8F9E] animate-pulse" />
          <Heading>Today's Nutrition</Heading>
        </div>

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
          /* Premium Empty State */
          <div className="flex flex-col items-center justify-center py-4 bg-white dark:bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-700">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-[#3A8F9E]/10 blur-2xl rounded-full" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                <svg
                  className="w-8 h-8 text-[#3A8F9E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2 text-center">
              Fuel your day
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 text-center max-w-sm">
              Log your first meal to generate your daily nutrient breakdown and
              track your goals.
            </p>
            {/* Wrap the form so it feels like a deliberate action zone */}
            <AddLogForm
              selectedDate={selectedDate}
              onLogSuccess={handleLogSuccess}
            />
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
            {/* Modern Segmented Control Tabs */}
            <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-x-auto no-scrollbar max-w-full border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner">
              {Object.entries(categorizedNutrients)
                .filter(([, nutrients]) => nutrients.length > 0)
                .map(([category]) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg whitespace-nowrap transition-all ${
                      activeTab === category
                        ? "bg-white dark:bg-zinc-700 text-[#3A8F9E] dark:text-[#C9E6EA] shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categorizedNutrients[
                activeTab as keyof typeof categorizedNutrients
              ].map((nutrient) => (
                <NutrientCard
                  key={nutrient.nutrient_key}
                  title={
                    ALL_NUTRIENTS_DICT[nutrient.nutrient_key]?.display_name ||
                    nutrient.nutrient_key
                  }
                  amount={nutrient.consumed.toFixed(0)} // Passed separately now
                  unit={nutrient.unit} // Passed separately now
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
    );
  },
);

NutrientOverview.displayName = "NutrientOverview";

export default NutrientOverview;
