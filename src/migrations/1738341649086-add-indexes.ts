// import { MigrationInterface, QueryRunner } from "typeorm";

// export class AddIndexes1738341649086 implements MigrationInterface {
//   name = "AddIndexes1738341649086";

//   public async up(queryRunner: QueryRunner): Promise<void> {
//     // Add indexes for Auction table
//     await queryRunner.query(
//       `CREATE INDEX idx_auction_status ON \`auction\` (\`status\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_auction_start_datetime ON \`auction\` (\`start_datetime\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_auction_end_datetime ON \`auction\` (\`end_datetime\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_auction_created_by ON \`auction\` (\`created_by_id\`)`,
//     );

//     // Add indexes for Bid table
//     await queryRunner.query(
//       `CREATE INDEX idx_bid_auction_id ON \`bid\` (\`auction_id\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_bid_user_id ON \`bid\` (\`user_id\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_bid_amount ON \`bid\` (\`bid_amount\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_bid_time ON \`bid\` (\`bid_time\`)`,
//     );

//     // Add indexes for AuctionParticipant table
//     await queryRunner.query(
//       `CREATE INDEX idx_participant_auction ON \`auction_participant\` (\`auction_id\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_participant_user ON \`auction_participant\` (\`user_id\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_participant_joined ON \`auction_participant\` (\`joined_at\`)`,
//     );

//     // Add indexes for Job table
//     await queryRunner.query(
//       `CREATE INDEX idx_job_status ON \`jobs\` (\`status\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_job_reference ON \`jobs\` (\`referenceId\`, \`entity\`)`,
//     );
//     await queryRunner.query(
//       `CREATE INDEX idx_job_run_at ON \`jobs\` (\`runAt\`)`,
//     );
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     // Remove Auction indexes
//     await queryRunner.query(`DROP INDEX idx_auction_status ON \`auction\``);
//     await queryRunner.query(
//       `DROP INDEX idx_auction_start_datetime ON \`auction\``,
//     );
//     await queryRunner.query(
//       `DROP INDEX idx_auction_end_datetime ON \`auction\``,
//     );
//     await queryRunner.query(`DROP INDEX idx_auction_created_by ON \`auction\``);

//     // Remove Bid indexes
//     await queryRunner.query(`DROP INDEX idx_bid_auction_id ON \`bid\``);
//     await queryRunner.query(`DROP INDEX idx_bid_user_id ON \`bid\``);
//     await queryRunner.query(`DROP INDEX idx_bid_amount ON \`bid\``);
//     await queryRunner.query(`DROP INDEX idx_bid_time ON \`bid\``);

//     // Remove AuctionParticipant indexes
//     await queryRunner.query(
//       `DROP INDEX idx_participant_auction ON \`auction_participant\``,
//     );
//     await queryRunner.query(
//       `DROP INDEX idx_participant_user ON \`auction_participant\``,
//     );
//     await queryRunner.query(
//       `DROP INDEX idx_participant_joined ON \`auction_participant\``,
//     );

//     // Remove Job indexes
//     await queryRunner.query(`DROP INDEX idx_job_status ON \`jobs\``);
//     await queryRunner.query(`DROP INDEX idx_job_reference ON \`jobs\``);
//     await queryRunner.query(`DROP INDEX idx_job_run_at ON \`jobs\``);
//   }
// }
