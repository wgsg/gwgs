export enum LOG_LEVELS {
  none = 0,
  verbose = 1 << 0,
  debug = 1 << 1,
  info = 1 << 2,
  warn = 1 << 3,
  error = 1 << 4,
  timer = 1 << 5,
}

export class Logger {
  static defaultLogLevel: LOG_LEVELS =
    LOG_LEVELS.info | LOG_LEVELS.warn | LOG_LEVELS.error | LOG_LEVELS.timer;
  static #loggers: Map<string, Logger> = new Map();

  static getLogger(name: string): Logger {
    if (!this.#loggers.has(name)) this.#loggers.set(name, new Logger());
    return this.#loggers.get(name)!;
  }

  static deleteLogger(name: string): void {
    this.#loggers.delete(name);
  }

  #levels: LOG_LEVELS;

  constructor(levels?: LOG_LEVELS) {
    this.#levels = levels ?? Logger.defaultLogLevel;
  }

  verbose(...msg: unknown[]) {
    if (this.#levels & LOG_LEVELS.verbose) console.debug(...msg);
  }

  debug(...msg: unknown[]) {
    if (this.#levels & LOG_LEVELS.debug) console.debug(...msg);
  }

  info(...msg: unknown[]) {
    if (this.#levels & LOG_LEVELS.info) console.info(...msg);
  }

  warn(...msg: unknown[]) {
    if (this.#levels & LOG_LEVELS.warn) console.warn(...msg);
  }

  error(...msg: unknown[]) {
    if (this.#levels & LOG_LEVELS.error) console.error(...msg);
  }

  time(label: string) {
    if (this.#levels & LOG_LEVELS.timer) console.time(label);
  }

  timeLog(label: string) {
    if (this.#levels & LOG_LEVELS.timer) console.timeLog(label);
  }

  timeEnd(label: string) {
    if (this.#levels & LOG_LEVELS.timer) console.timeEnd(label);
  }
}
