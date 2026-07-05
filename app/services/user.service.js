const { ObjectId } = require("mongodb");
const crypto = require("crypto");

class UserService {
  constructor(client) {
    this.User = client.db().collection("users");
  }

  // Băm mật khẩu sử dụng thư viện crypto có sẵn của Node.js
  hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  async findByUsername(username) {
    return await this.User.findOne({ username });
  }

  async create(payload) {
    const user = {
      username: payload.username,
      email: payload.email,
      password: this.hashPassword(payload.password),
      role: payload.role || "user", // Mặc định vai trò là user
    };
    const result = await this.User.insertOne(user);
    return result;
  }

  async verifyPassword(user, password) {
    return user.password === this.hashPassword(password);
  }

  async seedDefaultUser() {
    try {
      // Tạo tài khoản admin
      const adminUser = await this.findByUsername("admin");
      if (!adminUser) {
        await this.create({
          username: "admin",
          password: "123",
          email: "admin@example.com",
          role: "admin",
        });
      } else if (adminUser.role !== "admin") {
        // Đảm bảo tài khoản admin cũ được cập nhật vai trò admin
        await this.User.updateOne(
          { username: "admin" },
          { $set: { role: "admin" } },
        );
      }

      // Tạo tài khoản user thường
      const normalUser = await this.findByUsername("user");
      if (!normalUser) {
        await this.create({
          username: "user",
          password: "123",
          email: "user@example.com",
          role: "user",
        });
        console.log("Seeded default user: user / 123");
        console.log("----------------------------------------");
      } else if (normalUser.role !== "user") {
        // Đảm bảo tài khoản user cũ được cập nhật vai trò user
        await this.User.updateOne(
          { username: "user" },
          { $set: { role: "user" } },
        );
        console.log("Updated existing normal user to have role 'user'");
      }
    } catch (error) {
      console.error("Error seeding default users:", error);
    }
  }
}

module.exports = UserService;
