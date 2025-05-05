"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Menu, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ConnectButton, useCurrentAccount, useSuiClient, useSignTransaction } from "@mysten/dapp-kit"
import { Transaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/sui/bcs'
import { SuiClient } from '@mysten/sui/client'
import { SuinsClient } from '@mysten/suins';
import { getFullnodeUrl } from '@mysten/sui/client';

interface HeaderProps {
  onWalletSearch: (address: string) => void
}

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID
const NFT_SYSTEM_MODULE = "nft_system"
const DEFAULT_BACKGROUND = "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//DB8829AA-F5CF-4EDA-922E-3C628C5AB593.PNG"
const DEFAULT_LEVEL = 1

export default function Header({ onWalletSearch }: HeaderProps) {
  const [walletInput, setWalletInput] = useState("")
  const [hasTank, setHasTank] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signTransaction = useSignTransaction()

  const client = new SuiClient({ url: getFullnodeUrl('testnet') });

  const suinsClient = new SuinsClient({
    client,
    network: 'testnet',
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let searchAddress = walletInput

      // 入力が.suiで終わる場合、SuiNS名として解決を試みる
      if (walletInput.toLowerCase().endsWith('.sui')) {
        const nameRecord = await suinsClient.getNameRecord(walletInput)
        if (nameRecord?.targetAddress) {
          searchAddress = nameRecord.targetAddress
        }
      }

      // 解決したアドレスで検索を実行
      onWalletSearch(searchAddress)
    } catch (error) {
      console.error('Error resolving SuiNS name:', error)
      // エラーの場合は元の入力値で検索
      onWalletSearch(walletInput)
    }
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

      // 署名
      const { bytes, signature } = await signTransaction.mutateAsync({
        transaction: tx as any,
      })

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
          <Link href="/" className="pixel-text text-xl text-white font-bold">
            <img src="/seionlogo.jpg" alt="Swion" className="h-10 rounded-lg" />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="pixel-text text-xl text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Explore
            </Link>
            <Link href="/collections" className="pixel-text text-xl text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Recipes
            </Link>
            <a
              href="https://swion.gitbook.io/swion"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-text text-xl text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
            >
              Docs
            </a>
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
        <div className="hidden md:flex items-center">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Enter Wallet Address or SuiNS"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="pixel-input px-3 py-1 w-64"
            />
            <button type="submit" className="pixel-button ml-2 px-3 py-1 text-white shadow-md bg-stone-500 hover:bg-stone-600">
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

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-800 bg-opacity-95 flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <Link href="/" className="pixel-text text-xl text-white font-boldg">
              <img src="/seionlogo.jpg" alt="Swion" className="h-10 rounded-lg" />
            </Link>
            <button
              className="text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col p-4 space-y-6">
            <Link
              href="/explore"
              className="pixel-text text-xl text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/collections"
              className="pixel-text text-xl text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Recipes
            </Link>
            <a
              href="https://swion.gitbook.io/swion"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-text text-xl text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Docs
            </a>
            <form onSubmit={(e) => {
              handleSearch(e);
              setIsMobileMenuOpen(false);
            }} className="flex flex-col space-y-2 mt-6">
              <input
                type="text"
                placeholder="Enter Wallet Address or SuiNS"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="pixel-input px-3 py-2 w-full"
              />
              <button type="submit" className="pixel-button px-3 py-2 text-white shadow-md bg-stone-500 hover:bg-stone-600 w-full">
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
