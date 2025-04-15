"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Header from "@/components/header"
import SynObjectDetailModal from "@/components/syn-object-detail-modal"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { KioskClient, Network } from '@mysten/kiosk'
import { type SuiObjectData, SuiParsedData } from '@mysten/sui/client'
import { SynObject, SuiMoveObject } from "@/types/synObject"

// Mock data for development
const mockSynObjects: SynObject[] = [
  {
    id: "0x123456789",
    owner: "0xmockowner1",
    attached_objects: ["obj1", "obj2"],
    image: "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//Subject%2011.png",
    is_public: true,
    max_supply: 100,
    current_supply: 1,
    price: 10,
    kioskId: "0xkiosk1",
    listing: {
      id: "0xlisting1",
      price: 10000000000
    }
  },
  {
    id: "0x987654321",
    owner: "0xmockowner2",
    attached_objects: ["obj3"],
    image: "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//Subject%205.png",
    is_public: true,
    max_supply: 50,
    current_supply: 3,
    price: 20,
    kioskId: "0xkiosk2",
    listing: {
      id: "0xlisting2",
      price: 20000000000
    }
  }
]

export default function CollectionsPage() {
  const [synObjects, setSynObjects] = useState<SynObject[]>([])
  const [selectedSynObject, setSelectedSynObject] = useState<SynObject | null>(null)
  const { toast } = useToast()
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const [kioskClient, setKioskClient] = useState<KioskClient | null>(null)

  useEffect(() => {
    // Initialize KioskClient
    const client = new KioskClient({
      client: suiClient,
      network: Network.CUSTOM,
      packageIds: {
        kioskLockRulePackageId: process.env.NEXT_PUBLIC_PACKAGE_ID ?? "",
      }
    })
    setKioskClient(client)
  }, [suiClient])

  useEffect(() => {
    // Simulate API fetch with mock data
    const fetchMockData = () => {
      setTimeout(() => {
        setSynObjects(mockSynObjects)
      }, 1000) // Add 1 second delay to simulate network request
    }

    fetchMockData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onWalletSearch={(address: string) => {
          console.log("Searching wallet:", address)
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
                    {synObject.attached_objects.length} items
                  </div>
                </div>

                <div className="text-sm">
                  <div className="font-semibold">Price:</div>
                  <div className="text-gray-600">
                    {synObject.listing ? `${synObject.listing.price / 1_000_000_000} SUI` : "Not Listed"}
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
            No items are currently listed in the marketplace.
          </div>
        )}

        {selectedSynObject && kioskClient && (
          <SynObjectDetailModal
            synObject={selectedSynObject}
            kioskClient={kioskClient}
            onClose={() => setSelectedSynObject(null)}
          />
        )}
      </main>
    </div>
  )
}