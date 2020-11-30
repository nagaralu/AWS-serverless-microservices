import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
  const now = new Date();
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString()
    },
    // note the following is only required for reserved variables like 'status'
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

  const result = await dynamodb.query(params).promise();
  return result.Items;
}
