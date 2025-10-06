import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';

dotenv.config();

// AWS Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const MESSAGE_MODE = process.env.MESSAGE_MODE || 'simulation';

// Initialize AWS clients
const snsClient = new SNSClient({ 
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const sesClient = new SESClient({ 
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

/**
 * Send SMS via Amazon SNS
 * @param {string} phoneNumber - Phone number in E.164 format (+1234567890)
 * @param {string} message - SMS message text
 * @returns {Promise<object>} - Result with success status and details
 */
export async function sendSMS(phoneNumber, message) {
  if (MESSAGE_MODE === 'simulation') {
    return {
      success: true,
      mode: 'simulation',
      message: 'SMS simulated (not sent)',
      phoneNumber,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'GymAlert'
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional' // or 'Promotional'
        }
      }
    };

    const command = new PublishCommand(params);
    const response = await snsClient.send(command);

    return {
      success: true,
      mode: 'aws',
      messageId: response.MessageId,
      phoneNumber,
      timestamp: new Date().toISOString(),
      message: 'SMS sent successfully via AWS SNS'
    };
  } catch (error) {
    console.error('SNS Error:', error);
    return {
      success: false,
      mode: 'aws',
      error: error.message,
      errorCode: error.name,
      phoneNumber,
      timestamp: new Date().toISOString(),
      details: getSandboxErrorMessage(error)
    };
  }
}

/**
 * Send Email via Amazon SES
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML email body
 * @param {string} textBody - Plain text email body
 * @returns {Promise<object>} - Result with success status and details
 */
export async function sendEmail(toEmail, subject, htmlBody, textBody) {
  if (MESSAGE_MODE === 'simulation') {
    return {
      success: true,
      mode: 'simulation',
      message: 'Email simulated (not sent)',
      toEmail,
      subject,
      timestamp: new Date().toISOString()
    };
  }

  const fromEmail = process.env.SES_FROM_EMAIL;
  if (!fromEmail) {
    return {
      success: false,
      mode: 'aws',
      error: 'SES_FROM_EMAIL not configured in .env file',
      toEmail,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const params = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    return {
      success: true,
      mode: 'aws',
      messageId: response.MessageId,
      toEmail,
      subject,
      timestamp: new Date().toISOString(),
      message: 'Email sent successfully via AWS SES'
    };
  } catch (error) {
    console.error('SES Error:', error);
    return {
      success: false,
      mode: 'aws',
      error: error.message,
      errorCode: error.name,
      toEmail,
      timestamp: new Date().toISOString(),
      details: getSandboxErrorMessage(error)
    };
  }
}

/**
 * Helper function to provide user-friendly error messages for AWS sandbox limitations
 */
function getSandboxErrorMessage(error) {
  const errorName = error.name || '';
  const errorMessage = error.message || '';

  if (errorName === 'OptInRequired' || errorMessage.includes('Opt In')) {
    return {
      issue: 'SNS SMS Sandbox Mode',
      solution: 'You need to verify phone numbers in AWS SNS console or request production access.',
      steps: [
        '1. Go to AWS SNS Console',
        '2. Navigate to Text messaging (SMS) > Sandbox destination phone numbers',
        '3. Add and verify the recipient phone number',
        '4. Or request production access to send to any number'
      ]
    };
  }

  if (errorName === 'MessageRejected' || errorMessage.includes('Email address is not verified')) {
    return {
      issue: 'SES Sandbox Mode',
      solution: 'You need to verify email addresses in AWS SES console or request production access.',
      steps: [
        '1. Go to AWS SES Console',
        '2. Navigate to Verified identities',
        '3. Verify both sender and recipient email addresses',
        '4. Or request production access to send to any email'
      ]
    };
  }

  if (errorName === 'InvalidClientTokenId' || errorMessage.includes('security token')) {
    return {
      issue: 'Invalid AWS Credentials',
      solution: 'Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file',
      steps: [
        '1. Go to AWS Console > IAM > Users > Security Credentials',
        '2. Create new access key if needed',
        '3. Update .env file with correct credentials',
        '4. Restart the server'
      ]
    };
  }

  return {
    issue: 'AWS Service Error',
    solution: 'Check AWS console and credentials',
    error: errorMessage
  };
}

/**
 * Get current AWS configuration status
 */
export function getAWSStatus() {
  return {
    mode: MESSAGE_MODE,
    region: AWS_REGION,
    credentialsConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    sesFromEmail: process.env.SES_FROM_EMAIL || 'Not configured',
    snsEnabled: process.env.SNS_ENABLED === 'true'
  };
}
