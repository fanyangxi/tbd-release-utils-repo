function NotFoundError(message) {
  this.message = message;
  this.name = 'NotFoundError';
  Error.captureStackTrace(this, NotFoundError);
}

NotFoundError.prototype = new Error();
NotFoundError.prototype.constructor = NotFoundError;

module.exports = NotFoundError;
