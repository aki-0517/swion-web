"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Header from "@/components/header"
import SynObjectDetailModal from "@/components/syn-object-detail-modal"

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

export default function CollectionsPage() {
  const [synObjects, setSynObjects] = useState<SynObject[]>([])
  const [objectImages, setObjectImages] = useState<{ [key: number]: string }>({})
  const [selectedSynObject, setSelectedSynObject] = useState<SynObject | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchPublicSynObjects() {
      const { data, error } = await supabase
        .from('syn_objects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "エラー",
          description: "コレクションの読み込みに失敗しました",
          variant: "destructive",
        })
        return
      }

      setSynObjects(data || [])

      const imageUrls: { [key: number]: string } = {}
      for (const object of data || []) {
        if (object.image) {
          const { data: imageUrl } = supabase
            .storage
            .from('syn-objects')
            .getPublicUrl(object.image)
          
          if (imageUrl) {
            imageUrls[object.id] = imageUrl.publicUrl
          }
        }
      }
      setObjectImages(imageUrls)
    }

    fetchPublicSynObjects()
  }, [])

  const formatMintFlags = (mintFlags: MintFlag[]) => {
    return mintFlags.map(flag => 
      `${flag.package}::${flag.module}::${flag.function}`
    ).join(', ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onWalletSearch={(address: string) => {
          // ウォレットアドレスで検索する処理を実装
          console.log("Searching wallet:", address);
        }}
      />

      <main className="container mx-auto px-4 py-8">
        <h1 className="pixel-text text-2xl mb-6">Public Collections</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {synObjects.map((synObject) => (
            <div 
              key={synObject.id} 
              className="pixel-card p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedSynObject(synObject)}
            >
              <div className="w-full aspect-square bg-blue-100 border-2 border-black mb-4 relative">
                {objectImages[synObject.id] ? (
                  <Image
                    src={objectImages[synObject.id]}
                    alt={synObject.name || `SynObject ${synObject.id}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="pixel-text text-lg">
                  {synObject.name || `SynObject ${synObject.id}`}
                </h3>

                <div className="text-sm">
                  <div className="font-semibold">Attached Objects:</div>
                  <div className="text-gray-600">
                    {synObject.attached_objects.length} objects
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created: {new Date(synObject.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {synObjects.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            公開されているコレクションはまだありません。
          </div>
        )}

        {selectedSynObject && (
          <SynObjectDetailModal
            synObject={selectedSynObject}
            onClose={() => setSelectedSynObject(null)}
          />
        )}
      </main>
    </div>
  )
}

