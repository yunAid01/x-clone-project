/**
 * 🐘 Prisma Error Codes
 * Prisma에서 발생하는 에러 코드를 상수로 관리합니다.
 * https://www.prisma.io/docs/reference/api-reference/error-reference
 */
export const PRISMA_ERRORS = {
  UNIQUE_CONSTRAINT_FAILED: 'P2002', // 유니크 제약 조건 위반 (중복 데이터)
  RECORD_NOT_FOUND: 'P2025', // 레코드를 찾을 수 없음 (업데이트/삭제 시)
  FOREIGN_KEY_CONSTRAINT_FAILED: 'P2003', // 외래 키 제약 조건 위반
};
