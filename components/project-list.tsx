"use client"

interface ProjectListProps {
  onSelectProject: (projectId: string) => void
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
  const projects = [
    { id: "project1", name: "Pixel Monsters", description: "Collect pixel art monsters for your tank" },
    { id: "project2", name: "Aqua Decorations", description: "Beautiful decorations for your aquarium" },
    { id: "project3", name: "Rare Fish", description: "Rare and exotic fish species" },
  ]

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="pixel-card p-4 cursor-pointer" onClick={() => onSelectProject(project.id)}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-200 border-2 border-black mr-4 flex items-center justify-center">
              <span className="pixel-text">{project.name.charAt(0)}</span>
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

