import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { theme, tetrisColors } from './themes'
import './App.css'

// Tetris Game Constants & Types
const BLOCK_SIZE = 30
const DROP_SPEED = 400 // ms

type GameScreen = 'menu' | 'game' | 'gameover'

// Tetris pieces (tetrominoes)
interface Piece {
  shape: boolean[][]
  color: string
  x: number
  y: number
}

interface Block {
  color: string | null
  filled: boolean
}

// Initial pieces
const tetrisShapes = {
  I: {
    shape: [
      [true, true, true, true],
    ],
    color: tetrisColors.I,
  },
  O: {
    shape: [
      [true, true],
      [true, true],
    ],
    color: tetrisColors.O,
  },
  T: {
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
    color: tetrisColors.T,
  },
  S: {
    shape: [
      [false, true, true],
      [true, true, false],
      [false, false, false],
    ],
    color: tetrisColors.S,
  },
  Z: {
    shape: [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ],
    color: tetrisColors.Z,
  },
  J: {
    shape: [
      [true, false, false],
      [true, true, true],
      [false, false, false],
    ],
    color: tetrisColors.J,
  },
  L: {
    shape: [
      [false, false, true],
      [true, true, true],
      [false, false, false],
    ],
    color: tetrisColors.L,
  },
}

function MenuScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center px-4"
      style={{ backgroundColor: theme.bgDark }}
    >
      <h1 className="text-6xl font-bold mb-4" style={{ color: theme.gold, fontFamily: 'Cinzel' }}>
        ⚔ TETRIS ⚔
      </h1>
      <p className="text-xl mb-8" style={{ color: theme.textMuted, fontFamily: 'Crimson Text' }}>
        Medieval Block Puzzle
      </p>

      <div className="mb-12 max-w-md" style={{ color: theme.textCream, fontFamily: 'Crimson Text' }}>
        <p className="mb-4">Fit the falling blocks to complete rows.</p>
        <div className="text-left text-sm space-y-2" style={{ color: theme.textMuted }}>
          <p>⬅️ ➡️ - Move left/right</p>
          <p>⬇️ - Soft drop</p>
          <p>R - Rotate</p>
          <p>SPACE - Hard drop</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="px-12 py-4 text-2xl font-bold rounded-lg shadow-2xl hover:scale-110 active:scale-95 transition-all"
        style={{
          backgroundColor: theme.gold,
          color: theme.bgDark,
          fontFamily: 'Cinzel',
        }}
      >
        START GAME
      </button>
    </div>
  )
}

function GameOverScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center px-4"
      style={{ backgroundColor: theme.bgDark }}
    >
      <h1 className="text-6xl font-bold mb-4" style={{ color: theme.goldLight, fontFamily: 'Cinzel' }}>
        GAME OVER
      </h1>
      <p className="text-4xl mb-8" style={{ color: theme.gold, fontFamily: 'Cinzel' }}>
        Score: {score}
      </p>

      <button
        onClick={onRestart}
        className="px-12 py-4 text-2xl font-bold rounded-lg shadow-2xl hover:scale-110 active:scale-95 transition-all"
        style={{
          backgroundColor: theme.gold,
          color: theme.bgDark,
          fontFamily: 'Cinzel',
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}

function GameScreen({ onGameOver }: { onGameOver: (score: number) => void }) {
  // ===================== STATE MANAGEMENT =====================
  const [gridWidth, setGridWidth] = useState(10)
  const [gridHeight, setGridHeight] = useState(20)

  const [grid, setGrid] = useState<Block[][]>(
    Array(gridHeight)
      .fill(null)
      .map(() =>
        Array(gridWidth)
          .fill(null)
          .map(() => ({ color: null, filled: false }))
      )
  )

  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  // ===================== REFS =====================
  const keysPressed = useRef<Record<string, boolean>>({})
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gridRef = useRef<Block[][]>(grid)
  const currentPieceRef = useRef<Piece | null>(currentPiece)
  const nextPieceRef = useRef<Piece | null>(nextPiece)
  const scoreRef = useRef<number>(score)
  const spacePressed = useRef<boolean>(false) // Flag para evitar duplicação de hard drop
  const skipNextGameLoop = useRef<boolean>(false) // Flag para pular game loop após hard drop

  // Update refs when state changes - using useLayoutEffect for synchronous updates
  useLayoutEffect(() => {
    gridRef.current = grid
    currentPieceRef.current = currentPiece
    nextPieceRef.current = nextPiece
    scoreRef.current = score
  }, [grid, currentPiece, nextPiece, score])

  // ===================== HELPER FUNCTIONS =====================

  // Get random tetromino
  const getRandomPiece = useCallback((): Piece => {
    const keys = Object.keys(tetrisShapes) as (keyof typeof tetrisShapes)[]
    const randomKey = keys[Math.floor(Math.random() * keys.length)]
    const shapeData = tetrisShapes[randomKey]

    return {
      shape: shapeData.shape.map((row) => [...row]),
      color: shapeData.color,
      x: Math.floor(gridWidth / 2) - 1,
      y: 0,
    }
  }, [gridWidth])

  // Check collision
  const checkCollision = useCallback(
    (piece: Piece, testGrid: Block[][], offsetX = 0, offsetY = 0): boolean => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (!piece.shape[row][col]) continue

          const x = piece.x + col + offsetX
          const y = piece.y + row + offsetY

          // Check bounds
          if (x < 0 || x >= gridWidth) return true
          if (y >= gridHeight) return true

          // Check grid collision
          if (y >= 0 && testGrid[y] && testGrid[y][x].filled) return true
        }
      }
      return false
    },
    [gridWidth, gridHeight]
  )

  // Place piece on grid
  const placePiece = useCallback((piece: Piece, testGrid: Block[][]): Block[][] => {
    const newGrid = testGrid.map((row) => [...row])

    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (!piece.shape[row][col]) continue

        const x = piece.x + col
        const y = piece.y + row

        if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
          newGrid[y][x] = { color: piece.color, filled: true }
        }
      }
    }

    return newGrid
  }, [])

  // Clear complete lines
  const clearLines = useCallback((testGrid: Block[][]): { grid: Block[][]; clearedLines: number } => {
    let clearedCount = 0
    let newGrid = testGrid.filter((row) => {
      const isFull = row.every((block) => block.filled)
      if (isFull) clearedCount++
      return !isFull
    })

    // Add empty rows at top
    while (newGrid.length < gridHeight) {
      newGrid.unshift(
        Array(gridWidth)
          .fill(null)
          .map(() => ({ color: null, filled: false }))
      )
    }

    return { grid: newGrid, clearedLines: clearedCount }
  }, [gridHeight, gridWidth])

  // Rotate piece
  const rotatePiece = useCallback((piece: Piece): Piece => {
    // Special case: O piece never needs rotation
    if (piece.shape.length === 2 && piece.shape[0].length === 2) {
      return piece
    }

    // Create rotated shape by transposing and reversing rows
    const rows = piece.shape.length
    const cols = piece.shape[0].length
    const rotated: boolean[][] = []

    // Transpose and reverse
    for (let col = 0; col < cols; col++) {
      const newRow: boolean[] = []
      for (let row = rows - 1; row >= 0; row--) {
        newRow.push(piece.shape[row][col])
      }
      rotated.push(newRow)
    }

    // Adjust position to prevent piece from going out of bounds
    let newX = piece.x
    const newCols = rotated[0]?.length || 0
    
    // If rotated piece exceeds right boundary, move it left
    if (newX + newCols > gridWidth) {
      newX = gridWidth - newCols
    }
    // If rotated piece exceeds left boundary, move it right
    if (newX < 0) {
      newX = 0
    }

    return { ...piece, shape: rotated, x: newX }
  }, [])

  // ===================== INITIALIZE GAME =====================

  useEffect(() => {
    const first = getRandomPiece()
    const second = getRandomPiece()
    setCurrentPiece(first)
    setNextPiece(second)
    setTimeLeft(600) // Reset timer to 10 minutes
    setGameStarted(true)
  }, [getRandomPiece])

  // ===================== GAME LOOP =====================

  useEffect(() => {
    if (!gameStarted || !currentPiece || isPaused) return

    gameLoopRef.current = setInterval(() => {
      // Skip this cycle if hard drop was just executed
      if (skipNextGameLoop.current) {
        skipNextGameLoop.current = false
        return
      }

      setCurrentPiece((prevPiece) => {
        if (!prevPiece) return prevPiece

        const piece = { ...prevPiece }

        // Try to move piece down
        const canFall = !checkCollision(piece, gridRef.current, 0, 1)

        if (canFall) {
          // Piece can still fall
          piece.y++
          return piece
        } else {
          // Piece hits bottom - place it
          const newGrid = placePiece(piece, gridRef.current)
          const { grid: clearedGrid, clearedLines: cleared } = clearLines(newGrid)

          setGrid(clearedGrid)
          const newScore = scoreRef.current + 10 + (cleared > 0 ? cleared * 100 : 0)
          setScore(newScore)
          setLines((l) => l + cleared)

          // Check if we have a next piece to spawn
          if (nextPieceRef.current) {
            const spawnPiece = nextPieceRef.current

            // Check if new piece can spawn (game over condition)
            if (checkCollision(spawnPiece, clearedGrid)) {
              onGameOver(newScore)
              return null
            }

            // Generate new next piece
            setNextPiece(getRandomPiece())

            // Return the spawn piece (next piece becomes current)
            return spawnPiece
          }

          return null
        }
      })
    }, DROP_SPEED)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameStarted, isPaused, checkCollision, placePiece, clearLines, getRandomPiece, onGameOver])

  // ===================== TIMER =====================

  useEffect(() => {
    if (!gameStarted || isPaused || timeLeft <= 0) return

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        
        // Game over when time runs out
        if (newTime <= 0) {
          setTimeLeft(0)
          onGameOver(scoreRef.current)
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [gameStarted, isPaused, onGameOver])

  // ===================== GRID EXPANSION =====================

  useEffect(() => {
    if (!gameStarted || isPaused) return

    const expansionInterval = setInterval(() => {
      // Expand width (add column on right)
      setGridWidth((w) => w + 1)

      // Expand height (add row at bottom)
      setGridHeight((h) => h + 1)

      // Expand the grid itself
      setGrid((prevGrid) => {
        // Add new column to all existing rows
        const expandedGrid = prevGrid.map((row) => [
          ...row,
          { color: null, filled: false },
        ])

        // Add new row at bottom
        const newRow = Array(gridWidth + 1)
          .fill(null)
          .map(() => ({ color: null, filled: false }))
        expandedGrid.push(newRow)

        return expandedGrid
      })
    }, 120000) // 120 seconds = 2 minutes

    return () => clearInterval(expansionInterval)
  }, [gameStarted, isPaused, gridWidth])

  // ===================== INPUT HANDLERS =====================

  // Handle continuous movement (left, right, soft drop)
  useEffect(() => {
    if (isPaused || !gameStarted) return

    const movementInterval = setInterval(() => {
      setCurrentPiece((prev) => {
        if (!prev) return prev

        const moved = { ...prev }
        let hasMoved = false

        // Left
        if (keysPressed.current['arrowleft'] && !checkCollision(prev, gridRef.current, -1, 0)) {
          moved.x--
          hasMoved = true
        }

        // Right
        if (keysPressed.current['arrowright'] && !checkCollision(prev, gridRef.current, 1, 0)) {
          moved.x++
          hasMoved = true
        }

        // Soft drop
        if (keysPressed.current['arrowdown'] && !checkCollision(prev, gridRef.current, 0, 1)) {
          moved.y++
          hasMoved = true
        }

        return hasMoved ? moved : prev
      })
    }, 80) // Smooth continuous movement

    return () => clearInterval(movementInterval)
  }, [isPaused, gameStarted, checkCollision])

  // Handle instant actions (rotate, hard drop, pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysPressed.current[key] = true

      if (e.key === 'Escape') {
        e.preventDefault()
        setIsPaused((p) => !p)
        return
      }

      if (isPaused || !currentPieceRef.current) return

      // Rotate (R key)
      if (key === 'r') {
        e.preventDefault()
        setCurrentPiece((prev) => {
          if (!prev) return prev
          const rotated = rotatePiece(prev)
          if (!checkCollision(rotated, gridRef.current)) {
            return rotated
          }
          return prev
        })
      }

      // Hard drop (Space)
      if (e.code === 'Space') {
        e.preventDefault()

        // Only process if space wasn't already pressed
        if (spacePressed.current) return
        spacePressed.current = true

        // Signal game loop to skip next cycle
        skipNextGameLoop.current = true

        setCurrentPiece((prev) => {
          if (!prev) return prev

          const dropped = { ...prev }

          // Drop to bottom
          while (!checkCollision(dropped, gridRef.current, 0, 1)) {
            dropped.y++
          }

          // Place piece immediately
          const newGrid = placePiece(dropped, gridRef.current)
          const { grid: clearedGrid, clearedLines: cleared } = clearLines(newGrid)

          setGrid(clearedGrid)
          const newScore = scoreRef.current + 10 + (cleared > 0 ? cleared * 100 : 0)
          setScore(newScore)
          setLines((l) => l + cleared)

          // Spawn next piece
          if (nextPieceRef.current) {
            const spawnPiece = nextPieceRef.current

            // Check game over
            if (checkCollision(spawnPiece, clearedGrid)) {
              onGameOver(newScore)
              return null
            }

            // Generate new next piece
            setNextPiece(getRandomPiece())

            return spawnPiece
          }

          return null
        })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
      
      // Reset space flag when Space key is released
      if (e.code === 'Space') {
        spacePressed.current = false
      }
    }

    const handleBlur = () => {
      keysPressed.current = {}
      spacePressed.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [isPaused, checkCollision, placePiece, clearLines, getRandomPiece, onGameOver, rotatePiece])

  // ===================== RENDER =====================

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4" style={{ backgroundColor: theme.bgDark }}>
      {/* Game Board */}
      <div className="flex gap-8">
        {/* Main Grid */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridWidth}, ${BLOCK_SIZE}px)`,
              gap: '1px',
              backgroundColor: theme.bgPanel,
              padding: '10px',
              borderRadius: '8px',
              border: `2px solid ${theme.gold}`,
            }}
          >
            {grid.map((row, y) =>
              row.map((block, x) => {
                // Check if current piece occupies this cell
                let cellColor = block.filled ? (block.color || theme.gold) : theme.bgCard
                let cellShadow = block.filled ? `0 0 8px ${block.color || theme.gold}80` : 'none'

                if (currentPiece) {
                  for (let py = 0; py < currentPiece.shape.length; py++) {
                    for (let px = 0; px < currentPiece.shape[py].length; px++) {
                      if (currentPiece.shape[py][px]) {
                        const pieceX = currentPiece.x + px
                        const pieceY = currentPiece.y + py
                        if (pieceX === x && pieceY === y) {
                          cellColor = currentPiece.color
                          cellShadow = `0 0 12px ${currentPiece.color}`
                        }
                      }
                    }
                  }
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      backgroundColor: cellColor,
                      border: `1px solid ${theme.borderGold}`,
                      boxShadow: cellShadow,
                    }}
                  />
                )
              })
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Timer Panel */}
          <div
            style={{
              backgroundColor: timeLeft <= 60 ? '#5a3a3a' : theme.bgPanel,
              border: `2px solid ${timeLeft <= 60 ? '#ff6b6b' : theme.gold}`,
              borderRadius: '8px',
              padding: '20px',
              minWidth: '200px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: timeLeft <= 60 ? '#ff6b6b' : theme.gold, fontFamily: 'Cinzel', fontSize: '1.5rem', margin: '0 0 10px 0' }}>Time</h2>
            <p style={{ color: timeLeft <= 60 ? '#ff8888' : theme.goldLight, fontFamily: 'Cinzel', fontSize: '2.5rem', margin: '10px 0' }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </p>
          </div>

          {/* Score Panel */}
          <div
            style={{
              backgroundColor: theme.bgPanel,
              border: `2px solid ${theme.gold}`,
              borderRadius: '8px',
              padding: '20px',
              minWidth: '200px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: theme.gold, fontFamily: 'Cinzel', fontSize: '1.5rem', margin: '0 0 10px 0' }}>Score</h2>
            <p style={{ color: theme.goldLight, fontFamily: 'Cinzel', fontSize: '2.5rem', margin: '10px 0' }}>
              {score}
            </p>
            <hr style={{ borderColor: theme.gold, margin: '20px 0' }} />
            <h3 style={{ color: theme.gold, fontFamily: 'Cinzel', fontSize: '1rem', marginBottom: '10px' }}>Lines</h3>
            <p style={{ color: theme.goldLight, fontFamily: 'Cinzel', fontSize: '2rem', margin: 0 }}>{lines}</p>
          </div>

          {/* Next Piece Panel */}
          {nextPiece && (
            <div
              style={{
                backgroundColor: theme.bgPanel,
                border: `2px solid ${theme.gold}`,
                borderRadius: '8px',
                padding: '20px',
                minWidth: '200px',
                textAlign: 'center',
              }}
            >
              <h3 style={{ color: theme.gold, fontFamily: 'Cinzel', fontSize: '1rem', marginBottom: '15px', margin: 0 }}>Next</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(4, 30px)`,
                  gap: '2px',
                  justifyContent: 'center',
                  marginTop: '10px',
                }}
              >
                {Array(16)
                  .fill(null)
                  .map((_, idx) => {
                    const x = idx % 4
                    const y = Math.floor(idx / 4)
                    const filled = nextPiece.shape[y] && nextPiece.shape[y][x]

                    return (
                      <div
                        key={`next-${idx}`}
                        style={{
                          width: 30,
                          height: 30,
                          backgroundColor: filled ? nextPiece.color : theme.bgCard,
                          border: `1px solid ${theme.borderGold}`,
                          borderRadius: '2px',
                        }}
                      />
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pause status */}
      {isPaused && (
        <div style={{ color: theme.gold, fontFamily: 'Cinzel', fontSize: '1.5rem' }}>
          ⏸ PAUSED (ESC to resume)
        </div>
      )}

      {/* Instructions */}
      <p style={{ color: theme.textMuted, fontFamily: 'Crimson Text', textAlign: 'center', marginTop: '10px' }}>
        ⬅️ ➡️ ⬇️ Move | R Rotate | SPACE Hard Drop | ESC Pause
      </p>
    </div>
  )
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu')
  const [finalScore, setFinalScore] = useState(0)

  return (
    <div style={{ backgroundColor: theme.bgDark, minHeight: '100vh' }}>
      {currentScreen === 'menu' && <MenuScreen onStart={() => setCurrentScreen('game')} />}
      {currentScreen === 'game' && (
        <GameScreen
          onGameOver={(score) => {
            setFinalScore(score)
            setCurrentScreen('gameover')
          }}
        />
      )}
      {currentScreen === 'gameover' && (
        <GameOverScreen score={finalScore} onRestart={() => setCurrentScreen('menu')} />
      )}
    </div>
  )
}

export default App
