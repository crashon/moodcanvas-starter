/**
 * Charts Manager
 * Chart.js를 활용한 대시보드 차트 관리
 * 
 * 사용 예시:
 * Charts.createLineChart('sales-chart', {
 *     labels: ['1월', '2월', '3월'],
 *     data: [100, 200, 300]
 * });
 */

const Charts = {
    // 차트 인스턴스 저장
    instances: {},

    // 기본 색상 팔레트
    colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        purple: '#8b5cf6',
        pink: '#ec4899',
        indigo: '#6366f1',
        teal: '#14b8a6'
    },

    /**
     * 라인 차트 생성
     */
    createLineChart(canvasId, options) {
        const defaults = {
            labels: [],
            datasets: [],
            title: '',
            yAxisLabel: '',
            smooth: true,
            fill: false
        };

        const settings = { ...defaults, ...options };

        // 기존 차트 제거
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Canvas not found:', canvasId);
            return null;
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: settings.labels,
                datasets: settings.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: dataset.color || this.getColor(index),
                    backgroundColor: dataset.backgroundColor || this.getColorWithAlpha(index, 0.1),
                    borderWidth: 2,
                    tension: settings.smooth ? 0.4 : 0,
                    fill: settings.fill,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    ...dataset
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!settings.title,
                        text: settings.title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        borderRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: !!settings.yAxisLabel,
                            text: settings.yAxisLabel
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        this.instances[canvasId] = chart;
        return chart;
    },

    /**
     * 막대 차트 생성
     */
    createBarChart(canvasId, options) {
        const defaults = {
            labels: [],
            datasets: [],
            title: '',
            horizontal: false,
            stacked: false
        };

        const settings = { ...defaults, ...options };

        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Canvas not found:', canvasId);
            return null;
        }

        const chart = new Chart(ctx, {
            type: settings.horizontal ? 'bar' : 'bar',
            data: {
                labels: settings.labels,
                datasets: settings.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: dataset.color || this.getColorWithAlpha(index, 0.8),
                    borderColor: dataset.borderColor || this.getColor(index),
                    borderWidth: 1,
                    borderRadius: 6,
                    ...dataset
                }))
            },
            options: {
                indexAxis: settings.horizontal ? 'y' : 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!settings.title,
                        text: settings.title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        stacked: settings.stacked,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        stacked: settings.stacked,
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        this.instances[canvasId] = chart;
        return chart;
    },

    /**
     * 파이 차트 생성
     */
    createPieChart(canvasId, options) {
        const defaults = {
            labels: [],
            data: [],
            title: '',
            doughnut: false
        };

        const settings = { ...defaults, ...options };

        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Canvas not found:', canvasId);
            return null;
        }

        const colors = settings.data.map((_, index) => this.getColor(index));

        const chart = new Chart(ctx, {
            type: settings.doughnut ? 'doughnut' : 'pie',
            data: {
                labels: settings.labels,
                datasets: [{
                    data: settings.data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!settings.title,
                        text: settings.title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.instances[canvasId] = chart;
        return chart;
    },

    /**
     * 도넛 차트 생성 (파이 차트의 변형)
     */
    createDoughnutChart(canvasId, options) {
        return this.createPieChart(canvasId, { ...options, doughnut: true });
    },

    /**
     * 에어리어 차트 생성 (라인 차트의 변형)
     */
    createAreaChart(canvasId, options) {
        return this.createLineChart(canvasId, { ...options, fill: true });
    },

    /**
     * 혼합 차트 생성
     */
    createMixedChart(canvasId, options) {
        const defaults = {
            labels: [],
            datasets: [],
            title: ''
        };

        const settings = { ...defaults, ...options };

        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Canvas not found:', canvasId);
            return null;
        }

        const chart = new Chart(ctx, {
            data: {
                labels: settings.labels,
                datasets: settings.datasets.map((dataset, index) => ({
                    type: dataset.type || 'line',
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: dataset.color || this.getColor(index),
                    backgroundColor: dataset.backgroundColor || this.getColorWithAlpha(index, 0.1),
                    borderWidth: 2,
                    fill: dataset.fill || false,
                    tension: dataset.smooth !== false ? 0.4 : 0,
                    ...dataset
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!settings.title,
                        text: settings.title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        this.instances[canvasId] = chart;
        return chart;
    },

    /**
     * 차트 업데이트
     */
    updateChart(canvasId, data) {
        const chart = this.instances[canvasId];
        if (!chart) {
            console.error('Chart not found:', canvasId);
            return;
        }

        if (data.labels) {
            chart.data.labels = data.labels;
        }

        if (data.datasets) {
            chart.data.datasets = data.datasets;
        }

        chart.update();
    },

    /**
     * 차트 제거
     */
    destroyChart(canvasId) {
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
            delete this.instances[canvasId];
        }
    },

    /**
     * 모든 차트 제거
     */
    destroyAll() {
        Object.keys(this.instances).forEach(id => {
            this.destroyChart(id);
        });
    },

    /**
     * 차트 가져오기
     */
    getChart(canvasId) {
        return this.instances[canvasId] || null;
    },

    /**
     * 색상 가져오기
     */
    getColor(index) {
        const colorKeys = Object.keys(this.colors);
        const key = colorKeys[index % colorKeys.length];
        return this.colors[key];
    },

    /**
     * 투명도가 적용된 색상 가져오기
     */
    getColorWithAlpha(index, alpha) {
        const color = this.getColor(index);
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * 매출 트렌드 차트 (사전 정의)
     */
    createSalesTrendChart(canvasId, salesData) {
        return this.createLineChart(canvasId, {
            labels: salesData.labels,
            datasets: [{
                label: '매출',
                data: salesData.values,
                color: this.colors.primary,
                backgroundColor: this.getColorWithAlpha(0, 0.1),
                fill: true
            }],
            title: '매출 추이',
            yAxisLabel: '금액 (THB)',
            smooth: true
        });
    },

    /**
     * 상품별 판매 차트 (사전 정의)
     */
    createProductSalesChart(canvasId, productData) {
        return this.createBarChart(canvasId, {
            labels: productData.labels,
            datasets: [{
                label: '판매량',
                data: productData.values,
                color: this.colors.secondary
            }],
            title: '상품별 판매량',
            horizontal: true
        });
    },

    /**
     * 카테고리 분포 차트 (사전 정의)
     */
    createCategoryDistributionChart(canvasId, categoryData) {
        return this.createDoughnutChart(canvasId, {
            labels: categoryData.labels,
            data: categoryData.values,
            title: '카테고리별 분포'
        });
    },

    /**
     * 주문 상태 차트 (사전 정의)
     */
    createOrderStatusChart(canvasId, orderData) {
        return this.createPieChart(canvasId, {
            labels: orderData.labels,
            data: orderData.values,
            title: '주문 상태'
        });
    }
};

// 대시보드 위젯
const DashboardWidgets = {
    /**
     * KPI 카드 생성
     */
    createKPICard(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const changeClass = data.change >= 0 ? 'positive' : 'negative';
        const changeIcon = data.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

        container.innerHTML = `
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-icon" style="background: ${data.color}20; color: ${data.color}">
                        <i class="fas ${data.icon}"></i>
                    </span>
                    <span class="kpi-title">${data.title}</span>
                </div>
                <div class="kpi-value">${data.value}</div>
                ${data.change !== undefined ? `
                    <div class="kpi-change ${changeClass}">
                        <i class="fas ${changeIcon}"></i>
                        <span>${Math.abs(data.change)}%</span>
                        <span class="kpi-period">${data.period || '전월 대비'}</span>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * 통계 그리드 생성
     */
    createStatsGrid(containerId, stats) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                ${stats.map(stat => `
                    <div class="stat-card">
                        <div class="stat-label">${stat.label}</div>
                        <div class="stat-value">${stat.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * 최근 활동 목록 생성
     */
    createActivityList(containerId, activities) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="activity-list">
                <h3 class="activity-title">최근 활동</h3>
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon" style="background: ${activity.color}20; color: ${activity.color}">
                            <i class="fas ${activity.icon}"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.text}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// CSS 스타일 추가
if (!document.getElementById('charts-styles')) {
    const style = document.createElement('style');
    style.id = 'charts-styles';
    style.textContent = `
        .kpi-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .kpi-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .kpi-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }

        .kpi-title {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }

        .kpi-value {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 12px;
        }

        .kpi-change {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            font-weight: 500;
        }

        .kpi-change.positive {
            color: #10b981;
        }

        .kpi-change.negative {
            color: #ef4444;
        }

        .kpi-period {
            color: #9ca3af;
            font-weight: 400;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
        }

        .stat-card {
            background: white;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
        }

        .activity-list {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .activity-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
        }

        .activity-item {
            display: flex;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .activity-content {
            flex: 1;
        }

        .activity-text {
            font-size: 14px;
            color: #374151;
            margin-bottom: 4px;
        }

        .activity-time {
            font-size: 12px;
            color: #9ca3af;
        }
    `;
    document.head.appendChild(style);
}

// window 객체에 추가
if (typeof window !== 'undefined') {
    window.Charts = Charts;
    window.DashboardWidgets = DashboardWidgets;
}
