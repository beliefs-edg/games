const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio||1
const logicWidth = 720
const logicHeight = 900   //飞机游戏画布高度600
canvas.width = logicWidth*dpr
canvas.height = logicHeight*dpr
canvas.style.width = logicWidth+"px"
canvas.style.height = logicHeight+"px"
ctx.scale(dpr,dpr)

//我方飞机
const player = {
  x: logicWidth/2 - 20,
  y: logicHeight - 80,
  w:40,
  h:40,
  speed:6,
  life:3
}
//按键状态
const keys = {
  left:false,
  right:false,
  up:false,
  down:false,
  fire:false
}
let bullets = []   
let shootCooldown = 0//射击冷却
const shootInterval = 20
let enemies = []  
let explosions = []
let score = 0
let gameOver = false
let isGameStart = false


// 碰撞工具函数 AABB矩形碰撞
function isHit(a,b){
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y
}

function update(){
  if(!isGameStart || gameOver){
    return
  }



  //飞机移动 + 边界锁住
  if(keys.left && player.x>0) player.x -= player.speed
  if(keys.right && player.x+player.w < logicWidth) player.x += player.speed
  if(keys.up && player.y>0) player.y -= player.speed
  if(keys.down && player.y+player.h < logicHeight) player.y += player.speed

  //空格开火 + 冷却控制
  shootCooldown--;
  if(keys.fire && shootCooldown <= 0 && bullets.length <8){
    bullets.push({
      x: player.x + player.w/2 -3,
      y: player.y -12,
      w:6,
      h:14,
      speed:9
    })
    shootCooldown = shootInterval; //重置冷却帧数
  }


  //更新子弹
  for(let i=bullets.length-1;i>=0;i--){
    const b = bullets[i]
    b.y -= b.speed
    if(b.y + b.h < 0){
      bullets.splice(i,1)
    }
  }

  //随机生成敌机，难度随分数提升
  let baseSpawnRate = 0.012 + score * 0.00015   //生成概率变高
  let baseSpeed = 1.2 + score * 0.008         //基础速度提升

  if(baseSpawnRate > 0.04) baseSpawnRate = 0.04
  if(baseSpeed > 3) baseSpeed = 3

  if(Math.random() < baseSpawnRate){
    enemies.push({
      x: Math.random()*(logicWidth-36),
      y: -36,
      w:36,
      h:36,
      speed: baseSpeed + Math.random()*2.5
    })
  }

  for(let i=enemies.length-1;i>=0;i--){
    const e = enemies[i]
    e.y += e.speed
    if(e.y > logicHeight){
      enemies.splice(i,1)
    }
  }

  //子弹打中敌机
  for(let bi=bullets.length-1;bi>=0;bi--){
    const b = bullets[bi]
    for(let ei=enemies.length-1;ei>=0;ei--){
      const e = enemies[ei]
      if(isHit(b,e)){
      bullets.splice(bi,1)
      enemies.splice(ei,1)
      score +=5
      // 创建爆炸，4个小方块
      for(let i=0;i<4;i++){
        explosions.push({
          x: e.x + e.w/2,
          y: e.y + e.h/2,
          vx: (Math.random()-0.5)*6,
          vy: (Math.random()-0.5)*6,
          size:8,
          life:25  
        })
      }
      break
      }

    }
  }

  //敌机撞玩家

  for(let i = enemies.length - 1; i >= 0; i--){
    const e = enemies[i]
    if(isHit(player, e)){
      player.life--
      enemies.splice(i,1) //撞到就移除这架敌机，防止连续扣血
    }
  }
  //循环结束后再判断是否死亡
  if(player.life <= 0){
    gameOver = true
  }


  // 更新爆炸粒子
  for(let i = explosions.length-1; i >=0; i--){
    let exp = explosions[i]
    exp.x += exp.vx
    exp.y += exp.vy
    exp.life--
    exp.size *=0.92 //逐渐缩小
    if(exp.life <=0){
      explosions.splice(i,1)
    }
  }

}

function resetGame(){
  player.x = logicWidth/2 - 20
  player.y = logicHeight - 80
  score = 0
  player.life = 3
  gameOver = false
  isGameStart = false
  bullets = []
  enemies = []
  explosions = []
  shootCooldown = 0
  keys.left = false
  keys.right = false
  keys.up = false
  keys.down = false
  keys.fire = false
}


function render(){
  if(!isGameStart){
  ctx.fillStyle="#050518"
  ctx.fillRect(0,0,logicWidth,logicHeight)
  ctx.fillStyle="#ffffff"
  ctx.font="32px Arial"
  ctx.textAlign="center"
  ctx.fillText("点击屏幕开始游戏", logicWidth/2, logicHeight/2)
  return 
  }


  //清空，黑色夜空
  ctx.fillStyle="#050518"
  ctx.fillRect(0,0,logicWidth,logicHeight)
  //画我方飞机（三角形简易）
  ctx.fillStyle="#42a5f5"
  ctx.beginPath()
  ctx.moveTo(player.x+player.w/2, player.y)
  ctx.lineTo(player.x, player.y+player.h)
  ctx.lineTo(player.x+player.w, player.y+player.h)
  ctx.closePath()
  ctx.fill()
  //绘制子弹
  ctx.fillStyle="#ffea35"
  for(const b of bullets){
    ctx.fillRect(b.x,b.y,b.w,b.h)
  }
  //绘制敌机（红色三角）
  ctx.fillStyle="#ef5350"
  for(const e of enemies){
    ctx.beginPath()
    ctx.moveTo(e.x+e.w/2, e.y+e.h)
    ctx.lineTo(e.x, e.y)
    ctx.lineTo(e.x+e.w, e.y)
    ctx.closePath()
    ctx.fill()
  }
  //绘制爆炸粒子
  ctx.fillStyle="#ffaa22"
  for(let exp of explosions){
    ctx.fillRect(exp.x, exp.y, exp.size, exp.size)
  }

  //绘制分数
  ctx.fillStyle="#fff"
  ctx.font="18px Arial"
  ctx.textAlign="left"
  ctx.fillText(`分数：${score}`,8,24)
  ctx.fillStyle="#ff4466"
  let heartStr = ''
  for(let i=0;i<player.life;i++){
    heartStr += '❤️ '
  }
  ctx.fillText(heartStr, 8, 48)

  if(gameOver){
    ctx.fillStyle="rgba(0,0,0,0.65)"
    ctx.fillRect(0,0,logicWidth,logicHeight)
    ctx.fillStyle="#fff"
    ctx.font="bold 30px Arial"
    ctx.textAlign="center"
    ctx.fillText("游戏结束", logicWidth/2, logicHeight/2-20)
    ctx.font="18px Arial"
    ctx.fillText(`最终分数：${score}`, logicWidth/2, logicHeight/2+10)
    ctx.fillText("点击屏幕重新游戏", logicWidth/2, logicHeight/2+40)
  }
}

window.addEventListener('keydown',e=>{
  switch(e.key){
    case 'ArrowLeft': keys.left=true;break
    case 'ArrowRight':keys.right=true;break
    case 'ArrowUp':   keys.up=true;break
    case 'ArrowDown': keys.down=true;break
    case ' ':
      if(!isGameStart){
        isGameStart = true  //未开始，按空格启动游戏
      }else if(gameOver){
        resetGame()
      }else{
        keys.fire = true;
      }
    break
  }
})

window.addEventListener('keyup',e=>{
  switch(e.key){
    case 'ArrowLeft': keys.left=false;break
    case 'ArrowRight':keys.right=false;break
    case 'ArrowUp':   keys.up=false;break
    case 'ArrowDown': keys.down=false;break
    case ' ': keys.fire=false;break
  }
})

let touchId = null;
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  touchId = touch.identifier;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive:false })

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if(gameOver || !isGameStart) return;
  for(let t of e.touches){
    if(t.identifier === touchId){
      const rect = canvas.getBoundingClientRect();
      const tx = t.clientX - rect.left;
      const ty = t.clientY - rect.top;
      player.x = tx - player.w / 2;
      player.y = ty - player.h / 2;
      if(player.x < 0) player.x = 0;
      if(player.x + player.w > logicWidth) player.x = logicWidth - player.w;
      if(player.y < 0) player.y = 0;
      if(player.y + player.h > logicHeight) player.y = logicHeight - player.h;
      break;
    }
  }
}, { passive:false })


canvas.addEventListener('touchend',(e)=>{
  if(touchId === null) return;

  for(let t of e.changedTouches){
    if(t.identifier === touchId){
      const dx = Math.abs(t.clientX - touchStartX);
      const dy = Math.abs(t.clientY - touchStartY);
      if(Math.max(dx, dy) < 15){
        if(!isGameStart){
          isGameStart = true   // 未开始，轻点屏幕启动游戏
        }else if(gameOver) {
          resetGame();
        }else{
          if(bullets.length < 8){
            bullets.push({
              x: player.x + player.w/2 -3,
              y: player.y -12,
              w:6,
              h:14,
              speed:9
            })
          }
        }
      }

      touchId = null;
      break;
    }
  }
},{passive:true})


function loop(){
  update()
  render()
  requestAnimationFrame(loop)
}
loop()
