"use client"

import { useState, useEffect, Fragment } from "react"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"

interface CraftingModalProps {
  objects: any[]
  onComplete: (result: any) => void
  onClose: () => void
}

export default function CraftingModal({ objects, onComplete, onClose }: CraftingModalProps) {
  const [resultObject, setResultObject] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [totalSupply, setTotalSupply] = useState<number>(1)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    async function calculateCraftingResult() {
      try {
        // クラフトの結果を計算するAPIを呼び出し
        const { data: result, error } = await supabase
          .rpc('calculate_crafting_result', {
            object_ids: objects.map(obj => obj.id),
            object_types: objects.map(obj => obj.type)
          })

        if (error) throw error

        setResultObject(result)
        setIsLoading(false)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to calculate crafting result",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    calculateCraftingResult()
  }, [objects])

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
    try {
      if (totalSupply < 1) {
        toast({
          title: "Error",
          description: "Total supply must be at least 1",
          variant: "destructive",
        })
        return
      }

      let imageUrl = resultObject.image
      if (selectedImage) {
        const fileName = `${Date.now()}_${selectedImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('suiden')
          .upload(fileName, selectedImage)

        if (uploadError) throw uploadError

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/suiden/${fileName}`
      }

      const { data: newSynObject, error } = await supabase
        .from('syn_objects')
        .insert({
          name: resultObject.name,
          rarity: resultObject.rarity,
          image: imageUrl,
          components: objects.map(obj => obj.id),
          owner_address: 'current_user_address',
          total_supply: totalSupply
        })
        .select()
        .single()

      if (error) throw error

      onComplete(newSynObject)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create new object",
        variant: "destructive",
      })
    }
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
            <div className="flex flex-wrap items-center justify-center">
              {objects.map((object, index) => (
                <Fragment key={object.id}>
                  <div className="pixel-card p-3 w-24">
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
                  {index < objects.length - 1 && (
                    <div className="pixel-text text-2xl mx-2">+</div>
                  )}
                </Fragment>
              ))}
              {objects.length > 0 && <div className="pixel-text text-2xl mx-2">=</div>}
            </div>

            {/* Result */}
            <div className="pixel-card p-3 w-32">
              <div className="w-full aspect-square bg-blue-100 flex items-center justify-center">
                {isLoading ? (
                  <div className="animate-pulse pixel-text">...</div>
                ) : (
                  imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">{resultObject?.image}</div>
                  )
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

          <div className="mt-6 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <label className="pixel-text text-sm">Total Supply</label>
              <input
                type="number"
                min="1"
                value={totalSupply}
                onChange={(e) => setTotalSupply(parseInt(e.target.value) || 1)}
                className="pixel-input w-32 text-center"
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="pixel-text text-sm">Custom Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="game-button px-4 py-2 cursor-pointer"
              >
                Select Image
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button onClick={handleMint} className="game-button px-8 py-2" disabled={isLoading}>
              {isLoading ? "Synthesizing..." : "Mint SynObject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

