# 📋 Assignment Checklist - AWS Integration

## ✅ What to Submit

### 1. Code Files
- [x] Full project code (already done!)
- [x] `.env.example` file (template for AWS config)
- [x] AWS integration code (`server/awsService.js`)
- [x] Updated frontend with "Send via AWS" button

### 2. Documentation

- [ ] **AWS Account Setup**
  - Screenshot of AWS console homepage
  - Confirmation email or account ID

- [ ] **IAM User Creation**
  - Screenshot of IAM user with name `gym-app-sender`
  - Screenshot showing attached policies:
    - `AmazonSNSFullAccess`
    - `AmazonSESFullAccess`
  - Screenshot of access key creation (HIDE SECRET KEY)

- [ ] **Amazon SES Setup (Email)**
  - Screenshot of SES console
  - Screenshot of verified email address
  - Screenshot showing sandbox status
  - (Optional) Screenshot of production access request

- [ ] **Amazon SNS Setup (SMS)**
  - Screenshot of SNS console
  - Screenshot of verified phone number
  - Screenshot showing sandbox destination
  - (Optional) Screenshot of production access request

- [ ] **Application Configuration**
  - Screenshot of `.env` file with AWS credentials (BLUR/HIDE SECRET KEY!)
  - Screenshot showing `package.json` with AWS SDK packages

- [ ] **Testing Results**
  - **If successful**: Screenshot of received email/SMS
  - **If sandbox blocked**: Screenshot of error message + explanation
  - Screenshot of app dashboard showing AWS results
  - Screenshot of logs tab showing send attempts

### 3. Written Explanation

Create a document (Word/PDF) with:

#### Section 1: What I Did
- Step-by-step process you followed
- Reference the screenshots
- Explain each AWS service used

#### Section 2: Code Changes
- Explain `server/awsService.js` functions
- Show how SNS sends SMS
- Show how SES sends email
- Explain error handling for sandbox mode

#### Section 3: Results
- What worked?
- What didn't work (if anything)?
- Sandbox limitations encountered?
- Production access requested?

#### Section 4: What I Learned
- Understanding of AWS SNS vs SES
- IAM permissions and security
- Sandbox mode vs production
- E.164 phone format
- Email verification process

---

## 📸 Screenshot Checklist

### AWS Console Screens
- [ ] AWS account dashboard
- [ ] IAM users list
- [ ] IAM user details showing policies
- [ ] Access key creation screen
- [ ] SES verified identities
- [ ] SES sandbox status
- [ ] SNS text messaging (SMS) console
- [ ] SNS verified phone numbers

### Application Screens
- [ ] `.env` file (REDACT SECRET KEY)
- [ ] `package.json` showing AWS SDK dependencies
- [ ] Terminal showing `npm install` with AWS packages
- [ ] App dashboard with "Send via AWS" button
- [ ] Clicking "Send via AWS" dropdown
- [ ] Confirmation dialog before sending
- [ ] Results showing in logs tab
- [ ] Success or error messages

### Results
- [ ] If email sent: Screenshot of inbox
- [ ] If SMS sent: Screenshot of phone
- [ ] If blocked: Screenshot of error with explanation
- [ ] Logs showing attempt details

---

## 💬 If You Encounter Sandbox Limitations

**This is EXPECTED and OKAY!**

Document it like this:

### Example Write-Up:

> **AWS Sandbox Limitations Encountered**
> 
> When attempting to send messages via AWS, I encountered sandbox mode restrictions:
> 
> **For SES (Email):**
> - Status: Sandbox mode
> - Issue: Can only send to verified email addresses
> - What I did: Verified my personal email address
> - Result: Successfully sent test email to my verified address
> - Screenshot: [Show verified email and received message]
> 
> **For SNS (SMS):**
> - Status: Sandbox mode  
> - Issue: Can only send to verified phone numbers
> - What I did: Verified my phone number in SNS console
> - Result: Successfully sent test SMS to my verified number
> - Screenshot: [Show verified number and received SMS]
> 
> **Production Access Request:**
> - Submitted request for production access
> - Reason: To send to any email/phone without verification
> - Status: Pending (requires 24-48 hour review)
> - Screenshot: [Show request confirmation]
> 
> **Code Implementation:**
> Even though sandbox limits testing, my code is production-ready:
> - Error handling for sandbox restrictions
> - Clear error messages explaining what to do
> - Support for both verified (sandbox) and unverified (production) sending
> 
> **Learning Outcome:**
> I now understand that AWS uses sandbox mode to prevent spam and requires verification before allowing mass sending. This is a security best practice that protects users.

---

## 🎯 Grading Criteria Met

✅ **AWS Account Created** - Screenshots prove account setup

✅ **AWS Services Configured** - SES and SNS properly set up

✅ **Code Implementation** - Full integration with error handling

✅ **Testing Attempted** - Documented send attempts

✅ **Understanding Demonstrated** - Explanation shows comprehension

✅ **Sandbox Limitations Documented** - Professional handling of constraints

---

## 🔒 Security Notes

**Before submitting:**
- [ ] Redact `AWS_SECRET_ACCESS_KEY` from all screenshots
- [ ] Blur sensitive account numbers if visible
- [ ] Don't share access keys publicly
- [ ] After assignment, delete or rotate AWS keys

---

## 📤 Submission Package

Create a folder with:

```
Gym_Membership_AWS_Assignment/
├── code/
│   └── [all project files]
├── screenshots/
│   ├── 01_aws_account.png
│   ├── 02_iam_user.png
│   ├── 03_ses_verification.png
│   ├── 04_sns_verification.png
│   ├── 05_env_config.png
│   ├── 06_app_dashboard.png
│   ├── 07_send_results.png
│   └── 08_logs.png
├── documentation.pdf
└── README.txt
```

Zip it up and submit!

---

**Good luck! You've got this! 🚀**
