"use client"

import { useState } from "react"
import Layout from "@/components/layout"
import FishTank from "@/components/fish-tank"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [currentWallet, setCurrentWallet] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const handleWalletSearch = (address: string) => {
    if (!address || !address.trim()) {
      toast({
        title: "エラー",
        description: "Invalid address",
        variant: "destructive",
      })
      return
    }

    setCurrentWallet(address)
    toast({
      title: "水槽を表示",
      description: `${address}の水槽を表示しています`,
    })
  }

  return (
    <Layout
      isConnected={isConnected}
      onConnect={() => setIsConnected(true)}
      onDisconnect={() => setIsConnected(false)}
      onWalletSearch={handleWalletSearch}
      currentWallet={currentWallet}
    >
      <div className="flex items-center justify-center w-full h-full">
        <FishTank walletAddress={currentWallet} isOwner={isConnected && currentWallet === "0xMyWallet"} />
      </div>
    </Layout>
  )
}

