import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import ProgressBar from 'progress';
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
    maxRetries: 3, // Maximum number of times to retry failed requests
    httpOptions: {
        timeout: 300000 // Timeout in milliseconds (5 minutes)
    }
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
        let fileStream = fs.createReadStream(filePath);
        let params = {Bucket: bucketName, Key: bucketPath, Body: fileStream};

        let bar = new ProgressBar('Uploading [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: stat.size
        });

        fileStream.on('data', function(chunk) {
            bar.tick(chunk.length);
        });

        s3_client.send(new PutObjectCommand(params))
        .then(() => console.log(`\n${bucketPath} uploaded successfully`))
        .catch(console.error);
    });
};

uploadDir('/home/ichigaya-9029/Scrivania/temporaryf', 'dupont0cell'); // replace './folderPath' with your directory





// aws s3 --endpoint https://s3.cubbit.eu cp /path/to/NEFFEX WIEN/VID_20230923_212742.mp4 s3://dupont0cell/NEFFEX WIEN/VID_20230923_212742.mp4 --expected-size 11258574739

// aws s3 cp "/home/ichigaya-9029/Cubbit/Photos/Backup pixel/filename.zip" "s3://dupont0cell/filename.zip" --endpoint-url https://s3.cubbit.eu
