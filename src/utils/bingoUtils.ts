export const generateBingoCard = () => {
  const card = Array(5).fill(null).map(() => Array(5).fill(null))
  const usedNumbers = new Set()

  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) {
      if (col === 2 && row === 2) {
        card[row][col] = 'FREE'
        continue
      }

      let num
      do {
        num = Math.floor(Math.random() * 15) + 1 + col * 15
      } while (usedNumbers.has(num))

      usedNumbers.add(num)
      card[row][col] = num
    }
  }

  return card
}

export const calculateMultiplier = (count) => {
  return Math.max(1, Math.log2(count) + 1)
}