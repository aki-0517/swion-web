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
            <div className="w-32 h-32 bg-blue-100 border-4 border-black flex items-center justify-center">
              {object.type === "fish" && (
                <div className="w-16 h-12 relative">
                  <div
                    className="absolute w-6 h-6"
                    style={{ left: "0px", top: "3px", backgroundColor: object.color }}
                  ></div>
                  <div
                    className="absolute w-6 h-6"
                    style={{ left: "6px", top: "0px", backgroundColor: object.color }}
                  ></div>
                  <div className="absolute w-3 h-3 bg-black" style={{ left: "8px", top: "3px" }}></div>
                </div>
              )}

              {object.type === "plant" && (
                <div className="w-12 h-20 relative">
                  <div
                    className="absolute w-3 h-12"
                    style={{ left: "5px", top: "8px", backgroundColor: object.color }}
                  ></div>
                  <div
                    className="absolute w-3 h-10"
                    style={{ left: "2px", top: "4px", backgroundColor: object.color }}
                  ></div>
                </div>
              )}

              {object.type === "decoration" && (
                <div className="w-16 h-16 bg-yellow-200 border-3 border-black flex items-center justify-center">
                  <span className="pixel-text text-lg">{object.name.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {object.type === "synObject" && <div className="text-6xl">{object.image}</div>}
              
              {object.type === "nft" && (
                <img src={object.image} alt={object.name} className="w-full h-full object-contain" />
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="pixel-text text-lg mb-1">{object.name}</div>
            <div className="text-sm text-gray-600">{object.type === "synObject" ? "SynObject" : object.type}</div>
            {object.rarity && (
              <div
                className="text-sm mt-1"
                style={{
                  color:
                    object.rarity === "Common"
                      ? "gray"
                      : object.rarity === "Uncommon"
                        ? "green"
                        : object.rarity === "Rare"
                          ? "blue"
                          : object.rarity === "Epic"
                            ? "purple"
                            : "orange",
                }}
              >
                {object.rarity}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {canAddToSynthesis && (
              <button onClick={onAddToSynthesis} className="game-button w-full py-2">
                Add to Synthesis
              </button>
            )}

            {object.type === "synObject" && (
              <button onClick={handlePublish} className="game-button w-full py-2 bg-purple-500">
                Publish to Marketplace
              </button>
            )}

            <button 
              onClick={handlePlaceInTank} 
              className="game-button w-full py-2 bg-green-500"
            >
              Place in Tank
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

