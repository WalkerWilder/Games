class Control {
  constructor(configs, player, orchestrator) {
    this.configs = configs;
    this.player = player;
    this.orchestrator = orchestrator;
    this.keys = {
      38: 'up',
      87: 'up',
      40: 'down',
      83: 'down',
      37: 'left',
      65: 'left',
      39: 'right',
      68: 'right'
    };
    this.configs.set('keys', this.keys);

    document.body.addEventListener('keydown', (e) => this.keyDown(e));
    document.body.addEventListener('keyup', (e) => this.keyUp(e));
    document.body.addEventListener('mousemove', (e) => this.moveView(e));
  }

  keyDown(e) {
    const comm = e.which || e.keyCode;

    if (typeof this.keys[comm] !== 'undefined') {
      e.preventDefault();
      this.orchestrator.action('startAction', this.player, this.keys[comm]);
    }
  }
  keyUp(e) {
    const comm = e.which || e.keyCode;
    
    if (typeof this.keys[comm] !== 'undefined') {
      e.preventDefault();
      this.orchestrator.action('stopAction', this.player, this.keys[comm]);
    }
  }
  
  moveView(m) {
    let x = m.offsetX;
    let y = m.offsetY;
    this.orchestrator.action('lookAt', this.player, { x, y });
  }
}