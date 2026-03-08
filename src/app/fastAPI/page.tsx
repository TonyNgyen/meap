"use client";

import React, { useActionState, useMemo, useState } from "react";
import { generateRecipe } from "./actions";

interface RecipeData {
  title: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
}

function Page() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [state, formAction] = useActionState(generateRecipe, null);

  const parsedRecipe = useMemo(() => {
    if (!state?.recipe) return null;
    try {
      console.log(JSON.parse(state.recipe));
      return JSON.parse(state.recipe) as RecipeData;
    } catch (e) {
      console.error("Parsing error:", e);
      return null;
    }
  }, [state]);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate a Recipe</h1>
      <p className="text-lg font-semibold mb-4">
        Enter ingredients to get a recipe suggestion.
      </p>
      <form
        action={formAction}
        className="rounded-md border-2 border-black bg-gray-200 p-4 flex flex-col"
      >
        <input
          type="text"
          name="ingredient"
          placeholder="Enter an ingredient"
          className="mb-2 p-2 bg-white border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setIngredientInput(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            setIngredients([...ingredients, ingredientInput]);
            setIngredientInput("");
          }}
          className="p-4 bg-blue-200 mb-2"
        >
          Add Ingredient
        </button>
        <button type="submit" className="p-4 bg-green-400 mb-2">
          Generate Recipe
        </button>
        {ingredients.map((ing, index) => (
          <input key={index} type="hidden" name="ingredients" value={ing} />
        ))}
      </form>
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Current Ingredients:</h2>
        <ul className="list-disc list-inside">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="text-lg">
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        {parsedRecipe && (
          <div className="p-4 bg-blue-100 rounded-md">
            <h3 className="text-lg font-bold">{parsedRecipe.title}</h3>
            <h4 className="font-semibold">Ingredients:</h4>
            <ul className="list-disc list-inside">
              {parsedRecipe.ingredients.map((ing, index) => (
                <li key={index}>
                  {ing.name}: {ing.quantity}
                </li>
              ))}
            </ul>
            <h4 className="font-semibold mt-2">Instructions:</h4>
            <ol className="list-decimal list-inside">
              {parsedRecipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}

export default Page;
