import { useState, useEffect, useCallback } from 'react'
import { Button } from './components/ui/button'

interface GridSquare {
  id: number
  letter: string
  isLit: boolean
}

function App() {
  const [grid, setGrid] = useState<GridSquare[]>([])
  const [isAnimating, setIsAnimating] = useState(true)

  // Generate random letter
  const getRandomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return letters[Math.floor(Math.random() * letters.length)]
  }

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid: GridSquare[] = []
    for (let i = 0; i < 100; i++) {
      newGrid.push({
        id: i,
        letter: getRandomLetter(),
        isLit: Math.random() > 0.5
      })
    }
    setGrid(newGrid)
  }, [])

  // Random transition effect with wave patterns
  useEffect(() => {
    if (!isAnimating) return

    const createWaveTransition = () => {
      setGrid(prevGrid => {
        const newGrid = [...prevGrid]
        
        // Create different transition patterns
        const patterns = [
          // Random scattered
          () => {
            const numToToggle = Math.floor(Math.random() * 8) + 4
            const indicesToToggle = new Set<number>()
            while (indicesToToggle.size < numToToggle) {
              indicesToToggle.add(Math.floor(Math.random() * 100))
            }
            return Array.from(indicesToToggle)
          },
          
          // Horizontal wave
          () => {
            const row = Math.floor(Math.random() * 10)
            const startCol = Math.floor(Math.random() * 6)
            const length = Math.floor(Math.random() * 5) + 3
            const indices = []
            for (let i = 0; i < length; i++) {
              if (startCol + i < 10) {
                indices.push(row * 10 + startCol + i)
              }
            }
            return indices
          },
          
          // Vertical wave
          () => {
            const col = Math.floor(Math.random() * 10)
            const startRow = Math.floor(Math.random() * 6)
            const length = Math.floor(Math.random() * 5) + 3
            const indices = []
            for (let i = 0; i < length; i++) {
              if (startRow + i < 10) {
                indices.push((startRow + i) * 10 + col)
              }
            }
            return indices
          },
          
          // Diagonal pattern
          () => {
            const startRow = Math.floor(Math.random() * 7)
            const startCol = Math.floor(Math.random() * 7)
            const length = Math.floor(Math.random() * 4) + 3
            const indices = []
            for (let i = 0; i < length; i++) {
              if (startRow + i < 10 && startCol + i < 10) {
                indices.push((startRow + i) * 10 + startCol + i)
              }
            }
            return indices
          },
          
          // Cross pattern
          () => {
            const centerRow = Math.floor(Math.random() * 8) + 1
            const centerCol = Math.floor(Math.random() * 8) + 1
            const indices = [
              centerRow * 10 + centerCol, // center
              (centerRow - 1) * 10 + centerCol, // top
              (centerRow + 1) * 10 + centerCol, // bottom
              centerRow * 10 + (centerCol - 1), // left
              centerRow * 10 + (centerCol + 1), // right
            ]
            return indices.filter(i => i >= 0 && i < 100)
          }
        ]
        
        // Randomly select a pattern
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)]
        const indicesToToggle = selectedPattern()
        
        indicesToToggle.forEach(index => {
          if (index >= 0 && index < 100) {
            newGrid[index] = {
              ...newGrid[index],
              isLit: !newGrid[index].isLit
            }
          }
        })

        return newGrid
      })
    }

    // Initial transition
    createWaveTransition()
    
    // Set up interval with varying timing
    const scheduleNext = () => {
      const delay = 600 + Math.random() * 1400 // Random interval between 600ms and 2000ms
      setTimeout(() => {
        if (isAnimating) {
          createWaveTransition()
          scheduleNext()
        }
      }, delay)
    }
    
    scheduleNext()
  }, [isAnimating])

  // Initialize grid on mount
  useEffect(() => {
    initializeGrid()
  }, [initializeGrid])

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  const resetGrid = () => {
    initializeGrid()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Interactive Letter Grid
          </h1>
          <p className="text-slate-600 mb-6">
            Watch the letters dance between light and shadow
          </p>
          
          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={toggleAnimation}
              variant={isAnimating ? "destructive" : "default"}
              className="px-6"
            >
              {isAnimating ? 'Pause Animation' : 'Start Animation'}
            </Button>
            <Button 
              onClick={resetGrid}
              variant="outline"
              className="px-6"
            >
              New Letters
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-slate-200">
          {grid.map((square) => (
            <div
              key={square.id}
              className={`
                grid-square relative aspect-square flex items-center justify-center
                text-lg font-bold rounded-xl cursor-pointer select-none
                border-2 transition-all duration-700 ease-out
                ${square.isLit 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25' 
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 border-slate-300 shadow-sm'
                }
              `}
              onClick={() => {
                setGrid(prevGrid => 
                  prevGrid.map(s => 
                    s.id === square.id 
                      ? { ...s, isLit: !s.isLit }
                      : s
                  )
                )
              }}
            >
              {/* Letter */}
              <span className="z-20 relative font-inter font-bold tracking-wide">
                {square.letter}
              </span>
              
              {/* Shadow overlay */}
              <div 
                className={`
                  shadow-overlay absolute inset-0 bg-slate-900 rounded-xl
                  ${square.isLit ? 'opacity-0' : 'opacity-50'}
                `}
              />
              
              {/* Glow effect for lit squares */}
              <div 
                className={`
                  glow-effect absolute inset-0 rounded-xl
                  ${square.isLit 
                    ? 'ring-2 ring-blue-400/30 shadow-xl shadow-blue-500/20' 
                    : 'ring-0 shadow-none'
                  }
                `}
              />
              
              {/* Subtle inner highlight */}
              <div 
                className={`
                  absolute inset-0.5 rounded-lg
                  transition-all duration-700 ease-out
                  ${square.isLit 
                    ? 'bg-gradient-to-t from-transparent to-white/10' 
                    : 'bg-transparent'
                  }
                `}
              />
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {isAnimating ? '✨ Animation running...' : '⏸️ Animation paused'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click any square to toggle manually
          </p>
        </div>
      </div>
    </div>
  )
}

export default App