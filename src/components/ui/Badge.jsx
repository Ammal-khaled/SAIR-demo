
export const Badge = ({ children, variant = "gray", className = "" }) => {
  const styles = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    indigo: "bg-indigo-100 text-indigo-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;