"use client"

import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProjectObjectModalProps {
  object: any
  onClose: () => void
}

export default function ProjectObjectModal({ object, onClose }: ProjectObjectModalProps) {
  const { toast } = useToast()

  const handleMint = () => {
    toast({
      title: "Mint Successful",
      description: `You minted ${object.name}! Fee distributed to Project ${object.projectId.replace("project", "")}`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white border-4 border-black">
        <div className="bg-blue-500 border-b-4 border-black p-4 flex justify-between items-center">
          <h2 className="pixel-text text-white text-lg">{object.name}</h2>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-blue-100 border-4 border-black flex items-center justify-center text-6xl">
              {object.image}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="pixel-text text-lg mb-1">{object.name}</div>
            <div className="text-sm text-gray-600">{object.type}</div>

            <div className="mt-4 p-3 bg-gray-100 border-2 border-gray-300 rounded-sm">
              <div className="text-sm font-bold mb-1">Mint Condition:</div>
              <div className="text-sm">{object.mintCondition}</div>
            </div>
          </div>

          <div className="space-y-3">
            {object.isEligible ? (
              <button onClick={handleMint} className="game-button w-full py-2">
                Mint
              </button>
            ) : (
              <button className="game-button w-full py-2 opacity-50 cursor-not-allowed" disabled>
                Not Eligible
              </button>
            )}

            {!object.isEligible && (
              <div className="text-center text-sm text-red-500">You haven't met the mint conditions yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

