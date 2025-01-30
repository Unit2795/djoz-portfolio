const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;
const maxRequestsPerMonth = process.env.MONTHLY_LIMIT;

exports.handler = async (event) => {
	console.time();
	try {
		const {Item} = await dynamo.send(
			new GetCommand({
				TableName: tableName,
				Key: {
					id: 1
				}
			})
		);
		console.timeEnd();

		const currentMonth = new Date().getUTCMonth();

		// If user has exceeded 10 requests this month, deny access
		if(Item?.count >= maxRequestsPerMonth && Item?.month === currentMonth) {
			console.timeEnd();
			console.error("Exceeded max requests");
			return { isAuthorized: false };
		}

		// If month has changed, reset count to 1
		const newCount = Item?.month === currentMonth ? Item.count + 1 : 1;
		await dynamo.send(
			new UpdateCommand({
				TableName: tableName,
				Key: {
					id: 1
				},
				UpdateExpression: `SET #month = :currentMonth, #count = :newCount`,
				ExpressionAttributeValues: {
					":currentMonth": currentMonth,
					":newCount": newCount
				},
				ExpressionAttributeNames: {
					"#count": "count",
					"#month": "month"
				},
			})
		);

		console.timeEnd();
		return { isAuthorized: true };
	} catch (error) {
		console.timeEnd();
		console.error(error);
		return { isAuthorized: false };
	}
};