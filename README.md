# BuildPro Construction Website

A professional, modern construction company website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ✅ Responsive design for all devices
- ✅ Modern, professional UI/UX
- ✅ Multiple pages (Home, About, Services, Projects, Contact)
- ✅ Smooth animations and transitions
- ✅ SEO optimized
- ✅ Fast performance with Next.js
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Icon library (Lucide React)

## Pages Included

- **Home** - Hero section, stats, featured services, projects, testimonials, CTA
- **About** - Company story, core values, team members
- **Services** - Detailed service offerings with descriptions
- **Projects** - Portfolio of completed projects with filters
- **Contact** - Contact form, business information, map integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm or yarn package manager

## Installation

1. Navigate to the project directory:
```bash
cd construction-site
```

2. Install dependencies:
```bash
npm install
```

## Running the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## Building for Production

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
construction-site/
├── app/
│   ├── about/
│   │   └── page.tsx
│   ├── services/
│   │   └── page.tsx
│   ├── projects/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Stats.tsx
│   ├── Services.tsx
│   ├── Projects.tsx
│   ├── WhyUs.tsx
│   ├── Testimonials.tsx
│   └── CTASection.tsx
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## Customization

### Colors
The primary color scheme uses orange tones. To change colors, edit `tailwind.config.ts`:
```typescript
primary: {
  50: '#fef6ee',
  100: '#fdecd7',
  // ... more shades
}
```

### Content
- Update text content in page files (`app/*/page.tsx`)
- Modify navigation links in `components/Navbar.tsx`
- Change footer information in `components/Footer.tsx`

### Images
Replace placeholder images with your own:
- Update image URLs in component files
- Use Unsplash, Pexels, or your own images
- Recommended: Store images in `public/` folder

### Contact Information
Update contact details in:
- `components/Footer.tsx`
- `app/contact/page.tsx`
- `components/Navbar.tsx`

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React 18** - Latest React features

## Performance Features

- Image optimization with Next.js Image component
- Automatic code splitting
- Server-side rendering (SSR)
- Static site generation (SSG) where applicable
- Lazy loading of components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for modification.

## Support

For questions or issues, please contact info@buildpro.com

---

Built with ❤️ using Next.js
