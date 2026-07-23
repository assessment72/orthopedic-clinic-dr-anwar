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

// تعريف المناطق مع إحداثيات نسبية (بالنسبة المئوية)
const regions = [
  { id: 'skull', label: 'الجمجمة', x: 40, y: 5, w: 20, h: 12 },
  { id: 'neck', label: 'الرقبة', x: 45, y: 18, w: 10, h: 8 },
  { id: 'shoulderRight', label: 'الكتف الأيمن', x: 70, y: 22, w: 15, h: 10 },
  { id: 'shoulderLeft', label: 'الكتف الأيسر', x: 15, y: 22, w: 15, h: 10 },
  { id: 'armRight', label: 'العضد الأيمن', x: 75, y: 32, w: 8, h: 15 },
  { id: 'armLeft', label: 'العضد الأيسر', x: 17, y: 32, w: 8, h: 15 },
  { id: 'elbowRight', label: 'المرفق الأيمن', x: 78, y: 47, w: 10, h: 6 },
  { id: 'elbowLeft', label: 'المرفق الأيسر', x: 12, y: 47, w: 10, h: 6 },
  { id: 'forearmRight', label: 'الساعد الأيمن', x: 76, y: 53, w: 8, h: 12 },
  { id: 'forearmLeft', label: 'الساعد الأيسر', x: 16, y: 53, w: 8, h: 12 },
  { id: 'wristRight', label: 'الرسغ الأيمن', x: 77, y: 65, w: 8, h: 6 },
  { id: 'wristLeft', label: 'الرسغ الأيسر', x: 15, y: 65, w: 8, h: 6 },
  { id: 'handRight', label: 'اليد اليمنى', x: 75, y: 71, w: 10, h: 8 },
  { id: 'handLeft', label: 'اليد اليسرى', x: 15, y: 71, w: 10, h: 8 },
  { id: 'fingersRight', label: 'أصابع اليد اليمنى', x: 73, y: 79, w: 12, h: 6 },
  { id: 'fingersLeft', label: 'أصابع اليد اليسرى', x: 15, y: 79, w: 12, h: 6 },
  { id: 'cervicalSpine', label: 'العمود الفقري العنقي', x: 47, y: 18, w: 6, h: 8 },
  { id: 'thoracicSpine', label: 'العمود الفقري الصدري', x: 47, y: 26, w: 6, h: 15 },
  { id: 'lumbarSpine', label: 'العمود الفقري القطني', x: 47, y: 41, w: 6, h: 12 },
  { id: 'pelvis', label: 'الحوض', x: 38, y: 53, w: 24, h: 10 },
  { id: 'hipRight', label: 'الورك الأيمن', x: 62, y: 55, w: 12, h: 10 },
  { id: 'hipLeft', label: 'الورك الأيسر', x: 26, y: 55, w: 12, h: 10 },
  { id: 'thighRight', label: 'الفخذ الأيمن', x: 60, y: 65, w: 10, h: 15 },
  { id: 'thighLeft', label: 'الفخذ الأيسر', x: 30, y: 65, w: 10, h: 15 },
  { id: 'kneeRight', label: 'الركبة اليمنى', x: 58, y: 80, w: 12, h: 6 },
  { id: 'kneeLeft', label: 'الركبة اليسرى', x: 30, y: 80, w: 12, h: 6 },
  { id: 'legRight', label: 'الساق الأيمن', x: 60, y: 86, w: 8, h: 12 },
  { id: 'legLeft', label: 'الساق الأيسر', x: 32, y: 86, w: 8, h: 12 },
  { id: 'ankleRight', label: 'الكاحل الأيمن', x: 60, y: 98, w: 10, h: 5 },
  { id: 'ankleLeft', label: 'الكاحل الأيسر', x: 30, y: 98, w: 10, h: 5 },
  { id: 'footRight', label: 'القدم اليمنى', x: 55, y: 103, w: 18, h: 8 },
  { id: 'footLeft', label: 'القدم اليسرى', x: 27, y: 103, w: 18, h: 8 },
  { id: 'toesRight', label: 'أصابع القدم اليمنى', x: 53, y: 111, w: 20, h: 5 },
  { id: 'toesLeft', label: 'أصابع القدم اليسرى', x: 27, y: 111, w: 20, h: 5 },
];

export default function SkeletonMap({
  selectedRegions,
  onSelectRegion,
  onDeselectRegion,
  onClearAll,
  onUpdateRegionNotes,
  lang,
}: SkeletonMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [popupRegion, setPopupRegion] = useState<SelectedRegion | null>(null);
  const [tempNotes, setTempNotes] = useState('');

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
    const r = regions.find(r => r.id === id);
    return r ? r.label : id;
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow relative">
      {/* أزرار التحكم */}
      <div className="flex justify-center gap-3 mb-4">
        <button onClick={onClearAll} className="px-4 py-2 bg-red-500 text-white rounded">
          {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
      </div>

      {/* صورة الهيكل العظمي مع المناطق التفاعلية */}
      <div className="relative w-full max-w-md mx-auto">
        {/* صورة الهيكل العظمي */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Human_skeleton_front_en.svg/500px-Human_skeleton_front_en.svg.png"
          alt="Skeleton"
          className="w-full h-auto"
          style={{ pointerEvents: 'none' }}
        />

        {/* المناطق التفاعلية (شفافة فوق الصورة) */}
        <div className="absolute inset-0">
          {regions.map((region) => {
            const isSelected = selectedRegions.some(r => r.id === region.id);
            const isHovered = hoveredRegion === region.id;
            return (
              <div
                key={region.id}
                className="absolute cursor-pointer transition-colors duration-200"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.w}%`,
                  height: `${region.h}%`,
                  backgroundColor: isSelected
                    ? 'rgba(59, 130, 246, 0.4)'
                    : isHovered
                    ? 'rgba(147, 197, 253, 0.3)'
                    : 'rgba(0,0,0,0)',
                  border: isSelected ? '2px solid #3b82f6' : 'none',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {/* عرض اسم المنطقة عند التمرير */}
                {isHovered && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {region.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* عرض البطاقات */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {selectedRegions.map((sel) => (
          <span
            key={sel.id}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            {getLabel(sel.id)}
            {sel.notes && <span className="text-xs text-gray-600">📝</span>}
            <button
              onClick={() => {
                setPopupRegion(sel);
                setTempNotes(sel.notes || '');
              }}
              className="text-blue-600"
            >
              ✏️
            </button>
            <button onClick={() => onDeselectRegion(sel.id)} className="text-red-500">
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* نافذة منبثقة لإضافة ملاحظات */}
      {popupRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{getLabel(popupRegion.id)}</h3>
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
