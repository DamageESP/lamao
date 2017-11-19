class Bullet {
  constructor(data) {
    this.userID = data.userID
    this.id = data.id
    this.pos = data.pos
    this.heading = { x: data.heading.x * (data.range || 16), y: data.heading.y * (data.range || 16) }
    this.decay = data.decay || 0
    this.strength = data.strength || 40
    this.out = data.out
  }
  fly() {
    this.strength > 0 ? this.strength -= .5 : this.strength = 0
    this.decay += .003
    this.heading.y += this.decay
    this.pos.x += this.heading.x
    this.pos.y += this.heading.y
  }
  display () {
    window.push()
    window.fill(255)
    window.strokeWeight(5)
    window.point(this.pos.x, this.pos.y)
    window.pop()
  }
}

module.exports = Bullet