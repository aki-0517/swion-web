"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

interface Project {
  id: number
  name: string
  description: string
  logo_image: string | null
  url: string | null
}

interface ProjectListProps {
  onSelectProject: (projectId: number) => void
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, logo_image, url')
        .order('name')

      if (error) {
        toast({
          title: "エラー",
          description: "プロジェクトの読み込みに失敗しました",
          variant: "destructive",
        })
        return
      }

      setProjects(data || [])
    }

    fetchProjects()
  }, [])

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="pixel-card p-4 cursor-pointer" onClick={() => onSelectProject(project.id)}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-200 border-2 border-black mr-4 flex items-center justify-center overflow-hidden">
              {project.logo_image ? (
                <Image
                  src={project.logo_image}
                  alt={`${project.name} logo`}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="pixel-text">{project.name.charAt(0)}</span>
              )}
            </div>

            <div>
              <h3 className="pixel-text text-sm">{project.name}</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>

            <button className="game-button ml-auto px-2 py-1 text-sm">Details</button>
          </div>
        </div>
      ))}
    </div>
  )
}

