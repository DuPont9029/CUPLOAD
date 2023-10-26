import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

const s3_client = new S3Client({
    endpoint: "https://s3.cubbit.eu",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: "eu-central-1",
});

const uploadDir = function(s3Path, bucketName) {

    function walkSync(currentDirPath, callback) {
        fs.readdirSync(currentDirPath).forEach(function (name) {
            var filePath = path.join(currentDirPath, name);
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                callback(filePath, stat);
            } else if (stat.isDirectory()) {
                walkSync(filePath, callback);
            }
        });
    }

    walkSync(s3Path, function(filePath, stat) {
        let bucketPath = filePath.substring(s3Path.length+1);
        let params = {Bucket: bucketName, Key: bucketPath, Body: fs.readFileSync(filePath)};

        s3_client.send(new PutObjectCommand(params))
        .then(() => console.log(`${bucketPath} uploaded successfully`))
        .catch(console.error);
    });
};

uploadDir('folder', 'bucket'); // replace './folderPath' with your directory
