import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735194283837 implements MigrationInterface {
  name = "Migration1735194283837";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`transaction\` (\`transaction_id\` varchar(36) NOT NULL, \`wallet_id\` varchar(255) NOT NULL, \`admin_id\` varchar(255) NULL, \`amount\` decimal(12,2) NOT NULL, \`type\` enum ('deposit', 'withdrawal', 'transfer') NOT NULL, \`status\` enum ('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending', \`proof_of_payment\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`transaction_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wallet\` (\`wallet_id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`balance\` decimal(12,2) NOT NULL DEFAULT '0.00', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_72548a47ac4a996cd254b08252\` (\`user_id\`), PRIMARY KEY (\`wallet_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_08081d10759ec250c557cebd81a\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallet\`(\`wallet_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_9ebef6fe1344f83ea266c0914c1\` FOREIGN KEY (\`admin_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallet\` ADD CONSTRAINT \`FK_72548a47ac4a996cd254b082522\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`wallet\` DROP FOREIGN KEY \`FK_72548a47ac4a996cd254b082522\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_9ebef6fe1344f83ea266c0914c1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_08081d10759ec250c557cebd81a\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_72548a47ac4a996cd254b08252\` ON \`wallet\``,
    );
    await queryRunner.query(`DROP TABLE \`wallet\``);
    await queryRunner.query(`DROP TABLE \`transaction\``);
  }
}
