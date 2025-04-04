"use client"

import { useState } from "react"
import Layout from "@/components/layout"
import ProjectList from "@/components/project-list"
import ObjectList from "@/components/object-list"

export default function ExplorePage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="pixel-container p-4">
          <h1 className="pixel-text text-2xl mb-4">Project Explore</h1>

          {!selectedProject ? (
            <ProjectList onSelectProject={setSelectedProject} />
          ) : (
            <>
              <button onClick={() => setSelectedProject(null)} className="pixel-button mb-4 px-4 py-2">
                ← Back to Projects
              </button>
              <ObjectList projectId={selectedProject} />
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

