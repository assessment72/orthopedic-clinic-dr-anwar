'use client';

import React, { useState } from 'react';

interface SelectedRegion {
  id: string;
  notes?: string;
  diagnosis?: string;
  xray?: string;
}

interface SkeletonMapProps {
  selectedRegions: SelectedRegion[];
  onSelectRegion: (region: SelectedRegion) => void;
  onDeselectRegion: (id: string) => void;
  onClearAll: () => void;
  onUpdateRegionNotes: (id: string, notes: string) => void;
  lang: 'ar' | 'en';
}

const regionsData = {
  front: [
    { id: 'skull', label: 'الجمجمة', path: 'M120,50 Q140,30 160,50 L170,80 L130,80 Z' },
    { id: 'jaw', label: 'الفك', path: 'M130,80 L170,80 L165,100 L135,100 Z' },
    { id: 'neck', label: 'الرقبة', path: 'M140,100 L160,100 L165,130 L135,130 Z' },
    { id: 'shoulderRight', label: 'الكتف الأيمن', path: 'M180,130 L210,130 L220,160 L190,160 Z' },
    { id: 'shoulderLeft', label: 'الكتف الأيسر', path: 'M90,130 L120,130 L110,160 L80,160 Z' },
    { id: 'armRight', label: 'العضد الأيمن', path: 'M210,160 L225,160 L230,210 L215,210 Z' },
    { id: 'armLeft', label: 'العضد الأيسر', path: 'M75,160 L90,160 L85,210 L70,210 Z' },
    { id: 'elbowRight', label: 'المرفق الأيمن', path: 'M215,210 L230,210 L225,235 L210,235 Z' },
    { id: 'elbowLeft', label: 'المرفق الأيسر', path: 'M70,210 L85,210 L80,235 L65,235 Z' },
    { id: 'forearmRight', label: 'الساعد الأيمن', path: 'M210,235 L225,235 L220,270 L205,270 Z' },
    { id: 'forearmLeft', label: 'الساعد الأيسر', path: 'M65,235 L80,235 L75,270 L60,270 Z' },
    { id: 'wristRight', label: 'الرسغ الأيمن', path: 'M205,270 L220,270 L215,285 L200,285 Z' },
    { id: 'wristLeft', label: 'الرسغ الأيسر', path: 'M60,270 L75,270 L70,285 L55,285 Z' },
    { id: 'handRight', label: 'اليد اليمنى', path: 'M200,285 L215,285 L210,310 L195,310 Z' },
    { id: 'handLeft', label: 'اليد اليسرى', path: 'M55,285 L70,285 L65,310 L50,310 Z' },
    { id: 'fingersRight', label: 'أصابع اليد اليمنى', path: 'M195,310 L210,310 L205,330 L190,330 Z' },
    { id: 'fingersLeft', label: 'أصابع اليد اليسرى', path: 'M50,310 L65,310 L60,330 L45,330 Z' },
    { id: 'cervicalSpine', label: 'العمود الفقري العنقي', path: 'M150,130 L160,130 L160,160 L150,160 Z' },
    { id: 'thoracicSpine', label: 'العمود الفقري الصدري', path: 'M150,160 L160,160 L160,220 L150,220 Z' },
    { id: 'lumbarSpine', label: 'العمود الفقري القطني', path: 'M150,220 L160,220 L160,260 L150,260 Z' },
    { id: 'pelvis', label: 'الحوض', path: 'M130,260 L170,260 L180,290 L120,290 Z' },
    { id: 'hipRight', label: 'الورك الأيمن', path: 'M180,290 L200,290 L210,320 L190,320 Z' },
    { id: 'hipLeft', label: 'الورك الأيسر', path: 'M120,290 L100,290 L90,320 L110,320 Z' },
    { id: 'thighRight', label: 'الفخذ الأيمن', path: 'M190,320 L210,320 L215,370 L195,370 Z' },
    { id: 'thighLeft', label: 'الفخذ الأيسر', path: 'M110,320 L90,320 L85,370 L105,370 Z' },
    { id: 'kneeRight', label: 'الركبة اليمنى', path: 'M195,370 L215,370 L210,390 L190,390 Z' },
    { id: 'kneeLeft', label: 'الركبة اليسرى', path: 'M105,370 L85,370 L90,390 L110,390 Z' },
    { id: 'legRight', label: 'الساق الأيمن', path: 'M190,390 L210,390 L200,440 L180,440 Z' },
    { id: 'legLeft', label: 'الساق الأيسر', path: 'M110,390 L90,390 L100,440 L120,440 Z' },
    { id: 'ankleRight', label: 'الكاحل الأيمن', path: 'M180,440 L200,440 L195,460 L185,460 Z' },
    { id: 'ankleLeft', label: 'الكاحل الأيسر', path: 'M120,440 L100,440 L105,460 L115,460 Z' },
    { id: 'footRight', label: 'القدم اليمنى', path: 'M185,460 L195,460 L200,490 L180,490 Z' },
    { id: 'footLeft', label: 'القدم اليسرى', path: 'M115,460 L105,460 L100,490 L120,490 Z' },
    { id: 'toesRight', label: 'أصابع القدم اليمنى', path: 'M180,490 L200,490 L195,510 L185,510 Z' },
    { id: 'toesLeft', label: 'أصابع القدم اليسرى', path: 'M120,490 L100,490 L105,510 L115,510 Z' },
  ],
  back: [
    // مؤقتاً نفس المسارات، يمكنك استبدالها بمسارات خلفية حقيقية لاحقاً
    { id: 'skull', label: 'الجمجمة', path: 'M120,50 Q140,30 160,50 L170,80 L130,80 Z' },
    { id: 'jaw', label: 'الفك', path: 'M130,80 L170,80 L165,100 L135,100 Z' },
    { id: 'neck', label: 'الرقبة', path: 'M140,100 L160,100 L165,130 L135,130 Z' },
    { id: 'shoulderRight', label: 'الكتف الأيمن', path: 'M180,130 L210,130 L220,160 L190,160 Z' },
    { id: 'shoulderLeft', label: 'الكتف الأيسر', path: 'M90,130 L120,130 L110,160 L80,160 Z' },
    { id: 'armRight', label: 'العضد الأيمن', path: 'M210,160 L225,160 L230,210 L215,210 Z' },
    { id: 'armLeft', label: 'العضد الأيسر', path: 'M75,160 L90,160 L85,210 L70,210 Z' },
    { id: 'elbowRight', label: 'المرفق الأيمن', path: 'M215,210 L230,210 L225,235 L210,235 Z' },
    { id: 'elbowLeft', label: 'المرفق الأيسر', path: 'M70,210 L85,210 L80,235 L65,235 Z' },
    { id: 'forearmRight', label: 'الساعد الأيمن', path: 'M210,235 L225,235 L220,270 L205,270 Z' },
    { id: 'forearmLeft', label: 'الساعد الأيسر', path: 'M65,235 L80,235 L75,270 L60,270 Z' },
    { id: 'wristRight', label: 'الرسغ الأيمن', path: 'M205,270 L220,270 L215,285 L200,285 Z' },
    { id: 'wristLeft', label: 'الرسغ الأيسر', path: 'M60,270 L75,270 L70,285 L55,285 Z' },
    { id: 'handRight', label: 'اليد اليمنى', path: 'M200,285 L215,285 L210,310 L195,310 Z' },
    { id: 'handLeft', label: 'اليد اليسرى', path: 'M55,285 L70,285 L65,310 L50,310 Z' },
    { id: 'fingersRight', label: 'أصابع اليد اليمنى', path: 'M195,310 L210,310 L205,330 L190,330 Z' },
    { id: 'fingersLeft', label: 'أصابع اليد اليسرى', path: 'M50,310 L65,310 L60,330 L45,330 Z' },
    { id: 'cervicalSpine', label: 'العمود الفقري العنقي', path: 'M150,130 L160,130 L160,160 L150,160 Z' },
    { id: 'thoracicSpine', label: 'العمود الفقري الصدري', path: 'M150,160 L160,160 L160,220 L150,220 Z' },
    { id: 'lumbarSpine', label: 'العمود الفقري القطني', path: 'M150,220 L160,220 L160,260 L150,260 Z' },
    { id: 'pelvis', label: 'الحوض', path: 'M130,260 L170,260 L180,290 L120,290 Z' },
    { id: 'hipRight', label: 'الورك الأيمن', path: 'M180,290 L200,290 L210,320 L190,320 Z' },
    { id: 'hipLeft', label: 'الورك الأيسر', path: 'M120,290 L100,290 L90,320 L110,320 Z' },
    { id: 'thighRight', label: 'الفخذ الأيمن', path: 'M190,320 L210,320 L215,370 L195,370 Z' },
    { id: 'thighLeft', label: 'الفخذ الأيسر', path: 'M110,320 L90,320 L85,370 L105,370 Z' },
    { id: 'kneeRight', label: 'الركبة اليمنى', path: 'M195,370 L215,370 L210,390 L190,390 Z' },
    { id: 'kneeLeft', label: 'الركبة اليسرى', path: 'M105,370 L85,370 L90,390 L110,390 Z' },
    { id: 'legRight', label: 'الساق الأيمن', path: 'M190,390 L210,390 L200,440 L180,440 Z' },
    { id: 'legLeft', label: 'الساق الأيسر', path: 'M110,390 L90,390 L100,440 L120,440 Z' },
    { id: 'ankleRight', label: 'الكاحل الأيمن', path: 'M180,440 L200,440 L195,460 L185,460 Z' },
    { id: 'ankleLeft', label: 'الكاحل الأيسر', path: 'M120,440 L100,440 L105,460 L115,460 Z' },
    { id: 'footRight', label: 'القدم اليمنى', path: 'M185,460 L195,460 L200,490 L180,490 Z' },
    { id: 'footLeft', label: 'القدم اليسرى', path: 'M115,460 L105,460 L100,490 L120,490 Z' },
    { id: 'toesRight', label: 'أصابع القدم اليمنى', path: 'M180,490 L200,490 L195,510 L185,510 Z' },
    { id: 'toesLeft', label: 'أصابع القدم اليسرى', path: 'M120,490 L100,490 L105,510 L115,510 Z' },
  ]
};

export default function SkeletonMap({ selectedRegions, onSelectRegion, onDeselectRegion, onClearAll, onUpdateRegionNotes, lang }: SkeletonMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [popupRegion, setPopupRegion] = useState<SelectedRegion | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const currentRegions = view === 'front' ? regionsData.front : regionsData.back;

  const handleRegionClick = (region: any) => {
    const existing = selectedRegions.find(r => r.id === region.id);
    if (existing) {
      setPopupRegion(existing);
      setTempNotes(existing.notes || '');
    } else {
      onSelectRegion({ id: region.id, notes: '' });
    }
  };

  const handleSaveNotes = () => {
    if (popupRegion) {
      onUpdateRegionNotes(popupRegion.id, tempNotes);
      setPopupRegion(null);
    }
  };

  const getLabel = (id: string) => {
    const r = currentRegions.find(r => r.id === id);
    return r ? r.label : id;
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow relative">
      <div className="flex justify-center gap-3 mb-4">
        <button onClick={() => setView('front')} className={`px-4 py-2 rounded ${view === 'front' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          {lang === 'ar' ? 'أمامي' : 'Front'}
        </button>
        <button onClick={() => setView('back')} className={`px-4 py-2 rounded ${view === 'back' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          {lang === 'ar' ? 'خلفي' : 'Back'}
        </button>
        <button onClick={onClearAll} className="px-4 py-2 bg-red-500 text-white rounded">
          {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <svg viewBox="0 0 300 550" className="w-full h-auto">
          {currentRegions.map((region) => {
            const isSelected = selectedRegions.some(r => r.id === region.id);
            const isHovered = hoveredRegion === region.id;
            return (
              <g key={region.id}>
                <path
                  d={region.path}
                  fill={isSelected ? '#3b82f6' : isHovered ? '#93c5fd' : '#cbd5e1'}
                  stroke="#1e293b"
                  strokeWidth="2"
                  className="cursor-pointer transition-colors"
                  onClick={() => handleRegionClick(region)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                {isHovered && (
                  <foreignObject x="10" y="10" width="120" height="30">
                    <div className="bg-black text-white text-xs p-1 rounded shadow">{region.label}</div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {selectedRegions.map((sel) => (
          <span key={sel.id} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {getLabel(sel.id)}
            {sel.notes && <span className="text-xs text-gray-600">📝</span>}
            <button onClick={() => { setPopupRegion(sel); setTempNotes(sel.notes || ''); }} className="text-blue-600">✏️</button>
            <button onClick={() => onDeselectRegion(sel.id)} className="text-red-500">✕</button>
          </span>
        ))}
      </div>

      {popupRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{getLabel(popupRegion.id)}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">ملاحظات</label>
                <textarea value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} className="w-full border rounded p-2" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setPopupRegion(null)} className="px-4 py-2 bg-gray-300 rounded">إلغاء</button>
              <button onClick={handleSaveNotes} className="px-4 py-2 bg-blue-600 text-white rounded">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
        }
