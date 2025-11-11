/**
 * Reusable UI Components
 * Centralized component library for consistent UI
 */

import React from 'react';
import { THEME } from '../config/styleConfig';

// ============================================
// CARD COMPONENT
// ============================================
export const Card = ({ children, className = "", hover = false, onClick }) => (
  <div
    className={`bg-white rounded-xl border border-slate-200 shadow-sm ${
      hover ? 'hover:border-indigo-300 transition-all duration-200' : ''
    } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// ============================================
// BUTTON COMPONENT
// ============================================
export const Button = ({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
  icon: Icon,
  type = "button",
  size = "md"
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================
export const Badge = ({ children, variant = "neutral", size = "md" }) => {
  const variantStyles = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700"
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };

  return (
    <span className={`rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};

// ============================================
// INPUT COMPONENT
// ============================================
export const Input = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  label = "",
  error = "",
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2 ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
        } ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// ============================================
// SELECT COMPONENT
// ============================================
export const Select = ({
  value,
  onChange,
  options = [],
  label = "",
  placeholder = "Select...",
  className = "",
  disabled = false
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.id || opt.value} value={opt.id || opt.value}>
            {opt.label || opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================
// CHECKBOX COMPONENT
// ============================================
export const Checkbox = ({ checked, onChange, label, description }) => {
  return (
    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
      <div>
        {label && <div className="font-medium text-slate-900">{label}</div>}
        {description && <div className="text-xs text-slate-500 mt-1">{description}</div>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
      />
    </label>
  );
};

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
export const ProgressBar = ({ progress, label = "", showPercentage = true }) => {
  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-indigo-600">{progress}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// LOADING SPINNER COMPONENT
// ============================================
export const LoadingSpinner = ({ size = "md", text = "" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
export const StatCard = ({ label, value, icon: Icon, color = "blue", trend }) => {
  const colorStyles = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-900",
    green: "from-green-50 to-green-100 border-green-200 text-green-600 text-green-900",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-600 text-purple-900",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-600 text-orange-900"
  };

  const [bgGradient, , iconColor, textColor] = colorStyles[color].split(' ');

  return (
    <Card className={`p-4 bg-gradient-to-br ${bgGradient} border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs ${iconColor} font-semibold uppercase`}>{label}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
        </div>
        {Icon && <Icon className={`w-8 h-8 ${iconColor} opacity-50`} />}
      </div>
    </Card>
  );
};

// ============================================
// ALERT COMPONENT
// ============================================
export const Alert = ({ type = "info", title, message, onClose }) => {
  const typeStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };

  return (
    <div className={`p-4 rounded-lg border ${typeStyles[type]} flex items-start justify-between`}>
      <div>
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-current opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
};

// ============================================
// MODAL COMPONENT
// ============================================
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// TAB COMPONENT
// ============================================
export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-slate-200">
      <nav className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default {
  Card,
  Button,
  Badge,
  Input,
  Select,
  Checkbox,
  ProgressBar,
  LoadingSpinner,
  StatCard,
  Alert,
  Modal,
  Tabs
};
