"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CraftingModalProps {
  objects: any[]
  onComplete: (result: any) => void
  onClose: () => void
}

export default function CraftingModal({ objects, onComplete, onClose }: CraftingModalProps) {
  const [resultObject, setResultObject] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate crafting result calculation
    const timer = setTimeout(() => {
      // Generate a result based on the combination
      const result = getCraftingResult(objects)
      setResultObject(result)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [objects])

  const getCraftingResult = (selectedObjects: any[]) => {
    // Simple crafting logic - in a real app this would be more complex
    // and would come from a backend or blockchain

    // Count object types
    const types = selectedObjects.map((obj) => obj.type)
    const fishCount = types.filter((type) => type === "fish").length
    const plantCount = types.filter((type) => type === "plant").length
    const decorationCount = types.filter((type) => type === "decoration").length

    // All fish
    if (fishCount === selectedObjects.length && fishCount > 0) {
      return {
        name: fishCount > 1 ? "School of Fish" : "Rainbow Fish",
        rarity: fishCount > 2 ? "Epic" : fishCount > 1 ? "Rare" : "Uncommon",
        image: fishCount > 2 ? "🐠🐟🐡" : fishCount > 1 ? "🐠🐟" : "🐠",
      }
    }

    // All plants
    if (plantCount === selectedObjects.length && plantCount > 0) {
      return {
        name: plantCount > 1 ? "Coral Reef" : "Giant Seaweed",
        rarity: plantCount > 2 ? "Epic" : plantCount > 1 ? "Rare" : "Uncommon",
        image: plantCount > 2 ? "🌿🌱🌾" : plantCount > 1 ? "🌿🌱" : "🌿",
      }
    }

    // All decorations
    if (decorationCount === selectedObjects.length && decorationCount > 0) {
      return {
        name: decorationCount > 1 ? "Treasure Collection" : "Golden Shrine",
        rarity: decorationCount > 2 ? "Legendary" : decorationCount > 1 ? "Epic" : "Rare",
        image: decorationCount > 2 ? "🏯🏰🏛️" : decorationCount > 1 ? "🏯🏰" : "🏯",
      }
    }

    // Fish + Plant combination
    if (fishCount > 0 && plantCount > 0 && decorationCount === 0) {
      return {
        name: "Aquatic Monster",
        rarity: fishCount + plantCount > 2 ? "Epic" : "Rare",
        image: "🦕",
      }
    }

    // Fish + Decoration combination
    if (fishCount > 0 && decorationCount > 0 && plantCount === 0) {
      return {
        name: "Treasure Guardian",
        rarity: fishCount + decorationCount > 2 ? "Epic" : "Rare",
        image: "🐉",
      }
    }

    // Plant + Decoration combination
    if (plantCount > 0 && decorationCount > 0 && fishCount === 0) {
      return {
        name: "Enchanted Garden",
        rarity: plantCount + decorationCount > 2 ? "Epic" : "Rare",
        image: "🌳",
      }
    }

    // All three types
    if (fishCount > 0 && plantCount > 0 && decorationCount > 0) {
      return {
        name: "Mythical Aquarium",
        rarity: "Legendary",
        image: "🌈",
      }
    }

    // Default fallback
    return {
      name: "Mystery Object",
      rarity: "Common",
      image: "❓",
    }
  }

  const handleMint = () => {
    onComplete(resultObject)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white border-4 border-black">
        <div className="bg-purple-500 border-b-4 border-black p-4 flex justify-between items-center">
          <h2 className="pixel-text text-white text-lg">Synthesis</h2>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Input Objects */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {objects.map((object, index) => (
                <div key={index} className="pixel-card p-3 w-24">
                  <div className="w-full aspect-square bg-blue-100 flex items-center justify-center">
                    {object.type === "fish" && (
                      <div className="w-12 h-8 relative">
                        <div
                          className="absolute w-4 h-4"
                          style={{ left: "0px", top: "2px", backgroundColor: object.color }}
                        ></div>
                        <div
                          className="absolute w-4 h-4"
                          style={{ left: "4px", top: "0px", backgroundColor: object.color }}
                        ></div>
                        <div className="absolute w-2 h-2 bg-black" style={{ left: "6px", top: "2px" }}></div>
                      </div>
                    )}

                    {object.type === "plant" && (
                      <div className="w-8 h-12 relative">
                        <div
                          className="absolute w-2 h-8"
                          style={{ left: "3px", top: "4px", backgroundColor: object.color }}
                        ></div>
                        <div
                          className="absolute w-2 h-6"
                          style={{ left: "1px", top: "2px", backgroundColor: object.color }}
                        ></div>
                      </div>
                    )}

                    {object.type === "decoration" && (
                      <div className="w-10 h-10 bg-yellow-200 border-2 border-black flex items-center justify-center">
                        <span className="pixel-text text-xs">{object.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="pixel-text text-xs text-center mt-2">{object.name}</div>
                </div>
              ))}

              {objects.length > 0 && <div className="pixel-text text-2xl mx-2">=</div>}
            </div>

            {/* Result */}
            <div className="pixel-card p-3 w-32">
              <div className="w-full aspect-square bg-blue-100 flex items-center justify-center">
                {isLoading ? (
                  <div className="animate-pulse pixel-text">...</div>
                ) : (
                  <div className="text-4xl">{resultObject?.image}</div>
                )}
              </div>
              <div className="pixel-text text-xs text-center mt-2">
                {isLoading ? "Synthesizing..." : resultObject?.name}
              </div>
              {!isLoading && resultObject?.rarity && (
                <div
                  className="text-xs text-center"
                  style={{
                    color:
                      resultObject.rarity === "Common"
                        ? "gray"
                        : resultObject.rarity === "Uncommon"
                          ? "green"
                          : resultObject.rarity === "Rare"
                            ? "blue"
                            : resultObject.rarity === "Epic"
                              ? "purple"
                              : "orange",
                  }}
                >
                  {resultObject.rarity}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button onClick={handleMint} className="game-button px-8 py-2" disabled={isLoading}>
              {isLoading ? "Synthesizing..." : "Mint SynObject"}
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Note: The component objects will be burned (consumed) when minting this SynObject
          </div>
        </div>
      </div>
    </div>
  )
}

