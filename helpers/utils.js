module.exports = {

  /**
   * Checks if number is finite
   * @param {number} value Number to validate
   * @return {boolean}
   */
  isNumber(value) {
    if (typeof (value) !== 'number' || isNaN(value) || !Number.isFinite(value)) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * Checks if number is finite and not less, than 0
   * @param {number} value Number to validate
   * @return {boolean}
   */
  isPositiveOrZeroNumber(value) {
    if (!this.isNumber(value) || value < 0) {
      return false;
    } else {
      return true;
    }
  },

  numbersDifferencePercent(a, b) {
    if (!this.isNumber(a) || !this.isNumber(b)) return undefined;
    return 100 * Math.abs( ( a - b ) / ( (a + b)/2 ) );
  },

};
