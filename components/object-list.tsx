"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import ProjectObjectModal from "./project-object-modal"

interface ObjectListProps {
  projectId: string
}

export default function ObjectList({ projectId }: ObjectListProps) {
  const { toast } = useToast()
  const [objectsWithEligibility, setObjectsWithEligibility] = useState<any[]>([])
  const [selectedObject, setSelectedObject] = useState<any | null>(null)

  // Different objects based on project
  useEffect(() => {
    const objectsByProject: Record<string, any[]> = {
      project1: [
        { id: 1, type: "Monster", name: "Pixel Dragon", image: "🐉", mintCondition: "Complete 3 quests" },
        { id: 2, type: "Monster", name: "Dot Shark", image: "🦈", mintCondition: "Collect 5 fish" },
        { id: 3, type: "Costume", name: "Hero Costume", image: "👕", mintCondition: "Win a battle" },
      ],
      project2: [
        { id: 4, type: "Decoration", name: "Pixel Castle", image: "🏰", mintCondition: "Visit 10 tanks" },
        { id: 5, type: "Decoration", name: "Treasure Chest", image: "📦", mintCondition: "Find a hidden key" },
        { id: 6, type: "Background", name: "Ocean Theme", image: "🌊", mintCondition: "Own 3 fish" },
      ],
      project3: [
        { id: 7, type: "Monster", name: "Golden Fish", image: "🐠", mintCondition: "Complete daily tasks for 5 days" },
        { id: 8, type: "Monster", name: "Rare Octopus", image: "🐙", mintCondition: "Reach level 10" },
        { id: 9, type: "Costume", name: "Crown", image: "👑", mintCondition: "Be in the top 100 players" },
      ],
    }

    // Add random eligibility status to each object
    const objects = objectsByProject[projectId] || []
    const objectsWithStatus = objects.map((obj) => ({
      ...obj,
      isEligible: Math.random() > 0.4, // 60% chance of being eligible
      projectId: projectId,
    }))

    setObjectsWithEligibility(objectsWithStatus)
  }, [projectId])

  const handleObjectClick = (object: any) => {
    setSelectedObject(object)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {objectsWithEligibility.map((object) => (
          <div
            key={object.id}
            className="pixel-card p-3 relative pb-16 cursor-pointer"
            onClick={() => handleObjectClick(object)}
          >
            <div className="w-full aspect-square bg-blue-100 mb-2 flex items-center justify-center text-4xl">
              {object.image}
            </div>

            <div className="pixel-text text-xs">{object.name}</div>
            <div className="text-xs text-gray-500">{object.type}</div>

            {/* Mint condition */}
            <div className="text-xs mt-1 text-gray-600">Condition: {object.mintCondition}</div>

            {/* Mint button at bottom */}
            <div className="absolute bottom-3 left-3 right-3">
              {object.isEligible ? (
                <div className="game-button w-full py-1 text-xs text-center">Mint</div>
              ) : (
                <div className="game-button w-full py-1 text-xs opacity-50 cursor-not-allowed text-center">
                  Not Eligible
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Project Object Modal */}
      {selectedObject && <ProjectObjectModal object={selectedObject} onClose={() => setSelectedObject(null)} />}
    </>
  )
}

