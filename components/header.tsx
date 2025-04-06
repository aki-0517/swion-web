"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"

interface HeaderProps {
  onWalletSearch: (address: string) => void
}

export default function Header({ onWalletSearch }: HeaderProps) {
  const [walletInput, setWalletInput] = useState("")
  const router = useRouter()
  const account = useCurrentAccount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onWalletSearch(walletInput)
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="pixel-text text-xl">
            Suiden
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

        <div>
          {account ? (
            <DropdownMenu>
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
            </DropdownMenu>
          ) : (
            <ConnectButton connectText="Connect Wallet" />
          )}
        </div>
      </div>
    </header>
  )
}

