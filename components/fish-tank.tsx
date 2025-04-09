"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Fish, Plant, Decoration } from "@/components/tank-objects"
import { Save, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"

interface FishTankProps {
  walletAddress: string
  isOwner: boolean
}

export default function FishTank({ walletAddress, isOwner }: FishTankProps) {
  const [objects, setObjects] = useState<any[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()
  const [tankBackground, setTankBackground] = useState<string>("")
  const suiClient = useSuiClient()

  // Add tank rank state
  const [tankRank, setTankRank] = useState(1)
  const [txCount, setTxCount] = useState(0)
  const [canUpgrade, setCanUpgrade] = useState(false)

  // useEffect(() => {
  //   async function fetchTankData() {
  //     if (walletAddress) {
  //       // タンクのオブジェクトを取得
  //       const { data: tankObjects, error: objectsError } = await supabase
  //         .from('tank_backgrounds')
  //         .select('*')
  //         .eq('wallet_address', walletAddress)

  //       if (objectsError) {
  //         toast({
  //           title: "Error",
  //           description: "Failed to load tank objects",
  //           variant: "destructive",
  //         })
  //         return
  //       }

  //       setObjects(tankObjects || [])

  //       // トランザクション数を取得
  //       const { data: txData, error: txError } = await supabase
  //         .from('wallet_transactions')
  //         .select('tx_count')
  //         .eq('wallet_address', walletAddress)
  //         .single()

  //       if (txError) {
  //         toast({
  //           title: "Error",
  //           description: "Failed to load transaction count",
  //           variant: "destructive",
  //         })
  //         return
  //       }

  //       const txCount = txData?.tx_count || 0
  //       setTxCount(txCount)

  //       // ランクを計算
  //       const newRank = Math.floor(txCount / 10) + 1
  //       setTankRank(newRank)

  //       // アップグレード可能かチェック
  //       setCanUpgrade(txCount >= newRank * 10 && newRank < 5)
  //     } else {
  //       setObjects([])
  //       setTxCount(0)
  //       setTankRank(1)
  //       setCanUpgrade(false)
  //     }
  //   }

  //   fetchTankData()
  // }, [walletAddress])

  useEffect(() => {
    async function fetchWaterTankSBT() {
      if (walletAddress) {
        try {
          // WaterTankオブジェクトを取得
          const objects = await suiClient.getOwnedObjects({
            owner: walletAddress,
            filter: {
              Package: process.env.NEXT_PUBLIC_PACKAGE_ID ?? ""
            },
            options: {
              showContent: true,
              showType: true
            }
          })

          // WaterTankオブジェクトを探す
          const waterTank = objects.data.find(obj => {
            const type = obj.data?.type as string
            return type.includes("WaterTank")
          })

          if (waterTank) {
            const content = waterTank.data?.content as any
            const fields = content?.fields || {}
            // background_imageフィールドからURLを取得
            const backgroundUrl = fields.background_image || ""
            setTankBackground(backgroundUrl)
          }
        } catch (error) {
          console.error("Error fetching WaterTank:", error)
          toast({
            title: "エラー",
            description: "水槽SBTの取得に失敗しました",
            variant: "destructive",
          })
        }
      }
    }

    fetchWaterTankSBT()
  }, [walletAddress, suiClient])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (!isOwner) {
      toast({
        title: "Error",
        description: "This is someone else's tank.",
        variant: "destructive",
      })
      return
    }

    const objectData = JSON.parse(e.dataTransfer.getData("application/json"))
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setObjects([...objects, { ...objectData, x, y }])
    setHasChanges(true)

    toast({
      title: "Placement Complete",
      description: `Placed ${objectData.name || objectData.type}`,
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleObjectMove = (id: number, newX: number, newY: number) => {
    if (!isOwner) return

    setObjects(objects.map((obj) => (obj.id === id ? { ...obj, x: newX, y: newY } : obj)))
    setHasChanges(true)
  }

  const handleSave = () => {
    // In a real app, this would save to the blockchain
    toast({
      title: "Tank Saved",
      description: "Your tank layout has been saved",
    })
    setHasChanges(false)
  }

  const handleUpgrade = () => {
    if (canUpgrade) {
      const newRank = tankRank + 1
      setTankRank(newRank)
      setCanUpgrade(false)

      toast({
        title: "Tank Upgraded!",
        description: `Your tank is now Rank ${newRank}. New decorations unlocked!`,
      })
    }
  }

  // Calculate progress to next rank
  const progressToNextRank = Math.min(100, ((txCount % 10) / 10) * 100)
  const txToNextRank = 10 - (txCount % 10)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="pixel-container p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="pixel-text text-xl">{walletAddress ? `${walletAddress}'s Tank` : "Display Tank"}</h2>

          <div className="flex items-center gap-2">
            {hasChanges && isOwner && (
              <button onClick={handleSave} className="game-button px-4 py-1 flex items-center gap-1">
                <Save size={16} />
                <span>Save Layout</span>
              </button>
            )}

            {walletAddress && (
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-black p-1 flex items-center">
                  <div className="pixel-text text-xs mr-2">Rank {tankRank}</div>
                  <div className="w-24 h-4 bg-gray-300 border border-black">
                    <div className="h-full bg-blue-500" style={{ width: `${progressToNextRank}%` }}></div>
                  </div>
                  {canUpgrade ? (
                    <button
                      onClick={handleUpgrade}
                      className="game-button ml-2 px-2 py-1 flex items-center gap-1 bg-green-500"
                    >
                      <TrendingUp size={12} />
                      <span className="text-xs">Upgrade</span>
                    </button>
                  ) : (
                    <div className="ml-2 text-xs">{txToNextRank} TX to next rank</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`fish-tank w-full h-[400px] relative rank-${tankRank}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            backgroundImage: tankBackground ? `url(${tankBackground})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Underwater background elements - enhanced based on rank */}
          {walletAddress && (
            <>
              {/* 背景画像がある場合は既存の背景要素を非表示にする */}
              {!tankBackground && (
                <>
                  <div className={`underwater-bg rank-${tankRank}`}></div>

                  {/* More decorations based on rank */}
                  <div className="underwater-plant" style={{ left: "10%" }}></div>
                  <div className="underwater-plant" style={{ left: "25%", height: "24px" }}></div>
                  <div className="underwater-rock" style={{ left: "40%" }}></div>
                  <div className="underwater-plant" style={{ left: "60%" }}></div>
                  <div className="underwater-rock" style={{ left: "75%" }}></div>
                  <div className="underwater-plant" style={{ left: "85%", height: "28px" }}></div>

                  {tankRank >= 2 && (
                    <>
                      <div className="underwater-plant" style={{ left: "15%", height: "32px" }}></div>
                      <div className="underwater-rock" style={{ left: "30%", width: "32px" }}></div>
                    </>
                  )}

                  {tankRank >= 3 && (
                    <>
                      <div className="underwater-plant" style={{ left: "50%", height: "36px" }}></div>
                      <div className="underwater-rock" style={{ left: "65%", width: "28px" }}></div>
                      <div className="pixel-text text-xs absolute" style={{ left: "20%", top: "30%" }}>
                        ✨
                      </div>
                    </>
                  )}

                  {tankRank >= 4 && (
                    <>
                      <div className="pixel-text text-xs absolute" style={{ left: "40%", top: "20%" }}>
                        💎
                      </div>
                      <div className="pixel-text text-xs absolute" style={{ left: "70%", top: "40%" }}>
                        🌟
                      </div>
                    </>
                  )}

                  {tankRank >= 5 && (
                    <>
                      <div className="pixel-text text-xs absolute" style={{ left: "30%", top: "15%" }}>
                        👑
                      </div>
                      <div className="pixel-text text-xs absolute" style={{ left: "60%", top: "25%" }}>
                        🏆
                      </div>
                      <div className="pixel-text text-xs absolute" style={{ left: "80%", top: "35%" }}>
                        💫
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {objects.map((obj) => {
            if (obj.type === "fish") {
              return (
                <DraggableObject
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  isOwner={isOwner}
                  onMove={handleObjectMove}
                >
                  <Fish color={obj.color} x={0} y={0} />
                </DraggableObject>
              )
            } else if (obj.type === "plant") {
              return (
                <DraggableObject
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  isOwner={isOwner}
                  onMove={handleObjectMove}
                >
                  <Plant color={obj.color} x={0} y={0} />
                </DraggableObject>
              )
            } else if (obj.type === "decoration") {
              return (
                <DraggableObject
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  isOwner={isOwner}
                  onMove={handleObjectMove}
                >
                  <Decoration name={obj.name} x={0} y={0} />
                </DraggableObject>
              )
            } else if (obj.type === "synObject") {
              return (
                <DraggableObject
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  isOwner={isOwner}
                  onMove={handleObjectMove}
                >
                  <div className="text-4xl">{obj.image}</div>
                </DraggableObject>
              )
            }
            return null
          })}

          {!walletAddress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="pixel-text text-lg text-gray-600">Please enter a wallet address</p>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="mt-2 text-xs text-gray-600">
            {objects.length === 0
              ? "Drag objects from MyBox to place them in your tank"
              : "Drag placed objects to reposition them"}
          </div>
        )}
      </div>
    </div>
  )
}

interface DraggableObjectProps {
  id: number
  x: number
  y: number
  isOwner: boolean
  children: React.ReactNode
  onMove: (id: number, x: number, y: number) => void
}

function DraggableObject({ id, x, y, isOwner, children, onMove }: DraggableObjectProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    if (!isOwner) {
      e.preventDefault()
      return
    }

    setIsDragging(true)
    // Store the initial mouse position relative to the object
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id,
        offsetX,
        offsetY,
      }),
    )
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)

    if (!isOwner) return

    const tankElement = e.currentTarget.parentElement
    if (!tankElement) return

    const tankRect = tankElement.getBoundingClientRect()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))

    // Calculate new position
    const newX = ((e.clientX - data.offsetX - tankRect.left) / tankRect.width) * 100
    const newY = ((e.clientY - data.offsetY - tankRect.top) / tankRect.height) * 100

    // Ensure the object stays within bounds
    const boundedX = Math.max(0, Math.min(100, newX))
    const boundedY = Math.max(0, Math.min(100, newY))

    onMove(id, boundedX, boundedY)
  }

  return (
    <div
      className={`absolute ${isOwner ? "cursor-move" : ""} ${isDragging ? "opacity-50" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 10 : 1,
      }}
      draggable={isOwner}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  )
}

