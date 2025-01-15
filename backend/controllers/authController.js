const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { addItem } = require("../util/dynamodb");  // Import the addItem function
const dynamoDB = require("../util/dynamodb").dynamoDB;

//console.log("access key",process.env.AWS_ACCESS_KEY_ID);
//console.log("secret key",process.env.AWS_SECRET_ACCESS_KEY);

const FACULTY_TABLE = process.env.FACULTY_TABLE || "Faculty";
const BATCHES_TABLE = process.env.BATCHES_TABLE || "Batches";
const VERIFICATION_TOKENS_TABLE = process.env.VERIFICATION_TOKENS_TABLE || "FacultyVerificationTokens";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'certificatesmanagement.verify@gmail.com',
    pass: 'ztyz ojtk wfvm asgj',
  },
});

// Register Function
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const checkEmailParams = {
      TableName: FACULTY_TABLE,
      IndexName: 'email-index', // GSI for email
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
    };
    const emailResult = await dynamoDB.send(new QueryCommand(checkEmailParams));

    if (emailResult.Items && emailResult.Items.length > 0) {
      return res.status(400).send({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const userId = uuidv4();
    const newUser = {
      userId,
      name,
      email,
      password: hashedPassword,
      role: "faculty",
      isVerified: false,
    };
    await addItem(FACULTY_TABLE, newUser);  // Use addItem function

    // Create email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const verificationToken = {
      token,
      userId,
      expiresAt: expiresAt.toISOString(),
      isUsed: false,
    };
    await addItem(VERIFICATION_TOKENS_TABLE, verificationToken);  // Use addItem function

    // Send verification email
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify your email",
      html: `<p>Hello ${name},</p>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${verificationUrl}">${verificationUrl}</a>`,
    });

    res.status(201).send({ message: "Registration successful! Please verify your email." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({ message: "Error during registration", error });
  }
};

// Verify Email Function
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const tokenParams = {
      TableName: VERIFICATION_TOKENS_TABLE,
      Key: marshall({ token }),
    };
    const tokenData = await dynamoDB.send(new GetItemCommand(tokenParams));
    if (!tokenData.Item) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    const { userId, expiresAt, isUsed } = unmarshall(tokenData.Item);

    // Check if token is used
    if (isUsed) {
      return res.status(400).send({ message: "This email has already been verified." });
    }

    // Check if token is expired
    if (new Date() > new Date(expiresAt)) {
      return res.status(400).send({ message: "Verification link has expired." });
    }

    // Mark token as used
    const updateTokenParams = {
      TableName: VERIFICATION_TOKENS_TABLE,
      Key: marshall({ token }),
      UpdateExpression: "SET isUsed = :isUsed",
      ExpressionAttributeValues: marshall({
        ":isUsed": true,
      }),
    };
    await dynamoDB.send(new UpdateItemCommand(updateTokenParams));

    const userParams = {
      TableName: FACULTY_TABLE,
      Key: marshall({ userId }),
    };
    const userData = await dynamoDB.send(new GetItemCommand(userParams));
    if (!userData.Item) {
      return res.status(404).send({ message: "User not found" });
    }

    // Mark user as verified
    const updateUserParams = {
      TableName: FACULTY_TABLE,
      Key: marshall({ userId }),
      UpdateExpression: "SET isVerified = :isVerified",
      ExpressionAttributeValues: marshall({
        ":isVerified": true,
      }),
    };
    await dynamoDB.send(new UpdateItemCommand(updateUserParams));

    res.send({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).send({ message: "Email verification failed", error });
  }
};

// Login Function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Roll number and password are required" });
    }

    const userParams = {
      TableName: FACULTY_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: marshall({
        ':email': email,
      }),
      //ProjectionExpression: "userId, name, role, isVerified",
    };
    const userData = await dynamoDB.send(new QueryCommand(userParams));

    if (userData.Items.length === 0) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const user = unmarshall(userData.Items[0]);
    console.log("User object retrieved from DynamoDB:", user);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).send({ message: "Please verify your email before logging in." });
    }

    const token = jwt.sign(
      { userId: user.userId,useremail: user.email, userName: user.name, userRole: user.role },
      "secret_key_of_cms",
      { expiresIn: "1h" }
    );

    const decodedToken = jwt.decode(token); // Debugging to check token payload
    console.log("Decoded token in login:", decodedToken);

    res.status(200).send({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "Login failed due to server error", error });
  }
};