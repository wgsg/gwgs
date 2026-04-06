import { LOG_LEVELS, Logger } from './logger';

describe('Logger', () => {
  describe('instance methods', () => {
    //#region mocks
    const debugMock = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);
    const infoMock = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const warnMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const errorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const timeMock = vi
      .spyOn(console, 'time')
      .mockImplementation(() => undefined);
    const timeLogMock = vi
      .spyOn(console, 'timeLog')
      .mockImplementation(() => undefined);
    const timeEndMock = vi
      .spyOn(console, 'timeEnd')
      .mockImplementation(() => undefined);
    //#endregion

    afterEach(() => {
      debugMock.mockClear();
      infoMock.mockClear();
      warnMock.mockClear();
      errorMock.mockClear();
      timeMock.mockClear();
      timeLogMock.mockClear();
      timeEndMock.mockClear();
    });

    afterAll(() => {
      debugMock.mockReset();
      infoMock.mockReset();
      warnMock.mockReset();
      errorMock.mockReset();
      timeMock.mockReset();
      timeLogMock.mockReset();
      timeEndMock.mockReset();
    });

    it('should log verbose when enabled', () => {
      const logger = new Logger(LOG_LEVELS.verbose);
      logger.verbose('test');
      expect(debugMock).toHaveBeenCalledOnce();
      expect(debugMock).toHaveBeenLastCalledWith('test');
    });

    it('should not log verbose when disabled', () => {
      const logger = new Logger(~LOG_LEVELS.verbose);
      logger.verbose('test');
      expect(debugMock).not.toHaveBeenCalledOnce();
      expect(debugMock).not.toHaveBeenLastCalledWith('test');
    });

    it('should log debug when enabled', () => {
      const logger = new Logger(LOG_LEVELS.debug);
      logger.debug('test');
      expect(debugMock).toHaveBeenCalledOnce();
      expect(debugMock).toHaveBeenLastCalledWith('test');
    });

    it('should not log debug when disabled', () => {
      const logger = new Logger(~LOG_LEVELS.debug);
      logger.debug('test');
      expect(debugMock).not.toHaveBeenCalledOnce();
      expect(debugMock).not.toHaveBeenLastCalledWith('test');
    });

    it('should log info when enabled', () => {
      const logger = new Logger(LOG_LEVELS.info);
      logger.info('test');
      expect(infoMock).toHaveBeenCalledOnce();
      expect(infoMock).toHaveBeenLastCalledWith('test');
    });

    it('should not log info when disabled', () => {
      const logger = new Logger(~LOG_LEVELS.info);
      logger.info('test');
      expect(infoMock).not.toHaveBeenCalledOnce();
      expect(infoMock).not.toHaveBeenLastCalledWith('test');
    });

    it('should log warn when enabled', () => {
      const logger = new Logger(LOG_LEVELS.warn);
      logger.warn('test');
      expect(warnMock).toHaveBeenCalledOnce();
      expect(warnMock).toHaveBeenLastCalledWith('test');
    });

    it('should not log warn when disabled', () => {
      const logger = new Logger(~LOG_LEVELS.warn);
      logger.warn('test');
      expect(warnMock).not.toHaveBeenCalledOnce();
      expect(warnMock).not.toHaveBeenLastCalledWith('test');
    });

    it('should log error when enabled', () => {
      const logger = new Logger(LOG_LEVELS.error);
      logger.error('test');
      expect(errorMock).toHaveBeenCalledOnce();
      expect(errorMock).toHaveBeenLastCalledWith('test');
    });

    it('should not log error when disabled', () => {
      const logger = new Logger(~LOG_LEVELS.error);
      logger.error('test');
      expect(errorMock).not.toHaveBeenCalledOnce();
      expect(errorMock).not.toHaveBeenLastCalledWith('test');
    });

    it('should log timers when enabled', () => {
      const logger = new Logger(LOG_LEVELS.timer);
      logger.time('test time');
      logger.timeLog('test timeLog');
      logger.timeEnd('test timeEnd');
      expect(timeMock).toHaveBeenCalledOnce();
      expect(timeMock).toHaveBeenLastCalledWith('test time');
      expect(timeLogMock).toHaveBeenCalledOnce();
      expect(timeLogMock).toHaveBeenLastCalledWith('test timeLog');
      expect(timeEndMock).toHaveBeenCalledOnce();
      expect(timeEndMock).toHaveBeenLastCalledWith('test timeEnd');
    });

    it('should not log timers when disabled', () => {
      const logger = new Logger(~LOG_LEVELS.timer);
      logger.time('test time');
      logger.timeLog('test timeLog');
      logger.timeEnd('test timeEnd');
      expect(timeMock).not.toHaveBeenCalledOnce();
      expect(timeMock).not.toHaveBeenLastCalledWith('test time');
      expect(timeLogMock).not.toHaveBeenCalledOnce();
      expect(timeLogMock).not.toHaveBeenLastCalledWith('test timeLog');
      expect(timeEndMock).not.toHaveBeenCalledOnce();
      expect(timeEndMock).not.toHaveBeenLastCalledWith('test timeEnd');
    });
  });
});
