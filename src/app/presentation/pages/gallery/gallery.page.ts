import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { CameraService } from 'src/app/core/services/camara.service';


@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
  standalone : false
})
export class GalleryPage {
 
  form: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private CaramaService: CameraService,
    private supabaseService: SupabaseService,
    private firestore: Firestore
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required]
    });
  }

  async pickImage() {
    const imagePath = await this.CaramaService.captureImage();
    const response = await fetch(imagePath);
    const blob = await response.blob();
    this.imageFile = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type });
    this.imagePreview = imagePath;
  }

  async onSubmit() {
    if (!this.imageFile || this.form.invalid) return;

    const path = `multimedia/${Date.now()}_${this.imageFile.name}`;
    const publicUrl = await this.supabaseService.uploadImage(this.imageFile, path);

    const data = {
      description: this.form.value.description,
      imageUrl: publicUrl,
      createdAt: Timestamp.now()
    };

    await addDoc(collection(this.firestore, 'multimedia'), data);
    this.form.reset();
    this.imageFile = null;
    this.imagePreview = null;
    alert('Multimedia registrada correctamente');
  }

}