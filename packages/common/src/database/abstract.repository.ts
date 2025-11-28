import { Logger, NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<TDocument> {
  protected abstract readonly logger: Logger;

  abstract create(data: Omit<TDocument, 'id'>): Promise<TDocument>;

  abstract findOne(filterQuery: any): Promise<TDocument>;

  abstract findOneAndUpdate(
    filterQuery: any,
    update: Partial<TDocument>,
  ): Promise<TDocument>;

  abstract find(filterQuery: any): Promise<TDocument[]>;

  // 공통 에러 처리 로직
  protected ensureExists(document: TDocument | null, entityName: string): void {
    if (!document) {
      this.logger.warn(`${entityName} not found with query`);
      throw new NotFoundException(`${entityName} not found.`);
    }
  }
}
