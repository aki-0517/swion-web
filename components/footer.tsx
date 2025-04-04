"use client"

interface FooterProps {
  onExplore: () => void
  onCollections: () => void
}

export default function Footer({ onExplore, onCollections }: FooterProps) {
  return (
    <footer className="h-16 flex items-center justify-end px-4 gap-4">
      <button onClick={onExplore} className="game-button explore-button">
        Explore
      </button>

      <button onClick={onCollections} className="game-button collections-button">
        Collections
      </button>
    </footer>
  )
}

