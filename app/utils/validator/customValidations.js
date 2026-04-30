const isJSON = require("validator/lib/isJSON");


exports.isValidId = (id) => {
  if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
    return true;
  } else {
    return false;
  }
};


exports.isEmpty = (value) => {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
  ) {
    return true;
  } else {
    return false;
  }
};


exports.isValidString = (str) => {
  var regExp = /^[a-zA-Z]+$/;
  if (typeof str !== "string") {
    return false;
  } else if (!str.match(regExp)) {
    return false;
  } else {
    return true;
  }
};


exports.customRegex = (str, regEx) => {
  if (typeof str !== "string") {
    return false;
  } else if (!regEx.test(str)) {
    return false;
  } else {
    return true;
  }
};


exports.isEmail = (value) => {
  var email = value;
  var myRegEx =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var isValid = myRegEx.test(email);
  if (isValid) {
    return true;
  } else {
    return false;
  }
};


exports.isArray = (value) => {
  if (typeof value === "string") {
    const replaced = value.replace(/'/g, '"');
    if (!isJSON(replaced)) {
      return false;
    } else {
      const parsed = JSON.parse(replaced);
      if (parsed.constructor === Array) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    if (value.constructor === Array) {
      return true;
    } else {
      return false;
    }
  }
};


exports.isValidDate = (d) => {
  var date = d ? new Date(d) : undefined;
  var myRegex = /Invalid|NaN/;
  return !myRegex.test(date);
};


exports.isString = (value) => {
  return typeof value === "string" || value instanceof String;
};


exports.isDecimalNumber = (value) => {
  var number = value;
  var myRegEx = /^\d+(\.\d+)?$/;
  var isValid = myRegEx.test(number);
  if (isValid) {
    return true;
  } else {
    return false;
  }
};


exports.isNumber = (value) => {
  var number = value;
  var myRegEx = /^(\s*[0-9]+\s*)+$/;
  var isValid = myRegEx.test(number);
  if (isValid) {
    return true;
  } else {
    return false;
  }
};


exports.isBoolean = (value) => {
  if (typeof value === "boolean") {
    return true;
  } else {
    return false;
  }
};
