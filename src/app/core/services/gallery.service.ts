import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  CollectionReference,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Foto } from '../models/foto';
import { PreferencesService } from './Preferences.Service';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private collectionPath = 'gallery';
  private mediaCollection: CollectionReference;

  constructor(
    private firestore: Firestore,
    private preferencesService: PreferencesService
  ) {
    this.mediaCollection = collection(
      this.firestore,
      this.collectionPath
    ) as CollectionReference;
  }

  addMediaRecord(description: string, imageUrl: string): Promise<void> {
    const newRecord: Omit<Foto, 'id'> = {
      description,
      imageUrl,
      createdAt: new Date(),
    };

    return addDoc(this.mediaCollection, newRecord).then(() =>
      this.updatePreferences()
    );
  }

  getMediaRecords(): Observable<Foto[]> {
    return collectionData(this.mediaCollection, {
      idField: 'id',
    }) as Observable<Foto[]>;
  }

  private updatePreferences() {
    this.getMediaRecords().subscribe((data) => {
      this.preferencesService
        .set('mediaRecords', JSON.stringify(data))
        .then(() => {
          console.log('Preferences updated successfully');
        })
        .catch((error) => {
          console.error('Error updating preferences:', error);
        });
    });
  }
}
