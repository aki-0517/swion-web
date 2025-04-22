"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import MyBoxModal from "@/components/my-box-modal"
import { useCurrentAccount } from "@mysten/dapp-kit"


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
    </div>
  )
}

