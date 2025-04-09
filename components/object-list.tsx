"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

interface MintFlag {
  module: string
  package: string
  function: string
}

interface NFTObject {
  id: number
  name: string
  image: string
  mint_flag: MintFlag
  created_at: string
  updated_at: string
  project_id: number
}

interface ObjectListProps {
  projectId: number
  onSelectObject?: (object: NFTObject) => void
}

export default function ObjectList({ projectId, onSelectObject }: ObjectListProps) {
  const { toast } = useToast()
  const [objects, setObjects] = useState<NFTObject[]>([])
  const [selectedObject, setSelectedObject] = useState<NFTObject | null>(null)
  const [objectImages, setObjectImages] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    async function fetchObjects() {
      const { data, error } = await supabase
        .from('nft_objects')
        .select(`
          id,
          name,
          image,
          mint_flag,
          created_at,
          updated_at,
          project_id
        `)
        .eq('project_id', projectId)

      if (error) {
        toast({
          title: "エラー",
          description: "オブジェクトの読み込みに失敗しました",
          variant: "destructive",
        })
        return
      }

      setObjects(data || [])

      // フルパスの画像URLをそのままマッピング
      const imageUrls: { [key: number]: string } = {}
      for (const object of data || []) {
        if (object.image) {
          imageUrls[object.id] = object.image
        }
      }
      setObjectImages(imageUrls)
    }

    fetchObjects()
  }, [projectId, toast])

  const handleObjectClick = (object: NFTObject) => {
    setSelectedObject(object)
    if (onSelectObject) {
      onSelectObject(object)
    }
  }

  // mint_flagの表示用フォーマット関数
  const formatMintFlag = (mintFlag: MintFlag) => {
    return `${mintFlag.package}::${mintFlag.module}::${mintFlag.function}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {objects.map((object) => (
        <div
          key={object.id}
          className="pixel-card p-4 cursor-pointer"
          onClick={() => handleObjectClick(object)}
        >
          <div className="w-full aspect-square bg-blue-900 border-2 border-black mb-2 flex items-center justify-center relative">
            {objectImages[object.id] ? (
              <Image
                src={objectImages[object.id]}
                alt={object.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="text-gray-400">No Image</div>
            )}
          </div>
          <h3 className="pixel-text text-sm">{object.name}</h3>
          <div className="text-xs text-gray-600 mt-1">
            Mint Flag: {formatMintFlag(object.mint_flag)}
          </div>
        </div>
      ))}
    </div>
  )
}
