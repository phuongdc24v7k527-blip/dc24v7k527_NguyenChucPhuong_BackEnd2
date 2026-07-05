const ApiError = require("../api-error");

exports.requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers["x-user-role"];
    if (!userRole) {
      return next(new ApiError(401, "Yêu cầu đăng nhập"));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new ApiError(403, "Bạn không có quyền thực hiện hành động này"));
    }
    next();
  };
};
