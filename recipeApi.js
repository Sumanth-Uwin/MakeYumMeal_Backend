const apiKey = process.env.SPOONACULAR;
const fetch = require("node-fetch");

const searchRecipes = async (searchTerm, page) => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
  const queryParams = {
    apiKey,
    query: searchTerm,
    number: "10",
    offset: (page * 10).toString(),
  };
  url.search = new URLSearchParams(queryParams).toString();

  try {
    const searchResponse = await fetch(url);
    const resultsJson = await searchResponse.json();
    return resultsJson.results.map(recipe => recipe.id); // Return only recipe IDs
  } catch (error) {
    console.log("Error in searchRecipes:", error);
    throw error;
  }
};

const getBulkRecipeDetails = async (recipeIds) => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const url = new URL("https://api.spoonacular.com/recipes/informationBulk");
  const params = {
    apiKey,
    ids: recipeIds.join(","), // Combine IDs into a comma-separated string
  };
  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url);
    const json = await response.json();
    return json; // Return detailed recipe information
  } catch (error) {
    console.log("Error in getBulkRecipeDetails:", error);
    throw error;
  }
};

const getCompleteRecipeDetails = async (searchTerm, page) => {
  try {
    // Step 1: Search for recipes to get IDs
    const recipeIds = await searchRecipes(searchTerm, page);
    if (!recipeIds.length) {
      return { message: "No recipes found for the given search term." };
    }

    // Step 2: Fetch complete details using IDs
    const detailedRecipes = await getBulkRecipeDetails(recipeIds);
    return detailedRecipes;
  } catch (error) {
    console.log("Error in getCompleteRecipeDetails:", error);
    throw error;
  }
};

module.exports = { getCompleteRecipeDetails };
