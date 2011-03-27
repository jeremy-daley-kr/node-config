// Dependencies
var _ = require('underscore');
var vows = require('vows');
var assert = require('assert');
var config = require('../lib/config');

// Module default parameters
var defaultParms = {
  dbHost: 'localhost',
  dbPort: 5984,
  dbName: 'customers',
  custTemplate: {
    credit: 200,
    region: 'Central',
    mailings: ['intro', 'month1']
  }
};

/**
 * <p>Unit tests for the node-config library</p>
 *
 * @class ConfigTest
 * @constructor
 */
exports.ConfigTest = vows.describe('Test suite for node-config').addBatch({
  'Library initialization': {
    'Config library is available': function() {
      assert.isFunction(config);
    },
    'Config utils are included with the library': function() {
      // Normal underscore + config extensions
      assert.isFunction(_);
      assert.isFunction(_.cloneDeep);
    }
  },

  'Configuration Tests': {
    topic: function() {
      // Remember the original command line argument values
      var orig = {argv:process.argv};
      return orig;
    },

    'Default configuration is correct': function() {
      process.argv = [];
      var conf = config('Customers', defaultParms);
      var shouldBe = {
        dbHost: 'localhost',
        dbPort: 5984,
        dbName: 'customers',
        custTemplate: {
          credit: 200,
          region: 'Central',
          mailings: ['intro', 'month1']
        }
      };
      assert.deepEqual(conf, shouldBe);
    },

    'Alpha configuration was mixed in': function() {
      process.argv = ['arg1', '-config', './config/alpha.js'];
      var conf = config('Customers', defaultParms);
      var shouldBe = _.extendDeep({}, defaultParms, {
        dbHost:"alpha",
        dbPort:5999
      });
      assert.deepEqual(conf, shouldBe);
    },

    'Multiple configurations can be mixed in': function() {
      process.argv = ['-config', './config/base.js', 'arg1', 
        '-config', './config/alpha.js', 'arg2'];
      var conf = config('Customers', defaultParms);
      var shouldBe = _.extendDeep({}, defaultParms, {
        dbName:'base_customers',
        dbHost:"alpha",
        dbPort:5999
      });
      assert.deepEqual(conf, shouldBe);
    },

    'Specific configurations are discoverable': function() {
      // Read the current Customers parameters
      var conf = config('Customers');
      var shouldBe = _.cloneDeep(defaultParms);
      shouldBe.custTemplate.mailings[1] = {name:"intro", mailed:"Y"};
      assert.deepEqual(conf, shouldBe);
    },

    'All configurations are discoverable': function() {
      var allConfs = config();
      assert.isObject(allConfs);
      assert.isObject(allConfs.Customers);
      var conf = allConfs.Customers;
      var shouldBe = _.cloneDeep(defaultParms);
      shouldBe.custTemplate.mailings[1] = {name:"intro", mailed:"Y"};
      assert.deepEqual(conf, shouldBe);
    },

    'JSON configuration files can be loaded': function() {
      process.argv = ['-config', './config/base.json', 'arg1', 
        '-config', './config/alpha.js', 'arg2'];
      var conf = config('Customers', defaultParms);
      var shouldBe = _.extendDeep({}, defaultParms, {
        dbName:'base_customers',
        dbHost:"alpha",
        dbPort:5999
      });
      assert.deepEqual(conf, shouldBe);
    },

    'YAML configuration files can be loaded': function() {
      process.argv = ['-config', './config/base.yaml', 'arg1', 
        '-config', './config/alpha.js', 'arg2'];
      var conf = config('Customers', defaultParms);
      var shouldBe = _.extendDeep({}, defaultParms, {
        dbName:'base_customers',
        dbHost:"alpha",
        dbPort:5999
      });
      assert.deepEqual(conf, shouldBe);
    },

    'Resetting command line args': function(orig) {
      process.argv = orig.argv;
      assert.deepEqual(process.argv, orig.argv);
    }
    
  }
  
});