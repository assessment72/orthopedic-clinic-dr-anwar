'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SelectedRegion {
  id: string;
  notes?: string;
  diagnosis?: string;
  xray?: string;
  injuryType?: 'fracture' | 'sprain' | 'tumor' | 'inflammation' | 'general';
}

interface SkeletonMapProps {
  selectedRegions: SelectedRegion[];
  onSelectRegion: (region: SelectedRegion) => void;
  onDeselectRegion: (id: string) => void;
  onClearAll: () => void;
  onUpdateRegionNotes: (id: string, notes: string) => void;
  onUpdateRegionInjuryType?: (id: string, injuryType: SelectedRegion['injuryType']) => void;
  lang: 'ar' | 'en';
}

// تعريف المناطق مع إحداثيات نسبية (بالنسبة المئوية) - متوافقة مع صورة الهيكل العظمي
const regions = [
  // الرأس والرقبة
  { id: 'skull', label: 'الجمجمة', x: 32, y: 1, w: 36, h: 18 },
  { id: 'jaw', label: 'الفك', x: 36, y: 16, w: 28, h: 7 },
  { id: 'neck', label: 'الرقبة', x: 42, y: 21, w: 16, h: 8 },

  // الصدر والأضلاع
  { id: 'sternum', label: 'القص', x: 42, y: 27, w: 16, h: 12 },
  { id: 'ribs_right', label: 'الأضلاع اليمنى', x: 58, y: 27, w: 20, h: 14 },
  { id: 'ribs_left', label: 'الأضلاع اليسرى', x: 22, y: 27, w: 20, h: 14 },
  { id: 'upper_abdomen', label: 'البطن العلوي', x: 40, y: 39, w: 20, h: 8 },
  { id: 'lower_abdomen', label: 'البطن السفلي', x: 40, y: 47, w: 20, h: 7 },

  // الكتفين
  { id: 'shoulderRight', label: 'الكتف الأيمن', x: 70, y: 24, w: 22, h: 10 },
  { id: 'shoulderLeft', label: 'الكتف الأيسر', x: 8, y: 24, w: 22, h: 10 },

  // الذراع الأيمن
  { id: 'armRight', label: 'العضد الأيمن', x: 76, y: 34, w: 12, h: 18 },
  { id: 'elbowRight', label: 'المرفق الأيمن', x: 74, y: 48, w: 16, h: 7 },
  { id: 'forearmRight', label: 'الساعد الأيمن', x: 76, y: 53, w: 12, h: 16 },
  { id: 'wristRight', label: 'الرسغ الأيمن', x: 74, y: 65, w: 14, h: 6 },
  { id: 'handRight', label: 'اليد اليمنى', x: 72, y: 69, w: 16, h: 9 },
  { id: 'fingersRight', label: 'أصابع اليد اليمنى', x: 70, y: 76, w: 20, h: 7 },

  // الذراع الأيسر
  { id: 'armLeft', label: 'العضد الأيسر', x: 12, y: 34, w: 12, h: 18 },
  { id: 'elbowLeft', label: 'المرفق الأيسر', x: 10, y: 48, w: 16, h: 7 },
  { id: 'forearmLeft', label: 'الساعد الأيسر', x: 12, y: 53, w: 12, h: 16 },
  { id: 'wristLeft', label: 'الرسغ الأيسر', x: 12, y: 65, w: 14, h: 6 },
  { id: 'handLeft', label: 'اليد اليسرى', x: 12, y: 69, w: 16, h: 9 },
  { id: 'fingersLeft', label: 'أصابع اليد اليسرى', x: 10, y: 76, w: 20, h: 7 },

  // العمود الفقري
  { id: 'cervicalSpine', label: 'العمود الفقري العنقي', x: 44, y: 21, w: 12, h: 8 },
  { id: 'thoracicSpine', label: 'العمود الفقري الصدري', x: 44, y: 27, w: 12, h: 18 },
  { id: 'lumbarSpine', label: 'العمود الفقري القطني', x: 44, y: 42, w: 12, h: 14 },
  { id: 'sacrum', label: 'العجز', x: 44, y: 52, w: 12, h: 6 },

  // الحوض
  { id: 'pelvis', label: 'الحوض', x: 32, y: 52, w: 36, h: 12 },

  // الوركان
  { id: 'hipRight', label: 'الورك الأيمن', x: 66, y: 54, w: 16, h: 12 },
  { id: 'hipLeft', label: 'الورك الأيسر', x: 18, y: 54, w: 16, h: 12 },

  // الساق اليمنى
  { id: 'thighRight', label: 'الفخذ الأيمن', x: 63, y: 62, w: 14, h: 18 },
  { id: 'kneeRight', label: 'الركبة اليمنى', x: 60, y: 76, w: 18, h: 6 },
  { id: 'legRight', label: 'الساق الأيمن', x: 63, y: 80, w: 14, h: 16 },
  { id: 'ankleRight', label: 'الكاحل الأيمن', x: 60, y: 92, w: 18, h: 6 },
  { id: 'footRight', label: 'القدم اليمنى', x: 54, y: 96, w: 28, h: 9 },
  { id: 'toesRight', label: 'أصابع القدم اليمنى', x: 50, y: 102, w: 32, h: 6 },

  // الساق اليسرى
  { id: 'thighLeft', label: 'الفخذ الأيسر', x: 23, y: 62, w: 14, h: 18 },
  { id: 'kneeLeft', label: 'الركبة اليسرى', x: 22, y: 76, w: 18, h: 6 },
  { id: 'legLeft', label: 'الساق الأيسر', x: 23, y: 80, w: 14, h: 16 },
  { id: 'ankleLeft', label: 'الكاحل الأيسر', x: 22, y: 92, w: 18, h: 6 },
  { id: 'footLeft', label: 'القدم اليسرى', x: 18, y: 96, w: 28, h: 9 },
  { id: 'toesLeft', label: 'أصابع القدم اليسرى', x: 18, y: 102, w: 32, h: 6 },
];

// أنواع الإصابات وألوانها
const injuryTypes = [
  { value: 'fracture', labelAr: 'كسر', labelEn: 'Fracture', color: '#ef4444' }, // أحمر
  { value: 'sprain', labelAr: 'التواء', labelEn: 'Sprain', color: '#f59e0b' }, // برتقالي
  { value: 'tumor', labelAr: 'ورم', labelEn: 'Tumor', color: '#8b5cf6' }, // بنفسجي
  { value: 'inflammation', labelAr: 'التهاب', labelEn: 'Inflammation', color: '#3b82f6' }, // أزرق
  { value: 'general', labelAr: 'إصابة عامة', labelEn: 'General Injury', color: '#6b7280' }, // رمادي
];

export default function SkeletonMap({
  selectedRegions,
  onSelectRegion,
  onDeselectRegion,
  onClearAll,
  onUpdateRegionNotes,
  onUpdateRegionInjuryType,
  lang,
}: SkeletonMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [popupRegion, setPopupRegion] = useState<SelectedRegion | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [tempInjuryType, setTempInjuryType] = useState<SelectedRegion['injuryType']>('general');
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRegionForZoom, setSelectedRegionForZoom] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // دالة لتحديد لون المنطقة بناءً على نوع الإصابة
  const getRegionColor = (regionId: string) => {
    const sel = selectedRegions.find(r => r.id === regionId);
    if (!sel || !sel.injuryType) return 'rgba(59, 130, 246, 0.5)'; // اللون الافتراضي (أزرق)
    const injuryType = injuryTypes.find(t => t.value === sel.injuryType);
    return injuryType ? injuryType.color + '80' : 'rgba(59, 130, 246, 0.5)'; // + '80' = شفافية 50%
  };

  const getRegionBorder = (regionId: string) => {
    const sel = selectedRegions.find(r => r.id === regionId);
    if (!sel || !sel.injuryType) return '2px solid #2563eb';
    const injuryType = injuryTypes.find(t => t.value === sel.injuryType);
    return injuryType ? `2px solid ${injuryType.color}` : '2px solid #2563eb';
  };

  const handleRegionClick = (region: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const existing = selectedRegions.find(r => r.id === region.id);
    if (existing) {
      setPopupRegion(existing);
      setTempNotes(existing.notes || '');
      setTempInjuryType(existing.injuryType || 'general');
    } else {
      // إضافة المنطقة مع نوع الإصابة الافتراضي
      onSelectRegion({ id: region.id, notes: '', injuryType: 'general' });
    }
  };

  // النقر المزدوج لتكبير منطقة محددة
  const handleDoubleClick = (regionId: string) => {
    if (selectedRegionForZoom === regionId) {
      // إذا كانت المنطقة مكبرة بالفعل، نعيد التكبير
      setSelectedRegionForZoom(null);
      setIsZoomed(false);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      // تكبير المنطقة
      setSelectedRegionForZoom(regionId);
      setIsZoomed(true);
      setZoomLevel(2.5);
      // المركز تلقائياً حول المنطقة
      const region = regions.find(r => r.id === regionId);
      if (region && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        // حساب الإزاحة لتوسيط المنطقة
        const centerX = (region.x + region.w / 2) / 100;
        const centerY = (region.y + region.h / 2) / 100;
        setPanOffset({
          x: -(centerX * containerWidth - containerWidth / 2) * 0.3,
          y: -(centerY * containerHeight - containerHeight / 2) * 0.3,
        });
      }
    }
  };

  // التحكم في التكبير والتصغير
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setIsZoomed(false);
      setPanOffset({ x: 0, y: 0 });
      setSelectedRegionForZoom(null);
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setSelectedRegionForZoom(null);
  };

  // السحب والإفلات لتحديد مناطق متعددة
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && isZoomed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPanOffset({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // السحب لتحديد مناطق متعددة (ميزة إضافية)
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

  const handleSelectionStart = (e: React.MouseEvent) => {
    if (e.shiftKey && !isZoomed) {
      setIsSelecting(true);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setSelectionStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleSelectionMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleSelectionEnd = () => {
    if (isSelecting) {
      setIsSelecting(false);
      // تحديد المناطق التي تقع داخل المستطيل المحدد
      const rect = (containerRef.current as HTMLElement).getBoundingClientRect();
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      // تحويل الإحداثيات إلى نسبة مئوية
      const width = rect.width;
      const height = rect.height;
      const minXPercent = (minX / width) * 100;
      const maxXPercent = (maxX / width) * 100;
      const minYPercent = (minY / height) * 100;
      const maxYPercent = (maxY / height) * 100;
      // اختيار المناطق التي تقاطع المستطيل
      regions.forEach(region => {
        const regionCenterX = region.x + region.w / 2;
        const regionCenterY = region.y + region.h / 2;
        if (regionCenterX >= minXPercent && regionCenterX <= maxXPercent &&
            regionCenterY >= minYPercent && regionCenterY <= maxYPercent) {
          const existing = selectedRegions.find(r => r.id === region.id);
          if (!existing) {
            onSelectRegion({ id: region.id, notes: '', injuryType: 'general' });
          }
        }
      });
    }
  };

  // إضافة مستمعي الأحداث للتكبير والتصغير باستخدام عجلة الماوس
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isZoomed) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 4));
        if (zoomLevel <= 1.2) {
          setIsZoomed(false);
          setPanOffset({ x: 0, y: 0 });
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isZoomed, zoomLevel]);

  const getLabel = (id: string) => {
    const r = regions.find(r => r.id === id);
    return r ? r.label : id;
  };

  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Appendicular_skeleton_diagram-ar.svg';

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow relative">
      {/* أزرار التحكم */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          onClick={onClearAll}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
        >
          {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
        <button
          onClick={handleZoomIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
        >
          🔍+
        </button>
        <button
          onClick={handleZoomOut}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
        >
          🔍-
        </button>
        <button
          onClick={handleResetZoom}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
        >
          {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
        </button>
        <span className="text-sm text-gray-600 self-center">
          {lang === 'ar' ? `التكبير: ${zoomLevel.toFixed(1)}x` : `Zoom: ${zoomLevel.toFixed(1)}x`}
        </span>
      </div>

      {/* صورة الهيكل العظمي مع المناطق التفاعلية */}
      <div
        ref={containerRef}
        className="relative w-full max-w-md mx-auto overflow-hidden"
        style={{
          cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default',
          height: isZoomed ? '600px' : 'auto',
          transition: 'height 0.3s ease',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* صورة الهيكل العظمي مع التكبير والتحريك */}
        <div
          className="relative w-full"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            pointerEvents: 'none',
          }}
        >
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
        </div>

        {/* المناطق التفاعلية (شفافة فوق الصورة) */}
        <div
          className="absolute inset-0"
          onMouseDown={handleSelectionStart}
          onMouseMove={handleSelectionMove}
          onMouseUp={handleSelectionEnd}
          onMouseLeave={handleSelectionEnd}
        >
          {regions.map((region) => {
            const isSelected = selectedRegions.some(r => r.id === region.id);
            const isHovered = hoveredRegion === region.id;
            const isZoomedRegion = selectedRegionForZoom === region.id;
            const regionColor = isSelected ? getRegionColor(region.id) : 'rgba(0,0,0,0)';
            const borderColor = isSelected ? getRegionBorder(region.id) : 'none';

            return (
              <div
                key={region.id}
                className="absolute cursor-pointer transition-all duration-200"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.w}%`,
                  height: `${region.h}%`,
                  backgroundColor: isSelected ? regionColor : isHovered ? 'rgba(147, 197, 253, 0.3)' : 'rgba(0,0,0,0)',
                  border: borderColor,
                  borderRadius: '6px',
                  boxShadow: isSelected ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                  transition: 'all 0.2s',
                  transform: isZoomedRegion ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isZoomedRegion ? 10 : 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegionClick(region, e);
                }}
                onDoubleClick={() => handleDoubleClick(region.id)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {isHovered && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                    {region.label}
                  </div>
                )}
                {isSelected && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[8px] text-gray-600 whitespace-nowrap pointer-events-none">
                    {selectedRegions.find(r => r.id === region.id)?.injuryType &&
                      (lang === 'ar'
                        ? injuryTypes.find(t => t.value === selectedRegions.find(r => r.id === region.id)?.injuryType)?.labelAr
                        : injuryTypes.find(t => t.value === selectedRegions.find(r => r.id === region.id)?.injuryType)?.labelEn
                      )
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* مستطيل التحديد (عند الضغط على Shift + سحب) */}
        {isSelecting && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-200/30 pointer-events-none"
            style={{
              left: Math.min(selectionStart.x, selectionEnd.x),
              top: Math.min(selectionStart.y, selectionEnd.y),
              width: Math.abs(selectionEnd.x - selectionStart.x),
              height: Math.abs(selectionEnd.y - selectionStart.y),
            }}
          />
        )}

        {/* إرشادات للاستخدام */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 bg-white/80 px-2 py-1 rounded-full whitespace-nowrap">
          {lang === 'ar' ? 'اضغط Shift + اسحب لتحديد عدة مناطق | نقر مزدوج لتكبير منطقة' : 'Shift + drag to select multiple | Double-click to zoom'}
        </div>
      </div>

      {/* عرض البطاقات */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {selectedRegions.map((sel) => {
          const injuryType = injuryTypes.find(t => t.value === sel.injuryType);
          return (
            <span
              key={sel.id}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: injuryType ? injuryType.color + '30' : '#dbeafe',
                color: injuryType ? injuryType.color : '#1e40af',
                border: `1px solid ${injuryType ? injuryType.color : '#3b82f6'}`,
              }}
            >
              {getLabel(sel.id)}
              {sel.injuryType && (
                <span className="text-xs font-medium">
                  {lang === 'ar'
                    ? injuryTypes.find(t => t.value === sel.injuryType)?.labelAr
                    : injuryTypes.find(t => t.value === sel.injuryType)?.labelEn
                  }
                </span>
              )}
              {sel.notes && <span className="text-xs text-gray-600">📝</span>}
              <button
                onClick={() => {
                  setPopupRegion(sel);
                  setTempNotes(sel.notes || '');
                  setTempInjuryType(sel.injuryType || 'general');
                }}
                className="hover:opacity-70"
              >
                ✏️
              </button>
              <button onClick={() => onDeselectRegion(sel.id)} className="hover:opacity-70">
                ✕
              </button>
            </span>
          );
        })}
      </div>

      {/* نافذة منبثقة لإضافة ملاحظات ونوع الإصابة */}
      {popupRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{getLabel(popupRegion.id)}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">
                  {lang === 'ar' ? 'نوع الإصابة' : 'Injury Type'}
                </label>
                <select
                  value={tempInjuryType || 'general'}
                  onChange={(e) => setTempInjuryType(e.target.value as SelectedRegion['injuryType'])}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mt-1"
                >
                  {injuryTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {lang === 'ar' ? type.labelAr : type.labelEn}
                    </option>
                  ))}
                </select>
              </div>
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
                onClick={() => {
                  if (popupRegion) {
                    onUpdateRegionNotes(popupRegion.id, tempNotes);
                    if (onUpdateRegionInjuryType) {
                      onUpdateRegionInjuryType(popupRegion.id, tempInjuryType);
                    } else {
                      // تحديث نوع الإصابة مباشرة إذا لم يتم توفير callback
                      const updated = { ...popupRegion, injuryType: tempInjuryType, notes: tempNotes };
                      // نستخدم onSelectRegion لتحديث المنطقة (سنقوم بإزالتها وإعادة إضافتها)
                      onDeselectRegion(popupRegion.id);
                      onSelectRegion(updated);
                    }
                    setPopupRegion(null);
                  }
                }}
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
