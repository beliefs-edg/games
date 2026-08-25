const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio||1
const logicWidth = 360
const logicHeight = 420
const boardOffsetY = 60
canvas.width = logicWidth*dpr
canvas.height = logicHeight*dpr
canvas.style.width = logicWidth+"px"
canvas.style.height = logicHeight+"px"
ctx.scale(dpr,dpr)
const gridCount = 4
const cellGap = 10
const cellSize = (logicWidth - cellGap*(gridCount+1))/gridCount

let board = [
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0]
]

const colorMap = {
  0:"#cdc1b4",
  2:"#eee4da",
  4:"#ede0c8",
  8:"#f2b179",
  16:"#f59563",
  32:"#f67c5f",
  64:"#f65e3b",
  128:"#edcf72",
  256:"#edcc61",
  512:"#edc850",
  1024:"#edc53f",
  2048:"#edc22e"
}

let gameOver = false
let score = 0
let highScore = Number(localStorage.getItem("best2048")) || 0

const restartBtn = {
  x: 240,
  y:12,
  w:100,
  h:34
}

function spawnNew(){
  let empty = []
  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      if(board[r][c]===0) empty.push({r,c})
    }
  }
  if(empty.length===0) return
  let pos = empty[Math.floor(Math.random()*empty.length)]
  board[pos.r][pos.c] = Math.random()<0.9 ? 2 :4
}

function slideLeft(row){
  let arr = row.filter(v=>v!==0)
  for(let i=0;i<arr.length-1;i++){
    if(arr[i]===arr[i+1]){
      arr[i] *=2
      arr[i+1]=0
      score += arr[i]
    }
  }
  arr = arr.filter(v=>v!==0)
  while(arr.length<4) arr.push(0)
  return arr
}

function rotate(b){
  let res = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      res[c][3-r] = b[r][c]
    }
  }
  return res
}

function move(dir){
  if(gameOver) return;
  let tempBoard = JSON.parse(JSON.stringify(board));
  switch(dir){
    case "left":
      for(let i=0;i<4;i++) board[i] = slideLeft(board[i])
      break
    case "right":
      for(let i=0;i<4;i++){
        board[i] = slideLeft(board[i].reverse()).reverse()
      }
      break
    case "up":
      board = rotate(rotate(rotate(board)))
      for(let i=0;i<4;i++) board[i] = slideLeft(board[i])
      board = rotate(board)
      break
    case "down":
      board = rotate(board)
      for(let i=0;i<4;i++) board[i] = slideLeft(board[i])
      board = rotate(rotate(rotate(board)))
      break
  }
  const changed = JSON.stringify(tempBoard) !== JSON.stringify(board);
  if(!changed) return;

  spawnNew();
  if(score > highScore){
    highScore = score;
    localStorage.setItem("best2048", highScore);
  }
  checkGameOver();
}

function checkGameOver(){
  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      if(board[r][c]===0) return
    }
  }
  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      if(c+1<4&&board[r][c]===board[r][c+1]) return
      if(r+1<4&&board[r][c]===board[r+1][c]) return
    }
  }
  gameOver = true
}

function resetGame(){
  gameOver = false
  board = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
  score = 0
  spawnNew()
  spawnNew()
}

function render(){
  ctx.clearRect(0,0,logicWidth,logicHeight)
  ctx.fillStyle="#776e65"
  ctx.font="bold 18px Arial"
  ctx.textAlign="left"
  ctx.fillText(`分数：${score}`,12,26)
  ctx.fillText(`最高分：${highScore}`,12,48)

  ctx.fillStyle="#8f7a66"
  ctx.fillRect(restartBtn.x, restartBtn.y, restartBtn.w, restartBtn.h)
  ctx.fillStyle="#ffffff"
  ctx.font="bold 16px Arial"
  ctx.textAlign="center"
  ctx.fillText("重新开始", restartBtn.x + restartBtn.w/2, restartBtn.y + restartBtn.h*0.62)

  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      let val = board[r][c]
      let x = cellGap + c*(cellSize+cellGap)
      let y = boardOffsetY + cellGap + r*(cellSize+cellGap)
      ctx.fillStyle = colorMap[val]||"#3c3a32"
      ctx.fillRect(x,y,cellSize,cellSize)
      if(val!==0){
        ctx.fillStyle = val<=4 ? "#776e65":"#f9f6f2"
        let fontSize = cellSize*0.45
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(String(val), x+cellSize/2, y+cellSize/2)
      }
    }
  }

  if(gameOver){
    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(0,0,logicWidth,logicHeight)
    ctx.fillStyle="#fff"
    ctx.font="bold 32px Arial"
    ctx.textAlign="center"
    ctx.fillText("游戏结束", logicWidth/2, logicHeight/2-20)
    ctx.font="20px Arial"
    ctx.fillText("滑动或者按方向键重新开始", logicWidth/2, logicHeight/2+20)
  }
}

canvas.addEventListener("click", e=>{
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  if(mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w
    && my >= restartBtn.y && my <= restartBtn.y + restartBtn.h){
      resetGame()
  }
})

window.addEventListener("keydown",e=>{
  switch(e.key){
    case "ArrowLeft": move("left");break
    case "ArrowRight":move("right");break
    case "ArrowUp":   move("up");break
    case "ArrowDown": move("down");break
  }
})

let touchStartX=0,touchStartY=0
canvas.addEventListener("touchstart",e=>{
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
},{passive:true})

canvas.addEventListener("touchend",e=>{
  const rect = canvas.getBoundingClientRect()
  let endX = e.changedTouches[0].clientX
  let endY = e.changedTouches[0].clientY
  const mx = endX - rect.left
  const my = endY - rect.top

  if(mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w
    && my >= restartBtn.y && my <= restartBtn.y + restartBtn.h){
      resetGame()
      return
  }

  let dx = endX-touchStartX
  let dy = endY-touchStartY
  let absDx = Math.abs(dx)
  let absDy = Math.abs(dy)
  if(Math.max(absDx,absDy)<20) return

  if(absDx>absDy){
    move(dx>0?"right":"left")
  }else{
    move(dy>0?"down":"up")
  }
},{passive:true})

function loop(){
  render()
  requestAnimationFrame(loop)
}

resetGame()
loop()
