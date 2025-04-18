import { gsap } from 'gsap';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Example animation
    gsap.from('h1', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });
}); 