/// <reference types="vitest" />
import {
  demoAddFoodLog,
  demoAddGoal,
  demoDeleteGoal,
  demoGetFoodLogs,
  demoGetGoals,
  demoUpdateGoal,
} from "@/services/demo-service";
import { useDemoStore } from "@/store/demo-store";

describe("demo service", () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemo();
  });

  it("adds food logs using logged_at and returns them with timestamps", async () => {
    const loggedAt = new Date().toISOString();

    const result = await demoAddFoodLog({
      ingredient_id: "ing-1",
      quantity: 1,
      unit: "g",
      logged_at: loggedAt,
    });

    expect(result.success).toBe(true);

    const date = loggedAt.split("T")[0];
    const { food_logs } = await demoGetFoodLogs(date);
    const found = food_logs.find((log) => log.log_datetime === loggedAt);

    expect(found).toBeDefined();
    expect(found?.ingredient?.id).toBe("ing-1");
  });

  it("supports add, update, and delete goal lifecycle", async () => {
    const initial = await demoGetGoals();
    const create = await demoAddGoal({ nutrient_key: "sodium", target_amount: 2000 });
    expect(create.success).toBe(true);
    const newId = create.goal?.id;
    expect(newId).toBeTruthy();

    const update = await demoUpdateGoal({ id: newId!, target_amount: 1800 });
    expect(update.success).toBe(true);
    expect(update.goal?.target_amount).toBe(1800);

    const remove = await demoDeleteGoal(newId!);
    expect(remove.success).toBe(true);

    const after = await demoGetGoals();
    expect(after.goals.find((g) => g.id === newId)).toBeUndefined();
    expect(after.goals.length).toBe(initial.goals.length);
  });
});
