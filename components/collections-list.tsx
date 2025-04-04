"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CollectionsListProps {
  onSelectCollection: (collectionId: string) => void
}

export default function CollectionsList({ onSelectCollection }: CollectionsListProps) {
  const { toast } = useToast()
  const [collections, setCollections] = useState([
    {
      id: "collection1",
      name: "Dragon Knight",
      image: "🐉",
      creator: "0xUser123",
      price: 0.5,
      isListed: true,
    },
    {
      id: "collection2",
      name: "Ocean King",
      image: "🐠",
      creator: "0xUser456",
      price: 0.8,
      isListed: true,
    },
    {
      id: "collection3",
      name: "Treasure Hunter",
      image: "🦑",
      creator: "0xUser789",
      price: 1.2,
      isListed: true,
    },
    {
      id: "collection4",
      name: "Pixel Warrior",
      image: "🐙",
      creator: "You",
      price: 0,
      isListed: false,
    },
  ])

  const handleBuy = (collection: any, e: React.MouseEvent) => {
    e.stopPropagation()

    toast({
      title: "Purchase Successful",
      description: `You purchased ${collection.name} for ${collection.price} SUI. Fees distributed to creator and projects.`,
    })
  }

  const handleList = (collection: any, e: React.MouseEvent) => {
    e.stopPropagation()

    setCollections(collections.map((c) => (c.id === collection.id ? { ...c, isListed: true, price: 1.0 } : c)))

    toast({
      title: "Listed for Sale",
      description: `${collection.name} is now listed for 1.0 SUI`,
    })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {collections.map((collection) => (
        <div
          key={collection.id}
          className="pixel-card p-3 cursor-pointer relative pb-16"
          onClick={() => onSelectCollection(collection.id)}
        >
          <div className="w-full aspect-square bg-blue-100 mb-2 flex items-center justify-center text-4xl">
            {collection.image}
          </div>

          <div className="pixel-text text-xs text-center">{collection.name}</div>

          <div className="text-xs text-center text-gray-600 mt-1">Creator: {collection.creator}</div>

          <div className="absolute bottom-3 left-3 right-3">
            {collection.isListed ? (
              <button onClick={(e) => handleBuy(collection, e)} className="game-button w-full py-1 text-xs">
                Buy for {collection.price} SUI
              </button>
            ) : (
              <button onClick={(e) => handleList(collection, e)} className="game-button w-full py-1 text-xs">
                List for Sale
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

