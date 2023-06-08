/**
 * File: testClass.spec.js
 *
 * Test to show how an exported class may be tested.
 */
'use strict';

const REL_SRC_PATH     = `../assets/`;
const MODULE_NAME      = 'testClass';
const TEST_MODULE      = REL_SRC_PATH + MODULE_NAME;
const TEST_MODULE_NAME = MODULE_NAME + '.js';

const sinon         = require( 'sinon' );
const { expect }    = require( 'chai' );
const UnitTestUtils = require( '../../src/index' );

// Construct the test utilities
const unitTestUtils = new UnitTestUtils( { testModulePathname: TEST_MODULE, dirPathname: __dirname } );

/**
 * Load the test module and any required test items.
 */
function createTestModule( { propNames = [], fnNames = [], classNames = [] } = {} ) {
  const { testModule, testProps, testStubs, testConStubs } = unitTestUtils.createTestComponents( { propNames, fnNames, classNames } );
  const testClass = testModule.TestClass;
  return { testModule, testClass, testProps, testStubs, testConStubs };
}

/**
 * Load the test module and any required test items.
 * Construct an instance of the class under test.
 */
function createTestObject( { args = [], testItems = {} } = {} ) {
  const { testModule, testClass, testProps, testStubs, testConStubs } = createTestModule( testItems );
  const testObject = new testClass( ...args );
  return { testModule, testClass, testProps, testStubs, testConStubs, testObject };
}

// Module loading
describe( TEST_MODULE_NAME, () => {
  let testModule;

  beforeEach( () => {
    unitTestUtils.commonBeforeEach();
  } );

  afterEach( () => {
    unitTestUtils.commonAfterEach();
  } );

  it('Module can be loaded', () => {
    ( { testModule } = createTestModule() );
    expect( testModule ).to.be.not.null;
  });
});

// Object construction
describe( TEST_MODULE_NAME + ':constructor', () => {
  let testObject;
  let testArgs;
  let expectedResult;

  beforeEach( () => {
    unitTestUtils.commonBeforeEach();
  } );

  afterEach( () => {
    unitTestUtils.commonAfterEach();
  } );

  it('Object constructed OK', () => {
    testArgs       = [ 'arg1' ];
    expectedResult = JSON.parse( JSON.stringify( testArgs ) );
    ( { testObject } = createTestObject( { args: testArgs } ) );
    expect( testObject.args ).to.deep.equal( expectedResult );
  });
});

// Unexported function
describe( TEST_MODULE_NAME + ':privateProcess', () => {
  let testProps;
  let testFnName = 'privateProcess';
  let testFn;
  let testArgs;
  let actualResult;
  let expectedResult;

  beforeEach( () => {
    unitTestUtils.commonBeforeEach();
    ( { testProps } = createTestModule( { propNames: [ testFnName ] } ) );
    testFn = testProps[ testFnName ];
  } );

  afterEach( () => {
    unitTestUtils.commonAfterEach();
  } );

  it('OK', () => {
    testArgs       = 'party';
    expectedResult = 'private party';
    actualResult   = testFn( testArgs );
    expect( actualResult ).to.equal( expectedResult );
  });
});

// Method calls unexported function
describe( TEST_MODULE_NAME + ':process', () => {
  let testStubs;
  let testObject;
  let testArgs;
  let actualResult;
  let expectedResult;
  let privateProcessStub;
  let privateProcessRet;

  beforeEach( () => {
    unitTestUtils.commonBeforeEach();
    ( { testObject, testStubs } = createTestObject( { testItems: { fnNames: [ 'privateProcess' ] } } ) );
    // The test stub is just an empty function that is to shortly be faked.
    // As the empty function never gets called, nyc marks it as not covered.
    // So just call it here so that function coverage is complete.
    testStubs[ 'privateProcess' ](); // NOTE: no need to do this in your test code
    privateProcessStub = unitTestUtils.sandbox.stub( testStubs, 'privateProcess' ).callsFake( () => {
      return privateProcessRet;
    } );
    privateProcessRet = 'privateProcess ret';
  } );

  afterEach( () => {
    unitTestUtils.commonAfterEach();
  } );

  it('OK', () => {
    testArgs       = 'party';
    expectedResult = privateProcessRet;
    actualResult   = testObject.process( testArgs );
    sinon.assert.calledWithExactly( privateProcessStub, testArgs );
    expect( actualResult ).to.equal( expectedResult );
  });
});
