# @rhobweb/unit-test-utils

## Overview

Simple framework for unit testing CJS Node.js modules using the following modules:

  - [mocha](https://www.npmjs.com/package/mocha) - testing framework;
  - [chai](https://www.npmjs.com/package/chai) - assertion library;
  - [sinon](https://www.npmjs.com/package/sinon) - test framework for stubs, spies and mocks;
  - [nyc](https://www.npmjs.com/package/nyc) - code coverage checker;
  - [rewire](https://www.npmjs.com/package/rewire) - allows access to the unexported items from the module under test;

## Features

The following unexported module items may be stubbed for testing:
  - function;
  - class constructor.

Unexported module items, e.g., variables, required modules, may be accessed and faked.

## Usage

See <code>./test/unit</code> for example usage.

## Testing

The following test scripts may be run from the command line:

  - <code>npm run test</code>
    - Runs the unit tests, code coverage and outputs the coverage stats.
  - <code>npm run coverage</code>
    - Generates the code coverage data in html format in the './coverage' directory.
  - <code>npm run lint</code>
    - Run eslint on the source and test code; if no errors are detected, only the lint command line is output.
