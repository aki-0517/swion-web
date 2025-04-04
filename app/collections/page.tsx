"use client"

import { useState } from "react"
import Layout from "@/components/layout"
import CollectionsList from "@/components/collections-list"
import CollectionDetailModal from "@/components/collection-detail-modal"

export default function CollectionsPage() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="pixel-container p-4">
          <h1 className="pixel-text text-2xl mb-4">Collections</h1>

          <CollectionsList onSelectCollection={setSelectedCollection} />

          {selectedCollection && (
            <CollectionDetailModal collectionId={selectedCollection} onClose={() => setSelectedCollection(null)} />
          )}
        </div>
      </div>
    </Layout>
  )
}

