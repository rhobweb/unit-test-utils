'use strict';

const REL_SRC_PATH     = `../assets/`;
const MODULE_NAME      = 'testModule';
const TEST_MODULE      = REL_SRC_PATH + MODULE_NAME;
const TEST_MODULE_NAME = MODULE_NAME + '.js';

const sinon         = require( 'sinon' );
const { expect }    = require( 'chai' );
const UnitTestUtils = require( '../../src/index' );

const unitTestUtils = new UnitTestUtils( { testModulePathname: TEST_MODULE, dirPathname: __dirname } );

function createTestModule( { propNames = [], fnNames = [], classNames = [] } = {} ) {
  const { testModule, testProps, testStubs, testConStubs } = unitTestUtils.createTestComponents( { propNames, fnNames, classNames } );
  return { testModule, testProps, testStubs, testConStubs };
}

// Module construction
describe( TEST_MODULE_NAME, () => {
  let testModule;

  beforeEach( () => {
    unitTestUtils.commonBeforeEach();
  } );

  afterEach( () => {
    unitTestUtils.commonAfterEach();
  } );

  it('Module can be constructed with empty test items', () => {
    ( { testModule } = createTestModule() );
    expect( testModule ).to.be.not.null;
  });

  it('Module can be loaded with no test items specified', () => {
    ( { testModule } = unitTestUtils.createTestComponents() );
    expect( testModule ).to.be.not.null;
  });
});

// Unexported function
describe( TEST_MODULE_NAME + ':publicProcess', () => {
  let testModule;
  let testConStubs;
  let testPrivateObj;
  let testArgs;
  let actualResult;
  let expectedResult;
  let classPrivateConStub;
  let privateProcessStub;
  let privateProcessRet;

  beforeEach( () => {
    unitTestUtils.commonBeforeEach();
    ( { testModule, testConStubs } = createTestModule( { classNames: [ 'ClassPrivate' ] } ) );
    testPrivateObj = {
      process: () => {},
    };
    classPrivateConStub = testConStubs[ 'ClassPrivate' ];
    classPrivateConStub.callsFake( () => {
      return testPrivateObj;
    } );
    privateProcessStub = unitTestUtils.sandbox.stub( testPrivateObj, 'process' ).callsFake( () => {
      return privateProcessRet;
    } );
    privateProcessRet = 'test privateProcess ret';
  } );

  afterEach( () => {
    unitTestUtils.commonAfterEach();
  } );

  it('OK', () => {
    testArgs       = 'party';
    expectedResult = privateProcessRet;
    actualResult   = testModule.publicProcess( testArgs );
    sinon.assert.calledWithExactly( classPrivateConStub, testArgs );
    sinon.assert.calledWithExactly( privateProcessStub );
    expect( actualResult ).to.equal( expectedResult );
  });
});
