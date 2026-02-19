/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { Home, Clock, Image as ImageIcon, Award, BarChart3, Settings, Mic, Map as MapIcon, BookOpen, ClipboardList, CloudSnow, Sun, Chrome, Facebook, Apple, ArrowRight, Sparkles } from 'lucide-react';
import { AppView, Achievement, Book, TimelineEvent, UserStats, AppState, RouteDetails, AudioStory, StorySegment, StoryPage } from './types';
import VirtualOffice from './components/VirtualOffice';
import LifeTimeline from './components/LifeTimeline';
import PhotoGallery from './components/PhotoGallery';
import RoutePlanner from './components/RoutePlanner';
import StoryPlayer from './components/StoryPlayer';
import StorybookView from './components/StorybookView';
import UpdatesJournal from './components/UpdatesJournal';
import { calculateTotalSegments, generateStoryOutline, generateSegment, generateSegmentAudio, generateStorybookPages } from './services/geminiService';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [isSnowing, setIsSnowing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // State-driven data (prepared for backend sync)
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<UserStats>({
    sobrietyDays: 0,
    totalCertifications: 0,
    flightHours: 0,
    recordsHeld: 0
  });

  // --- Journey/Storybook State ---
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [story, setStory] = useState<AudioStory>({ segments: [], totalSegmentsEstimate: 0 });
  const [storybookPages, setStorybookPages] = useState<StoryPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackgroundGenerating, setIsBackgroundGenerating] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const storyOutlineRef = useRef<string[]>([]);
  const generatingRef = useRef(false);

  // Initialize Data (In production, this would be a fetch() call to /api/user-data)
  useEffect(() => {
    const initializeData = async () => {
      // Simulation of a backend fetch
      setAchievements([
        { id: '1', title: 'Private Pilot License', date: '2012-05-15', description: 'Certified private pilot following years of dedication.', type: 'DIPLOMA', metric: '500+ Flight Hours' },
        { id: '2', title: 'APEX Excellence Award', date: '2015-11-20', description: 'Recognized for professional achievement in the industry.', type: 'AWARD', metric: 'Top 1% Global' },
        { id: '3', title: 'Million Dollar Club', date: '2018-01-10', description: 'Reached sales and valuation milestone.', type: 'CERTIFICATE', metric: '$1M+ Valuation' },
        { id: '4', title: 'Harley-Davidson Record', date: '2012-08-01', description: 'Set local dealership record for unbroken milestones.', type: 'MILESTONE', metric: '12 Years Unbroken' },
      ]);
      setBooks([
        { id: 'b1', title: '7 Habits of Highly Effective People', category: 'PERSONAL_GROWTH', lessonsLearned: 'Begin with the end in mind.', personalThoughts: 'Started my app journey with this vision.', dateRead: 'March 2020' },
        { id: 'b2', title: 'Zero to One', category: 'BUSINESS', lessonsLearned: 'Build things that don\'t exist.', personalThoughts: 'The foundation for MY JOURNEY.', dateRead: 'Jan 2021' },
      ]);
      setTimeline([
        { id: 't1', title: 'Born', date: '1985', description: 'The beginning of the journey.', type: 'EVENT' },
        { id: 't2', title: 'Own Apartment at 15', date: '2000', description: 'Gaining independence at a young age despite challenges.', type: 'MILESTONE', stats: [{ label: 'Age', value: '15' }] },
        { id: 't3', title: 'First Flight', date: '2012', description: 'Flying kids to school - a lifelong dream realized.', type: 'ACHIEVEMENT', stats: [{ label: 'Flight Hours', value: '1' }] },
        { id: 't4', title: '2 Years Sober', date: '2022', description: 'One of the hardest and most rewarding transformations.', type: 'MILESTONE', stats: [{ label: 'Sobriety', value: '730 Days' }] },
      ]);
      setStats({
        sobrietyDays: 730,
        totalCertifications: 12,
        flightHours: 520,
        recordsHeld: 3
      });
    };
    initializeData();
  }, []);

  // Improved Dynamic Google Maps Script Loading
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const apiKey = process.env.API_KEY || '';
      if (apiKey && apiKey !== 'undefined' && !apiKey.includes('YOUR_API_KEY')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Snow Management
  useEffect(() => {
    const snowContainer = document.getElementById('snow-container');
    if (!snowContainer) return;
    
    if (isSnowing) {
      for (let i = 0; i < 100; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        const size = Math.random() * 5 + 2;
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        snowflake.style.opacity = Math.random().toString();
        snowContainer.appendChild(snowflake);
      }
    } else {
      snowContainer.innerHTML = '';
    }
  }, [isSnowing]);

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentView(AppView.OFFICE);
  };

  const handleRouteFound = (details: RouteDetails) => {
    setRouteDetails(details);
    setAppState(AppState.ROUTE_FOUND);
    startGeneration(details);
    setIsAuthenticated(true);
    setCurrentView(AppView.JOURNEY);
  };

  const handleCreateStorybook = async () => {
    setCurrentView(AppView.STORYBOOK);
    setIsGenerating(true);
    const lifeContext = "The journey of Syan Kazi: from early dreams of flight and overcoming hardship to breaking records at Harley-Davidson, achieving business success, and maintaining sobriety while inspiring the next generation of pilots.";
    const pages = await generateStorybookPages(lifeContext);
    setStorybookPages(pages);
    setIsGenerating(false);
  };

  const startGeneration = async (route: RouteDetails) => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setAppState(AppState.GENERATING);
    setIsBackgroundGenerating(true);

    try {
      const totalSegments = calculateTotalSegments(route.durationSeconds);
      setStory({ segments: [], totalSegmentsEstimate: totalSegments });
      const outline = await generateStoryOutline(route, totalSegments);
      storyOutlineRef.current = outline;
      await fetchNextSegment(1, route, totalSegments, "");
      setAppState(AppState.PLAYING);
    } catch (err) {
      console.error("Failed to start journey:", err);
      setAppState(AppState.IDLE);
    } finally {
      generatingRef.current = false;
    }
  };

  const fetchNextSegment = async (index: number, route: RouteDetails, total: number, context: string) => {
    try {
      const outline = storyOutlineRef.current[index - 1] || "Continue the journey.";
      const segment = await generateSegment(route, index, total, outline, context);
      setStory(prev => ({ ...prev, segments: [...prev.segments, segment] }));
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const buffer = await generateSegmentAudio(segment.text, audioContextRef.current, route.voiceName);
      setStory(prev => ({
        ...prev,
        segments: prev.segments.map(s => s.index === index ? { ...s, audioBuffer: buffer } : s)
      }));
      if (index < total) {
        fetchNextSegment(index + 1, route, total, segment.text);
      } else {
        setIsBackgroundGenerating(false);
      }
    } catch (err) {
      console.error(`Error fetching segment ${index}:`, err);
      setIsBackgroundGenerating(false);
    }
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  // --- RENDERING VIEWS ---
  if (!isAuthenticated && currentView === AppView.LANDING) {
    return (
      <div className="min-h-screen w-full sphere-bg relative flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
          {/* Brand Column */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-block p-4 glass rounded-3xl border border-white/20 mb-4 animate-fade-in shadow-2xl">
              <span className="text-white font-display font-black text-4xl lg:text-6xl tracking-tighter">Life's Journey</span>
            </div>
            <p className="text-brand-gold font-display font-medium text-xl lg:text-3xl italic tracking-wide animate-slide-up">
              "To the upper echelon"
            </p>
            <div className="space-y-4 animate-fade-in delay-300">
               <h3 className="text-brand-silver font-bold uppercase tracking-[0.3em] text-[10px]">Start Your Journey Today</h3>
               <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <SocialButton icon={Chrome} label="Google" color="hover:bg-red-500/20" onClick={handleRegister} />
                  <SocialButton icon={Facebook} label="Facebook" color="hover:bg-blue-600/20" onClick={handleRegister} />
                  <SocialButton icon={Apple} label="Apple" color="hover:bg-white/20" onClick={handleRegister} />
               </div>
            </div>
            <p className="text-brand-silver/60 text-sm max-w-md mx-auto lg:mx-0 leading-relaxed">
               Document your triumphs, map your challenges, and forge your chronology in a professional 3D virtual space. Click a social link or plan a route to begin.
            </p>
          </div>

          {/* Form Column */}
          <div className="animate-slide-up delay-500 w-full">
             <RoutePlanner onRouteFound={handleRouteFound} appState={appState} />
             <button 
              onClick={handleRegister}
              className="mt-6 w-full flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
             >
               Already have an account? Sign in <ArrowRight size={14} />
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-20 lg:w-24 glass border-r border-white/5 flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-gold flex items-center justify-center shadow-lg shadow-brand-purple/20 mb-4 cursor-pointer" onClick={() => setCurrentView(AppView.OFFICE)}>
          <span className="text-white font-bold text-xl">LJ</span>
        </div>
        
        <NavButton active={currentView === AppView.OFFICE} icon={Home} onClick={() => handleNavigate(AppView.OFFICE)} label="Office" />
        <NavButton active={currentView === AppView.TIMELINE} icon={Clock} onClick={() => handleNavigate(AppView.TIMELINE)} label="Timeline" />
        <NavButton active={currentView === AppView.STORYBOOK} icon={BookOpen} onClick={handleCreateStorybook} label="Storybook" />
        <NavButton active={currentView === AppView.JOURNAL} icon={ClipboardList} onClick={() => handleNavigate(AppView.JOURNAL)} label="Journal" />
        <NavButton active={currentView === AppView.ALBUM} icon={ImageIcon} onClick={() => handleNavigate(AppView.ALBUM)} label="Gallery" />
        <NavButton active={currentView === AppView.JOURNEY} icon={MapIcon} onClick={() => handleNavigate(AppView.JOURNEY)} label="Journeys" />
        
        <div className="mt-auto flex flex-col gap-6">
          <NavButton active={false} icon={BarChart3} onClick={() => {}} label="Stats" />
          <NavButton active={false} icon={Settings} onClick={() => {}} label="Settings" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-12 z-40">
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-wider uppercase">
              {currentView === AppView.OFFICE && 'VIRTUAL OFFICE'}
              {currentView === AppView.TIMELINE && 'LIFE TIMELINE'}
              {currentView === AppView.ALBUM && 'PHOTO ALBUMS'}
              {currentView === AppView.JOURNEY && 'JOURNEY NARRATOR'}
              {currentView === AppView.STORYBOOK && 'THE CHRONOLOGY OF SELF'}
              {currentView === AppView.JOURNAL && 'UPDATES JOURNAL'}
            </h1>
            <p className="text-xs text-brand-silver font-medium uppercase tracking-[0.2em] mt-1 italic">
              "To the upper echelon"
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSnowing(!isSnowing)}
              className={`w-10 h-10 rounded-full glass flex items-center justify-center transition-all ${isSnowing ? 'bg-white/20 shadow-[0_0_15px_white]' : 'hover:bg-white/10'}`}
              title="Toggle Snow"
            >
              {isSnowing ? <Sun size={20} className="text-brand-gold" /> : <CloudSnow size={20} className="text-brand-silver" />}
            </button>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-brand-gold/20">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></div>
              <span className="text-xs font-bold text-brand-gold tracking-widest uppercase">Legacy Tier Active</span>
            </div>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Mic size={20} className="text-brand-purple" />
            </button>
          </div>
        </header>

        <div className="w-full h-full pt-20 overflow-y-auto no-scrollbar">
          {currentView === AppView.OFFICE && (
            <VirtualOffice 
              achievements={achievements} 
              books={books} 
              onAlbumClick={(id) => {
                setActiveAlbum(id);
                setCurrentView(AppView.ALBUM);
              }}
              stats={stats}
            />
          )}
          {currentView === AppView.TIMELINE && (
            <LifeTimeline events={timeline} />
          )}
          {currentView === AppView.ALBUM && (
            <PhotoGallery albumId={activeAlbum} onBack={() => setCurrentView(AppView.OFFICE)} />
          )}
          {currentView === AppView.STORYBOOK && (
            <StorybookView pages={storybookPages} isLoading={isGenerating} />
          )}
          {currentView === AppView.JOURNAL && (
            <UpdatesJournal />
          )}
          {currentView === AppView.JOURNEY && (
            <div className="p-12">
              {appState <= AppState.ROUTE_FOUND || appState === AppState.GENERATING ? (
                <div className="max-w-2xl mx-auto">
                   <RoutePlanner onRouteFound={handleRouteFound} appState={appState} />
                </div>
              ) : (
                <StoryPlayer 
                  story={story} 
                  route={routeDetails!} 
                  onSegmentChange={() => {}} 
                  isBackgroundGenerating={isBackgroundGenerating} 
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, icon: Icon, onClick, label }: { active: boolean, icon: any, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-1 transition-all ${active ? 'text-brand-gold' : 'text-brand-silver hover:text-white'}`}
    >
      <div className={`p-3 rounded-2xl transition-all duration-300 ${active ? 'bg-white/10 shadow-inner' : 'group-hover:bg-white/5'}`}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
      {active && (
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-gold rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
      )}
    </button>
  );
}

function SocialButton({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`glass flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 font-bold text-[10px] uppercase tracking-widest transition-all ${color} active:scale-95`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}

export default App;