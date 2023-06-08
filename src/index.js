/**
 */
'use strict';

const sinon  = require( 'sinon' );
const rewire = require( 'rewire' );
const path   = require( 'node:path' );

// To enable full error output from chai, enable the following here or in the test
// const chai          = require( 'chai' );
// chai.config.truncateThreshold = 0; // Do not truncate errors

class UnitTestUtils {

  constructor( { testModulePathname, arrUnreqire = [], dirPathname = '' } ) {
    const resolveModule     = m => require.resolve( path.join( dirPathname, m ) );
    this.arrUnrequire       = [ testModulePathname, ...arrUnreqire ].map( e => resolveModule( e ) );
    this.testModulePathname = this.arrUnrequire[ 0 ];
    this.sandbox            = null;
  }

  /**
   * Modules load other modules, so to force a module reload need to delete
   * the test module and all child modules from the require cache.
   */
  unrequireModules() {
    this.arrUnrequire.forEach( key => {
      delete require.cache[ key ];
    } );
  }
  
  commonBeforeEach() {
    this.unrequireModules();
    this.sandbox = sinon.createSandbox();
  }
  
  commonAfterEach() {
    this.sandbox.restore();
    this.unrequireModules();
  }

  createTestModule() {
    const testModule = rewire( this.testModulePathname );
    return testModule;
  }
  
  getProps( testModule, arrProp = [] ) {
    const testProps = {};
    arrProp.forEach( m => { 
      testProps[ m ] = testModule.__get__( m );
    } );
    return testProps;
  }

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

  getPrivateStub( testModule, className ) {
    const testStubs = this.getPrivateStubs( testModule, [ className ] );
    return testStubs[ className ];
  }

  /**
   * Note: If faking the constructor return value, it must be a non-primitive, i.e., an object,
   *       see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new
   * @param {*} testModule 
   * @param {*} arrClassName 
   * @returns object with properties being the class names and values being the stubbed constructors.
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

  getPrivateConstructorStub( testModule, className ) {
    const testStubs = this.getPrivateConstructorStubs( testModule, [ className ] );
    return testStubs[ className ];
  }
  
  /**
   * @param {Object} with properties:
   * @returns object with properties:
   */
  createTestComponents( { propNames = [], fnNames = [], classNames = [] } = {} ) {
    const testModule   = this.createTestModule();
    const testProps    = this.getProps( testModule, propNames );
    const testStubs    = this.getPrivateStubs( testModule, fnNames );
    const testConStubs = this.getPrivateConstructorStubs( testModule, classNames );
    return { testModule, testProps, testStubs, testConStubs };
  }
}

module.exports = UnitTestUtils;
