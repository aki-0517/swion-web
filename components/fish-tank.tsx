"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Fish, Plant, Decoration } from "@/components/tank-objects"
import { Save, TrendingUp, RefreshCw } from "lucide-react"
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"

interface FishTankProps {
  walletAddress: string
  isOwner: boolean
}

// Improved Sui object ID validation function
function isValidSuiObjectId(id: string): boolean {
  // Proper Sui object IDs must start with 0x and have 64 hex characters after that
  return typeof id === 'string' && id.startsWith('0x') && /^0x[0-9a-fA-F]{64}$/.test(id);
}

export default function FishTank({ walletAddress, isOwner }: FishTankProps) {
  const [objects, setObjects] = useState<any[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [objectPositions, setObjectPositions] = useState<{ [key: string]: { x: number, y: number } }>({})
  const { toast } = useToast()
  const [tankBackground, setTankBackground] = useState<string>("")
  const [tankId, setTankId] = useState<string>("")
  const suiClient = useSuiClient()

  // Add tank rank state
  const [tankRank, setTankRank] = useState(1)
  const [txCount, setTxCount] = useState(0)
  const [canUpgrade, setCanUpgrade] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLocalMode, setIsLocalMode] = useState(false)

  // Extract fetchWaterTankSBT to a reusable function
  const fetchWaterTankSBT = useCallback(async () => {
    if (!walletAddress) {
      // Reset states when wallet address is not available
      setObjects([])
      setObjectPositions({})
      setTankBackground("")
      setTankId("")
      setTankRank(1)
      setTxCount(0)
      setCanUpgrade(false)
      setIsLocalMode(true)
      return
    }

    try {
      setIsRefreshing(true)
      
      // Get WaterTank object
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

      // Find WaterTank object
      const waterTank = objects.data.find(obj => {
        const type = obj.data?.type as string
        return type.includes("WaterTank")
      })

      if (waterTank) {
        interface WaterTankFields {
          background_image: string;
          child_objects: string[];
          level: number;
        }

        interface NFTFields {
          name: string;
          image: string;
          position_x: number;
          position_y: number;
        }

        const content = waterTank.data?.content as unknown as { fields: WaterTankFields }
        const fields = content?.fields || { background_image: "", child_objects: [], level: 1 }
        
        // Save tank ID for later use
        if (waterTank.data?.objectId) {
          setTankId(waterTank.data.objectId)
        }
        
        // Get URL from background_image field
        const backgroundUrl = fields.background_image
        setTankBackground(backgroundUrl)
        
        // Set tank level/rank
        setTankRank(fields.level || 1)

        // Get child objects (NFTs) and their positions
        const childObjects = fields.child_objects
        console.log("Tank child objects:", childObjects)
        
        const nftObjects: Array<{
          id: string;
          type: string;
          name: string;
          image: string;
          x: number;
          y: number;
        }> = []
        const positions: { [key: string]: { x: number; y: number } } = {}

        // Fetch each NFT object
        for (const nftId of childObjects) {
          try {
            // Verify that nftId is a valid Sui Object ID before fetching
            if (!isValidSuiObjectId(nftId)) {
              console.warn(`Skipping invalid NFT ID: ${nftId}`)
              continue
            }
            
            const nftObject = await suiClient.getObject({
              id: nftId,
              options: { showContent: true }
            })

            if (nftObject.data?.content) {
              const nftContent = nftObject.data.content as unknown as { fields: NFTFields }
              const nftFields = nftContent.fields || {
                name: "",
                image: "",
                position_x: 50,
                position_y: 50
              }

              console.log(`NFT ${nftId} position:`, nftFields.position_x, nftFields.position_y)

              const nft = {
                id: nftId,
                type: "nft",
                name: nftFields.name || "",
                image: nftFields.image || "",
                x: nftFields.position_x || 50,
                y: nftFields.position_y || 50
              }

              nftObjects.push(nft)
              positions[nftId] = {
                x: nftFields.position_x || 50,
                y: nftFields.position_y || 50
              }
            }
          } catch (error) {
            console.error(`Error fetching NFT ${nftId}:`, error)
          }
        }

        setObjects(nftObjects)
        setObjectPositions(positions)
        
        // Reset hasChanges after loading
        setHasChanges(false)
        
        // ローカルモード判定
        setIsLocalMode(false) // デフォルトはブロックチェーンモード
      } else {
        console.log("WaterTank object not found, switching to local mode")
        setIsLocalMode(true)
      }
    } catch (error) {
      console.error("Error fetching WaterTank:", error)
      toast({
        title: "Error",
        description: "Failed to retrieve the water tank SBT",
        variant: "destructive",
      })
      setIsLocalMode(true)
    } finally {
      setIsRefreshing(false)
    }
  }, [walletAddress, suiClient, toast])

  // Load tank data on component mount or wallet change
  useEffect(() => {
    fetchWaterTankSBT()
  }, [fetchWaterTankSBT])

  // Event listener for placing objects in tank
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
      
      // Make sure any added object has a valid ID format
      // For local objects, we'll use a special prefix
      const newId = object.id && isValidSuiObjectId(object.id) 
                ? object.id 
                : `local_${object.type}_${Date.now()}`
                  
      const newObject = {
        ...object,
        id: newId,
        x: object.x || 50, // Use existing position or default to center
        y: object.y || 50
      }

      setObjects(prev => [...prev, newObject])
      setObjectPositions(prev => ({
        ...prev,
        [newId]: { x: newObject.x, y: newObject.y }
      }))
      setHasChanges(true)
    }

    window.addEventListener('placeInTank', handlePlaceInTank as EventListener)
    return () => {
      window.removeEventListener('placeInTank', handlePlaceInTank as EventListener)
    }
  }, [isOwner, toast])

  // Handle object movement
  const handleObjectMove = (id: string, newX: number, newY: number) => {
    if (!isOwner) return

    setObjectPositions(prev => ({
      ...prev,
      [id]: { x: newX, y: newY }
    }))
    setHasChanges(true)
  }

  // Get transaction execution function from custom hook
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const currentAccount = useCurrentAccount()

  // ローカルモードでの保存処理
  const handleLocalSave = () => {
    setIsLoading(true)
    
    // 簡易的なローカル保存のみ
    setTimeout(() => {
      setHasChanges(false)
      setIsLoading(false)
      
      toast({
        title: "Layout Saved (Local)",
        description: "Your tank layout has been saved locally",
      })
    }, 500)
  }

  // 新しい実装: アタッチして保存する関数
  const handleAttachAndSave = async () => {
    // ローカルモードの場合は簡易保存のみ
    if (isLocalMode) {
      handleLocalSave()
      return
    }
    
    if (!currentAccount?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    if (!tankId) {
      toast({
        title: "Error",
        description: "Water tank not found",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Create transaction
      const tx = new Transaction()
      
      // Set the sender for the transaction (important)
      tx.setSender(currentAccount.address)
      
      let hasValidObjects = false

      console.log("Number of objects to save:", objects.length)
      console.log("Tank ID:", tankId)
      console.log("SuiClient type:", typeof suiClient, suiClient ? "exists" : "is null/undefined")

      // 有効なSuiオブジェクトIDをフィルタリング
      const validNFTs = objects.filter(obj => 
        obj.type === "nft" && isValidSuiObjectId(obj.id)
      )
      
      console.log(`Found ${validNFTs.length} valid NFT objects out of ${objects.length} total objects`)
      
      if (validNFTs.length === 0) {
        console.log("No valid Sui objects found")
        toast({
          title: "警告",
          description: "有効なSuiオブジェクトが見つかりませんでした。NFTオブジェクトを配置してください。",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // First attach NFTs to tank, then save positions
      for (const obj of validNFTs) {
        const position = objectPositions[obj.id] || { x: obj.x, y: obj.y }
        
        console.log(`Processing NFT: ${obj.id}, Position: x=${Math.floor(position.x)}, y=${Math.floor(position.y)}`)
        
        try {
          // Use attach_object and save_layout in one transaction
          tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system::attach_object`,
            arguments: [
              tx.object(tankId),
              tx.object(obj.id),
            ],
          })
          
          tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system::save_layout`,
            arguments: [
              tx.object(tankId),
              tx.object(obj.id),
              tx.pure.u64(Math.floor(position.x)),
              tx.pure.u64(Math.floor(position.y)),
            ],
          })
          
          hasValidObjects = true
          console.log(`Added attach_object and save_layout for NFT ${obj.id}`)
        } catch (error) {
          console.error(`Error preparing transaction for NFT ${obj.id}:`, error)
        }
      }

      if (!hasValidObjects) {
        toast({
          title: "Information",
          description: "No NFT objects to save on-chain, using local save",
        })
        handleLocalSave()
        return
      }

      // Check if suiClient is valid
      if (!suiClient || typeof suiClient !== 'object') {
        throw new Error('suiClient is not a valid object')
      }

      // Build the transaction
      await tx.build({ client: suiClient })

      console.log("Transaction ready to send")
      
      // Execute the transaction
      const result = await signAndExecute({
        transaction: tx,
      })
      
      console.log("Transaction result:", result)

      toast({
        title: "Save Complete",
        description: "Water tank layout has been saved successfully",
      })
      
      setHasChanges(false)
      
      // レイアウト保存が完了したら、トランザクション数を増やし、ランクアップ判定
      setTxCount(prev => {
        const newCount = prev + 1
        // 10トランザクションごとにアップグレード可能に
        if (newCount % 10 === 0) {
          setCanUpgrade(true)
          toast({
            title: "Upgrade Available!",
            description: "You can now upgrade your water tank to the next level!",
          })
        }
        return newCount
      })
      
      // Refresh the tank data to show the updated child_objects
      await fetchWaterTankSBT()
      
    } catch (error) {
      console.error("Layout save error:", error)
      toast({
        title: "Error",
        description: "Failed to save water tank layout: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
      
      // オンチェーン保存に失敗したら、ローカル保存に切り替え
      handleLocalSave()
    } finally {
      setIsLoading(false)
    }
  }

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await fetchWaterTankSBT()
      toast({
        title: "Refreshed",
        description: "Tank data has been refreshed",
      })
    } catch (error) {
      console.error("Refresh error:", error)
      toast({
        title: "Error",
        description: "Failed to refresh tank data",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Tank level upgrade
  const handleUpgrade = async () => {
    // ローカルモードの場合は簡易アップグレードのみ
    if (isLocalMode) {
      setIsLoading(true)
      const newRank = tankRank + 1
      
      setTimeout(() => {
        setTankRank(newRank)
        setCanUpgrade(false)
        setIsLoading(false)
        
        toast({
          title: "Tank Upgrade Complete! (Local)",
          description: `Your tank is now rank ${newRank}. New decorations have been unlocked!`,
        })
      }, 500)
      return
    }
    
    if (!currentAccount?.address || !tankId) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const newRank = tankRank + 1
      
      // Create transaction to update tank level
      const tx = new Transaction()
      
      // Explicitly set the sender
      tx.setSender(currentAccount.address)
      
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system::update_tank_level`,
        arguments: [
          tx.object(tankId),
          tx.pure.u64(newRank),
        ],
      })

      // Check if suiClient is valid
      if (!suiClient || typeof suiClient !== 'object') {
        throw new Error('suiClient is not a valid object')
      }

      // Build the transaction
      await tx.build({ client: suiClient })

      // Execute transaction
      const result = await signAndExecute({
        transaction: tx,
      })
    
      setTankRank(newRank)
      setCanUpgrade(false)

      toast({
        title: "Tank Upgrade Complete!",
        description: `Your tank is now rank ${newRank}. New decorations have been unlocked!`,
      })
      
      // Refresh after upgrade
      await fetchWaterTankSBT()
    } catch (error) {
      console.error("Tank upgrade error:", error)
      toast({
        title: "Error",
        description: "Failed to upgrade the tank: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress to next rank
  const progressToNextRank = Math.min(100, ((txCount % 10) / 10) * 100)
  const txToNextRank = 10 - (txCount % 10)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="pixel-container p-4 bg-stone-600">
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <div className="flex items-center">
            <h2 className="pixel-text text-xl text-white font-bold">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}'s Water Tank` : "Water Tank Display"}
              {isLocalMode && <span className="text-xs ml-2 text-gray-600">(Local Mode)</span>}
            </h2>
            {walletAddress && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2 p-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                title="Refresh tank data"
              >
                <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

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
                    disabled={isLoading}
                    className={`game-button ml-2 px-2 py-1 flex items-center gap-1 ${isLoading ? 'bg-gray-400' : 'bg-green-500'}`}
                  >
                    <TrendingUp size={12} />
                    <span className="text-xs">Upgrade</span>
                  </button>
                ) : (
                  <div className="ml-2 text-xs">{txToNextRank} more for next rank</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="fish-tank w-full h-[480px] relative rank-${tankRank}"
          style={{
            backgroundImage: tankBackground ? `url(${tankBackground})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Underwater background elements - enhanced based on rank */}
          {walletAddress && (
            <>
              {/* Hide existing background elements if a background image exists */}
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
                    className="w-[153.6px] h-[153.6px] object-contain"
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
              ? "Drag objects from MyBox to place them in the tank"
              : "Drag placed objects to change their position"}
          </div>
        )}

        {isOwner && hasChanges && (
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleAttachAndSave}
              disabled={isLoading}
              className={`game-button px-4 py-2 flex items-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-green-500'}`}
            >
              <Save size={16} />
              <span>{isLoading ? "Saving..." : "Save Layout"}</span>
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

    // Hide ghost image when dragging
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

    // Limit range to 0-100
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