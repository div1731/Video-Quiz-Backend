const mongoose = require("mongoose");
const { hashSync, compareSync, genSaltSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { EXPRESS_SECRET } = require("../config/env");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  { timestamps: true } // UTC format, removed deprecated usePushEach
);

// Hash password before saving
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = this._hashPassword(this.password);
    return next();
  }
  return next();
});

// Hash password for findOneAndUpdate
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.password) {
    update.password = hashSync(update.password, genSaltSync(10));
  }
  next();
});

userSchema.methods = {
  authenticateUser(password) {
    return compareSync(password, this.password);
  },

  _hashPassword(password) {
    return hashSync(password, genSaltSync(10));
  },

  toJSON() {
    return {
      _id: this._id,
      username: this.username,
      email: this.email,
    };
  },

  createToken() {
    if (!EXPRESS_SECRET) {
      throw new Error("EXPRESS_SECRET is not defined for JWT signing");
    }
    return jwt.sign(
      {
        id: this._id,
        username: this.username,
        email: this.email,
      },
      EXPRESS_SECRET,
      { expiresIn: "7d" }
    );
  },

  toAuthJSON() {
    return {
      _id: this._id,
      username: this.username,
      email: this.email,
      token: this.createToken(),
    };
  },
};

module.exports = mongoose.model("User", userSchema);