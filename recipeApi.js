const apiKey = process.env.SPOONACULAR;

const searchRecipes = async (searchTerm, page) => {
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
    const queryParams = {
        apiKey,
        query: searchTerm,
        number: "10",
        offset: (page * 10).toString()
    }
    url.search = new URLSearchParams(queryParams).toString()
    try {
        const searchResponse = await fetch(url);
        const resultsJson = await searchResponse.json();
        return resultsJson;
    } catch (error) {
        console.log(error);
    }
}

const getRecipeInstructions = async (recipeId) => {
    if (!apiKey) {
      throw new Error("API Key not found");
    }
  
    const url = new URL(
      `https://api.spoonacular.com/recipes/${recipeId}/information`
    );
    const params = {
      apiKey: apiKey,
    };
    url.search = new URLSearchParams(params).toString();
  
    const response = await fetch(url);
    const json = await response.json();
  
    return json;
  };
  

module.exports = { searchRecipes,getRecipeInstructions };