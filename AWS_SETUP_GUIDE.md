# 📘 AWS Integration Setup Guide

This guide will walk you through setting up Amazon SNS (for SMS) and Amazon SES (for email) to actually send messages to gym members.

## 🎯 Overview

The application supports two modes:
- **Simulation Mode** (default): Messages are logged but not sent
- **AWS Mode**: Messages are actually sent via Amazon SNS and SES

---

## 📋 Prerequisites

- AWS Account (free tier eligible)
- Credit card (required for AWS, but free tier covers testing)
- Email address you can verify
- Phone number you can verify (for SMS testing)

---

## 🚀 Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click **"Create an AWS Account"**
3. Follow the registration process:
   - Enter email and account name
   - Provide contact information
   - Enter payment information (free tier available)
   - Verify your identity
   - Select the **"Free" support plan**
4. Sign in to the AWS Console

**Screenshot checkpoint**: You should see the AWS Management Console homepage

---

## 🔐 Step 2: Create IAM User and Access Keys

IAM (Identity and Access Management) provides secure access to AWS services.

### 2.1 Create IAM User

1. In AWS Console, search for **"IAM"** and open it
2. Click **"Users"** in the left sidebar
3. Click **"Create user"**
4. Enter username: `gym-app-sender`
5. Click **"Next"**
6. Select **"Attach policies directly"**
7. Search for and select these policies:
   - `AmazonSNSFullAccess` (for SMS)
   - `AmazonSESFullAccess` (for email)
8. Click **"Next"**, then **"Create user"**

### 2.2 Create Access Keys

1. Click on the user you just created
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"**, then **"Create access key"**
7. **IMPORTANT**: Copy both:
   - Access Key ID
   - Secret Access Key
   
   ⚠️ **Save these immediately! The secret key won't be shown again.**

8. Click **"Done"**

**Screenshot checkpoint**: Save your access keys securely

---

## 📧 Step 3: Set Up Amazon SES (Email Service)

Amazon SES starts in "sandbox mode" - you can only send emails to verified addresses.

### 3.1 Verify Your Email Address (Sender)

1. In AWS Console, search for **"SES"** (Simple Email Service)
2. Make sure you're in a supported region (top right):
   - **us-east-1** (N. Virginia) - Recommended
   - **us-west-2** (Oregon)
   - **eu-west-1** (Ireland)
3. In the left sidebar, click **"Verified identities"**
4. Click **"Create identity"**
5. Select **"Email address"**
6. Enter your email (e.g., `yourname@gmail.com`)
7. Click **"Create identity"**
8. Check your email inbox for verification email
9. Click the verification link in the email
10. Refresh the SES console - status should show "Verified"

### 3.2 Verify Recipient Email (Sandbox Testing)

Since SES starts in sandbox mode, also verify the recipient email:

1. Repeat the same steps to verify a test recipient email
2. This could be the same email or a different one

### 3.3 (Optional) Request Production Access

To send to any email address without verification:

1. In SES console, click **"Account dashboard"** in left sidebar
2. Click **"Request production access"** button
3. Fill out the form:
   - Mail type: **"Transactional"**
   - Website URL: `https://example.com` (or your gym's site)
   - Use case description: 
     ```
     Sending automated follow-up emails to gym members who haven't 
     attended classes in 7-35 days. This is transactional communication 
     to re-engage members with their fitness goals.
     ```
   - Compliance: Check the box confirming you follow AWS policies
4. Click **"Submit request"**
5. **Wait 24-48 hours** for AWS review

**Note**: For this assignment, sandbox mode is sufficient! Just document this step.

**Screenshot checkpoint**: 
- Screenshot of verified email identities
- Screenshot of sandbox status or production access request confirmation

---

## 📱 Step 4: Set Up Amazon SNS (SMS Service)

Amazon SNS also starts in "sandbox mode" for SMS.

### 4.1 Access SNS Console

1. In AWS Console, search for **"SNS"**
2. Make sure you're in the same region as SES (e.g., us-east-1)
3. In the left sidebar, click **"Text messaging (SMS)"**

### 4.2 Check SMS Sandbox Status

1. Scroll down to **"Sandbox destination phone numbers"**
2. You'll see that SNS is in sandbox mode

### 4.3 Add Verified Phone Number (Sandbox Testing)

1. Click **"Add phone number"**
2. Enter a phone number you own (must include country code)
   - Format: `+1234567890` (E.164 format)
   - Example: `+15551234567` for US number
3. Click **"Add phone number"**
4. You'll receive a verification code via SMS
5. Enter the verification code
6. Click **"Verify phone number"**

### 4.4 (Optional) Request Production Access for SMS

To send SMS to any phone number:

1. In SNS console, navigate to **"Text messaging (SMS)"**
2. Look for sandbox exit request option
3. Click **"Request production access"** or **"Exit sandbox"**
4. Fill out the form:
   - Use case: **"Transactional"**
   - Message volume: Low (< 100/day)
   - Description:
     ```
     Sending gym membership re-engagement notifications to members 
     who haven't attended classes recently. Low volume transactional 
     SMS only.
     ```
5. Submit and wait for approval (can take 24-48 hours)

**Note**: Sandbox mode is fine for testing! Document this step.

**Screenshot checkpoint**:
- Screenshot of verified phone number in SNS
- Screenshot showing sandbox status or production access request

---

## ⚙️ Step 5: Configure the Application

### 5.1 Create .env File

1. In your project root (`c:\Users\cmara\gym-membership`), create a file named `.env`
2. Copy the content from `.env.example`
3. Fill in your AWS credentials:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# SES Configuration (Email)
SES_FROM_EMAIL=yourname@gmail.com
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
- Set `AWS_REGION` to match where you verified your identities

### 5.2 Install AWS Dependencies

Open your terminal and run:

```bash
npm install
```

This will install the new AWS SDK packages.

### 5.3 Restart the Server

1. Stop the current server (Ctrl+C in terminal)
2. Restart:
   ```bash
   npm run dev
   ```

---

## 🧪 Step 6: Test the Integration

### 6.1 Test in Simulation Mode (Safe)

1. Keep `MESSAGE_MODE=simulation` in your `.env` file
2. Open the app at `http://localhost:5173`
3. The app will log messages without actually sending them
4. This is useful to verify everything works

### 6.2 Test with AWS (Actually Send Messages)

⚠️ **Warning**: This will attempt to send real SMS/emails!

1. Update `.env`:
   ```env
   MESSAGE_MODE=aws
   ```

2. Restart the server (Ctrl+C, then `npm run dev`)

3. Update `members.json` to use your verified contact info:
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

4. In the dashboard, click **"📤 Send via AWS"** button (we'll add this)

5. Check the results:
   - ✅ **Success**: You'll receive actual SMS and/or email
   - ❌ **Sandbox Error**: See error messages with helpful guidance

### 6.3 Understanding Results

The app will show detailed results including:

- **Success**: Message sent successfully
- **Sandbox Error**: Need to verify recipient or request production access
- **Credentials Error**: Check your AWS keys in `.env`
- **Permission Error**: Check IAM policies

---

## 🚨 Common Issues and Solutions

### Issue 1: "Email address is not verified"

**Problem**: SES is in sandbox mode

**Solution**: 
- Verify the recipient email in SES console
- OR request production access

**Screenshot**: Shows error and resolution steps

---

### Issue 2: "Phone number not verified" or "Opt-in required"

**Problem**: SNS is in sandbox mode

**Solution**:
- Add and verify the phone number in SNS console
- OR request production access for SMS

---

### Issue 3: "Invalid security token" or "Access Denied"

**Problem**: AWS credentials are incorrect or missing permissions

**Solution**:
- Double-check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env`
- Verify IAM user has `AmazonSNSFullAccess` and `AmazonSESFullAccess` policies
- Restart the server after updating `.env`

---

### Issue 4: "The security token included in the request is invalid"

**Problem**: Access keys might be incorrect or from wrong region

**Solution**:
- Regenerate access keys in IAM
- Ensure you're using the correct region in `.env`
- Make sure there are no extra spaces in the `.env` file

---

## 💰 Cost Estimate

### Free Tier (12 months)
- **SES**: 62,000 emails per month FREE
- **SNS**: 100 SMS per month FREE (US only)

### After Free Tier
- **SES**: $0.10 per 1,000 emails
- **SNS SMS**: $0.00645 per SMS (US)

**For this project**: You'll stay well within free tier limits.

---

## 📸 Documentation Checklist

For your assignment submission, include:

- [ ] Screenshot of AWS account dashboard
- [ ] Screenshot of IAM user with policies attached
- [ ] Screenshot of verified email in SES
- [ ] Screenshot of SES sandbox status or production access request
- [ ] Screenshot of verified phone number in SNS
- [ ] Screenshot of SNS sandbox status or production access request
- [ ] Screenshot of `.env` file (HIDE SECRET KEY!)
- [ ] Screenshot of successful test send or sandbox error
- [ ] Screenshot of app showing AWS integration results

---

## 🔒 Security Best Practices

1. **Never commit `.env` file to Git** (already in `.gitignore`)
2. **Never share your secret access key**
3. **Rotate access keys regularly**
4. **Use least-privilege IAM policies** (only the permissions needed)
5. **Delete access keys when done with the assignment**

---

## 🎓 Assignment Submission Notes

Since you may encounter sandbox limitations, document:

1. ✅ **What I did**: Step-by-step process with screenshots
2. ✅ **Code changes**: Show AWS integration code
3. ✅ **Test results**: 
   - If successful: Show sent messages
   - If sandbox blocked: Show error messages and explain why
4. ✅ **Production request**: Screenshot of production access request
5. ✅ **Learnings**: What you learned about AWS services

**Even if you can't send real messages due to sandbox limits, demonstrating the setup and understanding the process shows competency.**

---

## 📚 Additional Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [E.164 Phone Format](https://en.wikipedia.org/wiki/E.164)

---

## ✅ Quick Setup Checklist

- [ ] Create AWS account
- [ ] Create IAM user with SNS and SES permissions
- [ ] Generate access keys
- [ ] Verify sender email in SES
- [ ] Verify test recipient email in SES
- [ ] Verify test phone number in SNS
- [ ] Create `.env` file with credentials
- [ ] Run `npm install`
- [ ] Test in simulation mode
- [ ] Test with AWS mode (if verification complete)
- [ ] Document all steps with screenshots
- [ ] (Optional) Request production access

---

**Need help?** Check the error messages - they include helpful guidance on what to do next!
