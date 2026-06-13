import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/auth',
});

const prisma = new PrismaClient({ adapter });

async function verifyTables() {
  try {
    console.log('🔍 验证数据库表...\n');

    // 检查所有表
    const tables = [
      { name: 'user', model: prisma.user },
      { name: 'session', model: prisma.session },
      { name: 'account', model: prisma.account },
      { name: 'verification', model: prisma.verification },
      { name: 'project', model: prisma.project },
      { name: 'storyboard_version', model: prisma.storyboardVersion },
      { name: 'scene', model: prisma.scene },
      { name: 'asset', model: prisma.asset },
      { name: 'generation_job', model: prisma.generationJob },
      { name: 'render_job', model: prisma.renderJob },
      { name: 'job_event', model: prisma.jobEvent },
      { name: 'usage_record', model: prisma.usageRecord },
    ];

    for (const table of tables) {
      const count = await (table.model.count as () => Promise<number>)();
      console.log(`✓ ${table.name.padEnd(20)} - ${count} 条记录`);
    }

    console.log('\n✅ 所有 12 个表验证成功！');
    console.log('   - 4 个认证表 (user, session, account, verification)');
    console.log('   - 8 个业务表 (project, storyboard_version, scene, asset, generation_job, render_job, job_event, usage_record)');
  } catch (error) {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
