'use strict';

function privateProcess( val ) {
  return 'private ' + val;
}

class TestClass {
  constructor( ...args ) {
    this.args = args;
  }

  process( val ) {
    return privateProcess( val );
  }
}

module.exports = {
  TestClass,
};