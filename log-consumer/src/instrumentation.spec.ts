const mockStart = jest.fn();
const mockShutdown = jest.fn();
const mockNodeSDK = jest.fn<Record<string, jest.Mock>, [Record<string, unknown>]>(() => ({ start: mockStart, shutdown: mockShutdown }));

jest.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: mockNodeSDK,
}));

jest.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: jest.fn(),
}));

jest.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: jest.fn(() => []),
}));

jest.mock('@opentelemetry/instrumentation-kafkajs', () => ({
  KafkaJsInstrumentation: jest.fn(),
}));

describe('instrumentation', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
  });

  it('should create NodeSDK on import', () => {
    require('./instrumentation');
    expect(mockNodeSDK).toHaveBeenCalledTimes(1);
  });

  it('should call sdk.start() on import', () => {
    require('./instrumentation');
    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('should pass resource, traceExporter and instrumentations to NodeSDK', () => {
    require('./instrumentation');
    const config = mockNodeSDK.mock.calls[0][0];
    expect(config).toMatchObject({
      resource: expect.any(Object),
      traceExporter: expect.any(Object),
      instrumentations: expect.any(Array),
    });
  });

  it('should call sdk.shutdown() on SIGTERM', () => {
    require('./instrumentation');
    process.emit('SIGTERM');
    expect(mockShutdown).toHaveBeenCalledTimes(1);
  });

  it('should call sdk.shutdown() on SIGINT', () => {
    require('./instrumentation');
    process.emit('SIGINT');
    expect(mockShutdown).toHaveBeenCalledTimes(1);
  });
});
