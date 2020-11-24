import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// defining this getAuctionById function so it can be used in other functions like update
export async function getAuctionById(id) {
  let auction;

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

  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction)
  };
}

export const handler = commonMiddleware(getAuction);
