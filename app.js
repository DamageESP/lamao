let express = require('express')
let app = express()
let http = require('http').Server(app)
let io = require('socket.io')(http)
let path = require('path')

const Bullet = require('./modules/bullet.js')
const Player = require('./modules/player.js')
const Utils = require('./modules/utils.js')
//let Utils = require('./utils.js')
const Game = require('./modules/game.js')

let myGame = new Game({
  playArea: {
    x: [0, 2000],
    y: [0, 2000]
  }, id: Utils.guid()
})

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})


http.listen(3000, function() {
  console.log('listening on *:3000')
})

function playGame() {
  if (myGame.bullets.length > 0) flyBullets()
  if (myGame.players.length > 0) {
    movePlayers()
    io.emit('game update', myGame)
  }
}

function movePlayers() {
  for (let i = myGame.players.length - 1; i >= 0; i--) {
    if (myGame.players[i].move().x >= myGame.playArea.x[0]
      && myGame.players[i].move().x <= myGame.playArea.x[1]
      && myGame.players[i].move().y >= myGame.playArea.y[0]
      && myGame.players[i].move().y <= myGame.playArea.y[1]) 
      myGame.players[i].pos = myGame.players[i].move()
  }
}

function flyBullets() {
  for (let i = myGame.bullets.length - 1; i >= 0; i--) {
    myGame.bullets[i].fly()
    checkBulletStatus(myGame.bullets[i])
  }
}

function checkBulletStatus(bullet) {
  if (bullet.pos.x > myGame.playArea.x[1] || bullet.pos.x < myGame.playArea.x[0] || bullet.pos.y < myGame.playArea.y[0] || bullet.pos.y > myGame.playArea.y[1]) {
    bullet.out = true
  } else if (bullet.strength <= 0) bullet.out = true
  else {
    for (let i = myGame.players.length - 1; i >= 0; i--) {
      if (Math.abs(myGame.players[i].pos.x - bullet.pos.x) < 20 && Math.abs(myGame.players[i].pos.y - bullet.pos.y) < 14 && myGame.players[i].id != bullet.userID) {
        myGame.players[i].health -= bullet.strength
        if (myGame.players[i].health <= 0) {
          let killer = myGame.lookupId(bullet.userID)
          killer.kills++
          console.log('player ' + myGame.lookupId(bullet.userID).username + ' hit AND KILLED player ' + myGame.players[i].username + ' (' + myGame.lookupId(bullet.userID).kills + ' kills) !')
          io.emit('player kill', { killer: { username: killer.username, colour: killer.colour }, killed: { username: myGame.players[i].username, colour: myGame.players[i].colour } }) // send killing info
          myGame.players.splice(i, 1)
          return true
        } else {
          console.log('player ' + myGame.lookupId(bullet.userID).username + ' hit player ' + myGame.players[i].username + ' and now has ' + myGame.players[i].health + ' health!')
        }
      }
    }
  }

  if (bullet.out) {
    let j = myGame.bullets.indexOf(bullet)
    //console.log('deleting bullet ' + bullet.id + ', position: x:' + bullet.pos.x + ' y: ' + bullet.pos.y)
    myGame.bullets.splice(j, 1)
  }
}

setInterval(() => {
  playGame()
}, 16)


// user connect

io.emit('server start')

io.on('connection', client => {

  io.to(client.id).emit('fetch players', myGame.players) //only for the requester
  console.log('anon_' + client.id + ' connected')

  // disconnect
  client.on('disconnect', () => {
    if (myGame.lookupId(client.id)) {
      let thisPlayer = myGame.lookupId(client.id)
      console.log(thisPlayer.username+' disconnected (id: '+client.id+')')
      let i = myGame.players.indexOf(thisPlayer)
      myGame.players.splice(i, 1)
      io.emit('disconnected', thisPlayer.id)
      io.emit('status message', thisPlayer.username+' disconnected')
    } else {
      console.log('anon_' + client.id + ' disconnected')
    }
    // io.emit('status message', 'user '+ user.username +' disconnected');
  })

  // fetch players

  client.on('fetch data', () => {
    console.log('sending game data: ' + JSON.stringify(myGame))
    io.to(client.id).emit('fetch data', myGame) //only for the requester
  })

  // add user
  client.on('add user', user => {
    if (user.username.length > 0) {
      if (myGame.lookupId(client.id)) {
        io.to(client.id).emit('user message', ' You are already playing as ' + myGame.lookupId(client.id).username)
        console.log(' ' + user.username + ' is already playing as ' + myGame.lookupId(client.id).username)
      } else if (myGame.lookup(user.username.toLowerCase())) {
        io.to(client.id).emit('user message', ' user '+ user.username +' already exists')
        console.log(' '+user.username+' already exists')
      } else {
        user.id = client.id
        user.pos = { x: Utils.random(myGame.playArea.x[0], myGame.playArea.x[1]), y: Utils.random(myGame.playArea.y[0], myGame.playArea.y[1]) }
        user.colour = { r: Utils.random(0, 255), g: Utils.random(0, 255), b: Utils.random(0, 255) }
        let newPlayer = new Player(user)
        myGame.players.push(newPlayer)
        console.log(user.username+' joined (id: '+client.id+')')
        client.broadcast.emit('status message', user.username +' has joined!') // announce user joining
        io.to(client.id).emit('status message', 'welcome, '+user.username+'!')
      }
    }

    //client.broadcast.emit('player move'); // message for all but sender
  })

  client.on('move', where => {
    let thisPlayer = myGame.lookupId(client.id)
    if (typeof thisPlayer.pos == 'undefined') return false
    let dirs = ['left', 'right', 'up', 'down']
    if (dirs.indexOf(where) > -1) {
      if (thisPlayer.move(where).x >= myGame.playArea.x[0]
        && thisPlayer.move(where).x <= myGame.playArea.x[1]
        && thisPlayer.move(where).y >= myGame.playArea.y[0]
        && thisPlayer.move(where).y <= myGame.playArea.y[1]) {
        thisPlayer.pos = thisPlayer.move(where)
        //console.log(myGame.playArea.x[0], thisPlayer.pos.x)
      }
    }
  })

  // add bullet

  client.on('shot', bullet => {
    bullet.userID = client.id
    bullet.id = Utils.guid()
    let newBullet = new Bullet(bullet)
    myGame.bullets.push(newBullet)
  })


  // say in chat
  client.on('say', function(data) {
    if (data.length > 0) {
      let thisPlayer = myGame.lookupId(client.id)
      if(thisPlayer) {
        console.log(thisPlayer.username+' says: '+data)
        io.emit('say', {
          user: thisPlayer.username,
          colour: thisPlayer.colour,
          data: data
        })
      } else {
        io.to(client.id).emit('disconnected', client.id)
      }
    }
  })

  // update players coordinates
  client.on('player update', function(data) {
    if (myGame.lookupId(data.id)) {
      let updateThis = myGame.lookupId(data.id)
      updateThis.pos = data.pos
      io.emit('player update', updateThis)
    }
  })

})


// ROUTING

app.use(express.static('public'))
app.use(express.static('dist'))

app.get('/', index)


function index(request, response) {
  response.sendFile(path.join(__dirname +'/index.html'))
}