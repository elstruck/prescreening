const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Update CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // e.g., 'smtp.gmail.com'
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'admin@builtwithlovellc.com', // Your email
    pass: 'xwwt yudd ofsx igdo' // Your email password or app-specific password
  }
});

// Endpoint to handle test submission
app.post('/submit-test', async (req, res) => {
  try {
    const { name, answers } = req.body;

    let personalityScore = 0;
    const personalityAnswers = [];
    const jobsiteAnswers = [];

    answers.forEach((answer) => {
      if (answer.type === 'positive' || answer.type === 'negative') {
        personalityScore += answer.score;
        personalityAnswers.push({
          question: answer.question,
          score: answer.score,
          type: answer.type
        });
      } else if (answer.type === 'jobsite') {
        jobsiteAnswers.push({
          question: answer.question,
          choice: answer.choice
        });
      }
    });

    // Create email content
    const emailHtml = `
      <h1>Assessment Results for ${name}</h1>
      <h2>Personality Score: ${personalityScore}</h2>
      
      <h3>Personality Questions:</h3>
      <ul>
        ${personalityAnswers.map(answer => `
          <li>
            <strong>${answer.question}</strong> (${answer.type})<br>
            Score: ${answer.score}
          </li>
        `).join('')}
      </ul>
      
      <h3>Jobsite Questions:</h3>
      <ul>
        ${jobsiteAnswers.map(answer => `
          <li>
            <strong>${answer.question}</strong><br>
            Choice: ${answer.choice}
          </li>
        `).join('')}
      </ul>
    `;

    // Send email
    const mailOptions = {
      from: 'BWL Virtual Assessment <admin@builtwithlovellc.com>',
      to: 'admin@builtwithlovellc.com',
      subject: `Assessment Results for ${name}`,
      html: emailHtml
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error('Failed to send email');
    }

    res.json({ message: `Test submitted successfully for ${name}`, personalityScore });
  } catch (error) {
    console.error('Error in /submit-test:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
