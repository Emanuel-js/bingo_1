import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"

export const BingoCard = React.memo(({ numbers = [], drawnNumbers = [], cardIndex, winningPattern = [] }) => {
  return (
    <Card className="bg-gradient-to-br from-purple-700 to-indigo-900 border-2 border-yellow-500 shadow-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="text-center mb-2">
          <Badge variant="secondary" className="bg-yellow-500 text-black font-bold">
            Card {cardIndex + 1}
          </Badge>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {['B', 'I', 'N', 'G', 'O'].map((letter, index) => (
            <div key={letter} className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-red-600 text-white rounded-full border-2 border-yellow-500">
              {letter}
            </div>
          ))}
          {numbers && numbers.map((row, rowIndex) =>
            row.map((number, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full
                  ${number === 'FREE' ? 'bg-red-500 text-white' :
                    drawnNumbers.includes(number) ? 'bg-yellow-300 text-black' : 'bg-white text-black'}
                  border-2 border-black shadow
                  ${winningPattern.some(([r, c]) => r === rowIndex && c === colIndex) ? 'ring-4 ring-green-500' : ''}
                `}
                animate={drawnNumbers.includes(number) ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {number}
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
})