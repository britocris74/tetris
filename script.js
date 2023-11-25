const BLOCK_SIZE = 20
const BOARD_WIDTH  = 14
const BOARD_HEIGHT = 30
let TIME_AUTO_DOWN_SHAPE = 1000

const posibleShapes = [
  {
    color: '#7a5e0b',
    shape: [
      [1,1],
      [1,1]
    ],
  },
  {
    color: '#d77f37',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    color: '#00358d',
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  },
  {
    color: '#7d2166',
    shape: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
  },
  {
    color: '#d7364e',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    color: '#459b52',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    color: '#4e7e96',
    shape: [
      [1, 1, 1, 1],
    ],
  }
]

const scoreTag = document.getElementById('score')
let score = 0
const singleTag = document.getElementById('single')
let sinlge = 0
const doubleTag = document.getElementById('double')
let double = 0
const tripleTag = document.getElementById('triple')
let triple = 0
const tetrisTag = document.getElementById('tetris')
let tetris = 0
const totalLinesTag = document.getElementById('total_lines')
let totalLines = 0

const userLinesCleaned = [
  {
    id: 1,
    key: sinlge,
    tag: singleTag,
    word: 'Singles:'
  },
  {
    id: 2,
    key: double,
    tag: doubleTag,
    word: 'Doubles:'

  },
  {
    id: 3,
    key: triple,
    tag: tripleTag,
    word: 'Triples:'

  },
  {
    id: 4,
    key: tetris,
    tag: tetrisTag,
    word: 'Tetris:'

  },
]

let canvas = document.getElementById('canvas')
let context = canvas.getContext('2d')
canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

let shape = []
let nextShape = []

// 1. Crear tablero logico
function createDashBorad() {
  const newDashBoard = new Array(BOARD_HEIGHT).fill(0).map((col, i) => new Array(BOARD_WIDTH).fill(0))
  return newDashBoard
}
let dashBorad = createDashBorad()

// 2. Generar figura
function generateShape() {
  const randShape = Math.floor(Math.random() * posibleShapes.length)
  const shape = {
    position: { x: 6, y: 0 },
    shape: posibleShapes[randShape].shape,
    color: posibleShapes[randShape].color
  }
  return (shape)
}
shape = generateShape()
nextShape = getNextShape()

// 3. Game Loop
function update() {
  draw()
  window.requestAnimationFrame(update)
}

function draw() {
  context.fillStyle = '#000'
  context.fillRect(0, 0, BLOCK_SIZE * BOARD_WIDTH, BLOCK_SIZE * BOARD_HEIGHT)
  drawBlocksInDashboard()
  drawShapeInDashboard()
}

// 4. Dibujar Bloques en el tablero
function drawBlocksInDashboard() {
  dashBorad.forEach((row, x) => row.forEach((col, y) => {
    if (col) {
      context.fillStyle = "grey"
      context.fillRect(y * BLOCK_SIZE, x * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
    }
  }))
}

// 5. Dibujar figura en el tablero
function drawShapeInDashboard() {
  shape.shape.forEach((row, y) => row.forEach((col, x) => {
    if (col) {
      context.fillStyle = shape.color
      context.fillRect((x + shape.position.x) * BLOCK_SIZE, (y + shape.position.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
    }
  }))
}

// 6. Mover la figura en el tablero
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    shape.position.x--
    if (detectShapeCollision(shape)) {
      shape.position.x++
    }
  }
  if (event.key === "ArrowRight") {
    shape.position.x++
    if (detectShapeCollision(shape)) {
      shape.position.x--
    }
  }
  if (event.key === "ArrowDown") {
    arrowDown()
  }
  if (event.key === 'ArrowUp') {
    rotateShape()
  }
  if (event.key === ' ') {
    let stopArrowDown = false
    while (!stopArrowDown) {
      stopArrowDown = arrowDown()
    }
  }
})

// Function ArrowDown para reutilizar
function arrowDown() {
  shape.position.y++
  const collision = detectShapeCollision(shape)
  if (collision) {
    shape.position.y--
    solidifyShapeInDashboard()
    clearDashboardLines()
  }
  return collision
}

// 7. Detectar Colision
function detectShapeCollision(shape) {
  return shape.shape.find((row, y) => {
    return row.find((col, x) => {
      return (
        col !== 0 &&
        dashBorad[y + shape.position.y]?.[x + shape.position.x] !== 0
      )
    })
  })
}

// 7. Fijar figura en el tablero
function solidifyShapeInDashboard() {
  shape.shape.forEach((row, y) => {
    row.forEach((col, x) => {
      if (col) {
        dashBorad[y + shape.position.y][x + shape.position.x] = 1
      }
    })
  })

  shape = nextShape
  gameOver(shape)
  nextShape = getNextShape()
}

// 8. Eliminar lineas
function clearDashboardLines() {
  let linesCleared = 0
  dashBorad.forEach((row, y) => {
    let clearRow = row.find((col) => {
      return col == 0
    })
    if (clearRow == undefined) {
      linesCleared++
      const newDashboard = dashBorad.filter((dash, i) => i !== y)
      newDashboard.unshift(new Array(BOARD_WIDTH).fill(0))
      dashBorad = newDashboard
    }
  })
  addScoreAndStats(linesCleared)
}

// 9.Rotar Piezas
function rotateShape() {
  const filas = shape.shape.length;
  const columnas = shape.shape[0].length;

  let newShape = new Array(columnas).fill(0).map(() => new Array(filas).fill(0));

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      newShape[j][filas - 1 - i] = shape.shape[i][j];
    }
  }

  if (detectShapeCollision({ shape: newShape, position: { x: shape.position.x, y: shape.position.y }})) {
    newShape = shape.shape
  } else {
    shape.shape = newShape
  }

}

// 10. Bajar la pieza automaticamente
function autoDownShape() {
  arrowDown()
}
setInterval(autoDownShape, TIME_AUTO_DOWN_SHAPE)

// 11. Clear and start new Game
function clearNewGame() {
  dashBorad = createDashBorad()
  update()
  shape = generateShape()
  scoreTag.innerHTML = 'Score: 0'
  score = 0
  singleTag.innerHTML = 'Singles: 0'
  sinlge = 0
  doubleTag.innerHTML = 'Doubles: 0'
  double = 0
  tripleTag.innerHTML = 'Triples: 0'
  triple = 0
  tetrisTag.innerHTML = 'Tetris: 0'
  tetris = 0
  totalLinesTag.innerHTML = 'Total Lines: 0'
  totalLines = 0
}

// 11. Next Shape 
function getNextShape() {
  let canvas = document.getElementById('next-shape')
  let nextShapeContext = canvas.getContext('2d')
  canvas.width = BLOCK_SIZE * 4
  canvas.height = BLOCK_SIZE * 4
  nextShapeContext.fillStyle = '#000'
  nextShapeContext.fillRect(1, 1, canvas.width, canvas.height)
  const nextShape = generateShape()
  nextShape.shape.forEach((row, x) => row.forEach((colunm, y) => {
    if (colunm) {
      nextShapeContext.fillStyle = nextShape.color
      nextShapeContext.fillRect(y * BLOCK_SIZE, x * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
    }
  }))
  return nextShape
}

// 12. Detect Game Over
function gameOver() {
  const collision = detectShapeCollision(shape)
  if (collision) {
    alert("Game Over: :(")
    clearNewGame()
  }
}

// 13. Agregar Lineas y puntuación
function addScoreAndStats(linesCleared) {
  if (linesCleared) {
    scoreTag.innerHTML = `Score: ${score += linesCleared * 100}`
    userLinesCleaned.find(el => {
      if (el.id == linesCleared) {
        el.tag.innerHTML = `${el.word} ${el.key += 1}`
        totalLinesTag.innerHTML = `Total Lines: ${totalLines += linesCleared}`
      }
    })
  }
}

update()