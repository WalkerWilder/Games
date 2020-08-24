class Game {
  start() {
    const configs = new Configs();
    
    configs.set('chunkSize', 1000);
    configs.set('hitpointsAngle', 18);
    configs.set('hitpointsDistance', 100);
    configs.set('physicsNChunks', 1);
    configs.set('RenderNChunks', 2);
    configs.set('drawHitPoints', false);
    this.configs = configs;
    
    const orchestrator = new Orchestrator(configs);
    this._orchestrator = orchestrator;
    this._orchestrator.start();
  }
}

game = new Game();
game.start()