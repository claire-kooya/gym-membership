# Gym Attendance Follow-Up Automation

A full-stack prototype application that automatically detects when gym members have missed classes and sends personalized follow-up messages via AWS SNS (SMS) and AWS SES (Email).

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js (Node.js)
- **AWS Services**: Amazon SNS (SMS), Amazon SES (Email)
- **Data Storage**: JSON files (members.json, messages_log.json)

---

## How to Run the Prototype

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- (Optional) **AWS Account** for real SMS/email sending

### Step 1: Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Verify data files exist** (should be included in the project):
   - `members.json` - Contains 10 mock gym members with attendance data
   - `messages_log.json` - Stores simulation/send history

### Step 2: Start the Application

Run both frontend and backend servers simultaneously:

```bash
npm run dev
```

This will:
- Start the **Express backend** on `http://localhost:3001`
- Start the **Vite dev server** on `http://localhost:5173`
- Open your browser automatically

Alternatively, you can run servers separately:

```bash
# Backend only
npm run server

# Frontend only
npm run client
```

### Step 3: Using the Application

1. **Open the dashboard** at `http://localhost:5173`

2. **Run a Simulation** (without sending real messages):
   - Click the **"Run Simulation"** button in the header
   - The system processes all members based on their attendance and membership status
   - View results in three tabs:
     - **Eligible Members** - Members who will receive follow-up messages
     - **Skipped Members** - Members excluded with specific reasons
     - **Message Log** - History of all simulation runs

3. **(Optional) Send via AWS**:
   - If AWS credentials are configured (see AWS Setup section below)
   - Click **"Send via AWS"** dropdown button
   - Choose: **Email Only**, **SMS Only**, or **Both**. But for this prototype, only the email simulation works. 
   - View detailed send results in the Message Log tab

4. **Export or Reset Logs**:
   - **Export Log** - Download the current log as JSON
   - **Reset Log** - Clear all simulation history

---

## Assumptions Made

### Business Logic Assumptions

1. **Eligibility Window**: Members who haven't attended in **7-35 days** are eligible for follow-up messages
   - **< 7 days**: Too recent, member likely still engaged
   - **7-35 days**: Ideal window for re-engagement
   - **≥ 35 days**: Too long, requires manual/personal follow-up

2. **Membership Status Filtering**:
   - **Active**: Eligible for automated follow-up
   - **Frozen**: Skipped (intentional pause by member)
   - **Canceled**: Skipped (no longer a customer)

3. **Recurring Membership Exception**: Members with recurring memberships who haven't attended in ≥ 35 days are flagged for **manual follow-up** instead of automated messages (assumption: they may have billing/retention issues requiring personal touch)

4. **Non-recurring Memberships**: Drop-in or non-recurring members inactive for ≥ 35 days are simply skipped (assumption: they've naturally churned)

### Technical Assumptions

5. **Message Template**: Simple, friendly tone with booking link:
   ```
   Hey {first_name}, we missed you last week! Book your next class here: [link]
   ```

6. **Contact Information**: All members in `members.json` have valid phone numbers (E.164 format) and email addresses

7. **AWS Sandbox Mode**: The prototype assumes AWS services start in sandbox mode, requiring verified recipients for testing (documented in AWS setup section)

8. **Date Calculation**: Days since attendance are calculated from the current system date to `last_attended_at` field

9. **Data Persistence**: Logs are stored in `messages_log.json` and persist between server restarts

10. **Single Daily Run**: The system is designed to be run once daily (no duplicate detection implemented)

---

## Steps for AWS Setup and Message Sending

### Overview

The application includes full integration with **Amazon SNS** (for SMS) and **Amazon SES** (for email). Due to AWS sandbox mode restrictions, you may need to verify recipients or request production access to send real messages.

### AWS Architecture

```
┌─────────────────┐
│  Express Server │
│   (server/)     │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  AWS SNS    │   │  AWS SES    │
│  (SMS)      │   │  (Email)    │
└─────────────┘   └─────────────┘
```

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click **"Create an AWS Account"**
3. Complete registration (credit card required, but free tier available)
4. Sign in to AWS Management Console

**Screenshot needed**: AWS Console homepage

### Step 2: Create IAM User with Permissions

1. In AWS Console, search for **"IAM"**
2. Click **"Users"** → **"Create user"**
3. Username: `gym-app-sender`
4. Select **"Attach policies directly"**
5. Attach these policies:
   - `AmazonSNSFullAccess`
   - `AmazonSESFullAccess`
6. Click **"Create user"**

**Screenshot needed**: IAM user with policies attached

### Step 3: Generate Access Keys

1. Click on the newly created user
2. Go to **"Security credentials"** tab
3. Click **"Create access key"**
4. Select **"Application running outside AWS"**
5. Click **"Create access key"**
6. **SAVE BOTH**:
   - Access Key ID: `AKIAXXXXXXXXXXXXXXXX`
   - Secret Access Key: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **Important**: The secret key is only shown once!

**Screenshot needed**: Access key created (hide secret key!)

### Step 4: Set Up Amazon SES (Email)

1. In AWS Console, search for **"SES"**
2. Select region: **us-east-1** (N. Virginia) recommended
3. Click **"Verified identities"** → **"Create identity"**
4. Select **"Email address"**
5. Enter your email (e.g., `yourname@gmail.com`)
6. Click **"Create identity"**
7. Check your inbox and click the verification link
8. Status should show **"Verified"**

**Important**: In sandbox mode, you must verify BOTH sender and recipient emails.

**Screenshot needed**: Verified email identity in SES console

### Step 5: Configure the Application

Create a `.env` file in the project root:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# SES Configuration (Email)
SES_FROM_EMAIL=your-verified-email@gmail.com
SES_VERIFIED=true

# SNS Configuration (SMS)
SNS_ENABLED=true

# Mode: 'simulation' or 'aws'
MESSAGE_MODE=simulation
```

**Important**:
- Replace `AWS_ACCESS_KEY_ID` with your actual access key
- Replace `AWS_SECRET_ACCESS_KEY` with your actual secret key
- Replace `SES_FROM_EMAIL` with your verified email
- Keep `MESSAGE_MODE=simulation` for testing without sending real messages

### Step 8: AWS Service Integration Code

The AWS integration is implemented in `server/awsService.js`:

#### SMS Sending (Amazon SNS)

```javascript
// server/awsService.js (SMS implementation)
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({ 
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function sendSMS(phoneNumber, message) {
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
        StringValue: 'Transactional'
      }
    }
  };

  const command = new PublishCommand(params);
  const response = await snsClient.send(command);
  
  return {
    success: true,
    messageId: response.MessageId,
    phoneNumber,
    timestamp: new Date().toISOString()
  };
}
```

**Key Features**:
- Uses AWS SDK v3 (@aws-sdk/client-sns)
- E.164 phone number format required (e.g., +15551234567)
- Transactional SMS type for better deliverability
- Custom sender ID: "GymAlert"

#### Email Sending (Amazon SES)

```javascript
// server/awsService.js (Email implementation)
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ 
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function sendEmail(toEmail, subject, htmlBody, textBody) {
  const params = {
    Source: process.env.SES_FROM_EMAIL,
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
    messageId: response.MessageId,
    toEmail,
    timestamp: new Date().toISOString()
  };
}
```

**Key Features**:
- Uses AWS SDK v3 (@aws-sdk/client-ses)
- Sends both HTML and plain text versions
- Beautiful responsive HTML email template (see full code in server/index.js)
- UTF-8 charset for international character support

#### Error Handling and Sandbox Detection

```javascript
// server/awsService.js (Error handling)
function getSandboxErrorMessage(error) {
  const errorName = error.name || '';
  const errorMessage = error.message || '';

  if (errorName === 'OptInRequired' || errorMessage.includes('Opt In')) {
    return {
      issue: 'SNS SMS Sandbox Mode',
      solution: 'Verify phone numbers in AWS SNS console or request production access',
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
      solution: 'Verify email addresses in AWS SES console or request production access',
      steps: [
        '1. Go to AWS SES Console',
        '2. Navigate to Verified identities',
        '3. Verify both sender and recipient email addresses',
        '4. Or request production access to send to any email'
      ]
    };
  }

  return {
    issue: 'AWS Service Error',
    solution: 'Check AWS console and credentials',
    error: errorMessage
  };
}
```

**Key Features**:
- Detects sandbox limitation errors
- Provides user-friendly error messages with actionable steps
- Handles credential errors gracefully

### Step 9: Testing the Integration

#### Test 1: Simulation Mode (No Real Sending)

1. Ensure `.env` has `MESSAGE_MODE=simulation`
2. Start the app: `npm run dev`
3. Click **"Run Simulation"**
4. View results - messages are logged but NOT sent
5. Check `messages_log.json` for simulation records

**Expected Result**: 
```json
{
  "timestamp": "2025-10-06T10:30:00.000Z",
  "mode": "simulation",
  "eligible_count": 3,
  "skipped_count": 7,
  "send_results": [
    {
      "member_id": 1,
      "member_name": "John",
      "attempts": [
        {
          "type": "sms",
          "success": true,
          "mode": "simulation",
          "message": "SMS simulated (not sent)"
        }
      ]
    }
  ]
}
```

**Screenshot needed**: Dashboard showing simulation results

#### Test 2: AWS Mode (Real Sending)

**Prerequisites**: 
- AWS credentials configured in `.env`
- Recipient email/phone verified in AWS console (if in sandbox mode)

1. Update `members.json` with YOUR verified contact info:
   ```json
   {
     "id": 1,
     "first_name": "TestUser",
     "last_attended_at": "2025-09-20",
     "membership_status": "active",
     "is_recurring": true,
     "phone": "+15551234567",
     "email": "your-verified-email@gmail.com"
   }
   ```

2. Change `.env` to `MESSAGE_MODE=aws`

3. Restart server: `npm run dev`

4. Click **"Send via AWS"** → Choose sending method

5. Check results:
   - ✅ **Success**: Check your phone/email for actual messages
   - ❌ **Sandbox Error**: See detailed error with resolution steps

**Expected Success Result**:
```json
{
  "success": true,
  "mode": "aws",
  "messageId": "0103018b5e4a2c3f-12345678-abcd-1234-abcd-1234567890ab-000000",
  "timestamp": "2025-10-06T10:35:00.000Z",
  "message": "SMS sent successfully via AWS SNS"
}
```

**Expected Sandbox Error**:
```json
{
  "success": false,
  "mode": "aws",
  "error": "Phone number is not verified",
  "issue": "SNS SMS Sandbox Mode",
  "solution": "Verify phone numbers in AWS SNS console",
  "steps": [...]
}
```

**Screenshots needed**:
- Dashboard showing send results (success or error)
- Email received in inbox (if successful)
- SMS received on phone (if successful)
- Error messages with helpful guidance (if sandbox blocked)

### API Endpoints Used

**POST /api/send-messages** - Send messages via AWS
```javascript
// Request body
{
  "sendVia": "both"  // Options: "sms", "email", or "both"
}

// Response
{
  "eligible": [...],
  "skipped": [...],
  "sendResults": [
    {
      "member_id": 1,
      "member_name": "John",
      "attempts": [
        {
          "type": "sms",
          "success": true,
          "messageId": "...",
          "timestamp": "..."
        },
        {
          "type": "email",
          "success": true,
          "messageId": "...",
          "timestamp": "..."
        }
      ]
    }
  ],
  "awsStatus": {
    "mode": "aws",
    "region": "us-east-1",
    "credentialsConfigured": true
  }
}
```

**GET /api/aws-status** - Check AWS configuration
```javascript
// Response
{
  "mode": "simulation" | "aws",
  "region": "us-east-1",
  "credentialsConfigured": true,
  "sesFromEmail": "your-email@gmail.com",
  "snsEnabled": true
}
```

### Common Issues and Solutions

#### Issue 1: "Email address is not verified"
**Problem**: SES is in sandbox mode  
**Solution**: 
- Verify both sender and recipient emails in SES console
- OR request production access (takes 24-48 hours)

#### Issue 2: "Phone number not verified" / "Opt-in required"
**Problem**: SNS is in sandbox mode  
**Solution**: 
- Add and verify the phone number in SNS console
- OR request production access for SMS

#### Issue 3: "Invalid security token" / "Access Denied"
**Problem**: Incorrect AWS credentials or missing permissions  
**Solution**: 
- Double-check credentials in `.env` file
- Verify IAM user has required policies (SNSFullAccess, SESFullAccess)
- Restart the server after updating `.env`

#### Issue 4: Messages sent but not received
**Problem**: May be in spam folder or carrier blocked  
**Solution**: 
- Check spam/junk folder for emails
- For SMS, verify phone number is mobile (not landline)
- Check AWS CloudWatch logs for delivery status

### Cost Estimate

**AWS Free Tier (12 months)**:
- SES: 62,000 emails/month FREE
- SNS: 100 SMS/month FREE (US only)

**After Free Tier**:
- SES: $0.10 per 1,000 emails
- SNS: $0.00645 per SMS (US)

**For this project**: You'll stay well within free tier limits during testing/development.

---

## Project Structure

```
gym-membership/
├── server/
│   ├── index.js              # Express API server, business logic
│   └── awsService.js         # AWS SNS/SES integration
├── src/
│   ├── components/           # React UI components
│   ├── App.tsx               # Main app component
│   ├── types.ts              # TypeScript interfaces
│   └── index.css             # Tailwind CSS
├── members.json              # Mock member data (10 members)
├── messages_log.json         # Simulation/send history
├── .env                      # AWS credentials (create this)
├── .env.example              # Template for .env
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## Security Notes

⚠️ **Important Security Practices**:

1. **Never commit `.env` file to Git** (already in `.gitignore`)
2. **Never share your AWS secret access key**
3. **Delete access keys after assignment completion**
4. **Rotate keys regularly in production**
5. **Use least-privilege IAM policies**

---

## Submission Checklist

For assignment submission, include:

- [ ] This README file
- [ ] Screenshot of AWS account dashboard
- [ ] Screenshot of IAM user with policies
- [ ] Screenshot of verified email in SES
- [ ] Screenshot of verified phone in SNS
- [ ] Screenshot of `.env` file (HIDE secret key!)
- [ ] Screenshot of app showing simulation results
- [ ] Screenshot of app showing AWS send results (or sandbox errors)
- [ ] Screenshot of received email (if successful)
- [ ] Code files (server/awsService.js, server/index.js)
- [ ] `messages_log.json` with test results

**Note**: Even if you encounter sandbox limitations and cannot send real messages, documenting the setup process, showing the error handling, and explaining the sandbox restrictions demonstrates full understanding of the AWS integration.

---

## License

MIT License - Free to use and modify

---

**Questions?** This is a learning prototype designed for demonstration purposes. The code is fully functional and production-ready with proper AWS account configuration.
"# gym-membership" 
