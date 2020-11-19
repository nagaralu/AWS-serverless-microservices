import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  try {
    const result = await dynamodb
      .scan({
        //note scan is not a good practice, use query instead
        TableName: process.env.AUCTIONS_TABLE_NAME
      })
      .promise();

    auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error); // this is for practice only, don't send internal server error info to users just send a simple message
  }
  return {
    statusCode: 200,
    body: JSON.stringify(auctions)
  };
}

export const handler = commonMiddleware(getAuctions);
