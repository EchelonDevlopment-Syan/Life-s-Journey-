/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppView {
  LANDING = 'LANDING',
  OFFICE = 'OFFICE',
  TIMELINE = 'TIMELINE',
  ALBUM = 'ALBUM',
  JOURNEY = 'JOURNEY',
  STORYBOOK = 'STORYBOOK',
  JOURNAL = 'JOURNAL'
}

export enum AppState {
  IDLE = 0,
  ROUTE_FOUND = 1,
  ROUTE_CONFIRMED = 2,
  GENERATING = 3,
  PLAYING = 4
}

export type StoryStyle = 'NOIR' | 'CHILDREN' | 'HISTORICAL' | 'FANTASY';

export interface RouteDetails {
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
  durationSeconds: number;
  travelMode: 'WALKING' | 'DRIVING';
  voiceName: string;
  storyStyle: StoryStyle;
}

export interface StorySegment {
  index: number;
  text: string;
  audioBuffer: AudioBuffer | null;
}

export interface AudioStory {
  segments: StorySegment[];
  totalSegmentsEstimate: number;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl?: string;
  audioBuffer?: AudioBuffer | null;
}

export interface SectionUpdate {
  id: string;
  section: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'DIPLOMA' | 'AWARD' | 'CERTIFICATE' | 'MILESTONE';
  imageUrl?: string;
  metric?: string;
}

export interface Book {
  id: string;
  title: string;
  category: 'BUSINESS' | 'PERSONAL_GROWTH' | 'HOBBIES' | 'FAMILY';
  lessonsLearned: string;
  personalThoughts: string;
  dateRead: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'EVENT' | 'MILESTONE' | 'ACHIEVEMENT';
  stats?: { label: string; value: string }[];
  voiceNoteUrl?: string;
  imageUrl?: string;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  type: 'KID_FRIENDLY' | 'PROFESSIONAL' | 'FRIENDS' | 'FAMILY';
  photos: string[];
}

export interface UserStats {
  sobrietyDays: number;
  totalCertifications: number;
  flightHours: number;
  recordsHeld: number;
}