"use client"

import { useState, useEffect, Suspense } from "react"
import Layout from "@/components/layout"
import FishTank from "@/components/fish-tank"
import { useToast } from "@/hooks/use-toast"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useSearchParams } from "next/navigation"

function WalletFishTank() {
  const [currentWallet, setCurrentWallet] = useState<string>("")
  const { toast } = useToast()
  const account = useCurrentAccount()
  const searchParams = useSearchParams()

  useEffect(() => {
    const addressParam = searchParams.get("address")
    if (addressParam && addressParam !== currentWallet) {
      setCurrentWallet(addressParam)
      toast({
        title: "水槽を表示",
        description: `${addressParam}の水槽を表示しています`,
      })
      return
    }
    if (account?.address && !addressParam) {
      setCurrentWallet(account.address)
      toast({
        title: "水槽を表示",
        description: `${account.address}の水槽を表示しています`,
      })
    }
  }, [account?.address, searchParams])

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

export default function Home() {
  return (
    <Suspense>
      <WalletFishTank />
    </Suspense>
  )
}

