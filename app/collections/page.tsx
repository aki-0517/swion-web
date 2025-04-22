"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Header from "@/components/header"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { supabase } from "@/lib/supabaseClient"
import { X } from "lucide-react"

export default function CollectionsPage() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const { toast } = useToast()
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data from syn_recipes
    const fetchRecipes = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("syn_recipes")
          .select("*")
        
        if (error) {
          throw error
        }
        
        if (data) {
          // Convert each recipe to SynObject format
          const formattedRecipes = data.map(recipe => ({
            id: recipe.id,
            name: recipe.result_name,
            image: recipe.image_url,
            image_url: recipe.image_url,
            rarity: recipe.result_rarity,
            ingredients: recipe.ingredients,
            // Add properties needed for display
            attached_objects: recipe.ingredients || [],
            is_public: true,
            max_supply: recipe.max_supply || 100,
            current_supply: 1,
            price: recipe.price || 10,
            recipeData: recipe // Keep original recipe data
          }))
          
          setRecipes(formattedRecipes)
        }
      } catch (error) {
        console.error("Error fetching recipes:", error)
        toast({
          title: "Error",
          description: "Failed to fetch recipes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [toast])

  // Handle recipe click
  const handleRecipeClick = (recipe: any) => {
    setSelectedRecipe(recipe)
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: 'url("https://embed.pixiv.net/artwork.php?illust_id=116659447&mdate=1709654598")' }}>
      <Header 
        onWalletSearch={(address: string) => {
          console.log("Searching wallet:", address)
        }}
      />

      <main className="container mx-auto px-4 py-8">
        <h1 className="pixel-text text-2xl mb-6">Recipe Collection</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="pixel-card p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRecipeClick(recipe)}
              >
                <div className="w-full aspect-square bg-blue-100 border-2 border-black mb-4 relative">
                  {recipe.image && (
                    <Image
                      src={recipe.image}
                      alt={recipe.name || `Recipe ${recipe.id}`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="pixel-text text-lg">
                    {recipe.name || `Recipe #${recipe.id}`}
                  </h3>

                  <div className="text-sm">
                    <div className="font-semibold">Required Materials:</div>
                    <div className="text-gray-600">
                      {recipe.ingredients?.length || 0} items
                    </div>
                  </div>

                  {recipe.rarity && (
                    <div className="text-sm">
                      <div className="font-semibold">Rarity:</div>
                      <div className="text-gray-600">
                        {recipe.rarity}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && recipes.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No recipes found.
          </div>
        )}

        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </main>
    </div>
  )
}

// Recipe detail modal
function RecipeDetailModal({ recipe, onClose }: { recipe: any, onClose: () => void }) {
  const account = useCurrentAccount()
  const { toast } = useToast()

  const handleSynthesize = () => {
    toast({
      title: "Synthesis Started",
      description: `Starting synthesis of "${recipe.name}". Please gather the required materials.`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="bg-blue-50 border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="pixel-text text-gray-700 text-lg">{recipe.name || `Recipe #${recipe.id}`}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="w-full aspect-square bg-blue-100 border-2 border-black mb-6 relative">
            {recipe.image && (
              <Image
                src={recipe.image}
                alt={recipe.name || `Recipe ${recipe.id}`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 425px) 100vw"
              />
            )}
          </div>

          <div className="space-y-4">
            {recipe.rarity && (
              <div>
                <h4 className="pixel-text text-sm">Rarity:</h4>
                <p className="text-sm font-medium" style={{
                  color: 
                    recipe.rarity === "Common" ? "#9CA3AF" :
                    recipe.rarity === "Uncommon" ? "#34D399" :
                    recipe.rarity === "Rare" ? "#60A5FA" :
                    recipe.rarity === "Epic" ? "#A78BFA" : "#F59E0B"
                }}>
                  {recipe.rarity}
                </p>
              </div>
            )}

            <div>
              <h4 className="pixel-text text-sm">Required Materials:</h4>
              <div className="mt-2 space-y-2">
                {recipe.ingredients?.map((ingredient: string, index: number) => (
                  <div key={index} className="pixel-card p-2 text-sm">
                    {ingredient}
                  </div>
                ))}
                {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                  <p className="text-sm text-gray-500">No material information available</p>
                )}
              </div>
            </div>

            <button 
              onClick={handleSynthesize} 
              className="game-button w-full py-2 mt-4 opacity-50 cursor-not-allowed"
              disabled
            >
              Not Eligible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}