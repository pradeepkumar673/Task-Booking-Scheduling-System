// frontend/src/utils.jsx
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'in-progress':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'rejected':
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'in-progress':
      return '🔄';
    case 'rejected':
    case 'cancelled':
      return '❌';
    default:
      return '⏳';
  }
};