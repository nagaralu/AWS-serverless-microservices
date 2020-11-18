async function createAuction(event, context) {
  // event: this object includes all the info about createAuction event - i.e event body, path params, query params, headers etc.
  // context: this includes meta data, custom data can be added to both event and context but context is preferred
  // context can be used as middleware, like authentication
  return {
    statusCode: 200,
    body: JSON.stringify({ event, context })
  };
}

export const handler = createAuction;
