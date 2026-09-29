import React from 'react';
import { PRODUCT_CATEGORY, PRODUCT_LIFECYCLE } from '../../utils/constants';
import './Sidebar.css';

const Sidebar = ({ filters, onFilterChange }) => {
  const handleStatusFilterChange = (status) => {
    const newStatus = filters.status === status ? '' : status;
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleCategoryFilterChange = (category) => {
    const newCategory = filters.category === category ? '' : category;
    onFilterChange({ ...filters, category: newCategory });
  };

  const statusFilters = [
    { value: '', label: 'All Products' },
    { value: PRODUCT_LIFECYCLE.PRICE_REVIEW_PENDING, label: 'Price Review Pending' },
    { value: PRODUCT_LIFECYCLE.OUT_OF_STOCK, label: 'Out of Stock' }
  ];

  const categoryFilters = [
    { value: '', label: 'All Categories' },
    { value: PRODUCT_CATEGORY.ELECTRONICS, label: 'Electronics' },
    { value: PRODUCT_CATEGORY.APPAREL, label: 'Apparel' },
    { value: PRODUCT_CATEGORY.HOME, label: 'Home' }
  ];

  return (
    <aside className="sidebar card">
      <div className="card-header">
        <h3>Filters</h3>
      </div>
      <div className="card-body">
        <div className="filter-section">
          <h4>Status</h4>
          <div className="filter-options">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                className={`filter-option ${filters.status === filter.value ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Category</h4>
          <div className="filter-options">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                className={`filter-option ${filters.category === filter.value ? 'active' : ''}`}
                onClick={() => handleCategoryFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;