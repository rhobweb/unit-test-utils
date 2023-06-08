/**
 * Simple module to test stubbing class constructors
 */
'use strict';

class ClassPrivate {
  constructor( ...args ) {
    this.args = args;
  }
  process() {
    return 'privateProcess';
  }
}

function publicProcess( val ) {
  const objProcessor = new ClassPrivate( val );
  return objProcessor.process();
}

module.exports = {
  publicProcess,
};