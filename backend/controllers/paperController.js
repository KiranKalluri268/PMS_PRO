const cloudinary = require('cloudinary').v2;
const {uploadFile, deleteResource} = require("../util/cloudinary");
const {GetCommand, PutCommand, UpdateCommand, DeleteCommand} = require('@aws-sdk/lib-dynamodb');
const { QueryCommand, DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

const PAPERS_TABLE = process.env.PAPERS_TABLE || "Papers";
const YEARS_TABLE = process.env.YEARS_TABLE || "Years";

// Upload a paper
exports.uploadPaper = async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

  try {
    const { paperLink, ...otherFields } = req.body; // Extracting all fields dynamically

    if (!req.file && !paperLink) {
      return res.status(400).json({ message: "Please provide either a PDF or a paper link." });
    }

    let pdfId = null;
    let downloadLink = null;

    if (req.file) {
      const uploadResponse = await uploadFile(req.file.buffer, { title: req.body.title || "Untitled" });
      pdfId = String(uploadResponse.public_id);
      downloadLink = uploadResponse.secure_url;
    }

    const paperId = pdfId || `paper-${Date.now()}`; // Unique Paper ID

    // Constructing the paper item dynamically
    const uploadedAt = new Date().toISOString();
    const paperItem = {
      facultyId: req.facultyId,
      PaperId: paperId, // Correct key for DynamoDB
      uploadedAt,
      ...otherFields, // Adds all received fields dynamically
      ...(paperLink ? { paperLink } : {}),
      ...(downloadLink ? { downloadLink } : {}),
    };

    console.log("New Paper Item:", paperItem);

    await dynamoDB.send(new PutCommand({
      TableName: PAPERS_TABLE,
      Item: paperItem,
    }));

    res.status(201).json({ message: "Paper uploaded successfully", paperId });
  } catch (error) {
    console.error("Error uploading paper:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a paper
exports.updatePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    const existingPaperResponse = await dynamoDB.send(
      new GetCommand({
        TableName: PAPERS_TABLE,
        Key: { paperId: id },
      })
    );

    if (!existingPaperResponse.Item) {
      return res.status(404).json({ message: "Paper not found." });
    }

    const existingPaper = existingPaperResponse.Item;

    let pdfId = existingPaper.pdfId;
    let downloadLink = existingPaper.downloadLink;

    if (req.file) {
      if (pdfId) await deleteResource(pdfId);
      const uploadResponse = await uploadFile(req.file.buffer, { title: updatedFields.title });
      pdfId = String(uploadResponse.public_id);
      downloadLink = uploadResponse.secure_url;
    }

    const updateFields = [];
    const updateValues = {};
    const expressionAttributeNames = {};

    for (const [key, value] of Object.entries(updatedFields)) {
      if (value) {
        const placeholder = `#${key}`;
        updateFields.push(`${placeholder} = :${key}`);
        updateValues[`:${key}`] = value;
        expressionAttributeNames[placeholder] = key;
      }
    }

    if (pdfId) {
      updateFields.push("#pdfId = :pdfId");
      updateValues[":pdfId"] = pdfId;
      expressionAttributeNames["#pdfId"] = "pdfId";
    }

    if (downloadLink) {
      updateFields.push("#downloadLink = :downloadLink");
      updateValues[":downloadLink"] = downloadLink;
      expressionAttributeNames["#downloadLink"] = "downloadLink";
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields provided for update." });
    }

    const updateCommand = new UpdateCommand({
      TableName: PAPERS_TABLE,
      Key: { paperId: id },
      UpdateExpression: `SET ${updateFields.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(updateValues),
      ReturnValues: "ALL_NEW",
    });

    const updatedPaperResponse = await dynamoDB.send(updateCommand);
    const updatedPaper = unmarshall(updatedPaperResponse.Attributes);

    res.status(200).json({ message: "Paper updated successfully", paper: updatedPaper });
  } catch (error) {
    console.error("Error updating paper:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a paper by ID
exports.getPaperById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await dynamoDB.send(
      new GetCommand({
        TableName: PAPERS_TABLE,
        Key: { paperId: id },
      })
    );

    if (!response.Item) {
      return res.status(404).json({ message: "Paper not found." });
    }

    const paper = unmarshall(response.Item);
    res.status(200).json(paper);
  } catch (error) {
    console.error("Error fetching paper by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getPapersByFaculty = async (req, res) => {
  const facultyId = req.params.id;
  const paperType = req.query.paperType;

  console.log("API HIT: /faculty/:id", facultyId, paperType);
  
  try {
    let queryParams = {
      TableName: PAPERS_TABLE,
      IndexName: "facultyId-index",
      KeyConditionExpression: "facultyId = :facultyId",
      ExpressionAttributeValues: marshall({
        ":facultyId": facultyId,
      }),
    };
  
    // ✅ Fix for reserved keyword "type"
    if (paperType) {
      queryParams.FilterExpression = "#type = :paperType";
      queryParams.ExpressionAttributeNames = { "#type": "type" };  // Alias for "type"
      queryParams.ExpressionAttributeValues = {
        ...queryParams.ExpressionAttributeValues,
        ":paperType": { S: paperType }  // Ensure correct format
      };
    }
  
    const response = await dynamoDB.send(new QueryCommand(queryParams));
  
    let papers = response.Items.map((item) => unmarshall(item));

    console.log("DynamoDB Response:", papers);

    if (papers.length === 0) {
      console.log("No papers found for selected type.");
      return res.status(200).json([]);
    }

    res.status(200).json(papers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a paper
exports.deletePaper = async (req, res) => {
  try {
    const { id } = req.params;

    const paperResponse = await dynamoDB.send(
      new GetCommand({
        TableName: PAPERS_TABLE,
        Key: { paperId: id },
      })
    );

    if (!paperResponse.Item) {
      return res.status(404).json({ message: "Paper not found." });
    }

    const paper = unmarshall(paperResponse.Item);

    if (paper.pdfId) {
      await deleteResource(paper.pdfId);
    }

    await dynamoDB.send(
      new DeleteCommand({
        TableName: PAPERS_TABLE,
        Key: { paperId: id },
      })
    );

    res.status(200).json({ message: "Paper deleted successfully." });
  } catch (error) {
    console.error("Error deleting paper:", error);
    res.status(500).json({ message: "Server error", error });
  }
};