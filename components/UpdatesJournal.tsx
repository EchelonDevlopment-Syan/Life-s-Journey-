/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { SectionUpdate } from '../types';
import { ClipboardList, History, CheckCircle2, Award, BookOpen, Clock, Image as ImageIcon } from 'lucide-react';

const MOCK_UPDATES: SectionUpdate[] = [
  { id: 'u1', section: 'Achievement Wall', action: 'Added Milestone', details: 'Harley-Davidson Record unbroken for 12 years.', timestamp: '2 hours ago' },
  { id: 'u2', section: 'Life Timeline', action: 'Recorded Voice Note', details: 'Added 1 minute reflection for the 2012 First Flight event.', timestamp: 'Yesterday' },
  { id: 'u3', section: 'Transformation Library', action: 'Finished Reading', details: 'Marked "7 Habits of Highly Effective People" as complete.', timestamp: '2 days ago' },
  { id: 'u4', section: 'Photo Archives', action: 'Created Album', details: 'New "Professional Heights" album with 24 photos.', timestamp: '3 days ago' },
  { id: 'u5', section: 'Life Timeline', action: 'Updated Entry', details: 'Adjusted dates for the "Own Apartment at 15" milestone.', timestamp: 'Last week' },
];

const UpdatesJournal: React.FC = () => {
  return (
    <div className="w-full h-full p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-display font-bold text-white tracking-tight">Updates Journal</h2>
            <p className="text-brand-silver font-medium mt-2 tracking-widest uppercase text-xs">A comprehensive log of your life résumé evolution.</p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
             <div className="text-right">
                <div className="text-[10px] font-bold text-brand-gold uppercase">Documentation Health</div>
                <div className="text-xl font-bold text-white">94% Complete</div>
             </div>
             <History className="text-brand-gold" />
          </div>
        </div>

        {/* Section Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <JournalStat icon={Award} label="Achievements" value="12" />
           <JournalStat icon={Clock} label="Timeline Events" value="48" />
           <JournalStat icon={BookOpen} label="Books Read" value="50+" />
           <JournalStat icon={ImageIcon} label="Archived Photos" value="1.2k" />
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-brand-purple tracking-[0.3em] uppercase flex items-center gap-3">
             <ClipboardList size={18} /> Recent Activity
          </h3>
          
          <div className="space-y-4">
            {MOCK_UPDATES.map((update) => (
              <div key={update.id} className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-6 hover:bg-white/5 transition-all group">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="text-brand-gold" size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">{update.section}</span>
                       <span className="text-[10px] text-brand-silver font-medium italic">{update.timestamp}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{update.action}</h4>
                    <p className="text-sm text-brand-silver leading-relaxed">{update.details}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const JournalStat = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon size={18} className="text-brand-silver" />
     </div>
     <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-[10px] font-bold text-brand-silver uppercase tracking-widest">{label}</div>
     </div>
  </div>
);

export default UpdatesJournal;