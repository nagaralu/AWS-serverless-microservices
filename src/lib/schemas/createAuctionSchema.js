// validate title provided in the body
const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        status: {
          type: 'string'
        }
      },
      required: ['title']
    }
  },
  required: ['body']
};

export default schema;
