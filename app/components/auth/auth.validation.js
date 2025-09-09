const { createValidationResponse } = require("../../utils/helpers/helpers");
const { isEmpty, isValidDate } = require("../../utils/validator");

class AuthValidator {
  signUp(req, res, next) {
    const errors = {};
    const { username, email, password } = req.body;

    if (isEmpty(username)) {
      errors.username = "Username is required";
    }

    if (isEmpty(email)) {
      errors.email = "Email is required";
    }
    if (isEmpty(password)) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  login(req, res, next) {
    const errors = {};
    const { email, password } = req.body;

    if (isEmpty(email)) {
      errors.email = "Email is required";
    }

    if (isEmpty(password)) {
      errors.password = "password is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }
}
const authValidationObj = new AuthValidator();
module.exports = authValidationObj;
