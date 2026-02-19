/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { TimelineEvent } from '../types';
import { Play, Mic, MapPin, ExternalLink, Calendar } from 'lucide-react';

interface Props {
  events: TimelineEvent[];
}

const LifeTimeline: React.FC<Props> = ({ events }) => {
  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar p-12 relative">
      {/* Central Axis */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-purple to-transparent opacity-30"></div>

      <div className="max-w-5xl mx-auto space-y-32">
        {events.map((event, index) => (
          <div 
            key={event.id}
            className={`flex items-center gap-12 group ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
          >
            {/* Content Card */}
            <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
               <div className="inline-block glass rounded-[2.5rem] p-8 border border-white/10 glow-border card-3d max-w-lg">
                  <div className="flex items-center gap-3 mb-4 text-brand-gold">
                    <Calendar size={14} />
                    <span className="text-xs font-bold tracking-[0.2em]">{event.date}</span>
                  </div>
                  
                  <h4 className="text-2xl font-display font-bold text-white mb-4 tracking-tight">{event.title}</h4>
                  <p className="text-sm text-brand-silver leading-relaxed mb-6">{event.description}</p>
                  
                  {event.stats && (
                    <div className="flex flex-wrap gap-4 mb-6">
                      {event.stats.map((stat, sIdx) => (
                        <div key={sIdx} className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                           <span className="text-[10px] font-bold text-brand-silver uppercase block tracking-widest">{stat.label}</span>
                           <span className="text-sm font-bold text-white">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 justify-between mt-6 pt-6 border-t border-white/5">
                    <button className="flex items-center gap-2 text-[10px] font-bold text-brand-purple uppercase tracking-widest hover:text-brand-gold transition-colors">
                       <Play size={14} className="fill-current" /> Play Voice Memory
                    </button>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10">
                        <MapPin size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Visual Node */}
            <div className="relative z-10 w-4 h-4 rounded-full bg-brand-purple shadow-[0_0_20px_#7c3aed] group-hover:scale-150 transition-transform duration-500 ring-4 ring-brand-dark ring-offset-4 ring-offset-brand-purple/20">
               <div className="absolute top-1/2 left-full w-8 h-px bg-white/10 -translate-y-1/2 hidden lg:block"></div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>
          </div>
        ))}
        
        {/* Placeholder for "Future" */}
        <div className="flex justify-center pt-24 pb-48">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-4 animate-spin-slow">
              <span className="text-white/20">+</span>
            </div>
            <p className="text-[10px] font-bold text-brand-silver uppercase tracking-[0.4em]">Next Chapter...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeTimeline;