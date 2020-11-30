// validate amount provided in the body
const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        status: {
          type: 'number'
        }
      },
      required: ['amount']
    }
  },
  required: ['body']
};

export default schema;
