/**
 * Employer.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    employerName: {
      type: 'string',
      required: true,
      maxLength: 30,
      example: 'Code Inc.'
    },

    employeeID: {
      type: 'string',
      required: true,
      maxLength: 10,
      example: 'c334455' 
    },

    userPassword: {
      type: 'string',
      required: true,
      maxLength: 30,
      example: 'password123'
    },

    userFirstName: {
      type: 'string',
      required: true,
      maxLength: 30,
      example: 'John'
    },

    userLastName:{
      type: 'string',
      required: true,
      maxLength: 30,
      example: 'Smith'
    },

    salary:{
      type: 'number',
      required: true,
      example: '30000'
    },

    employmentLengthYears:{
      type: 'number',
      required: true,
      example: 2,
    }

  },
  datastore: 'employerDB'
  
};

