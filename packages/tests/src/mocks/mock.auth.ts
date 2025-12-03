export const JwtServiceMock = {
  sign: jest.fn(),
};

export const AuthServiceMock = {
  userLogin: jest.fn(),
  userRegister: jest.fn(),
};

export const BcryptMock = {
  hash: jest.fn(),
  compare: jest.fn(),
};

export const AuthRepositoryMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
  findByEmail: jest.fn(),
};
