
export const StatCard = ({ title, value, sub, icon: Icon, delay = "0s", className = "" }) => {
  return (
    <div 
      style={{ animationDelay: delay }}
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-start justify-between cursor-default animate-slide-up ${className}`}
    >
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#002855] mb-1">{value}</h3>
        {sub && <div className="text-xs text-blue-600 font-medium">{sub}</div>}
      </div>
      
      {Icon && (
        <div className="p-2.5 rounded-full transition-transform duration-300 hover:scale-110 bg-blue-50 text-blue-600">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;