const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')

canvas.width = 480
canvas.height = 640

const paddle = {
  x: 200,
  y: 600,
  w: 80,
  h: 12,
  color: "#69ca1e"
}

//小球数据
const ball = {
  r: 8,        // 半径
  x: 240,
  y: 500,
  dx: 1,       // x方向速度（正数向右，负数向左）
  dy: -1     // y方向速度（负数向上）
}

let bricks = []

let level = 1

const ballSpeed = 300 // 像素/秒

const levelConfig = [
  //第1关 三角阵型
  {
    brickColor:"#69ca1e",
    bricks: [
      {x:225,y:30,w:30,h:20},
      {x:195,y:55,w:30,h:20},{x:225,y:55,w:30,h:20},{x:255,y:55,w:30,h:20},
      {x:165,y:80,w:30,h:20},{x:195,y:80,w:30,h:20},{x:225,y:80,w:30,h:20},{x:255,y:80,w:30,h:20},{x:285,y:80,w:30,h:20},
      {x:75,y:105,w:30,h:20},{x:105,y:105,w:30,h:20},{x:135,y:105,w:30,h:20},{x:165,y:105,w:30,h:20},{x:195,y:105,w:30,h:20},{x:225,y:105,w:30,h:20},{x:255,y:105,w:30,h:20},{x:285,y:105,w:30,h:20},{x:315,y:105,w:30,h:20},{x:345,y:105,w:30,h:20}
    ]
  },
  //第2关 左右双塔
  {
    brickColor:"#44aaff",
    bricks: [
      {x:90,y:30,w:30,h:20},{x:120,y:30,w:30,h:20},
      {x:330,y:30,w:30,h:20},{x:360,y:30,w:30,h:20},

      {x:90,y:55,w:30,h:20},{x:120,y:55,w:30,h:20},
      {x:330,y:55,w:30,h:20},{x:360,y:55,w:30,h:20},

      {x:90,y:80,w:30,h:20},{x:120,y:80,w:30,h:20},
      {x:330,y:80,w:30,h:20},{x:360,y:80,w:30,h:20},

      {x:150,y:105,w:30,h:20},{x:180,y:105,w:30,h:20},
      {x:300,y:105,w:30,h:20},{x:330,y:105,w:30,h:20},

      {x:150,y:130,w:30,h:20},{x:180,y:130,w:30,h:20},
      {x:300,y:130,w:30,h:20},{x:330,y:130,w:30,h:20},

      {x:210,y:155,w:30,h:20},{x:240,y:155,w:30,h:20}
    ]
  },
  //第3关 回字围墙
  {
    brickColor:"#ff7744",
    bricks: [
      {x:30,y:30,w:30,h:20},{x:60,y:30,w:30,h:20},{x:90,y:30,w:30,h:20},{x:120,y:30,w:30,h:20},{x:150,y:30,w:30,h:20},{x:180,y:30,w:30,h:20},{x:210,y:30,w:30,h:20},{x:240,y:30,w:30,h:20},{x:270,y:30,w:30,h:20},{x:300,y:30,w:30,h:20},{x:330,y:30,w:30,h:20},{x:360,y:30,w:30,h:20},{x:390,y:30,w:30,h:20},

      {x:30,y:55,w:30,h:20},                                                                                                         {x:390,y:55,w:30,h:20},
      {x:30,y:80,w:30,h:20},                                                                                                         {x:390,y:80,w:30,h:20},

      {x:30,y:105,w:30,h:20},{x:60,y:105,w:30,h:20},{x:90,y:105,w:30,h:20},{x:120,y:105,w:30,h:20},{x:150,y:105,w:30,h:20},{x:180,y:105,w:30,h:20},{x:210,y:105,w:30,h:20},{x:240,y:105,w:30,h:20},{x:270,y:105,w:30,h:20},{x:300,y:105,w:30,h:20},{x:330,y:105,w:30,h:20},{x:360,y:105,w:30,h:20},{x:390,y:105,w:30,h:20}
    ]
  },
  //第4关 金字塔
  {
    brickColor:"#69ca1e",
    bricks: [
      {x:225,y:30,w:30,h:20},
      {x:195,y:55,w:30,h:20},{x:225,y:55,w:30,h:20},{x:255,y:55,w:30,h:20},
      {x:165,y:80,w:30,h:20},{x:195,y:80,w:30,h:20},{x:225,y:80,w:30,h:20},{x:255,y:80,w:30,h:20},{x:285,y:80,w:30,h:20},
      {x:135,y:105,w:30,h:20},{x:165,y:105,w:30,h:20},{x:195,y:105,w:30,h:20},{x:225,y:105,w:30,h:20},{x:255,y:105,w:30,h:20},{x:285,y:105,w:30,h:20},{x:315,y:105,w:30,h:20}
    ]
  },
  //第5关 空心十字
  {
    brickColor:"#44aaff",
    bricks: [
      {x:60,y:30,w:30,h:20},{x:90,y:30,w:30,h:20},{x:120,y:30,w:30,h:20},{x:330,y:30,w:30,h:20},{x:360,y:30,w:30,h:20},{x:390,y:30,w:30,h:20},
      {x:60,y:55,w:30,h:20},                                                                 {x:390,y:55,w:30,h:20},
      {x:60,y:80,w:30,h:20},{x:210,y:80,w:30,h:20},{x:240,y:80,w:30,h:20},{x:270,y:80,w:30,h:20},{x:390,y:80,w:30,h:20},
      {x:60,y:105,w:30,h:20},                                                                 {x:390,y:105,w:30,h:20},
      {x:60,y:130,w:30,h:20},{x:90,y:130,w:30,h:20},{x:120,y:130,w:30,h:20},{x:330,y:130,w:30,h:20},{x:360,y:130,w:30,h:20},{x:390,y:130,w:30,h:20}
    ]
  },
  //第6关 V字形斜阵
  {
    brickColor:"#ff7744",
    bricks: [
      {x:225,y:30,w:30,h:20},
      {x:195,y:55,w:30,h:20},{x:255,y:55,w:30,h:20},
      {x:165,y:80,w:30,h:20},{x:285,y:80,w:30,h:20},
      {x:135,y:105,w:30,h:20},{x:315,y:105,w:30,h:20},
      {x:105,y:130,w:30,h:20},{x:345,y:130,w:30,h:20}
    ]
  },
  //第7关 棋盘交错
  {
    brickColor:"#bb66dd",
    bricks: [
      {x:75,y:30,w:30,h:20},{x:135,y:30,w:30,h:20},{x:195,y:30,w:30,h:20},{x:255,y:30,w:30,h:20},{x:315,y:30,w:30,h:20},{x:375,y:30,w:30,h:20},
      {x:105,y:55,w:30,h:20},{x:165,y:55,w:30,h:20},{x:225,y:55,w:30,h:20},{x:285,y:55,w:30,h:20},{x:345,y:55,w:30,h:20},
      {x:75,y:80,w:30,h:20},{x:135,y:80,w:30,h:20},{x:195,y:80,w:30,h:20},{x:255,y:80,w:30,h:20},{x:315,y:80,w:30,h:20},{x:375,y:80,w:30,h:20},
      {x:105,y:105,w:30,h:20},{x:165,y:105,w:30,h:20},{x:225,y:105,w:30,h:20},{x:285,y:105,w:30,h:20},{x:345,y:105,w:30,h:20}
    ]
  },
  //第8关 外圈围墙，中间散落
  {
    brickColor:"#22bbbb",
    bricks: [
      {x:30,y:30,w:30,h:20},{x:60,y:30,w:30,h:20},{x:90,y:30,w:30,h:20},{x:120,y:30,w:30,h:20},{x:150,y:30,w:30,h:20},{x:180,y:30,w:30,h:20},{x:210,y:30,w:30,h:20},{x:240,y:30,w:30,h:20},{x:270,y:30,w:30,h:20},{x:300,y:30,w:30,h:20},{x:330,y:30,w:30,h:20},{x:360,y:30,w:30,h:20},{x:390,y:30,w:30,h:20},
      {x:30,y:55,w:30,h:20},                                                                                                         {x:390,y:55,w:30,h:20},
      {x:150,y:80,w:30,h:20},{x:210,y:80,w:30,h:20},{x:270,y:80,w:30,h:20},
      {x:30,y:105,w:30,h:20},                                                                                                         {x:390,y:105,w:30,h:20},
      {x:30,y:130,w:30,h:20},{x:60,y:130,w:30,h:20},{x:90,y:130,w:30,h:20},{x:120,y:130,w:30,h:20},{x:150,y:130,w:30,h:20},{x:180,y:130,w:30,h:20},{x:210,y:130,w:30,h:20},{x:240,y:130,w:30,h:20},{x:270,y:130,w:30,h:20},{x:300,y:130,w:30,h:20},{x:330,y:130,w:30,h:20},{x:360,y:130,w:30,h:20},{x:390,y:130,w:30,h:20}
    ]
  }



]


let currentBrickColor = "#69ca1e"
let gameStart = false
let gameOver = false
let levelPassed = false
let page = "menu" 





function moveBall(){
  if(!gameStart) return
  const now = performance.now()
  const dt = (now - prevMs) / 1000
  prevMs = now

  ball.x += ball.dx * ballSpeed * dt
  ball.y += ball.dy * ballSpeed * dt
}


function wallBounce(){
  // 左右墙壁
  if(ball.x - ball.r < 0){
    ball.dx = -ball.dx
  }
  if(ball.x + ball.r > canvas.width){
    ball.dx = -ball.dx
  }
  // 顶部墙壁
  if(ball.y - ball.r < 0){
    ball.dy = -ball.dy
  }
}

function paddleBounce(){
  //小球底部碰到挡板顶部
  if(ball.y + ball.r >= paddle.y){
    //水平重叠
    if(ball.x + ball.r > paddle.x && ball.x - ball.r < paddle.x + paddle.w){
      ball.dy = -Math.abs(ball.dy) //向上反弹
    }
  }
}

function drawPaddle(){
  ctx.fillStyle = paddle.color
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h)
}

function drawBall(){
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
  ctx.fillStyle = "#ff4444"
  ctx.fill()
}

function drawBricks(){
  for(let brick of bricks){
    if(brick.alive){
      ctx.fillStyle = currentBrickColor
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h)
    }
  }
}


function drawLevelPassUI(){
  ctx.fillStyle="#228822"
  ctx.font="28px Arial"
  ctx.textAlign="center"
  ctx.fillText("🎉恭喜过关", canvas.width/2, 120)

  ctx.font="22px Arial"
  ctx.fillStyle="#333"

  if(level < levelConfig.length){
    ctx.fillText("点击按钮继续下一关", canvas.width/2, 200)
  }else{
    ctx.fillText("全部关卡已通关！", canvas.width/2,200)
  }
ctx.fillText("点击按钮返回主菜单", canvas.width/2, 240)

  //继续下一关按钮
  if(level < levelConfig.length){
    ctx.fillStyle="#77cc77"
    ctx.fillRect(80,280,130,40)
    ctx.fillStyle="#000"
    ctx.fillText("继续下一关",145,306)
  }

  //返回主菜单按钮
  ctx.fillStyle="#8888cc"
  ctx.fillRect(270,280,130,40)
  ctx.fillStyle="#fff"
  ctx.fillText("主菜单",335,306)
}

function drawMainMenu(){
  ctx.fillStyle="#222"
  ctx.font="36px Arial"
  ctx.textAlign="center"
  ctx.fillText("打砖块游戏", canvas.width/2,140)

  //按钮：进入选关界面
  ctx.fillStyle="#44aa44"
  ctx.fillRect(120,220,240,50)
  ctx.fillStyle="#fff"
  ctx.font="24px Arial"
  ctx.fillText("选择关卡", canvas.width/2,252)

  //按钮：退出（这里回到主菜单，仅装饰）
  ctx.fillStyle="#bb4444"
  ctx.fillRect(120,300,240,50)
  ctx.fillStyle="#ffffff"
  ctx.fillText("游戏说明", canvas.width/2,332)
}

function drawLevelSelect(){
  ctx.fillStyle="#222"
  ctx.font="32px Arial"
  ctx.textAlign="center"
  ctx.fillText("选择关卡", canvas.width/2, 100)

  //生成关卡按钮，一行3个
  const total = levelConfig.length
  for(let i=0;i<total;i++){
    const col = i % 3
    const row = Math.floor(i / 3)
    const bx = 60 + col * 130
    const by = 160 + row * 90

    ctx.fillStyle="#4477bb"
    ctx.fillRect(bx, by,100,60)
    ctx.fillStyle="#fff"
    ctx.font="22px Arial"
    ctx.fillText(`第${i+1}关`, bx+50, by+38)
  }

  //返回主菜单按钮
  ctx.fillStyle="#777777"
  ctx.fillRect(140, 480,200,45)
  ctx.fillStyle="#ffffff"
  ctx.font="20px Arial"
  ctx.fillText("返回主菜单", canvas.width/2,510)
}

function drawGameOver(){
  ctx.fillStyle="#000"
  ctx.font="24px Arial"
  ctx.textAlign="center"
  ctx.fillText("游戏结束！点击重新开始", canvas.width/2, canvas.height/2)
}


function createBricks(){
  bricks = []
  const cfg = levelConfig[level - 1]
  for(let b of cfg.bricks){
    bricks.push({
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      alive: true
    })
  }
}



function checkGameOver(){
  if(ball.y + ball.r > canvas.height){
    ball.x = canvas.width / 2
    ball.y = 500
    ball.dx = 1
    ball.dy = -1
    prevMs = performance.now()
    gameOver = true
    gameStart = false
    page = "gameover" //切换游戏结束页
  }
}


function checkWin(){
  let allBroken = true
  for(let brick of bricks){
    if(brick.alive){
      allBroken = false
      break
    }
  }
  if(allBroken && !levelPassed){
    levelPassed = true
    gameStart = false
    page = "levelPass" //切到过关弹窗页面
  }
}



function checkBrickHit(){
  for(let brick of bricks){
    if(!brick.alive) continue

    const ballLeft = ball.x - ball.r
    const ballRight = ball.x + ball.r
    const ballTop = ball.y - ball.r
    const ballBottom = ball.y + ball.r

    if( ballRight > brick.x && ballLeft < brick.x + brick.w
        && ballBottom > brick.y && ballTop < brick.y + brick.h ){
      brick.alive = false
      const overlapLeft = ballRight - brick.x
      const overlapRight = (brick.x + brick.w) - ballLeft
      const overlapTop = ballBottom - brick.y
      const overlapBottom = (brick.y + brick.h) - ballTop

      const minX = Math.min(overlapLeft, overlapRight)
      const minY = Math.min(overlapTop, overlapBottom)

      if(minX < minY){
        // 左右侧面碰撞，反转x方向
        ball.dx = -ball.dx
      }else{
        // 上下碰撞，反转y方向
        ball.dy = -ball.dy
      }
    }
  }
}


// 抽离点击处理函数
function handleCanvasClick(e){
  const rect = canvas.getBoundingClientRect()
  // 真实画布尺寸 / css显示尺寸 = 缩放比例
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  let mx, my

  if(e.changedTouches){
    const t = e.changedTouches[0]
    mx = (t.clientX - rect.left) * scaleX
    my = (t.clientY - rect.top) * scaleY
  }else{
    mx = (e.clientX - rect.left) * scaleX
    my = (e.clientY - rect.top) * scaleY
  }


  //主菜单
  if(page === "menu"){
    //跳转到选关页
    if(mx>=120 && mx<=360 && my>=220 && my<=270){
      page = "select"
    }
    return
  }


  //选关页面
  if(page === "select"){
    const total = levelConfig.length
    for(let i=0;i<total;i++){
      const col = i % 3
      const row = Math.floor(i / 3)
      const bx = 60 + col * 130
      const by = 160 + row * 90
      if(mx >= bx && mx <= bx+100 && my >= by && my <= by+60){
        level = i + 1
        createBricks()
        currentBrickColor = levelConfig[level -1].brickColor
        ball.x = canvas.width/2
        ball.y = 500
        ball.dx = 1
        ball.dy = -1
        prevMs = performance.now()
        levelPassed = false
        gameOver = false
        gameStart = true
        page = "game" //进入游戏
        return
      }
    }
    //返回主菜单
    if(mx>=140 && mx<=340 && my>=480 && my<=525){
      page = "menu"
    }
    return
  }


  //过关弹窗页面
  if(page === "levelPass"){
    if(level < levelConfig.length){
      if(mx >=80 && mx <= 210 && my >=280 && my <=320){
        level++
        ball.x = canvas.width/2
        ball.y = 500
        ball.dx = 1
        ball.dy = -1
        prevMs = performance.now()
        createBricks()
        currentBrickColor = levelConfig[level -1].brickColor
        levelPassed = false
        gameStart = true
        page = "game"
        return
      }
    }
    //返回主菜单
    if(mx >=270 && mx <=400 && my >=280 && my <=320){
      levelPassed = false
      gameOver = false
      gameStart = false
      page = "menu"
      return
    }
    return
  }


  //游戏结束页面，点击重新开始，回到选关
  if(page === "gameover"){
    page = "select"
    return
  }
}

//电脑鼠标点击
canvas.addEventListener('click', handleCanvasClick)

//手机触摸点击（手指抬起）
canvas.addEventListener('touchend',function(e){
  e.preventDefault()
  handleCanvasClick(e)
},{passive:false})


canvas.addEventListener('mousemove', function(e){
  if(page !== "game") return //只有游戏界面才控制挡板

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const mouseX = (e.clientX - rect.left) * scaleX
  paddle.x = mouseX - paddle.w / 2


  if(paddle.x < 0){
    paddle.x = 0
  }
  if(paddle.x + paddle.w > canvas.width){
    paddle.x = canvas.width - paddle.w
  }
})

// 手机触摸控制
canvas.addEventListener('touchmove', function(e){
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const x = (touch.clientX - rect.left) * scaleX;
  paddle.x = x - paddle.w / 2;


  // 限制挡板不跑出屏幕左右
  if(paddle.x < 0) paddle.x = 0;
  if(paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
},{passive:false});


function loop(){
  ctx.fillStyle = '#e4d3d3'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if(page === "menu"){
    drawMainMenu()
  }else if(page === "select"){
    drawLevelSelect()
  }else if(page === "levelPass"){
    drawLevelPassUI()
  }else if(page === "gameover"){
    drawGameOver()
  }else if(page === "game"){
    //只有game页面才执行游戏逻辑
    drawPaddle()
    drawBall()
    drawBricks()
    moveBall()
    wallBounce()
    paddleBounce()
    checkBrickHit()
    checkWin()
    checkGameOver()
  }

  requestAnimationFrame(loop)
}



loop()
