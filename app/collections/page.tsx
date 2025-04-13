"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Header from "@/components/header"
import SynObjectDetailModal from "@/components/syn-object-detail-modal"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { type SuiObjectData } from '@mysten/sui/client'

interface SynObject {
  id: string
  owner: string
  attached_objects: string[]
  image: string
  is_public: boolean
  max_supply: number
  current_supply: number
  price: number
  kioskId?: string
}

export default function CollectionsPage() {
  const [synObjects, setSynObjects] = useState<SynObject[]>([])
  const [selectedSynObject, setSelectedSynObject] = useState<SynObject | null>(null)
  const { toast } = useToast()
  const account = useCurrentAccount()
  const suiClient = useSuiClient()

  useEffect(() => {
    async function fetchMarketplaceSynObjects() {
      try {
        // Kioskに出品されているSynObjectを取得
        const { data: kiosks } = await suiClient.getOwnedObjects({
          owner: account?.address ?? "",
          filter: {
            MatchAll: [
              {
                Package: process.env.NEXT_PUBLIC_PACKAGE_ID ?? "",
              },
              {
                StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::marketplace::Kiosk`,
              },
            ],
          },
          options: {
            showContent: true,
            showType: true,
          },
        })

        const synObjectsData: SynObject[] = []
        
        for (const kiosk of kiosks) {
          if (!kiosk.data) continue

          // Kioskから出品中のSynObjectを取得
          const { data: objects } = await suiClient.getDynamicFields({
            parentId: kiosk.data.objectId,
          })
          
          for (const obj of objects) {
            // SynObjectの詳細情報を取得
            const { data: synObjectData } = await suiClient.getObject({
              id: obj.objectId,
              options: {
                showContent: true,
                showType: true,
              },
            })
            
            if (synObjectData && 'content' in synObjectData) {
              const fields = (synObjectData.content as { fields: any }).fields
              synObjectsData.push({
                id: synObjectData.objectId,
                owner: fields.owner,
                attached_objects: fields.attached_objects,
                image: fields.image,
                is_public: true,
                max_supply: Number(fields.max_supply),
                current_supply: Number(fields.current_supply),
                price: Number(fields.price),
                kioskId: kiosk.data.objectId,
              })
            }
          }
        }

        setSynObjects(synObjectsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load marketplace items",
          variant: "destructive",
        })
      }
    }

    fetchMarketplaceSynObjects()
  }, [suiClient, toast, account?.address])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onWalletSearch={(address: string) => {
          console.log("Searching wallet:", address);
        }}
      />

      <main className="container mx-auto px-4 py-8">
        <h1 className="pixel-text text-2xl mb-6">Marketplace</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {synObjects.map((synObject) => (
            <div 
              key={synObject.id} 
              className="pixel-card p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedSynObject(synObject)}
            >
              <div className="w-full aspect-square bg-blue-100 border-2 border-black mb-4 relative">
                {synObject.image && (
                  <Image
                    src={synObject.image}
                    alt={`SynObject ${synObject.id}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="pixel-text text-lg">
                  SynObject #{synObject.id.slice(0, 6)}
                </h3>

                <div className="text-sm">
                  <div className="font-semibold">Attached Objects:</div>
                  <div className="text-gray-600">
                    {synObject.attached_objects.length} objects
                  </div>
                </div>

                <div className="text-sm">
                  <div className="font-semibold">Price:</div>
                  <div className="text-gray-600">
                    {synObject.price} SUI
                  </div>
                </div>

                <div className="text-sm">
                  <div className="font-semibold">Supply:</div>
                  <div className="text-gray-600">
                    {synObject.current_supply} / {synObject.max_supply}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {synObjects.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No items available in the marketplace.
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

