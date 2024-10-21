import React, { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import { Howl } from 'howler'
import { Coins, Volume2, VolumeX, ChevronUp, ChevronDown, RefreshCw, DollarSign } from 'lucide-react'
import { Button } from "./components/ui/button"
import { Slider } from "./components/ui/slider"
import { Card, CardContent } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { BingoBallMachine } from './components/BingoBallMachine'
import { BingoCard } from './components/BingoCard'
import { generateBingoCard, calculateMultiplier } from './utils/bingoUtils'

const DeluxeCasinoBingo = () => {
  const [cardCount, setCardCount] = useState(1)
  const [cards, setCards] = useState([])
  const [drawnNumbers, setDrawnNumbers] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [multiplier, setMultiplier] = useState(1)
  const [currentBall, setCurrentBall] = useState(null)
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningCards, setWinningCards] = useState([])
  const [showAllCards, setShowAllCards] = useState(false)
  const [jackpot, setJackpot] = useState(10000)
  const [lastWinAmount, setLastWinAmount] = useState(0)
  const [floatingCoins, setFloatingCoins] = useState([])

  const soundsRef = useRef({
    ballDraw: new Howl({ src: ['/sounds/ball-draw.mp3'] }),
    win: new Howl({ src: ['/sounds/win.mp3'] }),
    gameStart: new Howl({ src: ['/sounds/game-start.mp3'] }),
    jackpot: new Howl({ src: ['/sounds/jackpot.mp3'] }),
    ambient: new Howl({ src: ['/sounds/casino-ambient.mp3'], loop: true, volume: 0.3 }),
  })

  useEffect(() => {
    setCards(Array(cardCount).fill(null).map(generateBingoCard))
    setMultiplier(calculateMultiplier(cardCount))
  }, [cardCount])

  useEffect(() => {
    if (!isMuted) {
      soundsRef.current.ambient.play()
    } else {
      soundsRef.current.ambient.pause()
    }
    return () => soundsRef.current.ambient.stop()
  }, [isMuted])

  const playSound = (soundName) => {
    if (!isMuted && soundsRef.current[soundName]) {
      soundsRef.current[soundName].play()
    }
  }

  const drawNumber = () => {
    if (isPlaying && drawnNumbers.length < 75 && !isSpinning) {
      setIsSpinning(true)

      gsap.to({}, {
        duration: 2,
        onComplete: () => {
          let newNumber
          do {
            newNumber = Math.floor(Math.random() * 75) + 1
          } while (drawnNumbers.includes(newNumber))

          setCurrentBall(newNumber)
          playSound('ballDraw')

          setDrawnNumbers((prevNumbers) => [...prevNumbers, newNumber])

          gsap.to({}, {
            duration: 1,
            onComplete: () => {
              setCurrentBall(null)
              checkWin()
              setIsSpinning(false)
            }
          })
        }
      })
    }
  }

  const startGame = () => {
    if (balance >= betAmount * cardCount) {
      setIsPlaying(true)
      setDrawnNumbers([])
      setBalance(prevBalance => prevBalance - betAmount * cardCount)
      setWinningCards([])
      playSound('gameStart')
      setJackpot(prevJackpot => prevJackpot + betAmount * cardCount * 0.1)

      // Create floating coins animation
      const newCoins = Array(5).fill(0).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50,
      }))
      setFloatingCoins(newCoins)

      const drawInterval = setInterval(() => {
        if (!isPlaying || winningCards.length > 0 || drawnNumbers.length >= 75) {
          clearInterval(drawInterval)
          return
        }
        drawNumber()
      }, 4000)

      return () => clearInterval(drawInterval)
    } else {
      alert("Insufficient balance!")
    }
  }

  const checkWin = () => {
    const newWinningCards = []
    cards.forEach((card, cardIndex) => {
      const winningPatterns = [
        // Rows
        [[0,0],[0,1],[0,2],[0,3],[0,4]],
        [[1,0],[1,1],[1,2],[1,3],[1,4]],
        [[2,0],[2,1],[2,2],[2,3],[2,4]],
        [[3,0],[3,1],[3,2],[3,3],[3,4]],
        [[4,0],[4,1],[4,2],[4,3],[4,4]],
        // Columns
        [[0,0],[1,0],[2,0],[3,0],[4,0]],
        [[0,1],[1,1],[2,1],[3,1],[4,1]],
        [[0,2],[1,2],[2,2],[3,2],[4,2]],
        [[0,3],[1,3],[2,3],[3,3],[4,3]],
        [[0,4],[1,4],[2,4],[3,4],[4,4]],
        // Diagonals
        [[0,0],[1,1],[2,2],[3,3],[4,4]],
        [[0,4],[1,3],[2,2],[3,1],[4,0]]
      ]

      for (const pattern of winningPatterns) {
        if (pattern.every(([row, col]) => drawnNumbers.includes(card[row][col]) || card[row][col] === 'FREE')) {
          newWinningCards.push({ cardIndex, pattern })
          break
        }
      }
    })

    if (newWinningCards.length > 0) {
      setWinningCards(newWinningCards)
      let winAmount = betAmount * multiplier * 10 * newWinningCards.length

      // Jackpot logic
      if (drawnNumbers.length <= 30) {
        winAmount += jackpot
        setJackpot(10000)
        playSound('jackpot')
      } else {
        playSound('win')
      }

      setBalance(prevBalance => prevBalance + winAmount)
      setLastWinAmount(winAmount)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Create more floating coins for big wins
      const newCoins = Array(20).fill(0).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50,
      }))
      setFloatingCoins(newCoins)

      setTimeout(() => {
        alert(`Bingo! You won $${winAmount}!`)
        setIsPlaying(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 animate-pulse">Deluxe Casino Bingo</h1>
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <Coins className="text-yellow-400 mr-2" />
              <span className="text-xl font-bold">${balance}</span>
            </motion.div>
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="icon"
              className="bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors duration-300"
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card className="bg-indigo-800 border-2 border-yellow-500 shadow-lg">
              <CardContent className="p-4">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">Game Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Number of Cards: {cardCount}</label>
                    <Slider
                      value={[cardCount]}
                      onValueChange={(value) => setCardCount(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Bet Amount: ${betAmount}</label>
                    <Slider
                      value={[betAmount]}
                      onValueChange={(value) => setBetAmount(value[0])}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Multiplier: x{multiplier.toFixed(2)}</label>
                    <div className="w-full h-4 bg-indigo-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-yellow-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(multiplier / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={isPlaying ? drawNumber : startGame}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                    disabled={isPlaying && (currentBall !== null || isSpinning)}
                  >
                    {isPlaying ? (isSpinning ? "Spinning..." : currentBall !== null ? "Drawing..." : "Draw Ball") : "Start Game"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-indigo-800 border-2 border-yellow-500 shadow-lg">
                <CardContent className="p-4">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-400">Jackpot</h2>
                  <motion.div
                    className="text-3xl font-bold text-green-400"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ${jackpot}
                  </motion.div>
                  <p className="text-sm mt-2">Win the jackpot by getting Bingo in 30 balls or less!</p>
                </CardContent>
              </Card>
            </motion.div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Drawn Numbers</h2>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {drawnNumbers.map((num) => (
                    <motion.div
                      key={num}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <Badge variant="secondary" className="bg-yellow-500 text-black font-bold text-lg px-3 py-1">
                        {num}
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Your Bingo Cards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {cards.slice(0, showAllCards ? cards.length : 4).map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <BingoCard
                    numbers={card}
                    drawnNumbers={drawnNumbers}
                    cardIndex={index}
                    winningPattern={winningCards.find(wc => wc.cardIndex === index)?.pattern || []}
                  />
                </motion.div>
              ))}
            </div>
            {cards.length > 4 && (
              <Button
                onClick={() => setShowAllCards(!showAllCards)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
              >
                {showAllCards ? <><ChevronUp className="mr-2" /> Show Less</> : <><ChevronDown className="mr-2" /> Show All Cards</>}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Bingo Ball Machine</h2>
          <div className="h-[400px] bg-black rounded-lg overflow-hidden shadow-2xl">
            <Canvas camera={{ position: [0, 0, 10] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls enableZoom={false} enablePan={false} />
              <Stars />
              <BingoBallMachine onDrawBall={drawNumber} isSpinning={isSpinning} currentBall={currentBall} />
            </Canvas>
          </div>
        </div>

        <AnimatePresence>
          {lastWinAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-bold">Last Win</h3>
              <p className="text-2xl font-bold">${lastWinAmount}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating coins animation */}
        <div className="fixed inset-0 pointer-events-none">
          <AnimatePresence>
            {floatingCoins.map((coin) => (
              <motion.div
                key={coin.id}
                className="absolute text-yellow-400"
                initial={{ x: coin.x, y: coin.y }}
                animate={{
                  y: -50,
                  opacity: [1, 0],
                  rotate: [0, 360],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                <DollarSign size={24} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default DeluxeCasinoBingo