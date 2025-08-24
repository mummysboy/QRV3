import AWS from 'aws-sdk';
import Busboy from 'busboy';
import { v4 as uuidv4 } from 'uuid';
const s3 = new AWS.S3();
const BUCKET = process.env.BUCKET_NAME;
export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
    try {
        const contentType = event.headers['content-type'] || event.headers['Content-Type'];
        if (!contentType.startsWith('multipart/form-data')) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
            };
        }
        const result = await parseForm(event, contentType);
        if (!result.logo || !result.businessName) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: 'Missing logo or businessName' }),
            };
        }
        const fileName = `logos/${String(result.businessName).replace(/[^a-zA-Z0-9]/g, '-')}-${uuidv4()}.png`;
        if (!BUCKET)
            throw new Error('BUCKET_NAME environment variable is not set');
        await s3.putObject({
            Bucket: BUCKET,
            Key: fileName,
            Body: result.logo,
            ContentType: typeof result.logoType === 'string' ? result.logoType : 'image/png',
            ACL: 'public-read',
            CacheControl: 'public, max-age=31536000',
        }).promise();
        const logoUrl = `https://${BUCKET}.s3.amazonaws.com/${fileName}`;
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ logoUrl }),
        };
    }
    catch (err) {
        console.error('Upload error:', err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: 'Failed to upload logo' }),
        };
    }
};
function parseForm(event, contentType) {
    return new Promise((resolve, reject) => {
        // @ts-expect-error: Busboy constructor type mismatch workaround
        const busboy = new Busboy({ headers: { 'content-type': contentType } });
        const result = {};
        let fileBuffer = Buffer.alloc(0);
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const buffers = [];
            file.on('data', (data) => buffers.push(data));
            file.on('end', () => {
                fileBuffer = Buffer.concat(buffers);
                result.logo = fileBuffer;
                result.logoType = mimetype;
            });
        });
        busboy.on('field', (fieldname, value) => {
            result[fieldname] = value;
        });
        busboy.on('finish', () => resolve(result));
        busboy.on('error', reject);
        const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
        busboy.end(body);
    });
}
