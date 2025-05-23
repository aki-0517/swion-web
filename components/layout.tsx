"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import MyBoxModal from "@/components/my-box-modal"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"


interface LayoutProps {
  children: React.ReactNode
  onWalletSearch: (address: string) => void
}

export default function Layout({
  children,
  onWalletSearch
}: LayoutProps) {
  const [isMyBoxOpen, setIsMyBoxOpen] = useState(false)
  const router = useRouter()
  const account = useCurrentAccount()

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://embed.pixiv.net/artwork.php?illust_id=116659447&mdate=1709654598')"}}>
      <Header onWalletSearch={onWalletSearch} />

      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        {children}
      </main>

      <div className="relative flex justify-center md:block">
        {account?.address && (
          <button 
            className="md:absolute md:bottom-20 md:left-4 mt-4 md:mt-0 flex items-center justify-center bg-transparent border-none hover:bg-transparent focus:outline-none" 
            onClick={() => setIsMyBoxOpen(true)}
            style={{
              padding: 0,
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//treasure_red_gold.png"
              alt="MyBox"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain',
              }}
            />
          </button>
        )}
      </div>

      {isMyBoxOpen && <MyBoxModal onClose={() => setIsMyBoxOpen(false)} />}

      {/* Testnet Demo Announcement - Marquee Style */}
      <div className="fixed bottom-4 left-0 z-50 w-full px-0 mx-0 pointer-events-none select-none">
        <div className="mx-4 rounded-lg bg-black border border-yellow-700 shadow overflow-hidden h-10 flex items-center">
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="whitespace-nowrap flex items-center animate-marquee"
              style={{
                animation: 'marquee 18s linear infinite',
              }}
            >
              <span className="mx-8 text-lg font-bold text-orange-400 drop-shadow-[0_0_2px_#ff0]">
                This is a testnet demo app. All mint flags are open for testing. Please feel free to mint any NFT for free and try it out!
              </span>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}

