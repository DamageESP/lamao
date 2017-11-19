class Game {
  constructor(data){
    this.id = data.id
    this.players = data.players || []
    this.bullets = data.bullets || []
    this.playArea = data.playArea
    this.playerLimit = 64
  }
  lookup(username) {
    let lookup = {}
    for (let i = 0, len = this.players.length; i < len; i++) {
      lookup[this.players[i].username.toLowerCase()] = this.players[i]
    }
    if (lookup[username]) {
      return lookup[username]
    }
    else return false
  }
  lookupId(id) {
    let lookup = {}
    for (let i = 0, len = this.players.length; i < len; i++) {
      lookup[this.players[i].id] = this.players[i]
    }
    if (lookup[id]) {
      return lookup[id]
    }
    else return false
  }
}

module.exports = Game