"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  const [objectPositions, setObjectPositions] = useState<{ [key: string]: { x: number, y: number } }>({})
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

  // タンクにオブジェクトを配置するイベントリスナー
  useEffect(() => {
    const handlePlaceInTank = (event: CustomEvent) => {
      if (!isOwner) {
        toast({
          title: "Error",
          description: "Cannot place objects in someone else's tank",
          variant: "destructive",
        })
        return
      }

      const object = event.detail
      const newId = `${object.type}_${Date.now()}`
      const newObject = {
        ...object,
        id: newId,
        x: 50, // Center position
        y: 50
      }

      setObjects(prev => [...prev, newObject])
      setObjectPositions(prev => ({
        ...prev,
        [newId]: { x: 50, y: 50 }
      }))
      setHasChanges(true)
    }

    window.addEventListener('placeInTank', handlePlaceInTank as EventListener)
    return () => {
      window.removeEventListener('placeInTank', handlePlaceInTank as EventListener)
    }
  }, [isOwner, toast])

  // オブジェクトの移動を処理
  const handleObjectMove = (id: string, newX: number, newY: number) => {
    if (!isOwner) return

    setObjectPositions(prev => ({
      ...prev,
      [id]: { x: newX, y: newY }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // TODO: Save layout to backend/blockchain
      toast({
        title: "Layout Saved",
        description: "Your tank layout has been saved successfully",
      })
      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tank layout",
        variant: "destructive",
      })
    }
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
          <h2 className="pixel-text text-xl">
            {walletAddress ? `${walletAddress}'s Tank` : "Display Tank"}
          </h2>

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

        <div
          className={`fish-tank w-full h-[400px] relative rank-${tankRank}`}
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
            } else if (obj.type === "nft") {
              const position = objectPositions[obj.id] || { x: obj.x, y: obj.y }
              return (
                <DraggableObject
                  key={obj.id}
                  id={obj.id}
                  x={position.x}
                  y={position.y}
                  isOwner={isOwner}
                  onMove={handleObjectMove}
                >
                  <img 
                    src={obj.image} 
                    alt={obj.name} 
                    className="w-32 h-32 object-contain"
                  />
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

        {isOwner && hasChanges && (
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleSave}
              className="game-button px-4 py-2 flex items-center gap-2 bg-green-500"
            >
              <Save size={16} />
              <span>Save Layout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface DraggableObjectProps {
  id: string
  x: number
  y: number
  isOwner: boolean
  children: React.ReactNode
  onMove: (id: string, x: number, y: number) => void
}

function DraggableObject({ id, x, y, isOwner, children, onMove }: DraggableObjectProps) {
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const dragDataRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 })

  const handleDragStart = (e: React.DragEvent) => {
    if (!isOwner || !elementRef.current) {
      e.preventDefault()
      return
    }

    // ドラッグ時のゴーストイメージを非表示にする
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)

    setIsDragging(true)
    
    const rect = elementRef.current.getBoundingClientRect()
    dragDataRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    if (!isOwner || !e.currentTarget.parentElement || !e.clientX || !e.clientY) return
    e.preventDefault()

    const tankRect = e.currentTarget.parentElement.getBoundingClientRect()
    
    const newX = ((e.clientX - dragDataRef.current.offsetX - tankRect.left) / tankRect.width) * 100
    const newY = ((e.clientY - dragDataRef.current.offsetY - tankRect.top) / tankRect.height) * 100

    // 範囲を0-100に制限
    const boundedX = Math.max(0, Math.min(100, newX))
    const boundedY = Math.max(0, Math.min(100, newY))

    onMove(id, boundedX, boundedY)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 10 : 1,
        touchAction: 'none',
        padding: '8px',
      }}
      draggable={isOwner}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <div className="w-32 h-32 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

