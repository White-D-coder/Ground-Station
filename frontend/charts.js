// Chart Configuration
const maxPoints = 100; // Rolling window

Chart.defaults.color = '#6080a0';
Chart.defaults.borderColor = 'rgba(0, 243, 255, 0.2)';
Chart.defaults.font.family = "'Rajdhani', sans-serif";

function createChart(ctx, label, color) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                backgroundColor: color + '10', // Very subtle fill
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: label.toUpperCase(),
                    color: color,
                    align: 'start',
                    font: { size: 10, weight: 700, family: 'Orbitron' },
                    padding: { top: 5, bottom: 5 }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#6080a0', font: { size: 9 }, maxTicksLimit: 5 },
                    border: { display: false }
                }
            },
            layout: { padding: 0 }
        }
    });
}

const chart1 = createChart(document.getElementById('chart1').getContext('2d'), 'Altitude', '#00f3ff');
const chart2 = createChart(document.getElementById('chart2').getContext('2d'), 'Velocity', '#7b2cbf');
const chart3 = createChart(document.getElementById('chart3').getContext('2d'), 'Battery', '#00ff9d');
const chart4 = createChart(document.getElementById('chart4').getContext('2d'), 'RSSI', '#ffffff');

const chartPitch = createChart(document.getElementById('chart-pitch').getContext('2d'), 'Pitch', '#00ffff');
const chartRoll = createChart(document.getElementById('chart-roll').getContext('2d'), 'Roll', '#ff00ff');
const chartYaw = createChart(document.getElementById('chart-yaw').getContext('2d'), 'Yaw', '#ffff00');
const chartTemp = createChart(document.getElementById('chart-temp').getContext('2d'), 'Temp', '#ff8800');

function updateGraph(chart, value) {
    const now = new Date().toLocaleTimeString();

    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(value);

    if (chart.data.labels.length > maxPoints) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

window.updateGraph1 = (val) => updateGraph(chart1, val);
window.updateGraph2 = (val) => updateGraph(chart2, val);
window.updateGraph3 = (val) => updateGraph(chart3, val);
window.updateGraph4 = (val) => updateGraph(chart4, val);

window.updateGraphPitch = (val) => updateGraph(chartPitch, val);
window.updateGraphRoll = (val) => updateGraph(chartRoll, val);
window.updateGraphYaw = (val) => updateGraph(chartYaw, val);
window.updateGraphTemp = (val) => updateGraph(chartTemp, val);
