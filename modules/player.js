const Utils = require('./utils.js')

class Player {
  constructor(data) {
    this.id = data.id
    this.username = data.username
    this.colour = data.colour
    this.speed = { x: 0, y: 0 }
    this.pos = data.pos
    this.kills = data.kills || 0
    this.size = data.size || 30
    this.health = data.health || 100
  }
  shoot() {
    let mousePos = window.createVector(window.mouseX, window.mouseY)
    let heading = mousePos.sub(this.playerScreenPos()).heading()
    heading = window.p5.Vector.fromAngle(heading)
    return {
      pos: { x: this.pos.x, y: this.pos.y },
      heading: { x: heading.x, y: heading.y }
    }
  }
  display() {
    this.pos = window.createVector(this.pos.x, this.pos.y)
    let mainColor = window.color(this.colour.r, this.colour.g, this.colour.b)
    let mousePos = window.createVector(window.mouseX, window.mouseY)
    let heading = mousePos.sub(this.playerScreenPos()).heading()
    let scale = window.createVector(this.size / 100, this.size / 100)
    window.push()
    window.translate(this.pos.x, this.pos.y)
    window.rotate(heading, this.pos)
    window.scale(scale)
    window.image(window.bird, - window.bird.width / 2, - window.bird.height / 2, window.bird.width, window.bird.height)
    window.pop()
    window.push()
    window.textAlign(window.CENTER)
    window.fill(mainColor)
    window.stroke(0)
    window.strokeWeight(3)
    window.textStyle(window.BOLD)
    window.text(this.username + ' (' + this.health + ')', this.pos.x, this.pos.y - window.bird.height / 1.5)
    window.pop()
  }
  playerScreenPos() {
    let playerPos = window.createVector(this.pos.x, this.pos.y)
    if (this.pos.x - window.playArea.x[0] >= window.width / 2) {
      playerPos.x = this.pos.x - (Math.abs(window.playArea.x[0] - (this.pos.x - window.width / 2)))
    }
    if (window.playArea.x[1] - this.pos.x < window.width / 2) {
      playerPos.x = window.width - (window.playArea.x[1] - this.pos.x)
    }
    if (this.pos.y - window.playArea.y[0] >= window.height / 2) {
      playerPos.y = this.pos.y - (Math.abs(window.playArea.y[0] - (this.pos.y - window.height / 2)))
    }
    if (window.playArea.y[1] - this.pos.y < window.height / 2) {
      playerPos.y = window.height - (window.playArea.y[1] - this.pos.y)
    }
    return playerPos
  }
  move(dir) {
    let targetSpeed = { x: 0, y: 0 }
    let targetPos = { x: this.pos.x, y: this.pos.y }
    if (dir === 'up') {
      targetSpeed = { x: 0, y: -10 }
    }
    if (dir === 'down') {
      targetSpeed = { x: 0, y: 10 }
    }
    if (dir === 'left') {
      targetSpeed = { x: -10, y: 0 }
    }
    if (dir === 'right') {
      targetSpeed = { x: 10, y: 0 }
    }
    this.speed.x = Utils.lerp(this.speed.x, targetSpeed.x, .02)
    this.speed.y = Utils.lerp(this.speed.y, targetSpeed.y, .02)
    targetPos.x += this.speed.x
    targetPos.y += this.speed.y
    return targetPos
  }
}

module.exports = Player