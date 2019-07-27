/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  '*': ['isAuthorized'],
  'EmployerController': {
    'authenticate': true, // We dont need authorization here, allowing public access
    'retrieveData': true // We dont need authorization here, allowing public access
  },
  'MBRController':
  {
    'newApplication':true,
    'check_credentials':true,
    'validateApplication':['isAuthorized'],
    'insuranceUpdate':true,
  },
  'LoggerController':{'*':true},
  'RealEstateController':{'*':true},
  'INSincController':{'*':true}


};
