export interface SynObject {
  id: string
  owner: string
  attached_objects: string[]
  image: string
  is_public: boolean
  max_supply: number
  current_supply: number
  price: number
  kioskId?: string
  listing?: {
    id: string
    price: number
  }
}

export interface SuiMoveObject {
  dataType: "moveObject"
  type: string
  hasPublicTransfer: boolean
  fields: {
    owner: string
    attached_objects: string[]
    image: string
    is_public: boolean
    max_supply: string
    current_supply: string
    price: string
  }
} 