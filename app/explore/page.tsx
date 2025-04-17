"use client"

import { useState } from "react"
import Layout from "@/components/layout"
import ProjectList from "@/components/project-list"
import ObjectList from "@/components/object-list"
import ObjectDetailModal from "@/components/object-detail-modal"

// NFTObjectの型定義をインポートまたは再定義
interface MintFlag {
  module: string
  package: string
  function: string
}

interface NFTObject {
  id: number
  name: string
  image: string
  mint_flag: MintFlag
  created_at: string
  updated_at: string
  project_id: number
}

export default function ExplorePage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [selectedObject, setSelectedObject] = useState<NFTObject | null>(null)

  return (
    <Layout onWalletSearch={function (address: string): void {
      throw new Error("Function not implemented.")
    }}>
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="pixel-container p-4">
          <h1 className="pixel-text text-2xl mb-4 font-bold">Project Explore</h1>

          {!selectedProject ? (
            <ProjectList onSelectProject={setSelectedProject} />
          ) : (
            <>
              <button onClick={() => setSelectedProject(null)} className="pixel-button mb-4 px-4 py-2">
                ← Back to Projects
              </button>
              <ObjectList projectId={selectedProject} onSelectObject={setSelectedObject} />
            </>
          )}

          {selectedObject && (
            <ObjectDetailModal
              object={selectedObject}
              onClose={() => setSelectedObject(null)}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}

