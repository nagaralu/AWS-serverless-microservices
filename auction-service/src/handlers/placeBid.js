import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';
import validator from '@middy/validator';
import placeBidSchema from '../lib/schemas/placeBidSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  // email of the bidder or the user who placed the bid
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id); // note it also does error handling: returns 404 if auction did not exist

  // Error handling - Bid Identity Validation
  if (email === auction.seller) {
    throw new createError.Forbidden('You cannot bid on your own auction');
  }

  //  Error handling - Avoiding Double Bidding
  if (email === auction.highestBid.bidder) {
    throw new createError.Forbidden('You are already the highest bidder');
  }
  // Error handling - Auction Status Validation
  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden('You cannot bid on closed auctions!');
  }

  // Error handling - Bid Amount Validation
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
  }

  // DynamoDB Update:
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id }, //update the auction that has this id using Key
    // highest bid object with amount property will be set with this bid
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email
    },
    ReturnValues: 'ALL_NEW'
  };

  let updatedAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
}

export const handler = commonMiddleware(placeBid).use(validator({ inputSchema: placeBidSchema }));
