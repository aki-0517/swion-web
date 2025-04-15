"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useToast } from "@/hooks/use-toast"

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

interface SynObjectDetailModalProps {
  synObject: SynObject
  onClose: () => void
}

export default function SynObjectDetailModal({ synObject, onClose }: SynObjectDetailModalProps) {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const { toast } = useToast()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const handlePurchase = async () => {
    if (!account?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      const tx = new Transaction()
      
      // SUIコインを分割
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(synObject.price))])
      
      // marketplace::purchase_syn_object_from_kioskを呼び出し
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::marketplace::purchase_syn_object_from_kiosk`,
        arguments: [
          tx.object(synObject.kioskId!), // kiosk
          tx.object(process.env.NEXT_PUBLIC_TRANSFER_POLICY_ID!), // policy
          tx.pure.address(synObject.id), // syn_id
          coin, // payment
        ],
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase SynObject",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="pixel-container sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="pixel-text text-xl">
            SynObject #{synObject.id.slice(0, 6)}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="w-full aspect-square bg-blue-100 border-2 border-black mb-4 relative">
            {synObject.image && (
              <Image
                src={synObject.image}
                alt={`SynObject ${synObject.id}`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 425px) 100vw"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="pixel-text text-sm">Attached Objects:</h4>
              <p className="text-sm">
                {synObject.attached_objects.length} objects
              </p>
            </div>

            <div>
              <h4 className="pixel-text text-sm">Supply:</h4>
              <p className="text-sm">
                {synObject.current_supply} / {synObject.max_supply}
              </p>
            </div>

            <div>
              <h4 className="pixel-text text-sm">Price:</h4>
              <p className="text-sm">
                {synObject.price} SUI
              </p>
            </div>

            {account?.address !== synObject.owner && (
              <button
                onClick={handlePurchase}
                className="game-button w-full py-2"
              >
                Purchase for {synObject.price} SUI
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 