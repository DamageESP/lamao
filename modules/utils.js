class Utils {
  static random(min, max) { // Random number between two numbers
    return Math.floor(max - Math.random() * (max - min))
  }
  static guid() { // Generate random guid
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  }
  static add() {  // Scroll chat down
    let out = document.getElementById('events')
    // allow 1px inaccuracy by adding 1
    out.scrollTop = out.scrollHeight - 10
  }
  static lerp(value1, value2, amount) {
    amount = amount < 0 ? 0 : amount
    amount = amount > 1 ? 1 : amount
    return value1 + (value2 - value1) * amount
  }
}

module.exports = Utils