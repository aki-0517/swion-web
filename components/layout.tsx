"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
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
    <div className="flex flex-col min-h-screen bg-blue-100">
      <Header onWalletSearch={onWalletSearch} />

      <main className="flex-1 p-4">{children}</main>

      <div className="relative">
        {account?.address && (
          <button className="absolute bottom-20 left-4 game-button mybox-button" onClick={() => setIsMyBoxOpen(true)}>
            MyBox
          </button>
        )}

        <Footer onExplore={() => router.push("/explore")} onCollections={() => router.push("/collections")} />
      </div>

      {isMyBoxOpen && <MyBoxModal onClose={() => setIsMyBoxOpen(false)} />}
    </div>
  )
}

