const { dynamoDB } = require("../util/dynamodb");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

exports.getPapersByType = async (req, res) => {
  try {
    const { type, lastEvaluatedKey } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Paper type is required" });
    }

    console.log(`Fetching papers for type: ${type}`);

    const paperParams = {
      TableName: process.env.PAPERS_TABLE,
      IndexName: "paperType-index",
      KeyConditionExpression: "#type = :type",
      ExpressionAttributeNames: { "#type": "type" },
      ExpressionAttributeValues: { ":type": type },
      ScanIndexForward: false, // Latest papers first
      Limit: 10, // Ensure pagination works
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined, // Handle pagination
    };

    const paperResponse = await dynamoDB.send(new QueryCommand(paperParams));
    const papers = paperResponse.Items || [];

    console.log(`Papers retrieved for type ${type}:`, papers);

    res.status(200).json({
      success: true,
      type,
      papers,
      lastEvaluatedKey: paperResponse.LastEvaluatedKey || null, // Send pagination key
    });
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ message: "Error fetching papers" });
  }
};
