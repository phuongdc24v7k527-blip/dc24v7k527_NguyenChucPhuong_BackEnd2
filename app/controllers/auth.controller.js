const ApiError = require("../api-error");
const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");

exports.login = async (req, res, next) => {
  if (!req.body?.username || !req.body?.password) {
    return next(new ApiError(400, "Tên đăng nhập và mật khẩu là bắt buộc"));
  }

  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findByUsername(req.body.username);
    if (!user) {
      return next(new ApiError(401, "Tên đăng nhập hoặc mật khẩu không đúng"));
    }

    const isValid = await userService.verifyPassword(user, req.body.password);
    if (!isValid) {
      return next(new ApiError(401, "Tên đăng nhập hoặc mật khẩu không đúng"));
    }

    // Trả về thông tin đăng nhập thành công (loại bỏ trường password)
    const { password, ...userWithoutPassword } = user;
    return res.send(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi trong quá trình đăng nhập"));
  }
};
