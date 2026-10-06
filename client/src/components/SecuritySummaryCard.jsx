import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const SecuritySummaryCard = () => {
  const securityFeatures = [
    { title: 'Authentication Enabled', desc: 'JWT + bcrypt hash' },
    { title: 'User Access Control', desc: 'Restricted email recipients' },
    { title: 'Expiry Protection', desc: 'Auto-expiration policy' },
    { title: 'Password Protection', desc: 'Optional hashed passcode' },
    { title: 'Download Limits', desc: 'Automatic link revocation' },
    { title: 'Activity Tracking', desc: 'Full audit log trail' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base tracking-wide text-white">SECURITY STATUS</h3>
          <p className="text-xs text-slate-400">Enterprise grade access control policy enforcement</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {securityFeatures.map((item, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-200">{item.title}</p>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecuritySummaryCard;
