const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')

const dpr = window.devicePixelRatio || 1
const logicW = 375
const logicH = 600
canvas.width = logicW * dpr
canvas.height = logicH * dpr
canvas.style.width = logicW + 'px'
canvas.style.height = logicH + 'px'
ctx.scale(dpr, dpr)

const grid = 20
let snake = [
  {x: 60, y:200},
  {x: 40, y:200},
  {x: 20, y:200}
]
let dirX = grid
let dirY = 0
let food
let gameOver = false
let score = 0
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0
let isStart = false
let deathDelay = 0
let activeBtn = null

const btnSize = 42
const baseX = logicW - 220
const baseY = logicH - 170
const buttons = {
  up:    { x:baseX+btnSize, y:baseY,        w:btnSize, h:btnSize, label:'↑' },
  down:  { x:baseX+btnSize, y:baseY+btnSize,w:btnSize, h:btnSize, label:'↓' },
  left:  { x:baseX,        y:baseY+btnSize,w:btnSize, h:btnSize, label:'←' },
  right: { x:baseX+btnSize*2,y:baseY+btnSize,w:btnSize,h:btnSize,label:'→'}
}
const restartBtn = {
  x: logicW/2 -60,
  y: logicH/2 + 40,
  w:120,
  h:45,
  label:"重新开始"
}

function pointInRect(px, py, rect){
  return px >= rect.x && px <= rect.x+rect.w && py >= rect.y && py <= rect.y+rect.h
}

function createFood(){
  let newFood
  while(true){
    const x = Math.floor(Math.random()*15)*grid
    const y = Math.floor(Math.random()*25)*grid
    newFood = {x,y}
    let isOnSnake = false
    for(let i=0;i<snake.length;i++){
      const seg = snake[i]
      if(seg.x === newFood.x && seg.y === newFood.y){
        isOnSnake = true
        break
      }
    }
    if(!isOnSnake) break
  }
  return newFood
}

function resetGame(){
  snake = [
    {x: 60, y:200},
    {x: 40, y:200},
    {x: 20, y:200}
  ]
  dirX = grid
  dirY = 0
  food = createFood()
  gameOver = false
  score = 0
  isStart = false
  deathDelay = 0
  activeBtn = null
}

canvas.addEventListener('touchstart', e=>{
  e.preventDefault()
  const t = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const logicX = (t.clientX - rect.left)/rect.width * logicW
  const logicY = (t.clientY - rect.top)/rect.height * logicH

  if(!isStart){
    isStart = true
    return
  }
  if(gameOver){
    if(deathDelay>0) return
    if(pointInRect(logicX,logicY,restartBtn)) resetGame()
    return
  }
  activeBtn = null
  if(pointInRect(logicX,logicY,buttons.up) && dirY !== grid){
    dirX=0; dirY=-grid; activeBtn="up"
  }else if(pointInRect(logicX,logicY,buttons.down) && dirY !== -grid){
    dirX=0; dirY=grid; activeBtn="down"
  }else if(pointInRect(logicX,logicY,buttons.left) && dirX !== grid){
    dirX=-grid; dirY=0; activeBtn="left"
  }else if(pointInRect(logicX,logicY,buttons.right) && dirX !== -grid){
    dirX=grid; dirY=0; activeBtn="right"
  }
}, { passive: false })

canvas.addEventListener('touchend',()=>{
  activeBtn = null
}, { passive: false })



let timer = 0
let speedInterval = 18
const minSpeed=8

function snakeMove(){
  if(gameOver) return
  const head = {x: snake[0].x + dirX, y: snake[0].y + dirY}
  if(head.x <0 || head.x >= logicW || head.y <0 || head.y >= logicH){
    gameOver=true
    deathDelay=45
    if(score>highScore){
      highScore=score
      localStorage.setItem("snakeHighScore",highScore)
    }
    return
  }
  for(let i=1;i<snake.length;i++){
    const body = snake[i]
    if(head.x===body.x && head.y===body.y){
      gameOver=true
      deathDelay=45
      if(score>highScore){
        highScore=score
        localStorage.setItem("snakeHighScore",highScore)
      }
      return
    }
  }
  snake.unshift(head)
  if(head.x===food.x && head.y===food.y){
    food=createFood()
    score++
    if(score%2===0){
      speedInterval -=2
      if(speedInterval<minSpeed) speedInterval=minSpeed
    }
  }else{
    snake.pop()
  }
}

function drawSnake(){
  for(let i=0;i<snake.length;i++){
    const seg = snake[i]
    ctx.fillStyle = i===0 ? "#00bb22":"#39cc58"
    ctx.fillRect(seg.x,seg.y,grid-1,grid-1)
  }
}
function drawFood(){
  ctx.fillStyle="#ff3333"
  ctx.fillRect(food.x, food.y, grid-1, grid-1)
}
function drawButtons(){
  ctx.textAlign="center"
  ctx.textBaseline="middle"
  ctx.font="22px sans-serif"
  const btnList = [
    {key:"up", data:buttons.up},
    {key:"down", data:buttons.down},
    {key:"left", data:buttons.left},
    {key:"right", data:buttons.right},
  ]
  for(let item of btnList){
    const b = item.data
    ctx.fillStyle = activeBtn===item.key ? "#2563b8":"#4488dd"
    ctx.fillRect(b.x,b.y,b.w,b.h)
    ctx.strokeStyle="#ffffff"
    ctx.lineWidth=2
    ctx.strokeRect(b.x,b.y,b.w,b.h)
    ctx.fillStyle="#ffffff"
    ctx.fillText(b.label,b.x+b.w/2,b.y+b.h/2)
  }
}
function drawScore(){
  ctx.fillStyle="#222222"
  ctx.font="24px sans-serif"
  ctx.textAlign="left"
  ctx.textBaseline="top"
  ctx.fillText(`分数：${score}`,15,15)
  ctx.textAlign="right"
  ctx.fillText(`最高分：${highScore}`, logicW-15,15)
}
function drawGameOver(){
  if(!gameOver) return
  ctx.fillStyle="#dd2222"
  ctx.font="32px sans-serif"
  ctx.textAlign="center"
  ctx.textBaseline="middle"
  ctx.fillText("游戏结束", logicW/2, logicH/2)
  if(deathDelay <=0){
    ctx.fillStyle="#4488dd"
    ctx.fillRect(restartBtn.x,restartBtn.y,restartBtn.w,restartBtn.h)
    ctx.fillStyle="#fff"
    ctx.font="20px sans-serif"
    ctx.fillText(restartBtn.label, restartBtn.x+restartBtn.w/2, restartBtn.y+restartBtn.h/2)
  }
}

function loop(){
  ctx.clearRect(0,0,logicW,logicH)
  ctx.fillStyle="#f7f7f7"
  ctx.fillRect(0,0,logicW,logicH)
  if(gameOver && deathDelay>0) deathDelay--
  if(isStart){
    timer++
    if(timer >= speedInterval){
      snakeMove()
      timer = 0
    }
  }
  drawScore()
  drawSnake()
  drawFood()
  drawButtons()
  drawGameOver()
  if(!isStart && !gameOver){
    ctx.fillStyle="#333333"
    ctx.font="28px sans-serif"
    ctx.textAlign="center"
    ctx.textBaseline="middle"
    ctx.fillText("点击屏幕开始游戏", logicW/2, logicH/2)
  }
  requestAnimationFrame(loop)
}

food = createFood()
loop()
