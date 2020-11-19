import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  let auction;
  const { id } = event.pathParameters;

  try {
    // note the primary partition key in the DynamoDB Table is by 'id'
    const result = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id }
      })
      .promise();
    auction = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  // error handling if auction is not found
  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" is not found!`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction)
  };
}

export const handler = middy(getAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
