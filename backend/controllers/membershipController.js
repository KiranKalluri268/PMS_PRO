const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient, PutItemCommand, QueryCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const MEMBERSHIP_TABLE = process.env.MEMBERSHIP_TABLE;

// Function to get Indian Standard Time (IST)
const getISTTime = () => {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

// Register Membership
exports.registerMembership = async (req, res) => {
  try {
    const { name, membershipBody, membershipType, customMembershipType, membershipYear, expiryDate } = req.body;
    const userId = req.facultyId; // Get userId from request (assuming middleware)
    console.log("recieved at backend",req.body)
    console.log("recieved at backend",userId)

    if (!userId || !name || !membershipBody || !membershipType || !membershipYear) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    if (!userId) {
      return res.status(400).json({ message: "Login Again." });
    }

    const finalExpiryDate = membershipType === "Lifetime" ? "N/A" : expiryDate;
    const finalMembershipType = membershipType === "Custom" ? customMembershipType : membershipType;
    const membershipId = uuidv4();
    const lastUpdated = getISTTime();

    // Save membership details in DynamoDB
    const params = {
      TableName: MEMBERSHIP_TABLE,
      Item: {
        membershipId: { S: membershipId },
        userId: { S: userId }, // Store userId
        name: { S: name },
        membershipBody: { S: membershipBody },
        membershipType: { S: finalMembershipType },
        membershipYear: { N: membershipYear.toString() },
        expiryDate: { S: finalExpiryDate },
        createdAt: { S: lastUpdated },
        lastUpdated: { S: lastUpdated },
      },
    };

    await dynamoDB.send(new PutItemCommand(params));
    res.status(201).json({ message: "Membership registered successfully!", membershipId });
  } catch (error) {
    console.error("Error registering membership:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get memberships for a specific user
exports.getMemberships = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const params = {
      TableName: MEMBERSHIP_TABLE,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": { S: userId } },
    };

    const data = await dynamoDB.send(new ScanCommand(params));
    const memberships = data.Items ? data.Items.map((item) => unmarshall(item)) : [];

    res.status(200).json(memberships);
  } catch (error) {
    console.error("Error fetching memberships:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get membership by ID
exports.getMembershipById = async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      TableName: MEMBERSHIP_TABLE,
      KeyConditionExpression: "membershipId = :id",
      ExpressionAttributeValues: { ":id": { S: id } },
    };

    const data = await dynamoDB.send(new QueryCommand(params));

    if (!data.Items || data.Items.length === 0) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res.status(200).json(unmarshall(data.Items[0]));
  } catch (error) {
    console.error("Error fetching membership:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};