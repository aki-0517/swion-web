"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import MyBoxModal from "@/components/my-box-modal"

interface LayoutProps {
  children: React.ReactNode
  isConnected?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onWalletSearch?: (address: string) => void
  currentWallet?: string
}

export default function Layout({
  children,
  isConnected = false,
  onConnect = () => {},
  onDisconnect = () => {},
  onWalletSearch = () => {},
  currentWallet = "",
}: LayoutProps) {
  const [isMyBoxOpen, setIsMyBoxOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-blue-100">
      <Header
        isConnected={isConnected}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onWalletSearch={onWalletSearch}
        currentWallet={currentWallet}
      />

      <main className="flex-1 p-4">{children}</main>

      <div className="relative">
        {isConnected && (
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

