# ⚡ Quick Start Guide

## 1️⃣ Basic Setup (No AWS)

```bash
# Install dependencies
npm install

# Start the app
npm run dev

# Open browser to http://localhost:5173
```

That's it! The app will run in simulation mode (no real messages sent).

---

## 2️⃣ AWS Integration Setup

### Quick Steps:

1. **Create AWS Account** → https://aws.amazon.com/
2. **Create IAM User** with these policies:
   - `AmazonSNSFullAccess`
   - `AmazonSESFullAccess`
3. **Get Access Keys** from IAM console
4. **Verify Email** in SES console (for sending emails)
5. **Verify Phone** in SNS console (for sending SMS)
6. **Create `.env` file**:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_here
   SES_FROM_EMAIL=your-verified@email.com
   MESSAGE_MODE=aws
   ```
7. **Restart server**: `npm run dev`

📘 **Full guide**: See `AWS_SETUP_GUIDE.md`

---

## 3️⃣ Testing AWS (Sandbox Mode)

### For Email (SES):
1. Verify your email in SES console
2. Use that email in `members.json`
3. Click "Send via AWS" → "Email Only"
4. Check your inbox!

### For SMS (SNS):
1. Verify your phone number in SNS console
2. Use that number in `members.json` (format: `+1234567890`)
3. Click "Send via AWS" → "SMS Only"
4. Check your phone!

---

## 🚨 Common Issues

### "Email address is not verified"
- Go to SES console → Verified identities → Verify email
- Or request production access

### "Phone number not verified"
- Go to SNS console → Sandbox phone numbers → Verify number
- Or request production access

### "Invalid credentials"
- Check `.env` file for correct AWS keys
- Restart server after changing `.env`

---

## 📸 For Assignment Documentation

Take screenshots of:

1. ✅ AWS Console dashboard
2. ✅ IAM user with policies
3. ✅ Verified email in SES
4. ✅ Verified phone in SNS
5. ✅ `.env` file (hide secret key!)
6. ✅ App dashboard
7. ✅ Successful send (or sandbox error with explanation)
8. ✅ Logs showing results

Even if AWS blocks you (sandbox), documenting the setup process and understanding why shows competency!

---

## 💡 Tips

- **Start with simulation mode** (`MESSAGE_MODE=simulation`)
- Test email before SMS (easier to verify)
- Free tier covers all testing needs
- Production access takes 24-48 hours
- Delete AWS keys after assignment
