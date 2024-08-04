
// // app.js
// const express = require('express');
// const multer = require('multer');
// const sharp = require('sharp');
// const path = require('path');
// const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');

// const app = express();
// const upload = multer({ dest: 'uploads/' });

// const PORT = process.env.PORT || 3000;

// // Define the directory where your images are stored
// const IMAGE_DIR = path.join(__dirname, 'Images');

// // Define the image paths for each choice
// const imagePaths = {
//     "wave tattoos": [
//         'wave1.jpeg',
//         'wave2.jpg',
//         'wave3.jpg',
//         'wave4.jpg',
//         'wave5.jpeg'
//     ],
//     "eagle tattoos": [
//         'eagle1.jpg',
//         'eagle2.jpg',
//         'eagle3.jpeg',
//         'eagle4.jpg',
//         'eagle5.jpeg'
//     ]
// };

// // Serve static files from the uploads directory
// app.use('/uploads', express.static('uploads'));

// // Set EJS as the templating engine
// app.set('view engine', 'ejs');

// // Serve the HTML form for uploading images
// app.get('/', (req, res) => {
//     res.render('index', { categories: Object.keys(imagePaths) });
// });

// // Endpoint to handle image upload
// app.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         const category = req.body.category;
//         const file = req.file;

//         if (!category || !file) {
//             return res.redirect('/?error=Category%20and%20image%20are%20required.');
//         }

//         const originalImagePath = path.join(__dirname, file.path);
//         const uploadedImageName = uuidv4() + path.extname(file.originalname);
//         const uploadedImagePath = path.join(__dirname, 'uploads', uploadedImageName);

//         // Resize the uploaded image
//         await sharp(originalImagePath)
//             .resize(256, 256)
//             .toFile(uploadedImagePath);

//         // Remove the original uploaded file safely
//         try {
//             fs.unlinkSync(originalImagePath);
//         } catch (err) {
//             console.error('Error removing the original file:', err);
//         }

//         // Get all images from the selected category
//         const selectedImages = imagePaths[category] || [];
//         const allImages = [];

//         for (const imageName of selectedImages) {
//             const imagePath = path.join(IMAGE_DIR, imageName);
//             const resizedImagePath = path.join(__dirname, 'uploads', `resized-${imageName}`);

//             // Resize images from the directory
//             await sharp(imagePath)
//                 .resize(256, 256)
//                 .toFile(resizedImagePath);

//             if (resizedImagePath !== uploadedImagePath) {
//                 allImages.push(`resized-${imageName}`);
//             }
//         }

//         // Add the newly uploaded image to the display list
//         allImages.push(uploadedImageName);

//         // Show all images including the uploaded one
//         res.render('display', { images: allImages, message: 'Here are all matches:' });
//     } catch (error) {
//         console.error(error);
//         res.redirect('/?error=An%20error%20occurred%20while%20uploading%20the%20image.');
//     }
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

// app.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;

// Define the directory where your images are stored
const IMAGE_DIR = path.join(__dirname, 'Images');

// Define the image paths for each choice
const imagePaths = {
    "wave tattoos": [
        'wave1.jpeg',
        'wave2.jpg',
        'wave3.jpg',
        'wave4.jpg',
        'wave5.jpeg'
    ],
    "eagle tattoos": [
        'eagle1.jpg',
        'eagle2.jpg',
        'eagle3.jpeg',
        'eagle4.jpg',
        'eagle5.jpeg'
    ]
};

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve the HTML form for uploading images
app.get('/', (req, res) => {
    res.render('index', { categories: Object.keys(imagePaths), error: req.query.error });
});

// Endpoint to handle image upload
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const category = req.body.category;
        const file = req.file;

        if (!category || !file) {
            return res.redirect('/?error=Category%20and%20image%20are%20required.');
        }

        const uploadedImageName = uuidv4() + path.extname(file.originalname);
        const uploadedImagePath = path.join(__dirname, 'uploads', uploadedImageName);
        const originalImagePath = path.join(__dirname, file.path);

        // Resize the uploaded image
        await sharp(originalImagePath)
            .resize({ width: 256, height: 256, fit: 'inside' }) // Resize image to fit within 256x256 while maintaining aspect ratio
            .toFile(uploadedImagePath);

        // Remove the original uploaded file safely
        try {
            fs.unlinkSync(originalImagePath);
        } catch (err) {
            console.error('Error removing the original file:', err);
        }

        // Get all images from the selected category
        const selectedImages = imagePaths[category] || [];
        const allImages = [];
        let isCategoryMatch = false;

        for (const imageName of selectedImages) {
            const imagePath = path.join(IMAGE_DIR, imageName);
            const resizedImagePath = path.join(__dirname, 'uploads', `resized-${imageName}`);

            // Resize images from the directory
            await sharp(imagePath)
                .resize({ width: 256, height: 256, fit: 'inside' }) // Resize to fit within 256x256 while maintaining aspect ratio
                .toFile(resizedImagePath);

            // Add to the list only if it is not the uploaded image
            if (`resized-${imageName}` !== uploadedImageName) {
                allImages.push(`resized-${imageName}`);
                isCategoryMatch = true;
            }
        }

        // Check if the uploaded image belongs to the selected category
        if (!isCategoryMatch) {
            fs.unlinkSync(uploadedImagePath); // Remove the uploaded image if no match
            return res.redirect('/?error=Uploaded%20image%20does%20not%20match%20the%20selected%20category.');
        }

        // Add the newly uploaded image to the display list
        res.render('display', { images: allImages, message: 'Here are all matches:', uploadedImage: uploadedImageName });
    } catch (error) {
        console.error(error);
        res.redirect('/?error=An%20error%20occurred%20while%20uploading%20the%20image.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
