export const UserProfileRepositoryMock = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
};

export const UserFollowRepositoryMock = {
  isFollowing: jest.fn(),
  followUser: jest.fn(),
  getFollowers: jest.fn(),
  getFollowing: jest.fn(),
  unfollowUser: jest.fn(),
  getFollowerCount: jest.fn(),
  getFollowingCount: jest.fn(),
};
