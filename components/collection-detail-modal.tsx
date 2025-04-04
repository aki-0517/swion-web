"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CollectionDetailModalProps {
  collectionId: string
  onClose: () => void
}

export default function CollectionDetailModal({ collectionId, onClose }: CollectionDetailModalProps) {
  const [collection, setCollection] = useState<any>(null)
  const [isEligible, setIsEligible] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading collection data
    const collections: Record<string, any> = {
      collection1: {
        name: "Dragon Knight",
        image: "🐉",
        creator: "0xUser123",
        price: 0.5,
        objects: [
          { type: "Monster", name: "Pixel Dragon", projectId: "project1" },
          { type: "Costume", name: "Knight Armor", projectId: "project2" },
          { type: "Decoration", name: "Castle", projectId: "project2" },
        ],
      },
      collection2: {
        name: "Ocean King",
        image: "🐠",
        creator: "0xUser456",
        price: 0.8,
        objects: [
          { type: "Monster", name: "Golden Fish", projectId: "project3" },
          { type: "Costume", name: "Crown", projectId: "project1" },
          { type: "Background", name: "Ocean Theme", projectId: "project2" },
        ],
      },
      collection3: {
        name: "Treasure Hunter",
        image: "🦑",
        creator: "0xUser789",
        price: 1.2,
        objects: [
          { type: "Monster", name: "Squid", projectId: "project3" },
          { type: "Costume", name: "Explorer Hat", projectId: "project1" },
          { type: "Decoration", name: "Treasure Chest", projectId: "project2" },
        ],
      },
      collection4: {
        name: "Pixel Warrior",
        image: "🐙",
        creator: "You",
        price: 0,
        objects: [
          { type: "Monster", name: "Octopus", projectId: "project3" },
          { type: "Costume", name: "Warrior Armor", projectId: "project1" },
          { type: "Decoration", name: "Weapon Rack", projectId: "project2" },
        ],
      },
    }

    setCollection(collections[collectionId])

    // Randomly determine eligibility for demo purposes
    setIsEligible(Math.random() > 0.5)
  }, [collectionId])

  const handleMint = () => {
    toast({
      title: "Mint Successful",
      description: `You minted ${collection?.name}! Fees distributed to creator and component projects.`,
    })
    onClose()
  }

  const handleBuy = () => {
    toast({
      title: "Purchase Successful",
      description: `You purchased ${collection?.name} for ${collection?.price} SUI. Fees distributed to creator and projects.`,
    })
    onClose()
  }

  if (!collection) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-white border-4 border-black">
        <div className="bg-blue-500 border-b-4 border-black p-4 flex justify-between items-center">
          <h2 className="pixel-text text-white text-lg">{collection.name}</h2>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 flex items-center justify-center p-4">
            <div className="w-48 h-48 bg-blue-100 border-4 border-black flex items-center justify-center text-7xl">
              {collection.image}
            </div>
          </div>

          <div className="w-full md:w-1/2 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="pixel-text text-lg">Component Objects</h3>
              <div className="text-sm">
                Creator: <span className="font-bold">{collection.creator}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {collection.objects.map((object: any, index: number) => (
                <div key={index} className="pixel-card p-2 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 border-2 border-black mr-2 flex items-center justify-center">
                    {object.type === "Monster"
                      ? "🐉"
                      : object.type === "Costume"
                        ? "👕"
                        : object.type === "Decoration"
                          ? "🏰"
                          : "🌊"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{object.name}</div>
                    <div className="text-xs text-gray-500">{object.type}</div>
                  </div>
                  <div className="text-xs bg-gray-100 px-1">{object.projectId.replace("project", "P")}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-600 mb-4">
              {collection.creator === "You"
                ? "This is your SynObject. You can list it for sale in the marketplace."
                : "This SynObject is available for purchase. Fees will be distributed to the creator and component projects."}
            </div>

            {collection.creator === "You" ? (
              <button onClick={handleMint} className="game-button w-full py-2">
                List for 1.0 SUI
              </button>
            ) : (
              <button onClick={handleBuy} className="game-button w-full py-2">
                Buy for {collection.price} SUI
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

