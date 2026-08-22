const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')



const snakeHeadImg = new Image()
snakeHeadImg.src = "snake-head.jpg"
const gameOverImg = new Image()
gameOverImg.src = "gameover.jpg"
let gameOverImgReady = false
gameOverImg.onload = function () {
  gameOverImgReady = true
}



let imgReady = false
snakeHeadImg.onload = function(){
  imgReady = true
}



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
let gameOver = false
let score = 0
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0
let isStart = false
let deathDelay = 0
let activeBtn = null



//========新增 多种食物+昼夜模式========
const foodArr = [
  { emoji:'🍎', score:1 },
  { emoji:'🍌', score:2 },
  { emoji:'🍇', score:3 }
]
const propStar = { emoji:'⭐', type:'dayNight' }
let currentFood = null
let isDarkMode = false




const btnSize = 42
const baseX = logicW - 220
const baseY = logicH - 170
const buttons = {
  up:    { x:baseX+btnSize, y:baseY,         w:btnSize, h:btnSize, label:'↑' },
  down:  { x:baseX+btnSize, y:baseY+btnSize,w:btnSize, h:btnSize, label:'↓' },
  left:  { x:baseX,         y:baseY+btnSize,w:btnSize, h:btnSize, label:'←' },
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
  const maxCol = Math.floor(logicW / grid)
  const maxRow = Math.floor(logicH / grid)
  while(true){
    const x = Math.floor(Math.random()*maxCol)*grid
    const y = Math.floor(Math.random()*maxRow)*grid
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


  const rand = Math.random()
  if(rand < 0.1){
    currentFood = { ...newFood, ...propStar }
  }else{
    const foodItem = foodArr[ Math.floor(Math.random()*foodArr.length) ]
    currentFood = { ...newFood, ...foodItem }
  }
}




function resetGame(){
  snake = [
    {x: 60, y:200},
    {x: 40, y:200},
    {x: 20, y:200}
  ]
  dirX = grid
  dirY = 0
  createFood()
  isDarkMode = false
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
    if(head.x===currentFood.x && head.y===currentFood.y){
      if(currentFood.type === 'dayNight'){
        isDarkMode = !isDarkMode
      }else{
        score += currentFood.score
      }
      createFood()
      if(score%2===0){
        speedInterval -=1
        if(speedInterval<minSpeed) speedInterval=minSpeed
      }
      // 吃到东西：不pop，蛇保留长度
    }else{
      //没吃到，删掉尾巴
      snake.pop()
    }
}



function drawSnake(){
  ctx.imageSmoothingEnabled = false;


  for(let i=0;i<snake.length;i++){
    const seg = snake[i]
    if(i === 0){
      // ========== 蛇头：用图片 ==========
      if(imgReady){
        ctx.drawImage(snakeHeadImg, seg.x, seg.y, grid-1, grid-1)
      }else{
        // 图片加载失败兜底，还是画绿色方块
        ctx.fillStyle = "#00bb22"
        ctx.fillRect(seg.x,seg.y,grid-1,grid-1)
      }
    }else{
      // ========== 蛇身体：保留原来方块逻辑 ==========
      ctx.fillStyle = "#39cc58"
      ctx.fillRect(seg.x,seg.y,grid-1,grid-1)
    }
  }
}



function drawFood(){
  ctx.font = `${grid}px Arial`
  ctx.fillText(currentFood.emoji, currentFood.x, currentFood.y + grid * 0.85)
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
  if(isDarkMode){
    ctx.fillStyle="#ffffff"
  }else{
    ctx.fillStyle="#222222"
  }
  ctx.font="24px sans-serif"
  ctx.textAlign="left"
  ctx.textBaseline="top"
  ctx.fillText(`分数：${score}`,15,15)
  ctx.textAlign="right"
  ctx.fillText(`最高分：${highScore}`, logicW-15,15)
}



function drawGameOver(){
  if(!gameOver) return
  if(deathDelay > 0) return


  // 半透明遮罩
  ctx.fillStyle = "rgba(0,0,0,0.65)"
  ctx.fillRect(0,0,logicW,logicH)


  ctx.textAlign="center"
  ctx.textBaseline="middle"


  // 如果图片加载成功，绘制失败图片，否则回退文字
  if(gameOverImgReady){
    // 图片宽高，居中绘制
    const imgW = 260
    const imgH = 160
    const imgX = (logicW - imgW)/2
    const imgY = logicH/2 - 120
    ctx.drawImage(gameOverImg, imgX, imgY, imgW, imgH)
  }else{
    // 图片加载失败兜底文字
    ctx.fillStyle="#ff4444"
    ctx.font="36px sans-serif"
    ctx.fillText("游戏结束", logicW/2, logicH/2 - 60)
  }


  // 得分文字
  ctx.fillStyle="#ffffff"
  ctx.font="24px sans-serif"
  ctx.fillText(`本局得分：${score}`, logicW/2, logicH/2 -15)
  ctx.fillText(`历史最高：${highScore}`, logicW/2, logicH/2 +20)


  // 重新开始按钮
  ctx.fillStyle="#4488dd"
  ctx.fillRect(restartBtn.x,restartBtn.y,restartBtn.w,restartBtn.h)
  ctx.fillStyle="#ffffff"
  ctx.font="20px sans-serif"
  ctx.fillText(restartBtn.label, restartBtn.x+restartBtn.w/2, restartBtn.y+restartBtn.h/2)
}


function loop(){
  ctx.clearRect(0,0,logicW,logicH)
  if(isDarkMode){
    ctx.fillStyle="#1a1a1a"
  }else{
    ctx.fillStyle="#f7f7f7"
  }
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
    if(isDarkMode){
      ctx.fillStyle="#ffffff"
    }else{
      ctx.fillStyle="#333333"
    }
    ctx.font="28px sans-serif"
    ctx.textAlign="center"
    ctx.textBaseline="middle"
    ctx.fillText("点击屏幕开始游戏", logicW/2, logicH/2)
  }
  requestAnimationFrame(loop)
}



createFood()
loop()
