import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const SecuritySummaryCard = () => {
  const securityFeatures = [
    { title: 'Authentication Protocol', desc: 'JWT + bcrypt hash' },
    { title: 'User Access Control', desc: 'Restricted email list' },
    { title: 'Expiry Protection', desc: 'Auto-expiration policy' },
    { title: 'Passcode Protection', desc: 'Hashed security key' },
    { title: 'Download Quota', desc: 'Automatic link lock' },
    { title: 'Activity Audit Log', desc: 'Timestamped history' },
  ];

  return (
    <div className="bg-[#093d62] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/10 text-white rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base tracking-wide text-white">CONTROL PROTOCOL SECURITY</h3>
          <p className="text-xs text-sky-200">Enterprise grade access policy enforcement</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {securityFeatures.map((item, idx) => (
          <div key={idx} className="bg-white/10 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">{item.title}</p>
              <p className="text-[10px] text-sky-200">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecuritySummaryCard;
