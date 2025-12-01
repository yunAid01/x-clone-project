FROM node:22-alpine AS base

# ========================================
# Stage 1: Pruner - Turborepo로 필요한 파일만 추출
# ========================================
FROM base AS pruner

# pnpm 설치     
RUN apk add --no-cache libc6-compat
RUN npm install turbo --global
WORKDIR /app

# 전체 프로젝트 복사
COPY . .

# notification과 그 의존성만 추출 (pruned 폴더에 저장)
RUN turbo prune @repo/notification --docker

# ========================================
# Stage 2: Builder - 의존성 설치 및 빌드
# ========================================
FROM base AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# pruned된 lockfile과 package.json 복사
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# 의존성 설치 (production + dev dependencies)
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY --from=pruner /app/out/full/ .

# Prisma Client 생성
RUN pnpm --filter @repo/notification prisma:generate

# Turbo로 빌드 실행 (notification과 그 의존성 빌드)
RUN pnpm turbo run build --filter=@repo/notification

# ========================================
# Stage 3: Runner - 프로덕션 실행 환경
# ========================================
FROM base AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 프로덕션 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# package.json과 lockfile 복사
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
COPY --from=builder /app/pnpm-workspace.yaml .

# 빌드된 파일 복사
COPY --from=builder --chown=nestjs:nodejs /app/apps/notification/dist ./apps/notification/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/notification/package.json ./apps/notification/package.json

# workspace 의존성 복사 (common, validation 등)
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

# node_modules 복사 (프로덕션 의존성만)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/notification/node_modules ./apps/notification/node_modules

USER nestjs

EXPOSE 9000

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=9000

WORKDIR /app/apps/notification

CMD ["node", "dist/main.js"]
