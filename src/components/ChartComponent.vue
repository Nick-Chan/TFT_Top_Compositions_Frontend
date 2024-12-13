<template>
    <div>
      <h2>{{ title }}</h2>
      <canvas id="chart"></canvas>
    </div>
  </template>
  
  <script>
  import { Chart } from 'chart.js';
  
  export default {
    props: ['title', 'chartData', 'chartOptions'],
    mounted() {
      new Chart(this.$refs.chart, {
        type: 'line',
        data: this.chartData,
        options: this.chartOptions,
      });
    },
  };
  </script>
  