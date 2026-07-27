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

// تعريف المناطق مع إحداثيات نسبية (بالنسبة المئوية) - متوافقة مع صورة الهيكل العظمي
const regions = [
  // الرأس والرقبة
  { id: 'skull', label: 'الجمجمة', x: 35, y: 2, w: 32, h: 16 },
  { id: 'jaw', label: 'الفك', x: 38, y: 17, w: 26, h: 6 },
  { id: 'neck', label: 'الرقبة', x: 43, y: 22, w: 16, h: 7 },

  // الصدر والأضلاع
  { id: 'sternum', label: 'القص', x: 43, y: 28, w: 14, h: 10 },
  { id: 'ribs_right', label: 'الأضلاع اليمنى', x: 58, y: 28, w: 18, h: 12 },
  { id: 'ribs_left', label: 'الأضلاع اليسرى', x: 24, y: 28, w: 18, h: 12 },

  // الكتفين
  { id: 'shoulderRight', label: 'الكتف الأيمن', x: 70, y: 26, w: 20, h: 9 },
  { id: 'shoulderLeft', label: 'الكتف الأيسر', x: 12, y: 26, w: 20, h: 9 },

  // الذراع الأيمن
  { id: 'armRight', label: 'العضد الأيمن', x: 76, y: 34, w: 10, h: 16 },
  { id: 'elbowRight', label: 'المرفق الأيمن', x: 74, y: 48, w: 14, h: 6 },
  { id: 'forearmRight', label: 'الساعد الأيمن', x: 76, y: 53, w: 10, h: 14 },
  { id: 'wristRight', label: 'الرسغ الأيمن', x: 74, y: 65, w: 12, h: 5 },
  { id: 'handRight', label: 'اليد اليمنى', x: 73, y: 69, w: 14, h: 8 },
  { id: 'fingersRight', label: 'أصابع اليد اليمنى', x: 72, y: 76, w: 16, h: 6 },

  // الذراع الأيسر
  { id: 'armLeft', label: 'العضد الأيسر', x: 14, y: 34, w: 10, h: 16 },
  { id: 'elbowLeft', label: 'المرفق الأيسر', x: 12, y: 48, w: 14, h: 6 },
  { id: 'forearmLeft', label: 'الساعد الأيسر', x: 14, y: 53, w: 10, h: 14 },
  { id: 'wristLeft', label: 'الرسغ الأيسر', x: 14, y: 65, w: 12, h: 5 },
  { id: 'handLeft', label: 'اليد اليسرى', x: 13, y: 69, w: 14, h: 8 },
  { id: 'fingersLeft', label: 'أصابع اليد اليسرى', x: 12, y: 76, w: 16, h: 6 },

  // العمود الفقري
  { id: 'cervicalSpine', label: 'العمود الفقري العنقي', x: 44, y: 22, w: 12, h: 7 },
  { id: 'thoracicSpine', label: 'العمود الفقري الصدري', x: 44, y: 28, w: 12, h: 16 },
  { id: 'lumbarSpine', label: 'العمود الفقري القطني', x: 44, y: 42, w: 12, h: 12 },

  // الحوض
  { id: 'pelvis', label: 'الحوض', x: 34, y: 52, w: 32, h: 10 },

  // الوركان
  { id: 'hipRight', label: 'الورك الأيمن', x: 66, y: 54, w: 14, h: 10 },
  { id: 'hipLeft', label: 'الورك الأيسر', x: 20, y: 54, w: 14, h: 10 },

  // الساق اليمنى
  { id: 'thighRight', label: 'الفخذ الأيمن', x: 63, y: 62, w: 12, h: 16 },
  { id: 'kneeRight', label: 'الركبة اليمنى', x: 60, y: 76, w: 16, h: 5 },
  { id: 'legRight', label: 'الساق الأيمن', x: 63, y: 80, w: 12, h: 14 },
  { id: 'ankleRight', label: 'الكاحل الأيمن', x: 60, y: 92, w: 16, h: 5 },
  { id: 'footRight', label: 'القدم اليمنى', x: 54, y: 96, w: 24, h: 8 },
  { id: 'toesRight', label: 'أصابع القدم اليمنى', x: 52, y: 102, w: 28, h: 5 },

  // الساق اليسرى
  { id: 'thighLeft', label: 'الفخذ الأيسر', x: 25, y: 62, w: 12, h: 16 },
  { id: 'kneeLeft', label: 'الركبة اليسرى', x: 24, y: 76, w: 16, h: 5 },
  { id: 'legLeft', label: 'الساق الأيسر', x: 25, y: 80, w: 12, h: 14 },
  { id: 'ankleLeft', label: 'الكاحل الأيسر', x: 24, y: 92, w: 16, h: 5 },
  { id: 'footLeft', label: 'القدم اليسرى', x: 22, y: 96, w: 24, h: 8 },
  { id: 'toesLeft', label: 'أصابع القدم اليسرى', x: 20, y: 102, w: 28, h: 5 },
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
  const [imageError, setImageError] = useState(false);

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

  // رابط الصورة من ويكيبيديا
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Appendicular_skeleton_diagram-ar.svg';

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow relative">
      {/* أزرار التحكم */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={onClearAll}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
      </div>

      {/* صورة الهيكل العظمي مع المناطق التفاعلية */}
      <div className="relative w-full max-w-md mx-auto">
        {/* صورة الهيكل العظمي */}
        {!imageError ? (
          <img
            src={imageUrl}
            alt="الهيكل العظمي"
            className="w-full h-auto"
            style={{ pointerEvents: 'none' }}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-semibold">⚠️ لم يتم تحميل الصورة</p>
              <p className="text-sm">يرجى التحقق من اتصال الإنترنت أو تحديث الصفحة</p>
            </div>
          </div>
        )}

        {/* المناطق التفاعلية (شفافة فوق الصورة) */}
        <div className="absolute inset-0">
          {regions.map((region) => {
            const isSelected = selectedRegions.some(r => r.id === region.id);
            const isHovered = hoveredRegion === region.id;
            return (
              <div
                key={region.id}
                className="absolute cursor-pointer transition-all duration-200"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.w}%`,
                  height: `${region.h}%`,
                  backgroundColor: isSelected
                    ? 'rgba(59, 130, 246, 0.5)'
                    : isHovered
                    ? 'rgba(147, 197, 253, 0.4)'
                    : 'rgba(0,0,0,0)',
                  border: isSelected ? '2px solid #2563eb' : 'none',
                  borderRadius: '6px',
                  boxShadow: isSelected ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {/* عرض اسم المنطقة عند التمرير */}
                {isHovered && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
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
              className="text-blue-600 hover:text-blue-800"
            >
              ✏️
            </button>
            <button onClick={() => onDeselectRegion(sel.id)} className="text-red-500 hover:text-red-700">
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
                <label className="block text-sm font-medium">
                  {lang === 'ar' ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                  placeholder={lang === 'ar' ? 'أضف ملاحظات حول هذا الموضع...' : 'Add notes about this location...'}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setPopupRegion(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {lang === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
