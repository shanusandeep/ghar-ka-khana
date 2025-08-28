import { useState } from "react";
import { ArrowLeft, Search, ChefHat, Clock, Users, Utensils, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { GlobalSearchButton } from "@/components/GlobalSearchButton";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG, isGeminiConfigured } from "../config/gemini";

const RecipeFinder = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [error, setError] = useState("");

  const findRecipe = async () => {
    if (!isGeminiConfigured()) {
      setError("Gemini API key not configured. Please check the setup instructions in src/config/gemini.ts");
      return;
    }

    if (!ingredients.trim()) {
      setError("Please enter some ingredients");
      return;
    }

    setIsLoading(true);
    setError("");
    setRecipe(null);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: GEMINI_CONFIG.model,
        generationConfig: GEMINI_CONFIG.generationConfig,
      });

      const prompt = `
        Create a detailed Indian recipe using these ingredients: ${ingredients}
        ${cuisineType ? `Cuisine preference: ${cuisineType}` : ''}
        ${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions}` : ''}
        
        Please provide the response in the following JSON format only (no markdown, no additional text):
        {
          "name": "Recipe Name",
          "description": "Brief description",
          "prepTime": "15 minutes",
          "cookTime": "30 minutes",
          "servings": "4",
          "difficulty": "Easy",
          "ingredients": [
            {"item": "ingredient name", "quantity": "amount"}
          ],
          "instructions": [
            "Step 1 instruction",
            "Step 2 instruction"
          ],
          "tips": [
            "Helpful tip 1",
            "Helpful tip 2"
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const recipeText = response.text();
      
      if (recipeText) {
        try {
          // Clean the response text in case it has markdown formatting
          const cleanedText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsedRecipe = JSON.parse(cleanedText);
          setRecipe(parsedRecipe);
        } catch (parseError) {
          console.error('Parse error:', parseError);
          console.log('Raw response:', recipeText);
          setError("Failed to parse recipe data. Please try again.");
        }
      }
    } catch (err: any) {
      console.error('Error finding recipe:', err);
      
      if (err.message?.includes('API_KEY_INVALID')) {
        setError("Invalid Gemini API key. Please check your configuration.");
      } else if (err.message?.includes('QUOTA_EXCEEDED')) {
        setError("Gemini API quota exceeded. Please check your account.");
      } else if (err.message?.includes('RATE_LIMIT_EXCEEDED')) {
        setError("Rate limit exceeded. Please wait a moment and try again.");
      } else {
        setError(`Sorry, we couldn't find a recipe right now: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          <div className="flex items-center">
            <ChefHat className="w-8 h-8 text-orange-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Recipe Finder</h1>
          </div>
          <GlobalSearchButton />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* API Configuration Warning */}
          {!isGeminiConfigured() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-yellow-800 font-medium mb-2">Gemini API Key Required</h3>
                  <p className="text-yellow-700 text-sm mb-2">
                    To use the Recipe Finder feature, you need to configure your Google Gemini API key:
                  </p>
                  <ol className="text-yellow-700 text-sm list-decimal list-inside space-y-1">
                    <li>Get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                    <li>Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file in the root directory</li>
                    <li>Add: <code className="bg-yellow-100 px-1 rounded">VITE_GEMINI_API_KEY=your_api_key_here</code></li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Recipe</h2>
              <p className="text-gray-600">Tell us what ingredients you have, and we'll suggest a delicious Indian recipe!</p>
              <p className="text-sm text-green-600 mt-1">✨ Powered by Ghar Ka Khana AI - Free to use!</p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                  Available Ingredients *
                </label>
                <Textarea
                  id="ingredients"
                  placeholder="e.g., onions, tomatoes, paneer, rice, chicken, spices..."
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Preference (Optional)
                  </label>
                  <Input
                    id="cuisine"
                    placeholder="e.g., North Indian, South Indian, Bengali..."
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions (Optional)
                  </label>
                  <Input
                    id="dietary"
                    placeholder="e.g., vegetarian, vegan, gluten-free..."
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={findRecipe}
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Finding Your Recipe...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Search className="w-5 h-5 mr-2" />
                    Find Recipe
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Recipe Display */}
          {recipe && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
                <p className="text-gray-600 text-lg">{recipe.description}</p>
              </div>

              {/* Recipe Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-semibold">{recipe.prepTime}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="font-semibold">{recipe.cookTime}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Utensils className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-semibold">{recipe.difficulty}</p>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients?.map((ingredient: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{ingredient.item}</span>
                      <span className="font-medium">{ingredient.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
                <ol className="space-y-4">
                  {recipe.instructions?.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {recipe.tips && recipe.tips.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Chef's Tips</h3>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-600 mr-2">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeFinder; 