import request from "supertest";
import { Express } from "express";
import { AppDataSource } from "../src/config/data-source";
import createApp from "../src/app";

describe("Authentication routes", () => {
  let app: Express;

  beforeAll(async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      app = createApp();
    } catch (error) {
      console.error("Test setup failed:", error);
      throw error;
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe("/api/login", () => {
    it("should return 200 and user data with token", async () => {
      const res = await request(app).post("/api/login").send({
        email: "admin-0@mail.com",
        password: "admin-0",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toEqual({
        user_id: expect.any(String),
        name: "admin-0",
        email: "admin-0@mail.com",
        role: "admin",
      });
    });

    it("should return 401 for invalid credentials with a message", async () => {
      const res = await request(app).post("/api/login").send({
        email: "invalid@mail.com",
        password: "invalid",
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Invalid email or password");
    });
  });
});
