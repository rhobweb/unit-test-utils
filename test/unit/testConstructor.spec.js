/**
 * File: testConstructor.spec.js
 *
 * Test to show how the module can be initialised with .
 */
'use strict';

const REL_SRC_PATH     = `../assets/`;
const MODULE_NAME      = 'testConstructor';
const TEST_MODULE      = REL_SRC_PATH + MODULE_NAME;
const TEST_MODULE_NAME = MODULE_NAME + '.js';

const sinon         = require( 'sinon' );
const { expect }    = require( 'chai' );
const path          = require( 'node:path' );
const UnitTestUtils = require( '../../src/index' );

// Module construction
describe( TEST_MODULE_NAME, () => {
  let actualErr;
  let expectedErrMessage;

  it('Module can be loaded with full path', () => {
    const testModulePathname = require.resolve( path.join( __dirname, TEST_MODULE ) );
    const arrUnrequire       = [ 'rewire' ]; 
    const unitTestUtils      = new UnitTestUtils( { testModulePathname, arrUnrequire } );
    expect( unitTestUtils ).to.not.be.null;
  });

  it('Module can be loaded with relative path and find unrequire modules', () => {
    const testModulePathname = TEST_MODULE;
    const arrUnrequire       = [ 'rewire' ]; 
    const unitTestUtils      = new UnitTestUtils( { testModulePathname, arrUnrequire, dirPathname: __dirname } );
    expect( unitTestUtils ).to.not.be.null;
  });

  it('Module fails to load if arrUnrequire is not an array', () => {
    const testModulePathname = TEST_MODULE;
    const arrUnrequire       = 'rewire'; 
    expectedErrMessage       = 'arrUnreqire must be an array';
    try {
      new UnitTestUtils( { testModulePathname, arrUnrequire, dirPathname: __dirname } );
      sinon.assert.fail( 'Test should not succeed' );
    }
    catch ( err ) {
      actualErr = err;
    }
    expect( actualErr.message ).to.equal( expectedErrMessage );
  });
});
