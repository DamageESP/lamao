const Game = require('./game.js')
const Bullet = require('./bullet.js')
const Player = require('./player.js')
const Utils = require('./utils.js')

const GameConsole = require('./console.js')
//const comms = require('./comms.js')

let bg, thisPlayer, myGame
let socket = window.io()

window.preload = () => {
  bg = window.loadImage('img/city.jpg')
  window.bird = window.loadImage('img/bird.png')
}

window.setup = () => {
  GameConsole.setup()
  window.createCanvas(window.windowWidth, window.windowHeight)
  if (!thisPlayer) {
    document.querySelector('#events').style.display = 'none'
    document.querySelector('#chat').style.display = 'none'
    document.querySelector('#login').style.display = 'block'
  }
}

window.draw = () => {
  window.background(bg)
  if (thisPlayer) {
    GameConsole.update(`
      Player pos: x-> ${Math.floor(thisPlayer.pos.x)}, y-> ${Math.floor(thisPlayer.pos.y)}
    `)
    //console.log("translating to x:"+x+", y:"+y)
    let cameraPos = Controls.cameraPos()
    window.translate(cameraPos.x, cameraPos.y)

    // players update
    for (let i = 0; i < myGame.players.length; i++) {
      myGame.players[i].display()
    }

    // bullets update
    for (let i = 0; i < myGame.bullets.length; i++) {
      if (myGame.bullets[i].out) {
        myGame.bullets.splice(i, 1)
      } else {
        myGame.bullets[i].display()
      }
    }

    // User movement (out of Controls because it took a second to respond)
    if (window.keyIsDown(window.UP_ARROW) || window.keyIsDown(87)) {
      socket.emit('move', 'up')
    }
    if (window.keyIsDown(window.DOWN_ARROW) || window.keyIsDown(83)) {
      socket.emit('move', 'down')
    }
    if (window.keyIsDown(window.LEFT_ARROW) || window.keyIsDown(65)) {
      socket.emit('move', 'left')
    }
    if (window.keyIsDown(window.RIGHT_ARROW) || window.keyIsDown(68)) {
      socket.emit('move', 'right')
    }
  }
}

window.windowResized = () => {
  window.resizeCanvas(window.windowWidth, window.windowHeight)
}

window.onload = () => {
  document.onkeydown = e => {
    Controls.keyDown(e.target, e.which)
  }
  document.onclick = e => {
    Controls.mouseClick(e)
  }
  window.addEventListener('contextmenu', e => {
    e.preventDefault()
  }, false)
}

class Controls {
  static keyDown(context, which) {
    switch(context.id) {
    case 'username': // Login as player
      if (which == 13) {
        let username = context.value
        if (username.length > 0) {
          socket.emit('add user', {
            username: username
          })
        }
      }
      break
    case 'send': // Send a message to chat
      if (which == 13) {
        let text = context.value
        socket.emit('say', text)
        context.value = ''
        context.blur()
      }
      break
    case 'playField':
      if (which == 99 || which == 67) GameConsole.toggle()
      if (which == 13) {
        document.querySelector('#send').focus()
      }
      break
    }
  }
  static mouseClick(event) {
    switch (event.target.id) {
    case 'defaultCanvas0':
      if (event.button == 0) {
        socket.emit('shot', thisPlayer.shoot())
      }
      break
    }
  }
  static cameraPos() {
    let x = 0
    let y = 0
    /*
    if (thisPlayer.pos.y - window.height / 2 > myGame.playArea.y[0] && thisPlayer.pos.y + window.height / 2 < myGame.playArea.y[1] && thisPlayer.pos.x - window.width / 2 > myGame.playArea.x[0] && thisPlayer.pos.x + window.width / 2 < myGame.playArea.x[1]) {
      x = - thisPlayer.pos.x + window.width / 2
      y = - thisPlayer.pos.y + window.height / 2
    }*/
    if (thisPlayer.pos.y - window.height / 2 > myGame.playArea.y[0]) {
      //console.log(1)
      y = - thisPlayer.pos.y + window.height / 2
    }
    if (thisPlayer.pos.x - window.width / 2 > myGame.playArea.x[0]) {
      //console.log(2)
      x = - thisPlayer.pos.x + window.width / 2
    }
    if (thisPlayer.pos.y + window.height / 2 >= myGame.playArea.y[1]) {
      //console.log(3)
      y = - myGame.playArea.y[1] + window.height
    }
    if (thisPlayer.pos.x + window.width / 2 >= myGame.playArea.x[1]) {
      //console.log(4)
      x = - myGame.playArea.x[1] + window.width
    }
    return { x, y }
  }
}

// SOCKET.IO

socket.on('game update', data => {
  let phase = 0
  let done = () => {
    myGame = new Game(data)
    window.playArea = myGame.playArea
    if (myGame.lookupId(socket.id)) {
      thisPlayer = myGame.lookupId(socket.id)
      document.querySelector('#events').style.display = 'block'
      document.querySelector('#chat').style.display = 'block'
      document.querySelector('#login').style.display = 'none'
    } else {
      thisPlayer = ''
      document.querySelector('#events').style.display = 'none'
      document.querySelector('#chat').style.display = 'none'
      document.querySelector('#login').style.display = 'block'
      document.querySelector('#username').focus()
    }
  }
  if (data.players.length > 0) {
    for(let i = 0; i < data.players.length; i++) {
      data.players[i] = new Player(data.players[i])
      if (i == data.players.length - 1) phase++
      if (phase == 2) done()
    }
  } else phase++

  if (phase == 2) done()
  
  if (data.bullets.length > 0) {
    for(let i = 0; i < data.bullets.length; i++) {
      data.bullets[i] = new Bullet(data.bullets[i])
      if (i == data.bullets.length - 1) phase++
      if (phase == 2) done()
    }
  } else phase++

  if (phase == 2) done()
})

socket.on('status message', msg => {
  let newEl = document.createElement('li')
  newEl.style.color = 'green'
  newEl.innerHTML = msg
  document.querySelector('#events').appendChild(newEl)
  Utils.add()
})

socket.on('user message', msg => {
  let newEl = document.createElement('li')
  newEl.style.color = 'green'
  newEl.innerHTML = msg
  document.querySelector('#events').appendChild(newEl)
  Utils.add()
})

socket.on('say', msg => {
  if (msg.data.charAt(0) == '/' && msg.user == thisPlayer.username) {
    //Controls.command(msg.data)
  } else {
    let newEl = document.createElement('li')
    newEl.style.color = 'black'
    newEl.innerHTML = '<strong style=\'color: ' + msg.colour + '\'>' + msg.user + '</strong>: ' + msg.data
    document.querySelector('#events').appendChild(newEl)
    Utils.add()
  }
})

socket.on('player update', player => {
  if (myGame.lookupId(player.id)) {
    let updateThis = myGame.lookupId(player.id)
    updateThis.pos = player.pos
  }
})

socket.on('bullet update', bullet => {
  //console.log('found bullet with id '+bullet.id+' to pos x:'+bullet.pos.x+', y:'+bullet.pos.y)
  if (myGame.lookupBullet(bullet.id)) {
    //console.log('found bullet with id '+bullet.id)
    let updateThis = myGame.lookupBullet(bullet.id)
    bullet.out || bullet.strength <= 0 ? updateThis.out = true : updateThis.pos = bullet.pos
  }
})

socket.on('add user', user => {
  console.log(myGame, user)
  let pushPlayer = new Player(user)
  myGame.players.push(pushPlayer)
  if (pushPlayer.id == socket.id) {
    thisPlayer = pushPlayer
    document.querySelector('#events').style.display = 'block'
    document.querySelector('#chat').style.display = 'block'
    document.querySelector('#login').style.display = 'none'
  }
})

socket.on('shot', bullet => {
  if (myGame.lookupId(bullet.userID)) {
    let pushBullet = new Bullet(bullet)
    myGame.bullets.push(pushBullet)
    //console.log('added bullet with id '+bullet.id+' and pos x:'+bullet.pos.x+', y:'+bullet.pos.y)
  } else {
    console.log('user not found when trying to shoot')
  }
})

socket.on('player killed', shooting => {
  let playerHit = myGame.lookupId(shooting.hit)
  let shooter = myGame.lookupId(shooting.shooter)
  if (playerHit) {
    console.log('player ' + playerHit.username + ' was killed by ' + shooter.username)
    let i = myGame.players.indexOf(playerHit)
    myGame.players.splice(i, 1)
    let bullet = myGame.lookupBullet(shooting.bullet)
    let j = myGame.bullets.indexOf(bullet)
    myGame.bullets.splice(j, 1)
    if (playerHit.id == socket.id) {
      document.body.innerHTML = 'u ded'
    }
  } else {
    console.log('player hit not found')
  }
})

socket.on('disconnected', id => {
  let deleteThis = myGame.lookupId(id)
  if (thisPlayer == deleteThis) {
    thisPlayer = ''
    document.querySelector('#events').style.display = 'none'
    document.querySelector('#chat').style.display = 'none'
    document.querySelector('#login').style.display = 'block'
  }
  let i = myGame.players.indexOf(deleteThis)
  myGame.players.splice(i, 1)
})