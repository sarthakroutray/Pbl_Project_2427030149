# IntelliMed-AI Project Showcase

A modern React showcase webpage for the IntelliMed-AI medical AI project, built with Vite and styled with Tailwind CSS. Features a brutalist design with custom cyan/primary theme, ready for GitHub Pages deployment.

## Project Overview

**IntelliMed-AI** is an intelligent medical document management platform that bridges communication gaps between patients and healthcare providers through:

- 🔬 **AI-Powered Analysis**: OCR + NLP for prescription extraction, ResNet50 for X-ray classification
- 🏥 **Multi-Modal Processing**: Handles PDFs, images, DICOM files with 8-step preprocessing
- 🔒 **Secure Architecture**: JWT authentication, role-based access, patient-controlled sharing
- 📊 **Performance**: 93.8% X-ray accuracy, 3-4s processing time, 150+ medication database

## Technology Stack

### Frontend
- React 18.2 + Vite
- Tailwind CSS (custom brutalist theme)
- Material Symbols icons
- Inter font family

### Backend (Referenced)
- FastAPI + Uvicorn
- PostgreSQL + Prisma ORM
- PyTorch (ResNet50)
- OpenCV + EasyOCR + Tesseract
- SpaCy NLP

## Academic Project

**Institution**: Manipal University Jaipur  
**Department**: Computer Science & Engineering  
**Course**: PBL 2026  
**Guide**: Ms. Soni Gupta

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the app in development mode.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deploy to GitHub Pages

### Setup

1. Create a new repository on GitHub
2. The `homepage` field in `package.json` is already configured for this repo:
   ```json
   "homepage": "https://yourusername.github.io/Pbl_Project_2427030149"
   ```
3. Update with your actual GitHub username

### Deploy

```bash
npm run deploy
```

This will build the project and push it to the `gh-pages` branch of your repository.

### Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the sidebar
3. Under "Source", select the `gh-pages` branch
4. Click "Save"

Your site will be live at `https://yourusername.github.io/Pbl_Project_2427030149`

## Project Structure

```
├── src/
│   ├── App.jsx          # Main application component with all sections
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with custom scrollbar & animations
├── index.html           # HTML template with Google Fonts
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Custom Tailwind theme (cyan primary, dark mode)
└── postcss.config.js    # PostCSS configuration
```

## Features

### Sections
1. **Hero**: Project introduction with animated gradient text
2. **Stats Marquee**: Scrolling performance metrics
3. **Capabilities**: Three AI capability cards (OCR/NLP, X-Ray, Security)
4. **Accuracy**: Performance comparison charts
5. **Tech Stack**: Technology showcase with 10 tools
6. **Team**: Project team member cards
7. **Footer**: University information and citation

### Design Features
- Brutalist design with thick borders (#283339)
- Custom cyan primary color (#00e5ff)
- Dark mode enabled by default
- Material Symbols icons
- Smooth hover transitions
- Responsive mobile-first layout
- Custom scrollbar styling

## Customization

### Update Team Information
Edit the team section in [src/App.jsx](src/App.jsx#L250) to add your team member names and registration numbers.

### Update Project Guide
Replace `[Guide Name]` placeholder in the team section.

### Modify Colors
Edit [tailwind.config.js](tailwind.config.js) to change the primary color theme.

## Performance Metrics (Referenced)

- **X-Ray Accuracy**: 93.8%
- **OCR Character Error Rate**: 2-10% (depends on quality)
- **Processing Speed**: 3-4 seconds per document
- **Medication Detection**: 93.2% accuracy
- **Sensitivity**: 94.3%

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Material Symbols** - Icon system
- **Inter Font** - Typography
- **gh-pages** - GitHub Pages deployment tool

---

**© 2026 Manipal University Jaipur - CSE Department**  
*Academic Project for PBL Course*
