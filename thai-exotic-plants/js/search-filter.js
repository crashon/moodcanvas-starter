/**
 * Advanced Search and Filter System
 * 실시간 검색, 다단계 필터링, 정렬 기능
 * 
 * 사용 예시:
 * const filter = new SearchFilter({
 *     containerId: 'products-container',
 *     data: products,
 *     searchFields: ['name', 'description'],
 *     filters: {...},
 *     onFilter: (filtered) => { ... }
 * });
 */

class SearchFilter {
    constructor(options) {
        this.options = {
            containerId: '',           // 결과 표시 컨테이너 ID
            data: [],                  // 필터링할 데이터
            searchFields: ['name'],    // 검색할 필드들
            filters: {},               // 필터 설정
            sortOptions: [],           // 정렬 옵션
            debounceTime: 300,         // 검색 지연 시간 (ms)
            onFilter: null,            // 필터링 완료 콜백
            onSearch: null,            // 검색 완료 콜백
            ...options
        };

        this.originalData = [...this.options.data];
        this.filteredData = [...this.options.data];
        this.activeFilters = {};
        this.searchQuery = '';
        this.sortBy = null;
        this.searchTimeout = null;

        this.init();
    }

    /**
     * 초기화
     */
    init() {
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            console.error('Container not found:', this.options.containerId);
            return;
        }

        this.renderControls();
        this.applyFilters();
    }

    /**
     * 검색 및 필터 컨트롤 렌더링
     */
    renderControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'search-filter-controls';
        controlsContainer.innerHTML = `
            <div class="search-filter-header">
                <!-- 검색 바 -->
                <div class="search-bar-container">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="검색..."
                            id="search-input-${this.options.containerId}"
                        >
                        <button class="search-clear" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- 필터 및 정렬 버튼 -->
                <div class="control-buttons">
                    <button class="filter-toggle-btn" id="filter-toggle-${this.options.containerId}">
                        <i class="fas fa-filter"></i>
                        <span>필터</span>
                        <span class="filter-badge" style="display: none;">0</span>
                    </button>
                    ${this.options.sortOptions.length > 0 ? `
                        <select class="sort-select" id="sort-select-${this.options.containerId}">
                            <option value="">정렬</option>
                            ${this.options.sortOptions.map(opt => `
                                <option value="${opt.value}">${opt.label}</option>
                            `).join('')}
                        </select>
                    ` : ''}
                </div>
            </div>

            <!-- 필터 패널 -->
            <div class="filter-panel" id="filter-panel-${this.options.containerId}" style="display: none;">
                ${this.renderFilters()}
                <div class="filter-actions">
                    <button class="filter-apply-btn">적용</button>
                    <button class="filter-reset-btn">초기화</button>
                </div>
            </div>

            <!-- 활성 필터 태그 -->
            <div class="active-filters" id="active-filters-${this.options.containerId}"></div>
        `;

        this.container.insertBefore(controlsContainer, this.container.firstChild);
        this.bindEvents();
    }

    /**
     * 필터 UI 렌더링
     */
    renderFilters() {
        let html = '<div class="filter-grid">';

        for (const [key, config] of Object.entries(this.options.filters)) {
            html += `<div class="filter-group">`;
            html += `<label class="filter-label">${config.label}</label>`;

            switch (config.type) {
                case 'checkbox':
                    html += this.renderCheckboxFilter(key, config);
                    break;
                case 'range':
                    html += this.renderRangeFilter(key, config);
                    break;
                case 'select':
                    html += this.renderSelectFilter(key, config);
                    break;
                case 'radio':
                    html += this.renderRadioFilter(key, config);
                    break;
            }

            html += `</div>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * 체크박스 필터 렌더링
     */
    renderCheckboxFilter(key, config) {
        return `
            <div class="checkbox-group">
                ${config.options.map(opt => `
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            name="${key}" 
                            value="${opt.value}"
                            class="filter-checkbox"
                        >
                        <span>${opt.label}</span>
                        ${opt.count !== undefined ? `<span class="option-count">(${opt.count})</span>` : ''}
                    </label>
                `).join('')}
            </div>
        `;
    }

    /**
     * 범위 필터 렌더링 (가격, 평점 등)
     */
    renderRangeFilter(key, config) {
        return `
            <div class="range-filter">
                <div class="range-inputs">
                    <input 
                        type="number" 
                        name="${key}-min" 
                        placeholder="${config.min || '최소'}"
                        min="${config.min || 0}"
                        max="${config.max || 999999}"
                        class="range-input"
                    >
                    <span class="range-separator">-</span>
                    <input 
                        type="number" 
                        name="${key}-max" 
                        placeholder="${config.max || '최대'}"
                        min="${config.min || 0}"
                        max="${config.max || 999999}"
                        class="range-input"
                    >
                </div>
                ${config.slider ? `
                    <div class="range-slider-container">
                        <input 
                            type="range" 
                            name="${key}-slider-min" 
                            min="${config.min || 0}" 
                            max="${config.max || 100}"
                            value="${config.min || 0}"
                            class="range-slider range-slider-min"
                        >
                        <input 
                            type="range" 
                            name="${key}-slider-max" 
                            min="${config.min || 0}" 
                            max="${config.max || 100}"
                            value="${config.max || 100}"
                            class="range-slider range-slider-max"
                        >
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 셀렉트 필터 렌더링
     */
    renderSelectFilter(key, config) {
        return `
            <select name="${key}" class="filter-select">
                <option value="">전체</option>
                ${config.options.map(opt => `
                    <option value="${opt.value}">${opt.label}</option>
                `).join('')}
            </select>
        `;
    }

    /**
     * 라디오 필터 렌더링
     */
    renderRadioFilter(key, config) {
        return `
            <div class="radio-group">
                ${config.options.map((opt, index) => `
                    <label class="radio-label">
                        <input 
                            type="radio" 
                            name="${key}" 
                            value="${opt.value}"
                            class="filter-radio"
                            ${index === 0 ? 'checked' : ''}
                        >
                        <span>${opt.label}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 검색 입력
        const searchInput = document.getElementById(`search-input-${this.options.containerId}`);
        const clearBtn = searchInput.nextElementSibling;

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            clearBtn.style.display = this.searchQuery ? 'block' : 'none';
            this.debounceSearch();
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            clearBtn.style.display = 'none';
            this.applyFilters();
        });

        // 필터 토글
        const filterToggle = document.getElementById(`filter-toggle-${this.options.containerId}`);
        const filterPanel = document.getElementById(`filter-panel-${this.options.containerId}`);

        filterToggle.addEventListener('click', () => {
            const isVisible = filterPanel.style.display !== 'none';
            filterPanel.style.display = isVisible ? 'none' : 'block';
            filterToggle.classList.toggle('active', !isVisible);
        });

        // 필터 적용
        const applyBtn = filterPanel.querySelector('.filter-apply-btn');
        applyBtn.addEventListener('click', () => {
            this.collectFilters();
            this.applyFilters();
            filterPanel.style.display = 'none';
            filterToggle.classList.remove('active');
        });

        // 필터 초기화
        const resetBtn = filterPanel.querySelector('.filter-reset-btn');
        resetBtn.addEventListener('click', () => {
            this.resetFilters();
        });

        // 정렬 변경
        const sortSelect = document.getElementById(`sort-select-${this.options.containerId}`);
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }
    }

    /**
     * 검색 디바운스
     */
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, this.options.debounceTime);
    }

    /**
     * 필터 수집
     */
    collectFilters() {
        this.activeFilters = {};

        for (const [key, config] of Object.entries(this.options.filters)) {
            switch (config.type) {
                case 'checkbox':
                    const checked = Array.from(
                        document.querySelectorAll(`input[name="${key}"]:checked`)
                    ).map(el => el.value);
                    if (checked.length > 0) {
                        this.activeFilters[key] = checked;
                    }
                    break;

                case 'range':
                    const minInput = document.querySelector(`input[name="${key}-min"]`);
                    const maxInput = document.querySelector(`input[name="${key}-max"]`);
                    const min = minInput.value;
                    const max = maxInput.value;
                    if (min || max) {
                        this.activeFilters[key] = { min, max };
                    }
                    break;

                case 'select':
                    const select = document.querySelector(`select[name="${key}"]`);
                    if (select.value) {
                        this.activeFilters[key] = select.value;
                    }
                    break;

                case 'radio':
                    const radio = document.querySelector(`input[name="${key}"]:checked`);
                    if (radio && radio.value) {
                        this.activeFilters[key] = radio.value;
                    }
                    break;
            }
        }

        this.updateFilterBadge();
        this.updateActiveFilters();
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        let result = [...this.originalData];

        // 검색 적용
        if (this.searchQuery) {
            result = this.applySearch(result);
        }

        // 필터 적용
        result = this.applyFilterRules(result);

        // 정렬 적용
        if (this.sortBy) {
            result = this.applySort(result);
        }

        this.filteredData = result;

        // 콜백 호출
        if (this.options.onFilter) {
            this.options.onFilter(result);
        }
    }

    /**
     * 검색 적용
     */
    applySearch(data) {
        const query = this.searchQuery.toLowerCase();
        
        return data.filter(item => {
            return this.options.searchFields.some(field => {
                const value = this.getNestedValue(item, field);
                return value && value.toString().toLowerCase().includes(query);
            });
        });
    }

    /**
     * 필터 규칙 적용
     */
    applyFilterRules(data) {
        let result = data;

        for (const [key, value] of Object.entries(this.activeFilters)) {
            const config = this.options.filters[key];

            switch (config.type) {
                case 'checkbox':
                    result = result.filter(item => {
                        const itemValue = this.getNestedValue(item, config.field || key);
                        return value.includes(itemValue?.toString());
                    });
                    break;

                case 'range':
                    result = result.filter(item => {
                        const itemValue = parseFloat(this.getNestedValue(item, config.field || key));
                        const min = value.min ? parseFloat(value.min) : -Infinity;
                        const max = value.max ? parseFloat(value.max) : Infinity;
                        return itemValue >= min && itemValue <= max;
                    });
                    break;

                case 'select':
                case 'radio':
                    result = result.filter(item => {
                        const itemValue = this.getNestedValue(item, config.field || key);
                        return itemValue?.toString() === value;
                    });
                    break;
            }
        }

        return result;
    }

    /**
     * 정렬 적용
     */
    applySort(data) {
        const sortOption = this.options.sortOptions.find(opt => opt.value === this.sortBy);
        if (!sortOption) return data;

        const sorted = [...data].sort((a, b) => {
            const aValue = this.getNestedValue(a, sortOption.field);
            const bValue = this.getNestedValue(b, sortOption.field);

            if (sortOption.type === 'number') {
                return sortOption.order === 'asc' 
                    ? aValue - bValue 
                    : bValue - aValue;
            } else {
                const comparison = aValue?.toString().localeCompare(bValue?.toString());
                return sortOption.order === 'asc' ? comparison : -comparison;
            }
        });

        return sorted;
    }

    /**
     * 중첩 객체 값 가져오기
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * 필터 초기화
     */
    resetFilters() {
        // 체크박스 초기화
        document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
        
        // 범위 입력 초기화
        document.querySelectorAll('.range-input').forEach(input => input.value = '');
        
        // 셀렉트 초기화
        document.querySelectorAll('.filter-select').forEach(select => select.selectedIndex = 0);
        
        // 라디오 초기화 (첫 번째 선택)
        document.querySelectorAll('.radio-group').forEach(group => {
            const firstRadio = group.querySelector('input[type="radio"]');
            if (firstRadio) firstRadio.checked = true;
        });

        this.activeFilters = {};
        this.updateFilterBadge();
        this.updateActiveFilters();
        this.applyFilters();
    }

    /**
     * 필터 배지 업데이트
     */
    updateFilterBadge() {
        const badge = document.querySelector(`#filter-toggle-${this.options.containerId} .filter-badge`);
        const count = Object.keys(this.activeFilters).length;
        
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * 활성 필터 태그 업데이트
     */
    updateActiveFilters() {
        const container = document.getElementById(`active-filters-${this.options.containerId}`);
        if (!container) return;

        const tags = [];

        for (const [key, value] of Object.entries(this.activeFilters)) {
            const config = this.options.filters[key];
            
            if (Array.isArray(value)) {
                value.forEach(v => {
                    const option = config.options.find(opt => opt.value === v);
                    tags.push({
                        key,
                        value: v,
                        label: option?.label || v
                    });
                });
            } else if (typeof value === 'object') {
                const label = `${value.min || '최소'} - ${value.max || '최대'}`;
                tags.push({ key, value: 'range', label });
            } else {
                const option = config.options?.find(opt => opt.value === value);
                tags.push({
                    key,
                    value,
                    label: option?.label || value
                });
            }
        }

        if (tags.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = tags.map(tag => `
            <span class="filter-tag">
                ${tag.label}
                <button class="filter-tag-remove" onclick="window.searchFilter_${this.options.containerId}.removeFilter('${tag.key}', '${tag.value}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
    }

    /**
     * 개별 필터 제거
     */
    removeFilter(key, value) {
        if (value === 'range') {
            delete this.activeFilters[key];
        } else if (Array.isArray(this.activeFilters[key])) {
            this.activeFilters[key] = this.activeFilters[key].filter(v => v !== value);
            if (this.activeFilters[key].length === 0) {
                delete this.activeFilters[key];
            }
        } else {
            delete this.activeFilters[key];
        }

        this.updateFilterBadge();
        this.updateActiveFilters();
        this.applyFilters();
    }

    /**
     * 데이터 업데이트
     */
    setData(data) {
        this.originalData = [...data];
        this.applyFilters();
    }

    /**
     * 필터링된 데이터 가져오기
     */
    getFilteredData() {
        return this.filteredData;
    }
}

// CSS 스타일 추가
if (!document.getElementById('search-filter-styles')) {
    const style = document.createElement('style');
    style.id = 'search-filter-styles';
    style.textContent = `
        .search-filter-controls {
            margin-bottom: 24px;
        }

        .search-filter-header {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
        }

        .search-bar-container {
            flex: 1;
        }

        .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-icon {
            position: absolute;
            left: 12px;
            color: #9ca3af;
        }

        .search-input {
            width: 100%;
            padding: 10px 40px 10px 40px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
        }

        .search-input:focus {
            outline: none;
            border-color: #10b981;
        }

        .search-clear {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
        }

        .control-buttons {
            display: flex;
            gap: 8px;
        }

        .filter-toggle-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }

        .filter-toggle-btn:hover,
        .filter-toggle-btn.active {
            border-color: #10b981;
            color: #10b981;
        }

        .filter-badge {
            background: #10b981;
            color: white;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 600;
        }

        .sort-select {
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            background: white;
        }

        .filter-panel {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
        }

        .filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .filter-label {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
        }

        .checkbox-group,
        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .checkbox-label,
        .radio-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #4b5563;
            cursor: pointer;
        }

        .option-count {
            color: #9ca3af;
            font-size: 12px;
            margin-left: auto;
        }

        .range-inputs {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .range-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
        }

        .range-separator {
            color: #9ca3af;
        }

        .filter-select {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            background: white;
            cursor: pointer;
        }

        .filter-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .filter-apply-btn,
        .filter-reset-btn {
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .filter-apply-btn {
            background: #10b981;
            color: white;
        }

        .filter-apply-btn:hover {
            background: #059669;
        }

        .filter-reset-btn {
            background: #f3f4f6;
            color: #374151;
        }

        .filter-reset-btn:hover {
            background: #e5e7eb;
        }

        .active-filters {
            display: none;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
        }

        .filter-tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: #ecfdf5;
            color: #059669;
            border-radius: 16px;
            font-size: 13px;
        }

        .filter-tag-remove {
            background: none;
            border: none;
            color: #059669;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
        }

        @media (max-width: 768px) {
            .search-filter-header {
                flex-direction: column;
            }

            .filter-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

// window 객체에 SearchFilter 추가
if (typeof window !== 'undefined') {
    window.SearchFilter = SearchFilter;
}
