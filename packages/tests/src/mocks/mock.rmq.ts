export const RmqServiceMock = {
  getOptions: jest.fn().mockReturnValue({}),
  ack: jest.fn(),
};

export const RmqPublisherMock = {
  publish: jest.fn(),
};

export const RmqContextMock = {
  getChannelRef: jest.fn().mockReturnValue({
    ack: jest.fn(),
    nack: jest.fn(),
  }),
  getMessage: jest.fn().mockReturnValue({}),
  getPattern: jest.fn(),
};

export const ClientProxyMock = {
  send: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnThis(),
  // pipe, subscribe 등을 위한 mock (RxJS)
  pipe: jest.fn().mockReturnThis(),
  subscribe: jest.fn(),
};
