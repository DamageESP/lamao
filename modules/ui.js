class UI {
  static displayKillFeed() {
    if (!this.killFeed) return false
    let chatBox = {
      position: {
        x: window.width - 300,
        y: 100
      },
      width: 300,
      height: 100
    }
    window.push()
    window.translate(chatBox.position.x, chatBox.position.y)
    for (let i = this.killFeed.length - 1; i >= 0; i--) {
      if ((this.killFeed.length - i) * 15 <= chatBox.height) {
        window.textSize(16)
        window.strokeWeight(2)
        window.stroke(0)
        window.textStyle(window.BOLD)
        window.fill(this.killFeed[i].killer.colour.r, this.killFeed[i].killer.colour.g, this.killFeed[i].killer.colour.b)
        window.text(this.killFeed[i].killer.username, 15, - (this.killFeed.length - i) * 15, chatBox.width - 15, chatBox.height - 15)
        window.textStyle(window.NORMAL)
        window.fill(0)
        window.noStroke()
        window.text(' killed', 17 + window.textWidth(this.killFeed[i].killer.username), - (this.killFeed.length - i) * 15, chatBox.width - 15, chatBox.height - 15)
        window.fill(this.killFeed[i].killed.colour.r, this.killFeed[i].killed.colour.g, this.killFeed[i].killed.colour.b)
        window.stroke(0)
        window.textStyle(window.BOLD)
        window.text(this.killFeed[i].killed.username, 17 + window.textWidth(this.killFeed[i].killer.username + ' killed'), - (this.killFeed.length - i) * 15, chatBox.width - 15, chatBox.height - 15)
      }
    }
    window.pop()
  }
}

module.exports = UI