"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Fish, Plant, Decoration } from "@/components/tank-objects"
import { Save, TrendingUp, RefreshCw } from "lucide-react"
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { SuiObjectData } from "@mysten/sui/client"
import html2canvas from "html2canvas"

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
  const [tankExists, setTankExists] = useState<boolean | null>(null)
  
  // ローディングのための新しい状態変数を追加
  const [isContentLoading, setIsContentLoading] = useState(true)
  const [isInitialAnimation, setIsInitialAnimation] = useState(true)
  // アニメーション用の背景画像切り替え
  const [loadingBgIndex, setLoadingBgIndex] = useState(0)
  
  // ローディング背景画像の配列
  const loadingBackgrounds = [
    "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//B7340C30-8347-4203-9219-9252435BB412.PNG",
    "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//DB8829AA-F5CF-4EDA-922E-3C628C5AB593.PNG",
    "https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//ChatGPT%20Image%20Apr%205,%202025,%2001_31_08%20PM.png"
  ]

  const tankRef = useRef<HTMLDivElement>(null)

  // Background animation effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    
    if (isContentLoading) {
      intervalId = setInterval(() => {
        setLoadingBgIndex(prev => (prev + 1) % loadingBackgrounds.length)
      }, 400) // 0.4秒ごとに切り替え
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isContentLoading])

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
      setTankExists(false)
      setIsContentLoading(false)
      return
    }

    try {
      // Validate Sui address format
      if (!walletAddress.startsWith('0x') || walletAddress.length !== 66) {
        window.alert("Invalid Sui address format. Please check the address and try again.")
        setTankExists(false)
        setIsContentLoading(false)
        return
      }
      
      setIsRefreshing(true)
      setIsContentLoading(true)
      
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

      // Check if any Water Tank exists
      if (objects.data.length === 0) {
        // No Tank found for this address
        setTankExists(false)
        setIsContentLoading(false)
        return
      }
      
      setTankExists(true)
      
      // Find WaterTank object
      const waterTank = objects.data.find(obj => {
        const type = obj.data?.type as string
        return type.includes("WaterTank")
      })

      if (waterTank) {
        interface WaterTankFields {
          background_image: string
          child_objects: string[]
          level: number
        }

        interface NFTFields {
          name: string
          image: string
          position_x: number
          position_y: number
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
          id: string
          type: string
          name: string
          image: string
          x: number
          y: number
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

              // NFTの型情報を取得してSynObjectかどうか判断
              const objectType = nftObject.data.type as string
              const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID ?? ""
              const expectedSynType = `${packageId}::nft_system_syn_object::SynObject`
              
              // オブジェクトの型に応じて処理を分ける
              if (objectType === expectedSynType) {
                console.log(`SynObject ${nftId} position:`, nftFields.position_x, nftFields.position_y)
                
                const synObj = {
                  id: nftId,
                  type: "synObject",  // synObjectタイプとして識別
                  name: nftFields.name || "",
                  image: nftFields.image || "",
                  x: nftFields.position_x || 50,
                  y: nftFields.position_y || 50
                }
                
                nftObjects.push(synObj)
                positions[nftId] = {
                  x: nftFields.position_x || 50,
                  y: nftFields.position_y || 50
                }
              } else {
                // 通常のNFTオブジェクトとして処理
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
            }
          } catch (error) {
            console.error(`Error fetching object ${nftId}:`, error)
          }
        }

        setObjects(nftObjects)
        setObjectPositions(positions)
        
        // Reset hasChanges after loading
        setHasChanges(false)
        
        // アニメーションのため2秒待機する
        if (isInitialAnimation) {
          // 最初のロード時のみ2秒待機
          await new Promise(resolve => setTimeout(resolve, 2000))
          setIsInitialAnimation(false)
        }
        
        setIsLocalMode(false) // デフォルトはブロックチェーンモード
        setIsContentLoading(false)
      } else {
        console.log("WaterTank object not found, switching to local mode")
        setIsLocalMode(true)
        setTankExists(false)
        setIsContentLoading(false)
      }
    } catch (error) {
      console.error("Error fetching Water Tank:", error)
      
      // エラーメッセージをウィンドウに表示
      if (error instanceof Error && error.message.includes("Invalid Sui address")) {
        window.alert("Invalid Sui address. Please check the address and try again.")
      } else {
        window.alert("Error loading the Water Tank. Please try again later.")
      }
      setTankExists(false)
      setIsContentLoading(false)
    } finally {
      setIsRefreshing(false)
    }
  }, [walletAddress, suiClient, isInitialAnimation])

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

    // Check if suiClient is valid (early check)
    if (!suiClient || typeof suiClient !== 'object') {
      toast({
        title: "Error",
        description: "Sui client is not available",
        variant: "destructive",
      })
      console.error('suiClient is not a valid object or is unavailable')
      return
    }

    try {
      setIsLoading(true)

      // Create transaction
      const tx = new Transaction()

      // Set the sender for the transaction (important)
      tx.setSender(currentAccount.address)

      let objectsToProcess: { id: string; type: "nft" | "synObject"; position?: { x: number; y: number } }[] = []

      // 1. Verify ownership and type for each object before adding to transaction
      console.log("Verifying object ownership and types...")
      for (const obj of objects) {
        // Skip local objects (those without a valid Sui Object ID format)
        if (!isValidSuiObjectId(obj.id)) {
          console.log(`Skipping local object: ${obj.id}`)
          continue
        }

        try {
          const objectDetails = await suiClient.getObject({
            id: obj.id,
            options: { showOwner: true, showType: true }
          })

          if (!objectDetails.data) {
             console.warn(`Could not fetch details for object ${obj.id}. Skipping.`)
             continue
          }

          const ownerAddress = objectDetails.data.owner 
            ? (typeof objectDetails.data.owner === 'object' && 'AddressOwner' in objectDetails.data.owner 
               ? objectDetails.data.owner.AddressOwner 
               : null)
            : null
          const objectType = objectDetails.data.type

          if (ownerAddress !== currentAccount.address) {
            console.warn(`Object ${obj.id} is not owned by the current wallet (${currentAccount.address}). Owner: ${ownerAddress}. Skipping.`)
            toast({
              title: "Ownership Error",
              description: `Cannot save object ${obj.id.substring(0, 8)}... as it's not owned by you.`,
              variant: "destructive",
            })
            continue
          }

          // Check if the object type includes NFTObject or SynObject from the correct package
          const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID
          const expectedNftType = `${packageId}::nft_system_nft::NFTObject`
          const expectedSynType = `${packageId}::nft_system_syn_object::SynObject`

          if (objectType === expectedNftType) {
            const position = objectPositions[obj.id] || { x: obj.x, y: obj.y }
            objectsToProcess.push({ id: obj.id, type: "nft", position: { x: Math.floor(position.x), y: Math.floor(position.y) } })
            console.log(`Verified NFTObject: ${obj.id}`)
          } else if (objectType === expectedSynType) {
            objectsToProcess.push({ id: obj.id, type: "synObject" })
            console.log(`Verified SynObject: ${obj.id}`)
          } else {
            console.warn(`Object ${obj.id} has an unexpected type: ${objectType}. Skipping.`)
             toast({
              title: "Type Error",
              description: `Object ${obj.id.substring(0,8)}... has an unexpected type.`,
              variant: "destructive",
            })
          }

        } catch (error) {
           console.error(`Error fetching details for object ${obj.id}:`, error)
           toast({
             title: "Verification Error",
             description: `Failed to verify object ${obj.id.substring(0,8)}...`,
             variant: "destructive",
           })
        }
      }

      console.log(`Verified ${objectsToProcess.length} objects to process.`)

      if (objectsToProcess.length === 0) {
        toast({
          title: "No Objects to Save",
          description: "No owned NFT or SynObjects found in the tank to save.",
          variant: "default",
        })
        setIsLoading(false)
        // ローカルモードではないが、保存対象がない場合はローカル保存と同様の動作（hasChangesをfalseにするなど）
        setHasChanges(false)
        return
      }


      // 2. Add move calls to the transaction
      let transactionHasCalls = false
      for (const objToProcess of objectsToProcess) {
        try {
          if (objToProcess.type === "nft" && objToProcess.position) {
            console.log(`Adding calls for NFT: ${objToProcess.id}, Position: x=${objToProcess.position.x}, y=${objToProcess.position.y}`)
            // Attach NFT
            tx.moveCall({
              target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system_nft::attach_object`,
              arguments: [
                tx.object(tankId),
                tx.object(objToProcess.id),
              ],
            })
            // Save Layout for NFT
            tx.moveCall({
              target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system_nft::save_layout`,
              arguments: [
                tx.object(tankId),
                tx.object(objToProcess.id),
                tx.pure.u64(objToProcess.position.x),
                tx.pure.u64(objToProcess.position.y),
              ],
            })
            transactionHasCalls = true
          } else if (objToProcess.type === "synObject") {
            // SynObjectの場合の位置情報も取得
            const position = objectPositions[objToProcess.id] || { x: 0, y: 0 }
            console.log(`Adding call for SynObject: ${objToProcess.id}, Position: x=${Math.floor(position.x)}, y=${Math.floor(position.y)}`)
            
            // まずSynObjectをタンクに添付
            tx.moveCall({
              target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system_syn_object::attach_syn_object`,
              arguments: [
                tx.object(tankId),
                tx.object(objToProcess.id),
              ],
            })
            
            // 次にSynObjectの位置情報を更新
            tx.moveCall({
              target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system_syn_object::update_syn_position`,
              arguments: [
                tx.object(tankId),
                tx.object(objToProcess.id),
                tx.pure.u64(Math.floor(position.x)),
                tx.pure.u64(Math.floor(position.y)),
              ],
            })
            
            transactionHasCalls = true
          }
        } catch (error) {
           console.error(`Error preparing transaction for object ${objToProcess.id}:`, error)
           toast({
             title: "Transaction Error",
             description: `Failed to prepare transaction for object ${objToProcess.id.substring(0,8)}...`,
             variant: "destructive",
           })
        }
      }

       if (!transactionHasCalls) {
        toast({
          title: "No Operations",
          description: "No valid operations to perform.",
          variant: "default",
        })
        setIsLoading(false)
        setHasChanges(false) // Reset changes if nothing was added to tx
        return
      }


      // 3. Build and Execute Transaction
      console.log("Building transaction...")
      // Build the transaction (this performs the dry run)
      await tx.build({ client: suiClient }) // Pass the suiClient instance here

      console.log("Transaction built successfully. Ready to sign and execute.")

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
      // エラーメッセージをより具体的に表示
      let description = "Failed to save water tank layout."
       if (error instanceof Error) {
        if (error.message.includes("CommandArgumentError")) {
          description += " There might be an issue with object types or ownership."
        } else if (error.message.includes("InsufficientGas")) {
          description += " Insufficient gas budget for the transaction."
        } else {
           description += ` ${error.message}`
        }
      } else {
        description += ` ${String(error)}`
      }

      toast({
        title: "Error",
        description: description,
        variant: "destructive",
      })

      // オンチェーン保存に失敗した場合でもローカル保存はしない方が混乱を招かないかも
      // handleLocalSave()
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
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system_nft::update_tank_level`,
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

  // Tank画像をキャプチャしてダウンロードする関数
  const handleDownloadTankImage = async () => {
    if (!tankRef.current) return
    try {
      const canvas = await html2canvas(tankRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2, // High resolution
      })
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = "tank.png"
      link.click()
    } catch (e) {
      toast({
        title: "Image Save Error",
        description: "Failed to save tank image.",
        variant: "destructive",
      })
    }
  }

  // If wallet is not connected and no wallet address is specified
  if (!currentAccount && !walletAddress) {
    return (
      <div className="game-container flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="pixel-text text-3xl text-white">Connect Wallet !!</p>
        </div>
      </div>
    )
  }
  
  // If we know the tank doesn't exist
  if (tankExists === false) {
    return (
      <div className="game-container flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="pixel-text text-3xl text-white font-bold">No Water Tank Found for this Address...</p>
          <p className="pixel-text text-xl text-white mt-4 font-bold">Look for Tank at a different address.</p>
        </div>
      </div>
    )
  }
  
  // Loading state
  if (tankExists === null && walletAddress) {
    return (
      <div className="game-container flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="pixel-text text-3xl text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative w-full">
        <div className="overflow-auto">
          <div className="pixel-container p-4 bg-stone-600">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-gray-300 pb-2">
              <div className="flex items-center mb-2 sm:mb-0">
                <h2 className="pixel-text text-white font-bold truncate max-w-[200px] sm:max-w-none">
                  {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}'s Water Tank`}
                  {isLocalMode && <span className="text-xs ml-2 text-gray-600">(Local Mode)</span>}
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="ml-2 p-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                  title="Refresh tank data"
                >
                  <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {walletAddress && (
                <div className="flex items-center w-full sm:w-auto">
                  <div className="bg-gray-200 border-2 border-black p-1 flex items-center flex-wrap sm:flex-nowrap w-full sm:w-auto">
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
                      // <div className="ml-2 text-xs whitespace-nowrap">{txToNextRank} more for next rank</div>
                      <></>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* タンクの内容部分 - 枠だけを表示するように変更 */}
            <div
              ref={tankRef}
              className="fish-tank w-full h-[480px] relative rank-${tankRank} rounded-lg border-4 border-stone-400 shadow-lg overflow-hidden"
              style={{
                backgroundImage: !isContentLoading && tankBackground ? `url(${tankBackground})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* コンテンツのローディング表示 */}
              {isContentLoading ? (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    backgroundImage: `url(${loadingBackgrounds[loadingBgIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'background-image 0.2s ease-in-out'
                  }}
                >
                  <div className="bg-black/50 p-6 rounded-lg">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
                    <p className="pixel-text text-white text-xl text-center">Checking recent Sui onchain activity...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* 背景がない場合のデフォルト背景 */}
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

                  {/* オブジェクトの表示 */}
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
                </>
              )}
            </div>

            {isOwner && !isContentLoading && walletAddress && (
              <div className="mt-2 flex flex-col items-start gap-2">
                <button
                  onClick={handleDownloadTankImage}
                  className="game-button p-1 w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-500 border border-gray-300 rounded shadow-none"
                  title="Download image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                </button>
                <div className="text-xs text-gray-600">
                  {objects.length === 0
                    ? "Drag objects from MyBox to place them in the tank"
                    : "Drag placed objects to change their position"}
                </div>
              </div>
            )}

            {isOwner && hasChanges && !isContentLoading && (
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