"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"

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

interface ObjectDetailModalProps {
  object: NFTObject
  onClose: () => void
}

export default function ObjectDetailModal({ object, onClose }: ObjectDetailModalProps) {
  const formatMintFlag = (mintFlag: MintFlag) => {
    return `${mintFlag.package}::${mintFlag.module}::${mintFlag.function}`
  }

  const getImageUrl = () => {
    const { data } = supabase
      .storage
      .from('nft-objects')
      .getPublicUrl(object.image)
    
    return data?.publicUrl
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="pixel-container sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="pixel-text text-xl">{object.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="w-full aspect-square bg-blue-100 border-2 border-black mb-4 relative">
            {object.image && (
              <Image
                src={getImageUrl() || ''}
                alt={object.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 425px) 100vw"
              />
            )}
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="pixel-text text-sm">Mint Flag:</h4>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {formatMintFlag(object.mint_flag)}
              </p>
            </div>

            <div>
              <h4 className="pixel-text text-sm">Object ID:</h4>
              <p className="text-sm">{object.id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 