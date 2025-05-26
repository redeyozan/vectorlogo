import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure upload directories exist
const createUploadDirectories = () => {
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  const pngDir = path.join(uploadsDir, 'png');
  const svgDir = path.join(uploadsDir, 'svg');
  
  // Create directories if they don't exist
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  if (!fs.existsSync(pngDir)) fs.mkdirSync(pngDir);
  if (!fs.existsSync(svgDir)) fs.mkdirSync(svgDir);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure upload directories exist
    createUploadDirectories();
    
    // Parse the form data
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    const fileType = fields.fileType as string | string[];
    const fileTypeStr = Array.isArray(fileType) ? fileType[0] : fileType;
    
    const fileObj = files.file;
    const file = Array.isArray(fileObj) ? fileObj[0] : fileObj;
    
    if (!file || !fileType) {
      return res.status(400).json({ error: 'No file uploaded or file type not specified' });
    }
    
    // Check if the file is of the correct type
    if (fileTypeStr === 'png' && !file.mimetype?.includes('png')) {
      return res.status(400).json({ error: 'File must be a PNG image' });
    }
    
    if (fileTypeStr === 'svg' && !file.mimetype?.includes('svg')) {
      return res.status(400).json({ error: 'File must be an SVG image' });
    }
    
    // Generate a unique filename
    const fileName = `${Date.now()}-${file.originalFilename}`;
    const targetPath = path.join(process.cwd(), 'public', 'uploads', fileTypeStr, fileName);
    
    // Copy the file to the target location
    fs.copyFileSync(file.filepath, targetPath);
    
    // Clean up the temporary file
    fs.unlinkSync(file.filepath);
    
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${fileTypeStr}/${fileName}`;
    
    return res.status(200).json({ 
      message: 'File uploaded successfully',
      url: fileUrl,
      path: `${fileType}/${fileName}`
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
