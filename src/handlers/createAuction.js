import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import validator from '@middy/validator';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  // event: this object includes all the info about createAuction event - i.e event body, path params, query params, headers etc.
  // context: this includes meta data, custom data can be added to both event and context but context is preferred
  // context can be used as middleware, like authentication

  const { title } = event.body;
  const { email } = event.requestContext.authorizer;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    },
    seller: email
  };

  try {
    // insert the new item into DynamoDB table using put (create a new item)
    await dynamodb
      .put({
        //TableName: 'AuctionsTable', //note do not use camel case, use AWS document syntax
        TableName: process.env.AUCTIONS_TABLE_NAME, //NOTE the name is from serverless.yml file - environment variable
        Item: auction
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction)
  };
}

export const handler = commonMiddleware(createAuction).use(
  validator({ inputSchema: createAuctionSchema }) //note output schema can be defined too
);
