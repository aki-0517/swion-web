"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useState } from "react"

interface MintFlag {
  module: string
  package: string
  function: string
}

interface NFTObject {
  id: number
  name: string
  image: string
  mint_flag: MintFlag
  created_at: string
  updated_at: string
  project_id: number
}

interface ObjectDetailModalProps {
  object: NFTObject
  onClose: () => void
}

export default function ObjectDetailModal({ object, onClose }: ObjectDetailModalProps) {
  const { toast } = useToast()
  const account = useCurrentAccount()
  const signTransaction = useSignTransaction()
  const suiClient = useSuiClient()
  const [isLoading, setIsLoading] = useState(false)

  const formatMintFlag = (mintFlag: MintFlag) => {
    return `${mintFlag.package}::${mintFlag.module}::${mintFlag.function}`
  }

  // フルパスの画像URLをそのまま返す
  const getImageUrl = () => {
    return object.image
  }

  const handleMint = async () => {
    setIsLoading(true)
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Create a new transaction
      const tx = new Transaction()
      
      // Set sender explicitly
      tx.setSender(account.address)
      
      // Add mint_nft_object move call to the transaction
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system::mint_nft_object`,
        arguments: [
          // object.name をバイト配列として渡す
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(object.name))),
          // object.image をバイト配列として渡す
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(getImageUrl() || ''))),
        ]
      })

      // Build transaction bytes
      await tx.build({ client: suiClient })
      
      // Sign the transaction
      const { bytes, signature } = await signTransaction.mutateAsync({ transaction: tx })
      
      // Execute the transaction
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showEvents: true },
      })
      
      // Wait for transaction to complete
      await suiClient.waitForTransaction({ digest: result.digest })

      toast({
        title: "Success",
        description: `Successfully minted ${object.name}!`,
      })
      onClose()
    } catch (error) {
      console.error("Mint error:", error)
      toast({
        title: "Error",
        description: "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="pixel-container sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="pixel-text text-xl">{object.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="w-full aspect-square bg-blue-900 border-2 border-black mb-4 relative">
            {object.image && (
              <Image
                src={getImageUrl() || ''}
                alt={object.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 425px) 100vw"
              />
            )}
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="pixel-text text-sm">Mint Flag:</h4>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {formatMintFlag(object.mint_flag)}
              </p>
            </div>

            <div>
              <h4 className="pixel-text text-sm">Object ID:</h4>
              <p className="text-sm">{object.id}</p>
            </div>

            {/* Mint button */}
            <div className="mt-6">
              <button
                onClick={handleMint}
                disabled={isLoading}
                className="game-button w-full py-2"
              >
                {isLoading ? "Minting..." : "Mint NFT"}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                When you mint this NFT, it will be transferred to your wallet
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
