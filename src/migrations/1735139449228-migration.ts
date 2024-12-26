import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735139449228 implements MigrationInterface {
  name = "Migration1735139449228";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`auction_participant\` (\`auction_participant_id\` varchar(36) NOT NULL, \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`auction_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`auction_participant_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auction_participants\` (\`auction_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, INDEX \`IDX_c6497d5c49209a6b40c1d04312\` (\`auction_id\`), INDEX \`IDX_473f48a130e6485847bf0db99e\` (\`user_id\`), PRIMARY KEY (\`auction_id\`, \`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('deposit', 'withdrawal', 'transfer', 'participate') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` ADD CONSTRAINT \`FK_9d4335b4fc0e2e7867a4dc902e0\` FOREIGN KEY (\`auction_id\`) REFERENCES \`auction\`(\`auction_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` ADD CONSTRAINT \`FK_959b52f79270decf318a585147b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participants\` ADD CONSTRAINT \`FK_c6497d5c49209a6b40c1d04312b\` FOREIGN KEY (\`auction_id\`) REFERENCES \`auction\`(\`auction_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participants\` ADD CONSTRAINT \`FK_473f48a130e6485847bf0db99ea\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`auction_participants\` DROP FOREIGN KEY \`FK_473f48a130e6485847bf0db99ea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participants\` DROP FOREIGN KEY \`FK_c6497d5c49209a6b40c1d04312b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` DROP FOREIGN KEY \`FK_959b52f79270decf318a585147b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` DROP FOREIGN KEY \`FK_9d4335b4fc0e2e7867a4dc902e0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('deposit', 'withdrawal', 'transfer') NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_473f48a130e6485847bf0db99e\` ON \`auction_participants\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c6497d5c49209a6b40c1d04312\` ON \`auction_participants\``,
    );
    await queryRunner.query(`DROP TABLE \`auction_participants\``);
    await queryRunner.query(`DROP TABLE \`auction_participant\``);
  }
}
