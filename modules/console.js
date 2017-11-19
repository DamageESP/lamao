class myConsole {
  static setup () {
    var console = document.createElement('div')
    console.id = 'console'
    console.style.cssText = 'width: 500px; height: 100%; background: white; right: 0; top: 0; position: absolute; padding: 25px; display: none;'
    document.getElementsByTagName('body')[0].appendChild(console)
  }
  static update (newContent) {
    if (document.getElementById('console').style.display == 'block') document.getElementById('console').innerHTML = newContent
  }
  static toggle () {
    document.getElementById('console').style.display == 'none' ? document.getElementById('console').style.display = 'block' : document.getElementById('console').style.display = 'none'
  }
}

module.exports = myConsole