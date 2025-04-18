"use client"

import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ObjectActionModalProps {
  object: any
  onAddToSynthesis: () => void
  onClose: () => void
  onPlaceInTank: (object: any) => void
  canAddToSynthesis: boolean
  onPublish?: () => void
}

export default function ObjectActionModal({
  object,
  onAddToSynthesis,
  onClose,
  onPlaceInTank,
  canAddToSynthesis,
  onPublish,
}: ObjectActionModalProps) {
  const { toast } = useToast()

  const handleDragToTank = () => {
    const dragObject = {
      id: Date.now(),
      type: "nft",
      name: object.name,
      image: object.image,
      x: 50,
      y: 50
    }

    const event = new DragEvent("dragstart")
    event.dataTransfer?.setData("application/json", JSON.stringify(dragObject))

    toast({
      title: "タンクに配置準備完了",
      description: "MyBoxからタンクにドラッグしてください",
    })
    onClose()
  }

  const handlePlaceInTank = () => {
    const nftObject = {
      id: object.id,
      type: "nft",
      name: object.name,
      image: object.image,
      x: 50,
      y: 50
    }

    onPlaceInTank(nftObject)
    
    toast({
      title: "タンクに配置完了",
      description: "NFTをドラッグして位置を調整できます",
    })
    onClose()
  }

  const handlePublish = () => {
    if (onPublish) {
      onPublish()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-500/30" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="bg-blue-50 border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="pixel-text text-gray-700 text-lg">{object.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
              {object.type === "fish" && (
                <div className="w-16 h-12 relative">
                  <div
                    className="absolute w-6 h-6 rounded-sm"
                    style={{ left: "0px", top: "3px", backgroundColor: object.color }}
                  ></div>
                  <div
                    className="absolute w-6 h-6 rounded-sm"
                    style={{ left: "6px", top: "0px", backgroundColor: object.color }}
                  ></div>
                  <div className="absolute w-3 h-3 bg-gray-600 rounded-full" style={{ left: "8px", top: "3px" }}></div>
                </div>
              )}

              {object.type === "plant" && (
                <div className="w-12 h-20 relative">
                  <div
                    className="absolute w-3 h-12 rounded-sm"
                    style={{ left: "5px", top: "8px", backgroundColor: object.color }}
                  ></div>
                  <div
                    className="absolute w-3 h-10 rounded-sm"
                    style={{ left: "2px", top: "4px", backgroundColor: object.color }}
                  ></div>
                </div>
              )}

              {object.type === "decoration" && (
                <div className="w-16 h-16 bg-yellow-100 rounded-lg border border-yellow-200 flex items-center justify-center">
                  <span className="pixel-text text-yellow-800 text-lg">{object.name.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {(object.type === "synObject" || object.type === "nft") && (
                <img src={object.image} alt={object.name} className="w-full h-full object-contain p-2" />
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="pixel-text text-gray-700 text-lg mb-1">{object.name}</div>
            <div className="text-sm text-gray-600">
              {object.type === "synObject" ? "SynObject" : object.type}
            </div>
            {object.rarity && (
              <div
                className="text-sm mt-1 font-medium"
                style={{
                  color:
                    object.rarity === "Common"
                      ? "#9CA3AF"
                      : object.rarity === "Uncommon"
                        ? "#34D399"
                        : object.rarity === "Rare"
                          ? "#60A5FA"
                          : object.rarity === "Epic"
                            ? "#A78BFA"
                            : "#F59E0B",
                }}
              >
                {object.rarity}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {canAddToSynthesis && (
              <button
                onClick={onAddToSynthesis}
                className="game-button synthesis-button w-full py-2"
              >
                Add to Synthesis
              </button>
            )}

            {object.type === "synObject" && (
              <button
                onClick={handlePublish}
                className="game-button publish-button w-full py-2 opacity-50 cursor-not-allowed"
              >
                Publish to Marketplace
              </button>
            )}

            <button
              onClick={handlePlaceInTank}
              className="game-button collections-button w-full py-2"
            >
              Place in Tank
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

