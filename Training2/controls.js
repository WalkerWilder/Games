class Control {
  constructor() {
    game.keys = {
      38: 'up',
      87: 'up',
      40: 'down',
      83: 'down',
      37: 'left',
      65: 'left',
      39: 'right',
      68: 'right'
    }
    document.body.addEventListener('keydown', this.keyDown);
    document.body.addEventListener('keyup', this.keyUp);
    document.body.addEventListener('mousemove', this.moveView);
  }

  keyDown(e) {
    const comm = e.which || e.keyCode;

    if (typeof game.keys[comm] !== 'undefined') {
      e.preventDefault();
      game._player.start(game.keys[comm]);
    }
  }
  keyUp(e) {
    const comm = e.which || e.keyCode;

    if (typeof game.keys[comm] !== 'undefined') {
      e.preventDefault();
      game._player.stop(game.keys[comm]);
    }
  }

  moveView(m) {
    let x = m.offsetX;
    let y = m.offsetY;
    game._player.lookAt({ x, y });
  }
}

const control = new Control()