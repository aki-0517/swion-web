interface PositionProps {
  x: number
  y: number
}

export function Fish({ x, y, color = "orange" }: PositionProps & { color?: string }) {
  return (
    <div
      className="absolute w-8 h-6"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="w-full h-full relative">
        {/* Pixel art fish */}
        <div className="absolute w-2 h-2 bg-black" style={{ left: "0px", top: "2px" }}></div>
        <div className="absolute w-4 h-4" style={{ left: "2px", top: "1px", backgroundColor: color }}></div>
        <div className="absolute w-2 h-2" style={{ left: "6px", top: "1px", backgroundColor: color }}></div>
        <div className="absolute w-2 h-2 bg-black" style={{ left: "6px", top: "3px" }}></div>
        <div className="absolute w-2 h-2" style={{ left: "8px", top: "2px", backgroundColor: color }}></div>
        <div className="absolute w-2 h-2" style={{ left: "10px", top: "3px", backgroundColor: color }}></div>
      </div>
    </div>
  )
}

export function Plant({ x, y, color = "green" }: PositionProps & { color?: string }) {
  return (
    <div
      className="absolute w-8 h-12"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="w-full h-full relative">
        {/* Pixel art plant */}
        <div className="absolute w-2 h-8" style={{ left: "3px", top: "4px", backgroundColor: color }}></div>
        <div className="absolute w-2 h-6" style={{ left: "1px", top: "2px", backgroundColor: color }}></div>
        <div className="absolute w-2 h-7" style={{ left: "5px", top: "1px", backgroundColor: color }}></div>
      </div>
    </div>
  )
}

export function Decoration({ x, y, name }: PositionProps & { name: string }) {
  // Different decorations based on name
  if (name === "castle") {
    return (
      <div
        className="absolute w-16 h-16"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="w-full h-full relative">
          {/* Pixel art castle */}
          <div className="absolute w-12 h-10 bg-gray-300" style={{ left: "2px", top: "6px" }}></div>
          <div className="absolute w-2 h-4 bg-gray-500" style={{ left: "2px", top: "2px" }}></div>
          <div className="absolute w-2 h-4 bg-gray-500" style={{ left: "6px", top: "2px" }}></div>
          <div className="absolute w-2 h-4 bg-gray-500" style={{ left: "10px", top: "2px" }}></div>
          <div className="absolute w-4 h-2 bg-gray-700" style={{ left: "6px", top: "12px" }}></div>
        </div>
      </div>
    )
  }

  // Default decoration
  return (
    <div
      className="absolute w-8 h-8 bg-yellow-200 border-2 border-black"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="pixel-text text-xs text-center">?</div>
    </div>
  )
}

