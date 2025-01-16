import request from "supertest";
import { Express } from "express";
import { AppDataSource } from "../src/config/data-source";
import createApp from "../src/app";

const adminCred = {
  email: "admin-0@mail.com",
  password: "admin-0",
};

const userCred = {
  email: "user-0@mail.com",
  password: "user-0",
};

let userToken: string;
let adminToken: string;

describe("Auction routes", () => {
  let app: Express;

  beforeAll(async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      app = createApp();

      const adminLogin = await request(app)
        .post("/api/auth/login")
        .send(adminCred);
      const userLogin = await request(app)
        .post("/api/auth/login")
        .send(userCred);
      adminToken = adminLogin.body.accessToken;
      userToken = userLogin.body.accessToken;
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

  describe("/api/auction", () => {
    it("should return 200 and return auction data", async () => {
      const res = await request(app).get("/api/auctions").send();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it("should return 401 for invalid role with an error message", async () => {
      // Ensure the token exists

      const res = await request(app)
        .post("/api/auctions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Auction title",
          description: "Auction Description",
          item_id: "00099a71-fe7e-4192-8bc5-fe8ae6e600dd",
          start_datetime: "2024-12-12T12:00:00Z",
          end_datetime: "2024-01-01T12:00:00Z",
          reserve_price: "10000",
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Forbidden");
    });

    it("should return 400 and error message if one of the field is missing", async () => {
      const res = await request(app)
        .post("/api/auctions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });
});
