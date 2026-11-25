import { Module } from '@nestjs/common';
import { GroupRankModule } from './group-rank.module';

@Module({ imports: [GroupRankModule] })
export class GroupRankStandaloneModule {}
