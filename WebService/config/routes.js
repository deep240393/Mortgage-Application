/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },
  'POST /FundsForm' : 'MBRController.newApplication',
  'POST /check_credentials' : 'MBRController.check_credentials',
  'POST /validateApplication' : 'MBRController.validateApplication',
  // '/ApplicationStatus': { view: 'pages/ApplicationStatus'},
  'POST /REApprovalForm' : 'RealEstateController.REApprovalForm',
  'POST /appraisalForm/checkAppraisalCredentials': 'RealEstateController.checkAppraisalCredentials',
  '/getREData': 'RealEstateController.getREData',
  'POST /updateREData': 'RealEstateController.updateREData',
  'POST /insuranceUpdate': 'MBRController.insuranceUpdate',
  'POST /insuranceQuote': 'INSincController.insuranceQuote',
  '/ApplicationStatus': { view: 'pages/ApplicationStatus' },


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
