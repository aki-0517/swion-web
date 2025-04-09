"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import FishTank from "@/components/fish-tank"
import { useToast } from "@/hooks/use-toast"
import { useCurrentAccount } from "@mysten/dapp-kit"

export default function Home() {
  const [currentWallet, setCurrentWallet] = useState<string>("")
  const { toast } = useToast()
  const account = useCurrentAccount()

  useEffect(() => {
    if (account?.address) {
      setCurrentWallet(account.address)
      toast({
        title: "水槽を表示",
        description: `${account.address}の水槽を表示しています`,
      })
    }
  }, [account?.address])

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
    <Layout onWalletSearch={handleWalletSearch}>
      <div className="flex items-center justify-center w-full h-full">
        <FishTank walletAddress={currentWallet} isOwner={account?.address === currentWallet} />
      </div>
    </Layout>
  )
}

