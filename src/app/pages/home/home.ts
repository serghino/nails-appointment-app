import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  constructor(private cdr: ChangeDetectorRef) {}

  services: Service[] = [
    {
      id: 1,
      name: 'Dry E-file Manicure technique + Hard Gel Extension',
      description: 'Gel color, Gels build the shape, Extension, Gel polish permanent + Russian manicure (Cuticle cleaning)',
      price: '$100',
      duration: '2h 30m',
      category: 'Extensions'
    },
    {
      id: 2,
      name: 'Dry E-file Manicure technique + Gel polish (Shellac)',
      description: 'Russian manicure Dry E-file Manicure technique with color gel polish',
      price: '$70',
      duration: '2h',
      category: 'Manicure'
    },
    {
      id: 3,
      name: 'Pedicure combo technique + Gel polish (Shellac)',
      description: 'Pedicure cleaning with color gel polish',
      price: '$80',
      duration: '2h',
      category: 'Pedicure'
    },
    {
      id: 4,
      name: 'Pedicure combo technique (without any polish)',
      description: 'No polish, just cleaning',
      price: '$60',
      duration: '1h 15m',
      category: 'Pedicure'
    },
    {
      id: 5,
      name: 'Dry E-file Manicure technique (without any polish)',
      description: 'No polish, just cleaning cuticle',
      price: '$50',
      duration: '1h',
      category: 'Manicure'
    },
    {
      id: 6,
      name: 'Russian classic soak-off technique Manicure (without any polish)',
      description: 'No polish, just cleaning cuticle',
      price: '$50',
      duration: '1h',
      category: 'Manicure'
    },
    {
      id: 7,
      name: 'Nail Polish Permanent',
      description: 'Gel polish, Shellac, Nail polish permanent',
      price: '$20',
      duration: '1h',
      category: 'Polish'
    },
    {
      id: 8,
      name: 'Gel polish removal',
      description: 'Gel polish removal which liquid or machine',
      price: '$15',
      duration: '30m',
      category: 'Removal'
    },
    {
      id: 9,
      name: 'Gel extension removal',
      description: 'Gel extension removal which a machine',
      price: '$20',
      duration: '1h',
      category: 'Removal'
    },
    {
      id: 10,
      name: 'Nail Polish regular',
      description: 'Regular Nail polish',
      price: '$10',
      duration: '30m',
      category: 'Polish'
    }
  ];

  workingHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '11:00 AM - 5:00 PM' }
  ];

  galleryPhotos = [
    { id: 1, src: '/images/professional/a.jpeg', alt: 'Professional nail work 1' },
    { id: 2, src: '/images/professional/b.jpeg', alt: 'Professional nail work 2' },
    { id: 3, src: '/images/professional/c.jpeg', alt: 'Professional nail work 3' },
    { id: 4, src: '/images/professional/d.jpeg', alt: 'Professional nail work 4' },
    { id: 5, src: '/images/professional/e.jpeg', alt: 'Professional nail work 5' },
    { id: 6, src: '/images/professional/f.jpeg', alt: 'Professional nail work 6' }
  ];

  // Gallery images auto-loaded from gallery folder
  galleryImages = [
    { id: 1, src: '/images/gallery/1.jpeg', alt: 'Gallery work 1' },
    { id: 2, src: '/images/gallery/2.jpeg', alt: 'Gallery work 2' },
    { id: 3, src: '/images/gallery/3.jpeg', alt: 'Gallery work 3' },
    { id: 4, src: '/images/gallery/4.jpeg', alt: 'Gallery work 4' },
    { id: 5, src: '/images/gallery/5.jpeg', alt: 'Gallery work 5' },
    { id: 6, src: '/images/gallery/6.jpeg', alt: 'Gallery work 6' }
  ];

  currentPhotoIndex = 0;
  currentGalleryIndex = 0;
  private autoRotateInterval: any;
  private galleryAutoRotateInterval: any;

  ngOnInit(): void {
    this.startAutoRotate();
    this.startGalleryAutoRotate();
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
    this.stopGalleryAutoRotate();
  }

  startAutoRotate(): void {
    this.autoRotateInterval = setInterval(() => {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.galleryPhotos.length;
      this.cdr.detectChanges();
    }, 3000); // Change photos every 3 seconds
  }

  stopAutoRotate(): void {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
    }
  }

  get visiblePhotos() {
    return [
      this.galleryPhotos[this.currentPhotoIndex],
      this.galleryPhotos[(this.currentPhotoIndex + 1) % this.galleryPhotos.length]
    ];
  }

  nextPhoto(): void {
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.galleryPhotos.length;
    this.resetAutoRotate();
  }

  prevPhoto(): void {
    this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.galleryPhotos.length) % this.galleryPhotos.length;
    this.resetAutoRotate();
  }

  onManualNavigation(): void {
    this.resetAutoRotate();
  }

  private resetAutoRotate(): void {
    this.stopAutoRotate();
    this.startAutoRotate();
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Gallery carousel methods
  startGalleryAutoRotate(): void {
    this.galleryAutoRotateInterval = setInterval(() => {
      this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryImages.length;
      this.cdr.detectChanges();
    }, 3000); // Change gallery photos every 3 seconds
  }

  stopGalleryAutoRotate(): void {
    if (this.galleryAutoRotateInterval) {
      clearInterval(this.galleryAutoRotateInterval);
    }
  }

  get visibleGalleryImages() {
    return [
      this.galleryImages[this.currentGalleryIndex],
      this.galleryImages[(this.currentGalleryIndex + 1) % this.galleryImages.length],
      this.galleryImages[(this.currentGalleryIndex + 2) % this.galleryImages.length]
    ];
  }

  nextGalleryPhoto(): void {
    this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryImages.length;
    this.resetGalleryAutoRotate();
  }

  prevGalleryPhoto(): void {
    this.currentGalleryIndex = (this.currentGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    this.resetGalleryAutoRotate();
  }

  private resetGalleryAutoRotate(): void {
    this.stopGalleryAutoRotate();
    this.startGalleryAutoRotate();
  }
}
