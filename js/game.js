const canvas = document.querySelector("canvas");
const imgGameBackground = new Image()
const score = document.getElementById("score");
const popSound = document.getElementById("popSound");
const shotSound = document.getElementById("shotSound")
const eatSound = document.getElementById("eatSound")
const menu = document.getElementById("menu");
const playBtn = document.getElementById("playBtn");
const ctx = canvas.getContext("2d");
const colors = ["red", "yellow", "#02F9FF", "#00FF02", "#FD00A7", "#FF6400"];
let game = false
let txtName = document.getElementById("name")
const rankDiv = document.getElementById("rank")
const rank = document.getElementById('rankingNames')

canvas.width = innerWidth + 1000;
canvas.height = innerHeight + 1300;
imgGameBackground.src = './img/gameBackground.jpg'

imgGameBackground.onload = function(){
  ctx.beginPath()
  ctx.drawImage(imgGameBackground, 0, 0, canvas.width, canvas.height);
  ctx.closePath()
}

// Server
//const socket = io()

class Player {
  constructor({x, y, id, radius, name, points}) {
    this.id = id;

    this.position = {
      x: x,
      y: y,
    };
    this.velocity = {
      x: 3,
      y: 3,
    };

    this.direction = {
      x: 0,
      y: 0,
    };

    this.radius = radius;
    this.points = points
    this.name = name
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.shadowColor = "black";
    // Define o desfoque da sombra (quanto maior, mais borrado)
    ctx.shadowBlur = 8;
    // Define o deslocamento horizontal da sombra
    ctx.shadowOffsetX = 0;
    // Define o deslocamento vertical da sombra
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  drawName(name, x, y){
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '14px arial'
    ctx.fillText(name, x, y)
  }

  move() {
    this.draw();

    // INTERPOLAÇÃO

    // A interpolação é basicamente um método para estimar valores intermediários entre dois pontos conhecidos.
    // Isso significa que vamos calcular a velocidade de forma que o personagem
    //se mova gradualmente em direção ao ponto de destino, em vez de mudar instantaneamente para a velocidade máxima.

    const easing = 0.009; // Controla o quão suave será o movimento

    let velX = mouse.x - this.position.x; // Diferença entre a posição de destino e a posição atual do player
    let velY = mouse.y - this.position.y;

    if (this.position.x < this.radius) {
      this.position.x = this.radius;
    } else if (this.position.x + this.radius > canvas.width) {
      this.position.x = canvas.width - this.radius;
    } else if (this.position.y < this.radius) {
      this.position.y = this.radius;
    } else if (this.position.y > canvas.height - this.radius) {
      this.position.y = canvas.height - this.radius;
    }

    this.position.x += velX * easing;
    this.position.y += velY * easing;

    let x = this.position.x
    let y = this.position.y

    //socket.emit('playerMovement', {x, y})

    // DIRECTIONS
    if (this.position.x < mouse.x) {
      this.direction.x = 1;
    } else if (this.position.x > mouse.x) {
      this.direction.x = -1;
    }

    if (this.position.y < mouse.y) {
      this.direction.y = 1;
    } else if (this.position.y > mouse.y) {
      this.direction.y = -1;
    }
  }
}

class Ball {
  constructor({x, y, color, id}) {
    this.position = {
      x: x,
      y: y,
    };
    this.radius = 5;
    this.id = id
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}`;
    ctx.shadowColor = `${this.color}`;
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.closePath();
  }
}

class Projectiles {
  constructor({ angle, position, id }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = 14;

    this.angle = angle;

    this.radius = 5;

    this.id = id
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }

  move() {
    this.draw();

    this.position.x += Math.cos(this.angle) * this.velocity;
    this.position.y += Math.sin(this.angle) * this.velocity;
  }
}

class Bot{
  constructor(position, velocity, radius, id, name, points){
    this.position = {
      x: position.x,
      y: position.y
    }
    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }
    this.radius = radius
    this.id = id
    this.points = points
    this.name = name
  }

  draw(){
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.closePath()
  }

  drawName(name, x, y){
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, y);
  }

  move(){
    this.draw()

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if(this.position.x - this.radius < 0 || this.position.x + this.radius > canvas.width){
      this.velocity.x *= -1
    }

    if(this.position.y - this.radius < 0 || this.position.y + this.radius > canvas.height){
      this.velocity.y *= -1
    }

    // this.velocity.x += randomNumber(0.2, -0.2)
    // this.velocity.y += randomNumber(0.2, -0.2)

  }
}

//const player = new Player();
let balls = [];
let AllProjectiles = [];
let mouse = { x: 0, y: 0 };

// Criando as bolinhas 
    
for (let i = 0; i < 200; i++) {

  let codes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  let id = ''

  for(let code = 0; code < codes.length; code++){
    id += codes[Math.floor(Math.random() * codes.length)]
  }
  

  balls.push(new Ball({
    x: Math.floor(Math.random() * (canvas.width - 15)) + 10,
    y: Math.floor(Math.random() * (canvas.height - 15)) + 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    id: id
  }));
}

let player

function createPlayer(nome){
  player = new Player({
    x: randomNumber(canvas.width, 0), y: randomNumber(canvas.height, 0), radius: 15, name: nome, points: 0
  })
}

function animate() {

  if(game){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath()
    ctx.drawImage(imgGameBackground, 0, 0, canvas.width, canvas.height);
    ctx.closePath()
  
    player.move()
    player.drawName(player.name, player.position.x, player.position.y - (player.radius + 10))
   

    // Interação do player com as bolinhas

    let playerXini = player.position.x - player.radius;
    let playerXfim = player.position.x + player.radius;
    let playerCenter = player.position.x;
    let playerYini = player.position.y - player.radius;
    let playerYfim = player.position.y + player.radius;
  
    balls.forEach((ball, i) => {
      ball.draw();
  
      if (
        ball.position.x > playerXini &&
        ball.position.x < playerXfim &&
        ball.position.y > playerYini &&
        ball.position.y < playerYfim
      ) {
        setTimeout(() => {
          // COLOCAMOS DENTRO DE UM SetTimeout para impedir o flash nas outras bolinhas
          balls.splice(i, 1);
          player.radius += 0.4;
          player.points = Math.floor((player.radius - 15) * 10)
          ranking()

          let radius = player.radius
          let points = player.points
  
          if (popSound.currentTime > 0) {
            // Permite que um som seja reproduzido mesmo que outro já esteja em execução
            popSound.currentTime = 0;
          }
  
          popSound.play();
          score.innerText = `Pontuação: ${player.points}`;
        }, 0);
        
        
        if (balls.length <= 100) {
          
          for (let newBall = 0; newBall < 100; newBall++) {

            let codes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            let id = ''

            for(let code = 0; code < codes.length; code++){
              id += codes[Math.floor(Math.random() * codes.length)]
            }
            

            balls.push(new Ball({
              x: Math.floor(Math.random() * (canvas.width - 15)) + 10,
              y: Math.floor(Math.random() * (canvas.height - 15)) + 10,
              color: colors[Math.floor(Math.random() * colors.length)],
              id: id
            }));
          }
        }
      }
    });
    
    
    moveScreen(player.position.x, player.position.y);

    projectiles.forEach((projectile, i) => {
      projectile.move();
  
      if (
        projectile.position.x < 0 ||
        projectile.position.x > canvas.width ||
        projectile.position.y < 0 ||
        projectile.position.y > canvas.height
      ) {
        
        projectiles.splice(i, 1);
      }

      bots.forEach((bot) => {
        let distanceX = projectile.position.x - bot.position.x
        let distanceY = projectile.position.y - bot.position.y
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

        if(distance < bot.radius && bot.radius > 15){
          bot.radius -= 0.5
          bot.points = Math.floor((bot.radius - 15) * 10)
          ranking()
          projectiles.splice(i, 1)
        }
      })
    });

    bots.forEach((bot) => {
      bot.move()
      bot.drawName(bot.name, bot.position.x, bot.position.y - (bot.radius+10))

      balls.forEach((ball, ballIndex) => {
        let distanceX = ball.position.x - bot.position.x
        let distanceY = ball.position.y - bot.position.y
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

        if(distance < bot.radius){
          // bot come a bolinha e aumenta de tamanho
          balls.splice(ballIndex, 1)
          bot.radius += ball.radius/8
          bot.points = Math.floor((bot.radius - 15) * 10)
          ranking()
        }
      })

      // Colisão dos bots com os players
        let distanceX = player.position.x - bot.position.x
        let distanceY = player.position.y - bot.position.y
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
        
        // Bot foge ou persegue o jogador
        if(distance < chaseDistance){
          let survivalDirection = chaseOrFlee(bot, player) 
          //console.log(survivalDirection)
          bot.velocity.x += survivalDirection.velX
          bot.velocity.y += survivalDirection.velY
        }

      // Bot come o jogador
      
      if(distance < player.radius && player.radius < bot.radius){
        // Reseta o player para uma posição aleatória do mapa
        bot.radius += player.radius/8
        bot.points = Math.floor((bot.radius - 15) * 10)
        player.position.x = randomNumber(canvas.width, 0)
        player.position.y = randomNumber(canvas.height, 0)
        player.radius = 15;
        player.points = Math.floor((player.radius - 15) * 10)
        score.innerText = `Pontuação: ${player.points}`;
        ranking()

        if(eatSound.currentTime > 0){
          eatSound.currentTime = 0
        }

        eatSound.play()
        player.move()
        ranking()
      }

      if(distance < player.radius && player.radius > bot.radius){
        // Reseta o bot
        player.radius += bot.radius/8;
        player.points = Math.floor((player.radius - 15) * 10)
        score.innerText = `Pontuação: ${player.points}`;
        bot.radius = 15
        bot.points = Math.floor((bot.radius - 15) * 10)
        bot.position.x = randomNumber(canvas.width, 0)
        bot.position.y = randomNumber(canvas.height, 0)
        ranking()

        if(eatSound.currentTime > 0){
          eatSound.currentTime = 0
        }

        eatSound.play()
      }
      

      //Bots perseguem ou fogem de outros bots
      // Perseguição ou fuga dos bots
      function chaseOrFlee(bot, anotherBot){
        let distanceX = bot.position.x - anotherBot.position.x
        let distanceY = bot.position.y - anotherBot.position.y
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

        if(distance == 0){
          return {velX: 0, velY: 0}
        }

        let factor = botSpeed/distance

        if(bot.radius > anotherBot.radius){
          return {velX: -distanceX * (factor+1), velY: -distanceY * (factor + 1)}
        }else{
          return {velX: distanceX * factor, velY: distanceY * factor}
        }
      }

      bots.forEach((anotherBot) => {
        let distanceX = bot.position.x - anotherBot.position.x
        let distanceY = bot.position.y - anotherBot.position.y
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

        // Bots comem uns aos outros
        if(bot.radius > anotherBot.radius && distance < bot.radius + anotherBot.radius){
          bot.radius += anotherBot.radius/8
          bot.points = Math.floor((bot.radius - 15) * 10)
          anotherBot.radius = 15
          anotherBot.points = Math.floor((anotherBot.radius - 15) * 10)
          anotherBot.position.x = randomNumber(canvas.width, 0)
          anotherBot.position.y = randomNumber(canvas.height, 0)
          ranking()
        }

        // Como a movimentação aleatória está somando novas valores, para impedir que a velocidade aumente
        // muito, limitados ela
        let speedLimit = Math.sqrt(bot.velocity.x * bot.velocity.x + bot.velocity.y * bot.velocity.y)
        if(speedLimit > 4 ){
            let factor = 4/speedLimit

            bot.velocity.x *= factor
            bot.velocity.y *= factor
        }

        // Movimentação aleatória
        bot.velocity.x += Math.random() * 0.6 - 0.3
        bot.velocity.y += Math.random() * 0.6 - 0.3

        // Perseguir ou fugir
        if(distance < chaseDistance){
          let survivalDirection = chaseOrFlee(bot, anotherBot) 
          //console.log(survivalDirection)
          bot.velocity.x += survivalDirection.velX
          bot.velocity.y += survivalDirection.velY

          // Colisões com a borda do mapa
          // Ajustando a colisão com a borda do mapa para ball
          if(bot.position.x - bot.radius < 0){
            bot.position.x = bot.radius
          }

          if(bot.position.x > canvas.width - bot.radius){
            bot.position.x = canvas.width - bot.radius
          }

          if(bot.position.y - bot.radius < 0){
            bot.position.y = bot.radius
          }

          if(bot.position.y > canvas.height - bot.radius){
            bot.position.y = canvas.height - bot.radius
          }

          // Ajustando a colisão com a borda do mapa para anotherBot

          if(anotherBot.position.x - anotherBot.radius < 0){
            anotherBot.position.x = 0
          }

          if(anotherBot.position.x > canvas.width - anotherBot.radius){
            anotherBot.position.x = canvas.width - anotherBot.radius
          }

          if(anotherBot.position.y - anotherBot.radius < 0){
            anotherBot.position.y = 0
          }

          if(anotherBot.position.y > canvas.height - anotherBot.radius){
            anotherBot.position.y = canvas.height - anotherBot.radius
          }

          let speedLimit = Math.sqrt(bot.velocity.x * bot.velocity.x + bot.velocity.y * bot.velocity.y)
          if(speedLimit > 4 ){
              let factor = 4/speedLimit

              bot.velocity.x *= factor
              bot.velocity.y *= factor
          }
        }
      })

    })
  
    requestAnimationFrame(animate);
  }

}

// Ajustando a camera
function moveScreen(x, y) {
  window.scrollTo(x - 780, y - 395);
}

document.addEventListener("mousemove", (e) => {
  let rectCanvas = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rectCanvas.left;
  mouse.y = e.clientY - rectCanvas.top;
});

let projectiles = []

document.addEventListener("keypress", (e) => {
  
  switch (e.key) {
    case " ":  // Dispara projétil
      let coorX = mouse.x - player.position.x;
      let coorY = mouse.y - player.position.y;
      let angle = Math.atan2(coorY, coorX); // Recebe o ângulo em radianos
      let posX = player.position.x + player.radius * Math.cos(angle);
      let posY = player.position.y + player.radius * Math.sin(angle);
      let codes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      let id = ''

      for(let code = 0; code < codes.length; code++){
        id += codes[Math.floor(Math.random() * codes.length)]
      }

      if(player.points > 20){
        projectiles.push(
          new Projectiles({ angle, position: { x: posX, y: posY }, id })
        );

        if(shotSound.currentTime > 0){
          shotSound.currentTime = 0
        }

        shotSound.play()
        player.radius -= 0.3;
        player.points = Math.floor((player.radius - 15) * 10)
        console.log(projectiles)

        score.innerText = `Pontuação: ${player.points}`;
        ranking()
      }
      break;
  }
});

playBtn.addEventListener("click", (e) =>{
  game = true
  let inputName = txtName.value

  if(inputName == ''){
    txtName.style.borderColor = '#ff7474'
    setTimeout(() => {
      txtName.style.borderColor = '#00000038'
    }, 3000)
    return
  }

  menu.style.display = "none"
  rankDiv.style.display = "block"
  
  createPlayer(inputName)
  ranking()
  animate();
})

// Sistema de ranking
function ranking(){
  // RANKING NÃO MUDA CASO O PLAYER NÃO GANHE PONTOS
  let ranking = []
  
  ranking.push({name: player.name, points: player.points})
  
  bots.forEach((bot) =>{
    ranking.push({name: bot.name, points: bot.points})
  })
  
  ranking = ranking.sort((a, b) => b.points - a.points)

  rank.innerHTML = ''

  ranking.forEach((ball) => {
    let item = document.createElement('li')
    item.innerText = `${ball.name}: ${ball.points}pts`
    rank.appendChild(item)
  })
}

function randomNumber(max, min){

  return Math.random() * (max - min) + min
}
//BOTS
let bots = []
let numBots = 14
let botSpeed = 8
let radiusRange = {min: 10, max: 30}
let chaseDistance = 280
let names = ['Via Láctea', 'Andrômeda ', 'Centauro ', 'Sombrero ', 'Girassol', 'Olho Negro', 'M33', 'M82', 'NGC 5128', 'M63', 'Sirius ', 'Polaris', 'Vega', 'Cygnus']

// Criando os bots 
for (let i = 0; i < numBots; i++) {

  let codes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  let id = ''

  for(let code = 0; code < codes.length; code++){
    id += codes[Math.floor(Math.random() * codes.length)]
  }
  
  let px = randomNumber(canvas.width, 0)
  let py = randomNumber(canvas.height, 0)
  let vx = randomNumber(2, -2)
  let vy = randomNumber(2, -2)

  bots.push(new Bot({x: px, y: py}, {x: vx, y: vy}, radius=15, id, names[i], points=0))
}