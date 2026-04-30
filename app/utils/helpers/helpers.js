const bCrypt = require("bcryptjs");
const _ = require("lodash");
const { isEmpty, isString } = require("../validator");


exports.createResponse = (
  res,
  status,
  msg,
  payload,
  other = undefined,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status,
    message: msg,
    data: payload,
    ...other,
  });
};


exports.createError = (res, error, options = undefined, statusCode = 400) => {
  if (!options) options = {};
  if (!options.other) options.other = {};

  const message =
    (error && error.message) ||
    (isString(error) && error) ||
    options.message ||
    "Error Occurred";
  const stackTrace = error || message;


  res.locals.errorStr = message;

  const other = {
    ...options.other,
    ...(options.returnStackTrace ? { error: error.message } : {}),
  };

  return exports.createResponse(
    res,
    false,
    message,
    other,
    undefined,
    statusCode
  );
};


exports.createServiceUnavailableError = (res, message, options = undefined) => {
  if (!options) options = {};
  if (!options.other) options.other = {};


  return res.status(503).json({
    status: false,
    message,
    ...options.other,
  });
};


exports.createValidationResponse = (res, errors) => {
  return res.status(400).json({
    status: false,
    message: errors[Object.keys(errors)[0]],
    errors: {
      ...errors,
    },
  });
};


exports.generateHash = (password) => {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
};


exports.comparePassword = (password, DbPassword) => {
  return bCrypt.compareSync(password, DbPassword);
};


exports.arrayFromString = (str) => {
  const newStr = str.slice(2, str.length - 2);
  const replacedStr = newStr.replace(/“|”|"/g, "");
  const array = replacedStr.split(",").map(String);
  return array;
};


exports.stringToKey = (str) => {
  const newStr = str.replace(/ /g, "_");
  return newStr;
};


exports.createValidKey = (str) => {
  const newStr = str.replace(/-| |_/g, "_");
  return newStr;
};


exports.getDefaultSortOrder = (sortOrder) => {
  const order =
    !isEmpty(sortOrder) && ["ASC", "DESC"].indexOf(sortOrder) !== -1
      ? sortOrder
      : "DESC";
  return order;
};


exports.encodingToBase64 = (data) => {
  if (!data) return data;
  const buff = new Buffer.from(data);
  return buff.toString("base64");
};


exports.decodeBase64ToString = (data) => {
  if (!data) return data;
  const buff = new Buffer.from(data, "base64");
  return buff.toString("utf8");
};

exports.formatCurrency = (num) => {
  try {
    if (num && Number.isNaN(num) === false)
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } catch (e) {
    return num;
  }
  return num;
};

exports.jsonParseSafe = (s, defaultVal) => {
  try {
    if (_.isEmpty(s)) {
      return defaultVal;
    }

    return JSON.parse(s);
  } catch (e) {
    return defaultVal;
  }
};

exports.isEmail = (value) => {
  const myRegEx =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isValid = myRegEx.test(value);
  return !!isValid;
};

exports.getUserDataId = (user) => {
  if (user) {
    if (user.data_uid) return user.data_uid;
    return user.id;
  }
};

exports.mathRounding = (num, digit = 2) => {
  const result = parseFloat(num).toFixed(digit);
  if (result && isNaN(result) === false) return Number(result);
  return 0;
};

exports.leftJoinArray = (
  array1 = [],
  array2 = [],
  array1FieldName,
  array2FieldName,
  name1 = "left",
  name2 = "right"
) => {
  if (!array1 || !array2) throw Error("Both array are required");
  const result = [];
  array1.forEach((item) => {
    const joinItem = {
      [name1]: item,
      [name2]: array2.find((x) => x[array2FieldName] === item[array1FieldName]),
    };
    result.push(joinItem);
  });
  return result;
};

exports.groupBy = (collection, iteratee) => {
  const groupResult = _.groupBy(collection, iteratee);
  return Object.keys(groupResult).map((key) => {
    return { name: key, value: groupResult[key] };
  });
};

exports.getDate = (date) => {
  if (date) date = new Date(date);
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
};


exports.userFriendlyString = (value, replaceChar) => {
  if (!value) return "";
  value = value.trim();

  if (!replaceChar) replaceChar = "_";
  return value === undefined
    ? ""
    : value
        .replace(/[^a-z0-9_]+/gi, replaceChar)
        .replace(/^-|-$/g, "")
        .toLowerCase();
};

exports.getNextNumber = (key = "", type = 1) => {
  try {
    if (!key) {
      key = type === 1 ? "0" : "@";
    }
    if (key === "Z" || key === "z") {
      return (
        String.fromCharCode(key.charCodeAt() - 25) +
        String.fromCharCode(key.charCodeAt() - 25)
      );
    } else {
      var lastChar = key.slice(-1);
      var sub = key.slice(0, -1);
      if (lastChar === "Z" || lastChar === "z") {
        return (
          getNextNumber(sub, 2) +
          String.fromCharCode(lastChar.charCodeAt() - 25)
        );
      } else {
        return sub + String.fromCharCode(lastChar.charCodeAt() + 1);
      }
    }
  } catch (e) {
    return key;
  }
};
