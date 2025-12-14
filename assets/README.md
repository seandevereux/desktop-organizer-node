# App Icons

Place your application icons in this directory.

## Required Files

### For Windows (Recommended)
- **icon.ico** - Windows icon file with multiple sizes (16x16, 32x32, 48x48, 256x256)

### For All Platforms (Fallback)
- **icon.png** - PNG image file (256x256 or 512x512 pixels recommended)

## How to Create Icons

### Option 1: Online Converters
1. Create or find a PNG image (256x256 or 512x512 pixels)
2. Use an online converter:
   - https://convertio.co/png-ico/
   - https://www.icoconverter.com/
   - https://cloudconvert.com/png-to-ico
3. Download the `.ico` file and save it as `icon.ico` in this folder
4. Also save your original PNG as `icon.png` for fallback

### Option 2: Design Tools
1. Use design software (Figma, Photoshop, GIMP, etc.)
2. Create a square image (256x256 or 512x512)
3. Export as PNG
4. Convert PNG to ICO using online tools or:
   - Windows: Use IcoFX or similar tools
   - macOS: Use Icon Composer or online converters
   - Linux: Use ImageMagick: `convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico`

### Option 3: Quick Test
For quick testing, you can use any PNG image:
1. Find or create a PNG image
2. Resize it to 256x256 pixels (use any image editor)
3. Save it as `icon.png` in this folder
4. The app will use it (though .ico is preferred for Windows)

## File Structure
```
assets/
├── icon.ico    (Windows - recommended)
└── icon.png    (Fallback for all platforms)
```

## After Adding Icons

Rebuild the main process:
```bash
npm run build:main
npm start
```

The icon will appear in:
- Window title bar
- Windows taskbar
- Application shortcuts
- macOS dock (if using .png)


