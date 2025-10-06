import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendSMS, sendEmail, getAWSStatus } from './awsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read JSON files
const readJSON = (filename) => {
  const filePath = path.join(__dirname, '..', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Helper function to write JSON files
const writeJSON = (filename, data) => {
  const filePath = path.join(__dirname, '..', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Calculate days since last attendance
const daysSinceAttendance = (lastAttendedAt) => {
  const lastDate = new Date(lastAttendedAt);
  const today = new Date();
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Generate personalized message for SMS
const generateMessage = (member, daysSince) => {
  return `Hey ${member.first_name}, we missed you last week! Book your next class here: http://localhost:5173?action=book`;
};

// API Routes

// GET /api/aws-status - Get AWS configuration status
app.get('/api/aws-status', (req, res) => {
  try {
    const status = getAWSStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get AWS status' });
  }
});

// GET /api/members - Returns all members
app.get('/api/members', (req, res) => {
  try {
    const members = readJSON('members.json');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read members data' });
  }
});

// POST /api/simulate - Simulate follow-up messages (no AWS sending)
app.post('/api/simulate', async (req, res) => {
  try {
    const members = readJSON('members.json');
    const eligible = [];
    const skipped = [];

    members.forEach((member) => {
      const daysSince = daysSinceAttendance(member.last_attended_at);
      
      // Check if membership is frozen or canceled
      if (member.membership_status === 'frozen') {
        skipped.push({
          ...member,
          skip_reason: 'Membership is frozen',
          days_since_attendance: daysSince
        });
        return;
      }

      if (member.membership_status === 'canceled') {
        skipped.push({
          ...member,
          skip_reason: 'Membership is canceled',
          days_since_attendance: daysSince
        });
        return;
      }

      // Check if >35 days and recurring (manual follow-up needed)
      if (daysSince >= 35 && member.is_recurring) {
        skipped.push({
          ...member,
          skip_reason: 'Manual follow-up needed (>35 days, recurring)',
          days_since_attendance: daysSince
        });
        return;
      }

      // Check if eligible (7-35 days, active)
      if (daysSince >= 7 && daysSince < 35 && member.membership_status === 'active') {
        eligible.push({
          ...member,
          days_since_attendance: daysSince,
          message: generateMessage(member)
        });
      } else {
        // Too recent (<7 days) or too old (>=35 days and not recurring)
        let reason = '';
        if (daysSince < 7) {
          reason = 'Attended recently (< 7 days)';
        } else {
          reason = 'Inactive for too long (>= 35 days)';
        }
        skipped.push({
          ...member,
          skip_reason: reason,
          days_since_attendance: daysSince
        });
      }
    });

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      eligible_count: eligible.length,
      skipped_count: skipped.length,
      eligible_members: eligible.map(m => ({ id: m.id, name: m.first_name })),
      skipped_members: skipped.map(m => ({ id: m.id, name: m.first_name, reason: m.skip_reason }))
    };

    // Append to log file
    const logs = readJSON('messages_log.json');
    logs.push(logEntry);
    writeJSON('messages_log.json', logs);

    res.json({
      eligible,
      skipped,
      log: logEntry
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate messages' });
  }
});

// POST /api/send-messages - Actually send messages via AWS
app.post('/api/send-messages', async (req, res) => {
  try {
    const { sendVia = 'both' } = req.body; // 'sms', 'email', or 'both'
    
    const members = readJSON('members.json');
    const eligible = [];
    const skipped = [];
    const sendResults = [];

    // First, determine eligible members (same logic as simulate)
    members.forEach((member) => {
      const daysSince = daysSinceAttendance(member.last_attended_at);
      
      if (member.membership_status === 'frozen') {
        skipped.push({
          ...member,
          skip_reason: 'Membership is frozen',
          days_since_attendance: daysSince
        });
        return;
      }

      if (member.membership_status === 'canceled') {
        skipped.push({
          ...member,
          skip_reason: 'Membership is canceled',
          days_since_attendance: daysSince
        });
        return;
      }

      if (daysSince >= 35 && member.is_recurring) {
        skipped.push({
          ...member,
          skip_reason: 'Manual follow-up needed (>35 days, recurring)',
          days_since_attendance: daysSince
        });
        return;
      }

      if (daysSince >= 7 && daysSince < 35 && member.membership_status === 'active') {
        eligible.push({
          ...member,
          days_since_attendance: daysSince,
          message: generateMessage(member)
        });
      } else {
        let reason = '';
        if (daysSince < 7) {
          reason = 'Attended recently (< 7 days)';
        } else {
          reason = 'Inactive for too long (>= 35 days)';
        }
        skipped.push({
          ...member,
          skip_reason: reason,
          days_since_attendance: daysSince
        });
      }
    });

    // Now attempt to send messages via AWS for eligible members
    for (const member of eligible) {
      const result = {
        member_id: member.id,
        member_name: member.first_name,
        attempts: []
      };

      // Send SMS via SNS
      if (sendVia === 'sms' || sendVia === 'both') {
        const smsResult = await sendSMS(member.phone, member.message);
        result.attempts.push({
          type: 'sms',
          ...smsResult
        });
      }

      // Send Email via SES
      if (sendVia === 'email' || sendVia === 'both') {
        const emailSubject = 'We Miss You at the Gym!';
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
                      <!-- Main Content -->
                      <tr>
                        <td style="padding: 60px 50px;">
                          <!-- Greeting -->
                          <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 600; color: #60a5fa; line-height: 1.3;">
                            Hey ${member.first_name}!
                          </h1>
                          
                          <!-- Body Text -->
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                            We noticed you haven't been to the gym in a while (${member.days_since_attendance} days). We miss you!
                          </p>
                          
                          <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                            Book your next class and get back to crushing your fitness goals!
                          </p>
                          
                          <!-- CTA Button -->
                          <table role="presentation" style="margin: 0; border-collapse: collapse;">
                            <tr>
                              <td style="border-radius: 6px; background-color: #3b82f6;">
                                <a href="http://localhost:5173?action=book" 
                                   target="_blank"
                                   style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                                  Book Your Class
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Sign Off -->
                          <p style="margin: 40px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                            See you soon!<br>
                            <span style="color: #d4a574;">Your Gym Team</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `;
        const emailText = `Hey ${member.first_name}! We noticed you haven't been to the gym in ${member.days_since_attendance} days. We miss you! Book your next class here: http://localhost:5173?action=book`;
        
        const emailResult = await sendEmail(member.email, emailSubject, emailHtml, emailText);
        result.attempts.push({
          type: 'email',
          ...emailResult
        });
      }

      sendResults.push(result);
    }

    // Create detailed log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      mode: getAWSStatus().mode,
      eligible_count: eligible.length,
      skipped_count: skipped.length,
      send_via: sendVia,
      eligible_members: eligible.map(m => ({ id: m.id, name: m.first_name })),
      skipped_members: skipped.map(m => ({ id: m.id, name: m.first_name, reason: m.skip_reason })),
      send_results: sendResults
    };

    // Append to log file
    const logs = readJSON('messages_log.json');
    logs.push(logEntry);
    writeJSON('messages_log.json', logs);

    res.json({
      eligible,
      skipped,
      sendResults,
      log: logEntry,
      awsStatus: getAWSStatus()
    });
  } catch (error) {
    console.error('Send messages error:', error);
    res.status(500).json({ error: 'Failed to send messages', details: error.message });
  }
});

// GET /api/logs - Get all logs
app.get('/api/logs', (req, res) => {
  try {
    const logs = readJSON('messages_log.json');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// DELETE /api/logs - Clear all logs
app.delete('/api/logs', (req, res) => {
  try {
    writeJSON('messages_log.json', []);
    res.json({ message: 'Logs cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// POST /api/send-email - Send individual email via AWS SES
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, message, firstName, daysSince } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: to, subject, message' 
      });
    }
    
    // Use the beautiful dark template (same as /api/send-messages)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 60px 50px;">
                      <!-- Greeting -->
                      <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 600; color: #60a5fa; line-height: 1.3;">
                        Hey ${firstName || 'there'}!
                      </h1>
                      
                      <!-- Body Text -->
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                        We noticed you haven't been to the gym in a while${daysSince ? ` (${daysSince} days)` : ''}. We miss you!
                      </p>
                      
                      <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                        Book your next class and get back to crushing your fitness goals!
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="margin: 0; border-collapse: collapse;">
                        <tr>
                          <td style="border-radius: 6px; background-color: #3b82f6;">
                            <a href="http://localhost:5173?action=book" 
                               target="_blank"
                               style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                              Book Your Class
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Sign Off -->
                      <p style="margin: 40px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                        See you soon!<br>
                        <span style="color: #d4a574;">Your Gym Team</span>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    
    const emailText = `Hey ${firstName || 'there'}! We noticed you haven't been to the gym${daysSince ? ` in ${daysSince} days` : ''}. We miss you! Book your next class here: http://localhost:5173?action=book`;
    
    const emailResult = await sendEmail(to, subject, emailHtml, emailText);
    
    res.json(emailResult);
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
