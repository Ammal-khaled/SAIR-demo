import { useState, useRef } from 'react';
import { Clock, Car, AlertCircle, Check, X } from 'lucide-react';
import Badge from './ui/Badge';

export const ReportCard = ({ incident, isSelected, onClick, className = "", style = {} }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isHorizontalSwipe = useRef(false);

  if (!incident) return null;

  const handleTouchStart = (e) => {
    touchStartPos.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    setIsSwiping(true);
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e) => {
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;

    const diffX = currentX - touchStartPos.current.x;
    const diffY = currentY - touchStartPos.current.y;

    if (!isHorizontalSwipe.current && Math.abs(diffX) > 10) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalSwipe.current = true;
      } else {
        setIsSwiping(false);
        return;
      }
    }

    if (isHorizontalSwipe.current) {
      if (Math.abs(diffX) < 100) {
        setSwipeOffset(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl mb-3">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6 z-0">
        <div className="flex items-center text-emerald-600 font-bold text-sm">
          <Check className="w-5 h-5 mr-2" /> Approve
        </div>
        <div className="flex items-center text-red-600 font-bold text-sm">
          Reject <X className="w-5 h-5 ml-2" />
        </div>
      </div>

      <div
        style={{
          ...style,
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          touchAction: 'pan-y'
        }}
        onClick={() => onClick && onClick(incident)}
        onTouchStart={handleTouchStart}
        onTouchMove={(e) => {
          handleTouchMove(e);
          if (isHorizontalSwipe.current) {
            if (e.cancelable) e.preventDefault();
          }
        }}
        onTouchEnd={handleTouchEnd}
        className={`relative z-10 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${isSelected
          ? 'bg-white border-blue-400 shadow-sm ring-1 ring-blue-400'
          : 'bg-white border-gray-100'
          } ${className}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-blue-600 tracking-wide">
            ID: {incident.id || incident._id}
          </span>

          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" /> {incident.occurredAt
              ? new Date(incident.occurredAt).toLocaleString()
              : "—"}
          </span>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">
          {incident.accidentType || "Report"}
        </h4>

        <div className="flex justify-between items-center">
          <Badge
            variant={
              incident.status === 'submitted' ? 'blue' :
                incident.status === 'under_review' ? 'yellow' :
                  incident.status === 'verified' ? 'indigo' :
                    incident.status === 'in_progress' ? 'orange' :
                      incident.status === 'resolved' ? 'green' :
                        incident.status === 'rejected' ? 'red' :
                          'gray'
            }
          >
            {incident.status || 'Unknown'}
          </Badge>

          <div className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-gray-400" />
            {incident.urgent && (
              <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;