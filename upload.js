import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs'; // Import the file system module
import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
require('dotenv').config(); // use the require method

const s3_client = new S3Client({
    endpoint: "https://s3.cubbit.eu",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: "eu-central-1",
});

const filePath = './uploadfolder.js';
const fileName = filePath.split('/').pop();

( async () => {
    const fileStream = fs.createReadStream(filePath);

    await s3_client.send(new PutObjectCommand({
        Bucket: "animecdn",
        Key: fileName, // Use the extracted filename here
        Body: fileStream,
    }));

    console.log("Done");
})().catch(console.error);
