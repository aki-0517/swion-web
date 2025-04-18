import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const names = searchParams.get("names");

  if (!names) {
    return NextResponse.json({ error: "Names parameter is required" }, { status: 400 });
  }

  try {
    // Parse comma-separated names
    const requestedNfts = names.split(",").map(name => name.trim());
    
    console.log("Searching for recipe with NFT names:", requestedNfts);
    
    // Get all recipes first
    const { data: allRecipes, error: recipesError } = await supabase
      .from("syn_recipes")
      .select("*");
      
    if (recipesError) {
      console.error("Error searching recipes:", recipesError);
      throw recipesError;
    }
    
    // Filter recipes that contain ALL requested NFTs
    const matchingRecipes = allRecipes.filter(recipe => {
      // Check if all requested NFTs are included in the recipe's ingredients
      return requestedNfts.every(nft => 
        recipe.ingredients.includes(nft)
      );
    });
    
    if (!matchingRecipes || matchingRecipes.length === 0) {
      console.log("No recipe found for NFT names:", requestedNfts);
      return NextResponse.json({ error: "Recipe not found for the provided NFTs" }, { status: 404 });
    }
    
    console.log("Found recipe:", matchingRecipes[0]);
    
    // Return the first matching recipe
    return NextResponse.json({ data: matchingRecipes[0] });
    
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch recipe", details: error }, { status: 500 });
  }
}