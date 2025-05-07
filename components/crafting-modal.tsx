"use client"

import { useState, useEffect, Fragment } from "react"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { Transaction } from "@mysten/sui/transactions"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"

interface CraftingModalProps {
  objects: any[]
  onComplete: (result: any) => void
  onClose: () => void
}

export default function CraftingModal({ objects, onComplete, onClose }: CraftingModalProps) {
  const [resultObject, setResultObject] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
  const { toast } = useToast()
  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  useEffect(() => {
    async function searchRecipe() {
      try {
        const objectNames = objects.map(obj => encodeURIComponent(obj.name)).sort().join(',');
        
        console.log("Sending object names to API:", objectNames);
        
        const response = await fetch(`/api/synrecipes?names=${objectNames}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setResultObject(null);
            toast({
              title: "No recipe available.",
              description: "There is no recipe that can be synthesized with the selected item combination",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          const errorData = await response.json();
          console.error("API error details:", errorData);
          throw new Error('APIエラー');
        }
        
        const { data: recipe } = await response.json();
        
        if (recipe) {
          setResultObject({
            name: recipe.name,
            image: recipe.image_url,
            rarity: recipe.result_rarity,
            price: recipe.price,
            maxSupply: recipe.max_supply
          });
        } else {
          setResultObject(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error searching recipe:", error);
        toast({
          title: "Error",
          description: "Failed to search for recipe",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }

    if (objects && objects.length > 0) {
      searchRecipe();
    } else {
      setIsLoading(false);
    }
  }, [objects]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setSelectedImage(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreviewUrl(previewUrl)
    setResultObject((prev: any) => ({
      ...prev,
      previewImage: previewUrl
    }))
  }

  const handleMint = async () => {
    if (!account?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    if (!resultObject) {
      toast({
        title: "Error",
        description: "No synthesis recipe found",
        variant: "destructive",
      })
      return
    }

    try {
      let imageUrl = resultObject.image
      if (selectedImage) {
        const fileName = `${Date.now()}_${selectedImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('suiden')
          .upload(fileName, selectedImage)

        if (uploadError) throw uploadError

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/suiden/${fileName}`
      }

      // Create a new transaction
      const transaction = new Transaction()
      
      // Call mint_syn_object with parameters matching the contract definition
      transaction.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system_syn_object::mint_syn_object`,
        arguments: [
          // attached_objects: vector<ID>
          transaction.pure.vector("address", objects.map(obj => obj.id)),
          // image: vector<u8>
          transaction.pure.vector("u8", Array.from(new TextEncoder().encode(imageUrl))),
          // max_supply: u64
          transaction.pure.u64(BigInt(resultObject.maxSupply || 100)),
          // price: u64
          transaction.pure.u64(BigInt(resultObject.price || 1000))
        ],
      })

      // Execute transaction
      await signAndExecuteTransaction({
        transaction
      })

      // Success notification
      toast({
        title: "Success",
        description: "Blends created successfully!",
      })

      // Close modal
      onComplete({
        name: resultObject.name,
        image: imageUrl,
        price: resultObject.price,
        maxSupply: resultObject.maxSupply
      })
    } catch (error) {
      console.error("Mint error:", error);
      toast({
        title: "Error",
        description: "Failed to create Blends",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-500/30" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white rounded-xl border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="bg-blue-50 border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="pixel-text text-gray-700 text-lg">Brend</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Input Objects */}
            <div className="flex flex-wrap items-center justify-center">
              {objects.map((object, index) => (
                <Fragment key={object.id}>
                  <div className="pixel-card p-3 w-24 bg-white rounded-lg border border-gray-200">
                    <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                      {object.type === "fish" && (
                        <div className="w-12 h-8 relative">
                          <div
                            className="absolute w-4 h-4 rounded-sm"
                            style={{ left: "0px", top: "2px", backgroundColor: object.color }}
                          ></div>
                          <div
                            className="absolute w-4 h-4 rounded-sm"
                            style={{ left: "4px", top: "0px", backgroundColor: object.color }}
                          ></div>
                          <div className="absolute w-2 h-2 bg-gray-600 rounded-full" style={{ left: "6px", top: "2px" }}></div>
                        </div>
                      )}

                      {object.type === "plant" && (
                        <div className="w-8 h-12 relative">
                          <div
                            className="absolute w-2 h-8 rounded-sm"
                            style={{ left: "3px", top: "4px", backgroundColor: object.color }}
                          ></div>
                          <div
                            className="absolute w-2 h-6 rounded-sm"
                            style={{ left: "1px", top: "2px", backgroundColor: object.color }}
                          ></div>
                        </div>
                      )}

                      {object.type === "decoration" && (
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg border border-yellow-200 flex items-center justify-center">
                          <span className="pixel-text text-yellow-800 text-xs">{object.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="pixel-text text-xs text-gray-700 text-center mt-2">{object.name}</div>
                  </div>
                  {index < objects.length - 1 && (
                    <div className="pixel-text text-2xl mx-2 text-gray-400">+</div>
                  )}
                </Fragment>
              ))}
              {objects.length > 0 && <div className="pixel-text text-2xl mx-2 text-gray-400">=</div>}
            </div>

            {/* Result */}
            <div className="pixel-card p-3 w-32 bg-white rounded-lg border border-gray-200">
              <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                {isLoading ? (
                  <div className="animate-pulse pixel-text text-gray-400">...</div>
                ) : resultObject ? (
                  imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={resultObject.image}
                      alt={resultObject.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )
                ) : (
                  <div className="text-xs text-center text-red-500">No recipe available</div>
                )}
              </div>
              <div className="pixel-text text-xs text-gray-700 text-center mt-2">
                {isLoading ? "Checking..." : resultObject ? resultObject.name : "Unknown item"}
              </div>
              {!isLoading && resultObject?.rarity && (
                <div
                  className="text-xs text-center font-medium"
                  style={{
                    color:
                      resultObject.rarity === "Common"
                        ? "#9CA3AF"
                        : resultObject.rarity === "Uncommon"
                          ? "#34D399"
                          : resultObject.rarity === "Rare"
                            ? "#60A5FA"
                            : resultObject.rarity === "Epic"
                              ? "#A78BFA"
                              : "#F59E0B",
                  }}
                >
                  {resultObject.rarity}
                </div>
              )}
            </div>
          </div>

          {!isLoading && resultObject && (
            <>
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleMint} 
                  className="game-button synthesis-button px-8 py-2" 
                  disabled={isLoading}
                >
                  {isLoading ? "Blending..." : "Mint Blends"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}