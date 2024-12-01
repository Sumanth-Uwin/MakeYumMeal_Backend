const fetch = require("node-fetch");
require('dotenv').config();

// API keys in an array
const apiKeys = [
  process.env.SPOONACULAR_KEY1,
  process.env.SPOONACULAR_KEY2,
  process.env.SPOONACULAR_KEY3,  // Add more keys as needed
  process.env.SPOONACULAR_KEY4,
  process.env.SPOONACULAR_KEY5,
  process.env.SPOONACULAR_KEY6,
  process.env.SPOONACULAR_KEY7,
  process.env.SPOONACULAR_KEY8
];

const fetchRecipesFromApi = async (url, apiKey) => {
  try {
    const urlWithApiKey = new URL(url);
    urlWithApiKey.searchParams.append('apiKey', apiKey);

    const response = await fetch(urlWithApiKey);
    const data = await response.json();

    // Handle API rate limit error
    if (data.code === 402) {
      throw new Error("API limit reached. Please upgrade your plan.");
    }

    return data;
  } catch (error) {
    console.error(`Error fetching recipes with API key ${apiKey}:`, error.message);
    throw error;
  }
};

// Function to iterate over API keys until one works
const fetchWithMultipleKeys = async (url) => {
  const errors = []; // Track errors for each key

  for (const apiKey of apiKeys) {
    try {
      const data = await fetchRecipesFromApi(url, apiKey);
      
      // Additional validation to ensure data is not empty or undefined
      if (data && (data.results || data.length > 0)) {
        return data; // Return data if successful and not empty
      } else {
        errors.push(`No data returned for key ${apiKey}`);
      }
    } catch (error) {
      console.log(`API key ${apiKey} failed:`, error.message);
      errors.push(error.message);
    }
  }

  // If we've gone through all keys without success, throw a comprehensive error
  throw new Error(`All API keys failed. Errors: ${errors.join('; ')}`);
};

const searchRecipes = async (searchTerm, page) => {
  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
  const queryParams = {
    query: searchTerm,
    number: "20", // Number of recipes to return
    offset: (page * 10).toString(),
  };
  url.search = new URLSearchParams(queryParams).toString();

  try {
    // Use the function to try all API keys
    const data = await fetchWithMultipleKeys(url);
    return data.results.map(recipe => recipe.id); // Return only recipe IDs
  } catch (error) {
    console.error("Error in searchRecipes:", error.message);
    throw new Error("Unable to fetch recipe IDs.");
  }
};

const getBulkRecipeDetails = async (recipeIds) => {
  const url = new URL("https://api.spoonacular.com/recipes/informationBulk");
  const params = {
    ids: recipeIds.join(","),
  };
  url.search = new URLSearchParams(params).toString();

  try {
    // Use the function to try all API keys
    const data = await fetchWithMultipleKeys(url);
    return data;
  } catch (error) {
    console.error("Error in getBulkRecipeDetails:", error.message);
    throw new Error("Unable to fetch bulk recipe details.");
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
    console.log("Error in getCompleteRecipeDetails:", error.message);
    throw error;
  }
};

module.exports = { getCompleteRecipeDetails };
