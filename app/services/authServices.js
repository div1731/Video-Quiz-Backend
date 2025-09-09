const Auth = require("../models/auth.model");

class AuthService {
  async addNewUser(obj) {
    try {
      obj.email = String(obj.email).toLowerCase();

      const existingUser = await Auth.findOne({
        $or: [{ email: obj.email }],
      }).maxTimeMS(10000);

      if (existingUser) {
        throw { message: "That email is already in use." };
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
      console.log('UserLogin service called with email:', payload.email);
      const { email, password } = payload;
      
      console.log('Attempting to find user with email:', email);
      const user = await Auth.findOne({ email: email }).maxTimeMS(10000);
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('Authenticating user password...');
        if (user && user.authenticateUser(password)) {
          console.log('Password authentication successful');
          return user.toAuthJSON();
        } else {
          console.log('Password authentication failed');
          throw Error("password is incorrect.");
        }
      } else {
        console.log('No user found with email:', email);
        throw Error(
          "Email or password is incorrect. Please check credentials and try again."
        );
      }
    } catch (err) {
      console.error('UserLogin service error:', err);
      throw err;
    }
  }
}

const authService = new AuthService();
module.exports = authService;
