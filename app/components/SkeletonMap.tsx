'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Region {
  id: string;
  label: string;
  path: string;
  view: 'front' | 'back';
}

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
  initialRegions?: SelectedRegion[]; // لتحميل البيانات المحفوظة
}

// تعريف المناطق مع مسارات SVG تفصيلية (هذه مسارات عشوائية، استبدلها بمسارات حقيقية)
const regionsData: Region[] = [
  // الرأس والرقبة
  { id: 'skull', label: 'الجمجمة', path: 'M120,50 Q140,30 160,50 L170,80 L130,80 Z', view: 'front' },
  { id: 'jaw', label: 'الفك', path: 'M130,80 L170,80 L165,100 L135,100 Z', view: 'front' },
  { id: 'neck', label: 'الرقبة', path: 'M140,100 L160,100 L165,130 L135,130 Z', view: 'front' },
  // الكتفين
  { id: 'shoulderRight', label: 'الكتف الأيمن', path: 'M180,130 L210,130 L220,160 L190,160 Z', view: 'front' },
  { id: 'shoulderLeft', label: 'الكتف الأيسر', path: 'M90,130 L120,130 L110,160 L80,160 Z', view: 'front' },
  // الذراعان (عضد، مرفق، ساعد، رسغ، يد، أصابع) - كل جهة على حدة
  { id: 'armRight', label: 'العضد الأيمن', path: 'M210,160 L225,160 L230,210 L215,210 Z', view: 'front' },
  { id: 'armLeft', label: 'العضد الأيسر', path: 'M75,160 L90,160 L85,210 L70,210 Z', view: 'front' },
  { id: 'elbowRight', label: 'المرفق الأيمن', path: 'M215,210 L230,210 L225,235 L210,235 Z', view: 'front' },
  { id: 'elbowLeft', label: 'المرفق الأيسر', path: 'M70,210 L85,210 L80,235 L65,235 Z', view: 'front' },
  { id: 'forearmRight', label: 'الساعد الأيمن', path: 'M210,235 L225,235 L220,270 L205,270 Z', view: 'front' },
  { id: 'forearmLeft', label: 'الساعد الأيسر', path: 'M65,235 L80,235 L75,270 L60,270 Z', view: 'front' },
  { id: 'wristRight', label: 'الرسغ الأيمن', path: 'M205,270 L220,270 L215,285 L200,285 Z', view: 'front' },
  { id: 'wristLeft', label: 'الرسغ الأيسر', path: 'M60,270 L75,270 L70,285 L55,285 Z', view: 'front' },
  { id: 'handRight', label: 'اليد اليمنى', path: 'M200,285 L215,285 L210,310 L195,310 Z', view: 'front' },
  { id: 'handLeft', label: 'اليد اليسرى', path: 'M55,285 L70,285 L65,310 L50,310 Z', view: 'front' },
  { id: 'fingersRight', label: 'أصابع اليد اليمنى', path: 'M195,310 L210,310 L205,330 L190,330 Z', view: 'front' },
  { id: 'fingersLeft', label: 'أصابع اليد اليسرى', path: 'M50,310 L65,310 L60,330 L45,330 Z', view: 'front' },
  // العمود الفقري (ثلاثة أقسام)
  { id: 'cervicalSpine', label: 'العمود الفقري العنقي', path: 'M150,130 L160,130 L160,160 L150,160 Z', view: 'front' },
  { id: 'thoracicSpine', label: 'العمود الفقري الصدري', path: 'M150,160 L160,160 L160,220 L150,220 Z', view: 'front' },
  { id: 'lumbarSpine', label: 'العمود الفقري القطني', path: 'M150,220 L160,220 L160,260 L150,260 Z', view: 'front' },
  // الحوض
  { id: 'pelvis', label: 'الحوض', path: 'M130,260 L170,260 L180,290 L120,290 Z', view: 'front' },
  // الوركان
  { id: 'hipRight', label: 'الورك الأيمن', path: 'M180,290 L200,290 L210,320 L190,320 Z', view: 'front' },
  { id: 'hipLeft', label: 'الورك الأيسر', path: 'M120,290 L100,290 L90,320 L110,320 Z', view: 'front' },
  // الفخذان
  { id: 'thighRight', label: 'الفخذ الأيمن', path: 'M190,320 L210,320 L215,370 L195,370 Z', view: 'front' },
  { id: 'thighLeft', label: 'الفخذ الأيسر', path: 'M110,320 L90,320 L85,370 L105,370 Z', view: 'front' },
  // الركبتان
  { id: 'kneeRight', label: 'الركبة اليمنى', path: 'M195,370 L215,370 L210,390 L190,390 Z', view: 'front' },
  { id: 'kneeLeft', label: 'الركبة اليسرى', path: 'M105,370 L85,370 L90,390 L110,390 Z', view: 'front' },
  // الساقان
  { id: 'legRight', label: 'الساق الأيمن', path: 'M190,390 L210,390 L200,440 L180,440 Z', view: 'front' },
  { id: 'legLeft', label: 'الساق الأيسر', path: 'M110,390 L90,390 L100,440 L120,440 Z', view: 'front' },
  // الكاحلان
  { id: 'ankleRight', label: 'الكاحل الأيمن', path: 'M180,440 L200,440 L195,460 L185,460 Z', view: 'front' },
  { id: 'ankleLeft', label: 'الكاحل الأيسر', path: 'M120,440 L100,440 L105,460 L115,460 Z', view: 'front' },
  // القدمان
  { id: 'footRight', label: 'القدم اليمنى', path: 'M185,460 L195,460 L200,490 L180,490 Z', view: 'front' },
  { id: 'footLeft', label: 'القدم اليسرى', path: 'M115,460 L105,460 L100,490 L120,490 Z', view: 'front' },
  // أصابع القدم
  { id: 'toesRight', label: 'أصابع القدم اليمنى', path: 'M180,490 L200,490 L195,510 L185,510 Z', view: 'front' },
  { id: 'toesLeft', label: 'أصابع القدم اليسرى', path: 'M120,490 L100,490 L105,510 L115,510 Z', view: 'front' },
];

// نفس المناطق ولكن للخلف (نفس المعرفات مع مسارات مختلفة)
const backRegionsData: Region[] = regionsData.map(r => ({
  ...r,
  // تعديل المسارات لتناسب الرؤية الخلفية (هنا نكرر نفس المسارات مؤقتاً)
  path: r.path, // يجب استبدالها بمسارات خلفية حقيقية
  view: 'back' as const,
}));

export default function SkeletonMap({
  selectedRegions,
  onSelectRegion,
  onDeselectRegion,
  onClearAll,
  onUpdateRegionNotes,
  lang,
  initialRegions = [],
}: SkeletonMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [popupRegion, setPopupRegion] = useState<SelectedRegion | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const currentRegions = view === 'front' ? regionsData : backRegionsData;

  // تحميل المناطق الأولية (عند التعديل)
  useEffect(() => {
    if (initialRegions.length > 0) {
      // يمكن استخدامها لتهيئة الحالة ولكننا نعتمد على props من الصفحة
    }
  }, [initialRegions]);

  const handleRegionClick = (region: Region) => {
    const existing = selectedRegions.find(r => r.id === region.id);
    if (existing) {
      // إذا كانت المنطقة محددة بالفعل، نفتح نافذة التعديل
      setPopupRegion(existing);
      setTempNotes(existing.notes || '');
    } else {
      // إضافة منطقة جديدة مع ملاحظات فارغة
      onSelectRegion({ id: region.id, notes: '' });
    }
  };

  const handleSaveNotes = () => {
    if (popupRegion) {
      onUpdateRegionNotes(popupRegion.id, tempNotes);
      setPopupRegion(null);
    }
  };

  const getRegionLabel = (id: string) => {
    const region = currentRegions.find(r => r.id === id);
    return region ? region.label : id;
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow relative">
      {/* أزرار العرض */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => setView('front')}
          className={`px-4 py-2 rounded ${view === 'front' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {lang === 'ar' ? 'أمامي' : 'Front'}
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-4 py-2 rounded ${view === 'back' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {lang === 'ar' ? 'خلفي' : 'Back'}
        </button>
        <button onClick={onClearAll} className="px-4 py-2 bg-red-500 text-white rounded">
          {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
      </div>

      {/* SVG */}
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
                {/* Tooltip */}
                {isHovered && (
                  <foreignObject x="10" y="10" width="120" height="30">
                    <div className="bg-black text-white text-xs p-1 rounded shadow">
                      {region.label}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* عرض البطاقات مع خيار إضافة ملاحظات */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {selectedRegions.map((sel) => (
          <span
            key={sel.id}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            {getRegionLabel(sel.id)}
            {sel.notes && <span className="text-xs text-gray-600">📝</span>}
            <button
              onClick={() => {
                setPopupRegion(sel);
                setTempNotes(sel.notes || '');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ✏️
            </button>
            <button
              onClick={() => onDeselectRegion(sel.id)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* نافذة منبثقة لإضافة ملاحظات وتشخيص وصورة أشعة */}
      {popupRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {getRegionLabel(popupRegion.id)}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">ملاحظات</label>
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full border rounded p-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">التشخيص (اختياري)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="مثل: كسر مفتت"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">رابط صورة الأشعة</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="رابط الصورة"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setPopupRegion(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                }
