"use strict";
var Exclusions = {
  re: {},
  _emptyStringRegex: /^$/,
  _starRegex: /\*/g,
  _caretRegex: /^\^/,
  _regChars: /[\[\]\|\(\)\^\$\?\*]/,
  getRegex: function(pattern) {
    var regex = this.re[pattern];
    if (regex) { return regex; }
    if (!this._regChars.test(pattern)) {
      regex = this._startsWith.bind(pattern);
    } else try {
      regex = new RegExp("^" + pattern.replace(this._starRegex, ".*").replace(this._caretRegex, ""));
      regex = regex.test.bind(regex);
    } catch (e) {
      regex = this._startsWith.bind(pattern);
    }
    return this.re[pattern] = regex;
  },
  _startsWith: function(url) {
    return url.startsWith(this);
  },
  rules: [],
  setRules: function(rules) {
    this.re = {};
    this.rules = this.Format(rules);
    this.getPattern = (this.rules.length !== 0) ? this._getPatternByRules : this._getNull;
  },
  Format: function(rules) {
    var keyRegex = Commands.keyRegex, _i, rule, pattern, pass, arr, out = [];
    for (_i = rules.length; 0 <= --_i; ) {
      pattern = (rule = rules[_i]).pattern;
      if (!pattern) { continue; }
      pass = rule.passKeys;
      out.push([this.getRegex(pattern), pass && (arr = pass.match(keyRegex))
        ? (arr.join(" ") + " ") : ""]);
    }
    return out;
  },
  getPattern: null,
  _getNull: function() {
    return null;
  },
  _getPatternByRules: function(url) {
    var rules = this.rules, _i, _len, matchedKeys = "";
    for (_i = 0, _len = rules.length; _i < _len; _i++) {
      if (rules[_i][0](url)) {
        if (!rules[_i][1]) {
          return "";
        }
        matchedKeys += rules[_i][1];
      }
    }
    return matchedKeys || null;
  },
  getTemp: function(url, rules) {
    var old = this.rules;
    this.rules = this.Format(rules);
    url = this._getPatternByRules(url);
    this.rules = old;
    return url;
  }
};