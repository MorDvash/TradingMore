import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import commonMiddleware from '@libs/lambda';
import  { SESClient, SendEmailCommand }  from  "@aws-sdk/client-ses";
import schema from './schema';


const REGION = "eu-west-2"; //e.g. "us-east-1"
const sesClient = new SESClient({ region: REGION });

const sendEmail: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { name, message, subject } = event.body;

  const params = {
    Destination: {
      ToAddresses: [
        name,
      ],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: message,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: "tradingmoreweb@gmail.com",
  };

  try {
    const data = await sesClient.send(new SendEmailCommand(params));
    console.log("Success", data);
  } catch (err) {
    console.log("Error", err);
  }

  return formatJSONResponse({
    message: `Hello ${name}, welcome to the exciting Serverless world!`,
    event,
  });
};

export const main = commonMiddleware(sendEmail);
