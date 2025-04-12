"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ConnectButton, useCurrentAccount, useSuiClient, useSignTransaction } from "@mysten/dapp-kit"
// ※ SDK 1.0 では Transaction クラスは @mysten/sui からのインポートも検討してくださいが、参考資料に合わせる場合は下記のように記述します
import { Transaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/sui/bcs'

interface HeaderProps {
  onWalletSearch: (address: string) => void
}

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID
const NFT_SYSTEM_MODULE = "nft_system"
const DEFAULT_BACKGROUND = "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/swion//DB8829AA-F5CF-4EDA-922E-3C628C5AB593.PNG"
const DEFAULT_LEVEL = 1

export default function Header({ onWalletSearch }: HeaderProps) {
  const [walletInput, setWalletInput] = useState("")
  const [hasTank, setHasTank] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const router = useRouter()

  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signTransaction = useSignTransaction()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onWalletSearch(walletInput)
  }

  // アカウント変更時にTankの有無をチェック
  useEffect(() => {
    if (account) {
      checkForTank(account.address)
    } else {
      setHasTank(null)
    }
  }, [account])

  // Tank の有無を確認する関数
  const checkForTank = async (address: string) => {
    try {
      setIsLoading(true)
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: address,
        filter: { StructType: `${PACKAGE_ID}::${NFT_SYSTEM_MODULE}::WaterTank` },
        options: { showContent: true },
      })
      setHasTank(ownedObjects.data.length > 0)
      setIsLoading(false)
    } catch (error) {
      console.error("Error checking for tank:", error)
      setHasTank(false)
      setIsLoading(false)
    }
  }

  // 新しいTankをmintする関数
  const mintNewTank = async () => {
    if (!account) return

    try {
      setIsMinting(true)
      
      // ① トランザクションの作成
      const tx = new Transaction()
      
      // （必要に応じて）送信元を明示的に設定
      tx.setSender(account.address)
      
      // ② 背景画像の URL を UTF-8 バイト配列に変換
      const backgroundBytes = new Uint8Array(new TextEncoder().encode(DEFAULT_BACKGROUND))
      
      // ③ initialize_tank 関数の呼び出しを追加
      tx.moveCall({
        target: `${PACKAGE_ID}::${NFT_SYSTEM_MODULE}::initialize_tank`,
        arguments: [
          tx.pure.address(account.address),
          // bcs を使ってベクターのシリアライズ（参考例）
          tx.pure(bcs.vector(bcs.U8).serialize(backgroundBytes)),
          tx.pure.u64(BigInt(DEFAULT_LEVEL)),
        ],
      })
      
      // ④ トランザクションバイト列をビルド（RPC 経由で入力値の解決が必要な場合）
      await tx.build({ client: suiClient })
      
      // ⑤ 署名（useSignTransaction の mutateAsync を利用）
      const { bytes, signature } = await signTransaction.mutateAsync({ transaction: tx })
      
      // ⑥ トランザクションの実行
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showEvents: true },
      })
      
      // ⑦ トランザクションの完了を待つ（以降の RPC 呼び出しで効果が反映されることを保証）
      await suiClient.waitForTransaction({ digest: result.digest })
      
      console.log("Tank minted successfully:", result)
      setHasTank(true)
      setIsMinting(false)
      router.push("/")
    } catch (error) {
      console.error("Error minting tank:", error)
      setIsMinting(false)
    }
  }

  // アカウントが接続されている場合に mint ボタンを表示
  const renderMintButton = () => {
    if (!account) return null

    if (isLoading) {
      return <button className="pixel-button px-3 py-1 ml-4" disabled>Checking...</button>
    }

    if (hasTank === false) {
      return (
        <button 
          className="pixel-button px-3 py-1 ml-4 bg-green-500 hover:bg-green-600 text-white" 
          onClick={mintNewTank}
          disabled={isMinting}
        >
          {isMinting ? "Minting..." : "Mint Your Tank"}
        </button>
      )
    }

    return null
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="pixel-text text-xl">
            Swion
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="pixel-text text-sm">
              Explore
            </Link>
            <Link href="/collections" className="pixel-text text-sm">
              Collections
            </Link>
          </nav>
        </div>
        <div className="flex items-center">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Enter Wallet Address or SuiNS"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="pixel-input px-3 py-1 w-64"
            />
            <button type="submit" className="pixel-button ml-2 px-3 py-1">
              Search
            </button>
          </form>
        </div>
        <div className="flex items-center">
          {account ? (
            <>
              <ConnectButton />
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="pixel-button px-3 py-1 flex items-center">
                    <span className="mr-1">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="pixel-container p-0 min-w-[160px]">
                  <DropdownMenuItem
                    className="pixel-text text-sm p-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      onWalletSearch(account.address)
                      router.push("/")
                    }}
                  >
                    My Page
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
              {renderMintButton()}
            </>
          ) : (
            <ConnectButton connectText="Connect Wallet" />
          )}
        </div>
      </div>
    </header>
  )
}
