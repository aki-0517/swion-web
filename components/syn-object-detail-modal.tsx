"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

interface MintFlag {
  module: string
  package: string
  function: string
}

interface SynObject {
  id: number
  name: string
  image: string
  attached_objects: number[]
  mint_flags: MintFlag[]
  is_public: boolean
  created_at: string
  updated_at: string
}

interface SynObjectDetailModalProps {
  synObject: SynObject
  onClose: () => void
}

export default function SynObjectDetailModal({ synObject, onClose }: SynObjectDetailModalProps) {
  const formatMintFlags = (mintFlags: MintFlag[]) => {
    return mintFlags.map(flag => 
      `${flag.package}::${flag.module}::${flag.function}`
    )
  }

  const getImageUrl = () => {
    const { data } = supabase
      .storage
      .from('syn-objects')
      .getPublicUrl(synObject.image)
    
    return data?.publicUrl
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="pixel-container sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="pixel-text text-xl">
            {synObject.name || `SynObject ${synObject.id}`}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="w-full aspect-square bg-blue-100 border-2 border-black mb-4 relative">
            {synObject.image && (
              <Image
                src={getImageUrl() || ''}
                alt={synObject.name || `SynObject ${synObject.id}`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 425px) 100vw"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="pixel-text text-sm">Attached Objects:</h4>
              <p className="text-sm">
                {synObject.attached_objects.length} objects
              </p>
            </div>

            <div>
              <h4 className="pixel-text text-sm">Mint Flags:</h4>
              <div className="space-y-1">
                {formatMintFlags(synObject.mint_flags).map((flag, index) => (
                  <p key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {flag}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 