import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { PreferencesService } from 'src/app/core/services/Preferences.Service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: false
})
export class LandingPage implements OnInit {

  @ViewChild('image3d', { static: false }) image3dElement!: ElementRef;

  constructor(private prefere: PreferencesService, private renderer: Renderer2) { }

  ngOnInit() {
    this.prefere.set('widget_text' , 'Hola desde el landing');
  }

  ngAfterViewInit() {
    if (window.innerWidth > 768) {
      this.setupImageInteractivity();
    }
  }

  private setupImageInteractivity() {
    const image3d = this.image3dElement.nativeElement;
    
    this.renderer.listen('document', 'mousemove', (event) => {
      const moveX = (event.clientX - window.innerWidth / 2) / 50;
      const moveY = (event.clientY - window.innerHeight / 2) / 50;
      
      this.renderer.setStyle(image3d, 'transform', 
        `translateY(-10px) rotateX(${moveY}deg) rotateY(${moveX}deg)`);
    });
    
    this.renderer.listen('document', 'mouseleave', () => {
      this.renderer.removeStyle(image3d, 'transform');
    });
  }
}
