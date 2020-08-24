class Configs {
  constructor() {
    this.configs = {};
  }
  get( name ) {
    return this.configs[name];
  }

  set(name, value) {
    this.configs[name] = value;
  }
}