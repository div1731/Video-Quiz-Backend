const Auth = require("../models/auth.model");

class AuthService {
async addNewUser(obj) {
  try {
    if (!obj.email) {
      throw new Error("Email is required");
    }

    obj.email = String(obj.email).toLowerCase();

    const existingUser = await Auth.findOne({ email: obj.email });

    if (existingUser) {
      throw new Error("That email is already in use.");
    }

    const auth = new Auth({ ...obj });
    const item = await auth.save();

    return item.toJSON();
  } catch (e) {
    throw e;
  }
}

  async UserLogin(payload) {
    try {
      const { email, password } = payload;
      
      const user = await Auth.findOne({ email: email }).maxTimeMS(10000);
      
      if (user) {
        if (user && user.authenticateUser(password)) {
          return user.toAuthJSON();
        } else {
          throw Error("password is incorrect.");
        }
      } else {
        throw Error(
          "Email or password is incorrect. Please check credentials and try again."
        );
      }
    } catch (err) {
      throw err;
    }
  }
}

const authService = new AuthService();
module.exports = authService;
