const { createError, createResponse } = require("../../utils/helpers/helpers");
const authServices = require("../../services/authServices");

class AuthController {
  async signUp(req, res) {
    try {
      const user = await authServices.addNewUser(req.body);
      if (user) {
        createResponse(res, true, "Signup successful", user);
      } else {
        createError(
          res,
          {},
          { message: "Unable to create new user,please try again" }
        );
      }
    } catch (e) {
      createError(res, e);
    }
  }

  async login(req, res) {
    try {
      // console.log('Login attempt for:', req.body.email);
      const data = await authServices.UserLogin(req.body);
      if (data) {
        // console.log('Login successful for:', req.body.email);
        createResponse(res, true, "Login success", data);
      } else {
        // console.log('Login failed - no data returned for:', req.body.email);
        createError(res, {}, { message: "Invalid Credentials" });
      }
    } catch (err) {
      console.error('Login error:', err);
      createError(res, {
        message: err.message || 'Login failed',
      });
    }
  }
}

const authController = new AuthController();
module.exports = authController;
