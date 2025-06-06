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
const NFT_SYSTEM_MODULE = "nft_system_water_tank"
const DEFAULT_BACKGROUND = "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//DB8829AA-F5CF-4EDA-922E-3C628C5AB593.PNG"
const DEFAULT_LEVEL = 1

export default function Header({ onWalletSearch }: HeaderProps) {
  const [walletInput, setWalletInput] = useState("")
  const [hasTank, setHasTank] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signTransaction = useSignTransaction()

  const client = new SuiClient({ url: getFullnodeUrl('testnet') });

  const suinsClient = new SuinsClient({
    client,
    network: 'testnet',
  });

  const ADDRESS = "swion-test.sui"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

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

      // クエリパラメータで遷移（/ に ?address=xxx を付与）
      router.push(`/?address=${searchAddress}`)
      onWalletSearch(searchAddress)
    } catch (error) {
      console.error('Error resolving SuiNS name:', error)
      // エラーの場合は元の入力値で検索
      router.push(`/?address=${walletInput}`)
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
      return <button className="pixel-button px-3 py-1 ml-4 min-w-[120px] whitespace-nowrap" disabled>Checking...</button>
    }

    if (hasTank === false) {
      return (
        <button
          className="pixel-button px-4 py-1 ml-4 bg-green-500 hover:bg-green-600 text-white min-w-[120px] whitespace-nowrap"
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
      <div className="container mx-auto px-2 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="pixel-text text-xl text-white font-bold flex-shrink-0 min-w-[56px]">
            <img src="/seionlogo.jpg" alt="Swion" style={{maxHeight: "48px", width: "auto"}} className="rounded-lg" />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="pixel-text text-base text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Explore
            </Link>
            <Link href="/collections" className="pixel-text text-base text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Recipes
            </Link>
            <a
              href="https://swion.gitbook.io/swion"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-text text-base text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
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
        {/* 検索バー：Mintボタンが表示されていない場合のみ表示 */}
        {!(account && hasTank === false) && (
          <div className="hidden md:flex items-center ml-6 space-x-2 min-w-0 relative">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Enter Wallet Address or SuiNS"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="pixel-input px-3 py-1 w-[320px] text-[10px]"
              />
              <button type="submit" className="pixel-button ml-2 px-3 py-1 text-white shadow-md bg-stone-500 hover:bg-stone-600">
                Search
              </button>
            </form>
            {/* 英語バルーン: ウォレット未接続時のみ、検索バーの下に表示 */}
            {!account && (
              <div
                className="absolute left-1/2 top-full -translate-x-1/2 mt-2 z-20 flex justify-center w-full"
                style={{ pointerEvents: 'none', animation: 'floatY 3s ease-in-out infinite' }}
              >
                <div className="relative bg-white/90 text-black text-sm px-2 py-1 rounded-xl shadow-lg border border-stone-300 max-w-xs text-center flex flex-col items-center justify-center" style={{ minWidth: '180px' }}>
                  <span style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '14px', textAlign: 'center' }}>
                    Try searching for:<br />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`underline text-blue-600 hover:text-blue-800 transition-colors duration-150 px-1 py-0.5 rounded ${copied ? 'bg-green-100' : ''}`}
                      style={{ cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', border: 'none', outline: 'none', pointerEvents: 'auto', textAlign: 'center' }}
                    >
                      {ADDRESS}
                    </button>
                  </span>
                  <span className="ml-2 text-green-600 text-xs font-bold" style={{visibility: copied ? 'visible' : 'hidden'}}>
                    Copied!
                  </span>
                  <span className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 bg-white/90 border-l border-t border-stone-300 rotate-45"></span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center ml-6 space-x-2 min-w-0">
          {account ? (
            <>
              <ConnectButton className="!h-8 !px-2 !text-xs" />
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
            <ConnectButton connectText="Connect Wallet" className="!h-8 !px-2 !text-xs" />
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
              className="pixel-text text-base text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/collections"
              className="pixel-text text-base text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Recipes
            </Link>
            <a
              href="https://swion.gitbook.io/swion"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-text text-base text-white font-bold text-shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Docs
            </a>
            <form onSubmit={(e) => {
              handleSearch(e);
              setIsMobileMenuOpen(false);
            }} className="flex flex-col space-y-2 mt-6 relative">
              <input
                type="text"
                placeholder="Enter Wallet Address or SuiNS"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="pixel-input px-3 py-2 w-full text-sm"
              />
              <button type="submit" className="pixel-button px-3 py-2 text-white shadow-md bg-stone-500 hover:bg-stone-600 w-full">
                Search
              </button>
              {/* 英語バルーン: ウォレット未接続時のみ、検索バーの下に表示 */}
              {!account && (
                <div
                  className="absolute left-1/2 top-full -translate-x-1/2 mt-2 z-20 flex justify-center w-full"
                  style={{ pointerEvents: 'none', animation: 'floatY 3s ease-in-out infinite' }}
                >
                  <div className="relative bg-white/90 text-black text-sm px-2 py-1 rounded-xl shadow-lg border border-stone-300 max-w-xs text-center flex flex-col items-center justify-center" style={{ minWidth: '180px' }}>
                    <span style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '14px', textAlign: 'center' }}>
                      Try searching for:<br />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`underline text-blue-600 hover:text-blue-800 transition-colors duration-150 px-1 py-0.5 rounded ${copied ? 'bg-green-100' : ''}`}
                        style={{ cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', border: 'none', outline: 'none', pointerEvents: 'auto', textAlign: 'center' }}
                      >
                        {ADDRESS}
                      </button>
                    </span>
                    <span className="ml-2 text-green-600 text-xs font-bold" style={{visibility: copied ? 'visible' : 'hidden'}}>
                      Copied!
                    </span>
                    <span className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 bg-white/90 border-l border-t border-stone-300 rotate-45"></span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
