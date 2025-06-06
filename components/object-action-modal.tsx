"use client"

import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"

interface ObjectActionModalProps {
  object: any
  onAddToSynthesis: () => void
  onClose: () => void
  onPlaceInTank: (object: any) => void
  canAddToSynthesis: boolean
  onPublish?: () => void
}

interface EvolutionPath {
  id: number
  pre_evolution_name: string
  post_evolution_name: string
  evolution_condition: {
    token: string
    minimum_amount: number
    required_action: string
  }
  evolution_condition_text: string
  created_at: string
  updated_at: string
}

export default function ObjectActionModal({
  object,
  onAddToSynthesis,
  onClose,
  onPlaceInTank,
  canAddToSynthesis,
  onPublish,
}: ObjectActionModalProps) {
  const { toast } = useToast()
  const [evolutionPath, setEvolutionPath] = useState<EvolutionPath | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchDone, setSearchDone] = useState(false)
  const [evolvedNftImage, setEvolvedNftImage] = useState<string | null>(null)
  const [isEvolving, setIsEvolving] = useState(false)
  
  // 必要なSuiのフックを追加
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signTransaction = useSignTransaction()

  useEffect(() => {
    // SynObjectの場合は検索しない
    if (object?.name && object?.type !== "synObject") {
      setIsSearching(true)
      setSearchDone(false)
      setEvolvedNftImage(null)
      
      // evolution_pathsテーブルから進化経路を取得
      const fetchEvolutionPath = async () => {
        try {
          // 対象のNFT名で進化経路を検索
          const { data: evolutionPathData, error: evolutionPathError } = await supabase
            .from('evolution_paths')
            .select('*')
            .eq('pre_evolution_name', object.name);
          
          if (evolutionPathError) throw evolutionPathError;
          
          if (evolutionPathData && evolutionPathData.length > 0) {
            setEvolutionPath(evolutionPathData[0]);
            
            // 進化後のNFT画像を取得
            const { data: nftData, error: nftError } = await supabase
              .from('nft_objects')
              .select('image')
              .eq('name', evolutionPathData[0].post_evolution_name)
              .maybeSingle();
              
            if (nftError) throw nftError;
            
            if (nftData) {
              setEvolvedNftImage(nftData.image);
            }
          } else {
            console.log(`No evolution path found for ${object.name}`);
          }
          
          setIsSearching(false);
          setSearchDone(true);
        } catch (error) {
          console.error('Error fetching evolution data:', error);
          setIsSearching(false);
          setSearchDone(true);
        }
      };
      
      fetchEvolutionPath();
    }
  }, [object?.name, object?.type]);

  const handleDragToTank = () => {
    const dragObject = {
      id: Date.now(),
      type: "nft",
      name: object.name,
      image: object.image,
      x: 50,
      y: 50
    }

    const event = new DragEvent("dragstart")
    event.dataTransfer?.setData("application/json", JSON.stringify(dragObject))

    toast({
      title: "タンクに配置準備完了",
      description: "MyBoxからタンクにドラッグしてください",
    })
    onClose()
  }

  const handlePlaceInTank = () => {
    const nftObject = {
      id: object.id,
      type: "nft",
      name: object.name,
      image: object.image,
      x: 50,
      y: 50
    }

    onPlaceInTank(nftObject)
    
    toast({
      title: "タンクに配置完了",
      description: "NFTをドラッグして位置を調整できます",
    })
    onClose()
  }

  const handlePublish = () => {
    if (onPublish) {
      onPublish()
    }
    onClose()
  }

  const handleEvolve = async () => {
    if (!evolutionPath || !evolvedNftImage) return;
    if (!account) {
      toast({
        title: "エラー",
        description: "ウォレットに接続されていません",
        variant: "destructive",
      });
      return;
    }
    
    setIsEvolving(true);
    
    toast({
      title: "進化処理を開始します",
      description: `${evolutionPath.pre_evolution_name}から${evolutionPath.post_evolution_name}に進化します`,
    });
    
    try {
      // トランザクション作成
      const tx = new Transaction();
      
      // 送信者設定
      tx.setSender(account.address);
      
      // NFTの名前と画像URLをバイト配列に変換
      const newNameBytes = Array.from(new TextEncoder().encode(evolutionPath.post_evolution_name));
      const newImageBytes = Array.from(new TextEncoder().encode(evolvedNftImage));
      
      // NFTの更新処理を呼び出す
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::nft_system_nft::update_nft_info`,
        arguments: [
          tx.object(object.id),
          tx.pure.vector("u8", newNameBytes),
          tx.pure.vector("u8", newImageBytes),
        ],
      });
      
      // トランザクションの構築
      await tx.build({ client: suiClient });
      
      // トランザクションに署名
      const { bytes, signature } = await signTransaction.mutateAsync({
        transaction: tx,
      });
      
      // トランザクションの実行
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showEvents: true },
      });
      
      // トランザクションの完了を待つ
      await suiClient.waitForTransaction({ digest: result.digest });
      
      // 進化後のNFTオブジェクトを作成
      const evolvedObject = {
        id: object.id,
        type: "nft",
        name: evolutionPath.post_evolution_name,
        image: evolvedNftImage,
        x: object.x || 50,
        y: object.y || 50
      };
      
      // 進化後のオブジェクトをタンクに配置
      onPlaceInTank(evolvedObject);
      
      toast({
        title: "進化完了",
        description: `${evolutionPath.post_evolution_name}に進化しました`,
      });
    } catch (error) {
      console.error('Error during evolution:', error);
      toast({
        title: "進化処理に失敗しました",
        description: "エラーが発生しました。後でもう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsEvolving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-500/30" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="bg-blue-50 border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="pixel-text text-gray-700 text-lg">{object.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
              {object.type === "fish" && (
                <div className="w-16 h-12 relative">
                  <div
                    className="absolute w-6 h-6 rounded-sm"
                    style={{ left: "0px", top: "3px", backgroundColor: object.color }}
                  ></div>
                  <div
                    className="absolute w-6 h-6 rounded-sm"
                    style={{ left: "6px", top: "0px", backgroundColor: object.color }}
                  ></div>
                  <div className="absolute w-3 h-3 bg-gray-600 rounded-full" style={{ left: "8px", top: "3px" }}></div>
                </div>
              )}

              {object.type === "plant" && (
                <div className="w-12 h-20 relative">
                  <div
                    className="absolute w-3 h-12 rounded-sm"
                    style={{ left: "5px", top: "8px", backgroundColor: object.color }}
                  ></div>
                  <div
                    className="absolute w-3 h-10 rounded-sm"
                    style={{ left: "2px", top: "4px", backgroundColor: object.color }}
                  ></div>
                </div>
              )}

              {object.type === "decoration" && (
                <div className="w-16 h-16 bg-yellow-100 rounded-lg border border-yellow-200 flex items-center justify-center">
                  <span className="pixel-text text-yellow-800 text-lg">{object.name.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {(object.type === "synObject" || object.type === "nft") && (
                <img src={object.image} alt={object.name} className="w-full h-full object-contain p-2" />
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="pixel-text text-gray-700 text-lg mb-1">{object.name}</div>
            <div className="text-sm text-gray-600">
              {object.type === "synObject" ? "SynObject" : object.type}
            </div>
            {object.rarity && (
              <div
                className="text-sm mt-1 font-medium"
                style={{
                  color:
                    object.rarity === "Common"
                      ? "#9CA3AF"
                      : object.rarity === "Uncommon"
                        ? "#34D399"
                        : object.rarity === "Rare"
                          ? "#60A5FA"
                          : object.rarity === "Epic"
                            ? "#A78BFA"
                            : "#F59E0B",
                }}
              >
                {object.rarity}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {canAddToSynthesis && (
              <button
                onClick={onAddToSynthesis}
                className="game-button synthesis-button w-full py-2"
              >
                Add to Blend
              </button>
            )}

            {object.type === "synObject" && (
              <button
                onClick={handlePublish}
                className="game-button publish-button w-full py-2 opacity-50 cursor-not-allowed"
              >
                Publish to Marketplace
              </button>
            )}

            <button
              onClick={handlePlaceInTank}
              className="game-button collections-button w-full py-2"
            >
              Place in Tank
            </button>
            
            {/* SynObjectではない場合のみEvolutionボタンを表示 */}
            {object.type !== "synObject" && (
              <>
                {isSearching && (
                  <button
                    disabled
                    className="game-button w-full py-2 bg-gray-200 text-gray-600"
                  >
                    Searching...
                  </button>
                )}
                
                {!isSearching && searchDone && evolutionPath && (
                  <button
                    onClick={handleEvolve}
                    disabled={isEvolving}
                    className="game-button evolve-button w-full py-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isEvolving ? "進化中..." : `Evolve to ${evolutionPath.post_evolution_name}`}
                  </button>
                )}
                
                {!isSearching && searchDone && !evolutionPath && (
                  <button
                    disabled
                    className="game-button w-full py-2 bg-gray-200 text-gray-600 cursor-not-allowed"
                  >
                    No evolution path found
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

