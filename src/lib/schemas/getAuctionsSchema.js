// validate query string parameters
const schema = {
  properties: {
    queryStringParameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['OPEN', 'CLOSED'],
          default: 'OPEN'
        }
      }
    }
  },
  required: ['queryStringParameters']
};

export default schema;
