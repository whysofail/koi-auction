import { MoreThan } from "typeorm";
import { AppDataSource } from "../config/data-source";
import RefreshToken from "../entities/RefreshToken";

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken).extend(
  {
    async createToken(token: string, userId: string, expiresAt: Date) {
      const refreshToken = this.create({
        token,
        is_revoked: false,
        user: { user_id: userId },
        expires_at: expiresAt,
      });
      return this.save(refreshToken);
    },

    async findValidToken(token: string) {
      return this.findOne({
        where: {
          token,
          is_revoked: false,
          expires_at: MoreThan(new Date()),
        },
        relations: ["user"],
      });
    },

    async revokeToken(token: string) {
      return this.update({ token }, { is_revoked: true });
    },
  },
);

export default refreshTokenRepository;
