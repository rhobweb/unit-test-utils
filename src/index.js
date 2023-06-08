/**
 * Unit test utilities for testing Node.js CJS modules.
 *
 * Uses the 'rewire' module to access the unexported items in the module:
 *   see https://www.npmjs.com/package/rewire
 *
 * See /test/unit for example usage.
 */
'use strict';

const sinon  = require( 'sinon' );
const rewire = require( 'rewire' );
const path   = require( 'node:path' );

// To enable full error output from chai, enable the following here or in the test
// const chai          = require( 'chai' );
// chai.config.truncateThreshold = 0; // Do not truncate errors

/**
 * @param {object} with properties:
 *          - modulePathname: absolute or relative pathname of module;
 *          - dirPathname:    directory pathname to try, or empty if path is absolute.
 *          - tryAbsolute:    if true, try resolving modulePathname to an absolute path first.
 * @returns the resolved module if successful.
 * @exception if the module cannot be resolved.
 */
function resolveModule( { modulePathname, dirPathname, tryAbsolute = true } ) {
  let resolvedModule = null;

  if ( ( dirPathname !== '' ) && tryAbsolute ) {
    try {
      resolvedModule = require.resolve( modulePathname );
    }
    catch ( err ) { // eslint-disable-line no-empty
    }
  }
  if ( ! resolvedModule ) {
    resolvedModule = require.resolve( path.join( dirPathname, modulePathname ) );
  }

  return resolvedModule;
}


class UnitTestUtils {

  /**
   * @param {object} with properties:
   *          - testModulePathname: pathname of the module under test;
   *          - arrUnrequire:       optional array of pathnames of modules to delete from the module cache after each test;
   *          - dirPathname:        if the pathnames specified in the other two parameters are relative pathnames,
   *                                specify the pathname that makes them absolute.
   * @exception if the test module or any of the unrequire module pathnames cannot be resolved.
   */
  constructor( { testModulePathname, arrUnrequire = [], dirPathname = '' } ) {
    if ( ! Array.isArray( arrUnrequire ) ) {
      throw new Error( 'arrUnreqire must be an array' );
    }
    this.testModulePathname = resolveModule( { modulePathname: testModulePathname, dirPathname, tryAbsolute: false } );
    this.arrUnrequire       = [ this.testModulePathname ];
    this.arrUnrequire.push( ...arrUnrequire.map( e => resolveModule( { modulePathname : e, dirPathname } ) ) );
    this.sandbox            = null; // The sinon sandbox should be used by all clients
  }

  /**
   * Modules load other modules.
   * Loaded modules are stored in the module cache.
   * If a test modifies a module, subsequent tests may load the module from the cache and potentially invalidate the test.
   * To force a module reload need to delete the module from the module cache.
   */
  unrequireModules() {
    this.arrUnrequire.forEach( key => {
      delete require.cache[ key ];
    } );
  }

  /**
   * Client should call this before each test to get a clean test environment.
   */
  commonBeforeEach() {
    this.unrequireModules(); // Call this just in case
    this.sandbox = sinon.createSandbox();
  }
  
  /**
   * Client should call this after each test to restore a clean test environment.
   */
  commonAfterEach() {
    this.sandbox.restore();
    this.unrequireModules();
  }

  /**
   * Load the test module using 'rewire' to allow access to the unexported module properties, functions and classes.
   * @returns the rewired test module.
   */
  createTestModule() {
    const testModule = rewire( this.testModulePathname );
    return testModule;
  }

  /**
   * @param {object} testModule - the rewired test module;
   * @param {array}  arrProp    - array of zero or more property names;
   * @returns object with properties being the property name and values being the property values.
   * Example usage:
   *   const testModule = unitTestUtils.createTestModule();
   *   const testProps  = getProps( testModule, [ 'myPrivateValue' ] );
   *   console.log( testProps[ 'myPrivateValue' ];
   */
  getProps( testModule, arrProp ) {
    const testProps = {};
    arrProp.forEach( m => { 
      testProps[ m ] = testModule.__get__( m );
    } );
    return testProps;
  }

  /**
   * Updates the module to update the private function so that it calls a dummy function instead.
   * @param {object} testModule - the rewired test module;
   * @param {array}  arrFnName  - array of function names;
   * @returns object with properties being the function name and values being a function that can be stubbed.
   * Example usage:
   *   const testModule = unitTestUtils.createTestModule();
   *   const testStubs  = getProps( testModule, [ 'myPrivateFn' ] );
   *   unitTestUtils.stub( testStubs, 'myPrivateFn' ).callsFake( ...
   */
  getPrivateStubs( testModule, arrFnName ) {
    const testStubs   = {};
    const testDummies = {};
  
    arrFnName.forEach( fnName => {
      testStubs[ fnName ]   = () => {};
      testDummies[ fnName ] = ( ...args ) => testStubs[ fnName ]( ...args );
      testModule.__set__( fnName, testDummies[ fnName ] );
    } );
  
    return testStubs;
  }

  /**
   * @param {*} testModule   - the rewired test module, to be updated with stubbed classes;
   * @param {*} arrClassName - array of class names to stub.
   * @returns object with properties being the class names and values being a constructor stub.
   * Example usage:
   *   const testModule        = unitTestUtils.createTestModule();
   *   const testConStubs      = getPrivateConstructorStubs( testModule, [ 'MyPrivateClass' ] );
   *   const testPrivateObject = { prop: 'testVal' };
   *   unitTestUtils.stub( testConStubs, 'MyPrivateClass' ).callsFake( () => testPrivateObject );
   *
   * Note: If faking the constructor return value, it must be a non-primitive, i.e., an object,
   *       see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new
   */
  getPrivateConstructorStubs( testModule, arrClassName ) {
    const testStubs = {};
  
    arrClassName.forEach( className => {
      const constructorStub = this.sandbox.stub();
      class testClass {
        constructor ( ...args ) {
          return constructorStub( ...args );
        }
      }
      testStubs[ className ] = constructorStub;
      testModule.__set__( className, testClass );
    } );
  
    return testStubs;
  }
  
  /**
   * @param {object} with properties:
   *         - propNames:  optional array of property names to get values for;
   *         - fnNames:    optional array of function names to stub;
   *         - classNames: optional array of class names to stub.
   * @returns object with properties:
   *         - testModule   - the rewired test module;
   *         - testProps    - object containing the requested properies;
   *         - testStubs    - object containing the requested function stubs;
   *         - testConStubs - object containing the requested class constructor stubs.
   */
  createTestComponents( { propNames = [], fnNames = [], classNames = [] } = {} ) {
    const testModule   = this.createTestModule();
    const testProps    = this.getProps( testModule, propNames );
    const testStubs    = this.getPrivateStubs( testModule, fnNames );
    const testConStubs = this.getPrivateConstructorStubs( testModule, classNames );
    return { testModule, testProps, testStubs, testConStubs };
  }
}

// Exports
module.exports = UnitTestUtils;
