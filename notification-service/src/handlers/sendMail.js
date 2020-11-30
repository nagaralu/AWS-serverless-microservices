import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'us-east-2' });

async function sendMail(event, context) {
  // from SQS
  const record = event.Records[0];
  console.log('record processing:', record);

  const email = JSON.parse(record.body); //note objects are stringified in SQS
  const { subject, body, recipient } = email;

  const params = {
    Source: 'rnsm25@gmail.com',
    Destination: {
      ToAddresses: [recipient]
    },
    Message: {
      Body: {
        Text: {
          Data: body
        }
      },
      Subject: {
        Data: subject
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendMail;
