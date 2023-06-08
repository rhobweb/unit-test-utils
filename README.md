# @rhobweb/unit-test-utils

## Overview

Simple framework for unit testing CJS Node.js modules using mocha, chai, sinon and nyc.
<br>This module uses the [rewire](https://www.npmjs.com/package/rewire) module to access the unexported items from the module under test.

## Features

The following unexported module items may be stubbed for testing:
  - function;
  - class constructor.

Unexported module items, e.g., variables, required modules, may be accessed and faked.

## Usage

See /test/unit for example usage.