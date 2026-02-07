# Automation Projects Portfolio

A modern, responsive portfolio website showcasing three automation projects.




3. Navigate to `http://localhost:8000` in your browser

## Customization

### Updating Project Information

Edit the `projects` object in `script.js` to update project details:

```javascript
const projects = {
    1: {
        title: 'Your Project Title',
        description: 'Your project description...',
        features: ['Feature 1', 'Feature 2', ...],
        technologies: ['Python', 'JavaScript', ...],
        github: 'https://github.com/yourusername/project',
        demo: 'https://your-demo-url.com'
    },
    // ... more projects
};
```

### Changing Colors

Update the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... other colors */
}
```

### Updating Contact Information

Edit the contact section in `index.html`:

```html
<div class="contact-item">
    <span>your.email@example.com</span>
</div>
```

### Adding Project Images

Replace the placeholder SVG icons in the project cards with actual images:

```html
<div class="project-image">
    <img src="path/to/your/image.jpg" alt="Project 1">
</div>
```

## Project Structure

```
portfolio/
├── index.html      # Main HTML file
├── styles.css      # Stylesheet
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select the branch (usually `main` or `master`)
4. Your site will be available at `https://yourusername.github.io/portfolio`

### Netlify

1. Drag and drop the `portfolio` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your site will be live instantly

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Contact

For questions or suggestions, please open an issue on GitHub or contact me directly.


