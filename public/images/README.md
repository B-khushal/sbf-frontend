# Images Directory

This directory should contain the following images for your SBF Florist application:

## Required Images:

1. **logosbf.png** - Company logo (recommended size: 200x200px, transparent background)
2. **1.jpg** - Hero carousel image #1 (recommended size: 1920x800px)
3. **d3.jpg** - Default section background image (recommended size: 1920x1080px)

## How to Add Images:

### Option 1: Upload via Admin Panel
1. Login to admin panel
2. Go to Settings > Hero Slides
3. Upload your images there

### Option 2: Manual Upload
1. Place your images in this `/public/images/` directory
2. Make sure filenames match exactly (case-sensitive)
3. Rebuild and redeploy your application

## Image Specifications:

### Logo (logosbf.png):
- Format: PNG with transparency preferred
- Dimensions: 200x200px to 400x400px
- Max file size: 500KB

### Hero Images (1.jpg, 2.jpg, etc.):
- Format: JPG or WebP
- Dimensions: 1920x800px (landscape)
- Max file size: 500KB (optimize for web)
- Make sure images are compressed for faster loading

### Background Images (d3.jpg):
- Format: JPG or WebP
- Dimensions: 1920x1080px
- Max file size: 500KB

## Image Optimization Tips:

1. **Compress images** before uploading (use tools like TinyPNG, ImageOptim)
2. **Use appropriate formats**: JPG for photos, PNG for logos/graphics with transparency
3. **WebP format** is recommended for better compression
4. **Keep file sizes small** for faster loading times

## Cloudinary Alternative:

If you're using Cloudinary for image hosting (recommended):
- Images will be served from Cloudinary CDN
- Update the image URLs in Settings to point to your Cloudinary URLs
- Local images in this folder are fallbacks only

## Temporary Placeholder:

Until you add your images, the application will:
- Use `/placeholder.svg` as fallback
- Show a generic gray placeholder box
- Log warnings in browser console

## Example File Structure:

```
public/
  images/
    logosbf.png          ← Your company logo
    1.jpg                ← Hero carousel image 1
    2.jpg                ← Hero carousel image 2 (optional)
    3.jpg                ← Hero carousel image 3 (optional)
    d3.jpg               ← Default background image
    placeholder.jpg      ← Generic placeholder (optional)
```

## Git Note:

If you want to commit images to git:
- Keep images small (< 500KB each)
- Consider using Git LFS for larger images
- Alternatively, use Cloudinary and only commit image URLs

---

**Need help?** Check the RENDER_DEPLOYMENT.md guide or admin documentation.
