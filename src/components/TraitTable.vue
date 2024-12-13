<template>
    <div>
      <h1>Average Placements by Traits</h1>
      <table class="styled-table">
        <thead>
          <tr>
            <th></th>
            <th>Trait Composition</th>
            <th class="stat-header">Avg Place</th>
            <th class="stat-header">Win Rate</th>
            <th class="stat-header">Top 4</th>
            <th class="stat-header">Play Rate</th>
            <th>Core Units</th>
            <th>Flex Units</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(trait, index) in traits" :key="trait.teamComposition">
            <!-- Main Trait Row -->
            <tr>
              <td>
                <button @click="toggleWidget(index)">
                  {{ expandedWidgets.includes(index) ? '-' : '+' }}
                </button>
              </td>
              <td>{{ trait.teamComposition }}</td>
              <td
                class="highlight-column"
                :style="{ backgroundColor: getAvgPlacementBackgroundColor(trait.avgPlacement, minAvgPlacement, maxAvgPlacement) }"
              >
                {{ trait.avgPlacement.toFixed(2) }}
              </td>
              <td
                class="highlight-column"
                :style="{ backgroundColor: getWinRateBackgroundColor(trait.winRate, minWinRate, maxWinRate) }"
              >
                {{ (trait.winRate).toFixed(2) }}
              </td>
              <td
                class="highlight-column"
                :style="{ backgroundColor: getTop4BackgroundColor(trait.top4Rate, minTop4Rate, maxTop4Rate) }"
              >
                {{ (trait.top4Rate).toFixed(2) }}
              </td>
              <td
                class="highlight-column"
                :style="{ backgroundColor: getPlayRateBackgroundColor(trait.playRate, minPlayRate, maxPlayRate) }"
              >
                {{ (trait.playRate).toFixed(2) }}
              </td>
              <td>
                <div class="unit-images">
                  <img
                    v-for="unit in trait.coreUnits.split(', ')"
                    :key="unit"
                    :src="unitImageMap[unit] || '/images/units/default.avif'"
                    :alt="unit"
                    :style="{ border: '3px solid ' + getBorderColor(unit) }"
                    class="unit-icon"
                  />
                </div>
              </td>
              <td>
                <div class="unit-images">
                  <img
                    v-for="unit in trait.flexUnits.split(', ')"
                    :key="unit"
                    :src="unitImageMap[unit] || '/images/units/default.avif'"
                    :alt="unit"
                    :style="{ border: '3px solid ' + getBorderColor(unit) }"
                    class="unit-icon"
                  />
                </div>
              </td>
            </tr>
            <!-- Expanded Widget Row -->
            <tr v-if="expandedWidgets.includes(index)" class="widget-row">
              <td colspan="8" class="widget-container">
                <!-- Top Variations-->
                <table class="nested-table">
                  <thead>
                    <tr>
                      <th>Play Rate</th>
                      <th>Top Variations</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="unit in nestedData[index]?.compositions || []"
                      :key="unit.unitComposition"
                    >
                      <td>{{ (unit.playRate).toFixed(2) }}</td>
                      <td>
                        <div class="unit-images">
                          <img
                            v-for="unit in unit.unitComposition.split(', ')"
                            :key="unit"
                            :src="unitImageMap[unit] || '/images/units/default.avif'"
                            :alt="unit"
                            :style="{ border: '3px solid ' + getBorderColor(unit) }"
                            class="unit-icon"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <!-- Top Items-->
                <table class="nested-table">
                  <thead>
                    <tr>
                      <th>Unit</th>
                      <th>Best Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="unit in nestedData[index]?.coreUnits || []" :key="unit.unit">
                      <td>
                        <div class="unit-images">
                          <img
                            v-for="unit in unit.unit.split(', ')"
                            :key="unit"
                            :src="unitImageMap[unit] || '/images/units/default.avif'"
                            :alt="unit"
                            :style="{ border: '3px solid ' + getBorderColor(unit) }"
                            class="unit-icon"
                          />
                        </div>
                      </td>
                      <td>
                        <div class="unit-images">
                          <img
                            v-for="item in unit.bestItems"
                            :key="item"
                            :src="itemImageMap[item] || '/images/items/default.avif'"
                            :alt="item"
                            class="unit-icon"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <!-- Chart Grid Container -->
                <div class="chart-grid">
                  <div class="chart-box">
                    <canvas :id="'avgPlacement-chart-' + index"></canvas>
                  </div>
                  <div class="chart-box">
                    <canvas :id="'winRate-chart-' + index"></canvas>
                  </div>
                  <div class="chart-box">
                    <canvas :id="'top4Rate-chart-' + index"></canvas>
                  </div>
                  <div class="chart-box">
                    <canvas :id="'playRate-chart-' + index"></canvas>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </template>  
  
  <script>
  import { fetchTraits, fetchCommonUnits, fetchFlexUnits, toggleNestedRow } from "../api";
  import { Chart } from "chart.js/auto";
  import unitImageMap from '../utils/unitImageMap';
  import unitLevelMap from '../utils/unitLevelMap';
  import itemImageMap from '../utils/itemImageMap';
  
  export default {
    data() {
      return {
        traits: [],
        nestedData: [],
        expandedWidgets: [],
        charts: {},
        minPlayRate: 0,
        maxPlayRate: 0,
        minAvgPlacement: 0,
        maxAvgPlacement: 0,
        minWinRate: 0,
        maxWinRate: 0,
        minTop4Rate: 0,
        maxTop4Rate: 0,
        unitImageMap,
        unitLevelMap,
        itemImageMap,
      };
    },
    async created() {
      const data = await fetchTraits();
  
      // Determine min and max values for conditional formatting
      const playRates = data.map((row) => row.playRate);
      const avgPlacements = data.map((row) => row.avgPlacement);
      const winRates = data.map((row) => (row.occurrences > 0 ? row.wins / row.occurrences : 0));
      const top4Rates = data.map((row) => (row.occurrences > 0 ? row.top4 / row.occurrences : 0));
  
      this.minPlayRate = Math.min(...playRates);
      this.maxPlayRate = Math.max(...playRates);
      this.minAvgPlacement = Math.min(...avgPlacements);
      this.maxAvgPlacement = Math.max(...avgPlacements);
      this.minWinRate = Math.min(...winRates);
      this.maxWinRate = Math.max(...winRates);
      this.minTop4Rate = Math.min(...top4Rates);
      this.maxTop4Rate = Math.max(...top4Rates);
  
      this.traits = await Promise.all(
        data.map(async (trait) => ({
          ...trait,
          winRate: trait.occurrences > 0 ? trait.wins / trait.occurrences : 0,
          top4Rate: trait.occurrences > 0 ? trait.top4 / trait.occurrences : 0,
          coreUnits: await fetchCommonUnits(trait.teamComposition),
          flexUnits: await fetchFlexUnits(trait.teamComposition),
        }))
      );
    },
    methods: {
      async toggleWidget(index) {
        if (this.expandedWidgets.includes(index)) {
          // Collapse widget and destroy chart
          this.expandedWidgets = this.expandedWidgets.filter((i) => i !== index);
          if (this.charts[index]) {
          this.charts[index].destroy();
          delete this.charts[index];
          }
          delete this.nestedData[index];
        } else {
          // Fetch nested data for both table and charts
          const result = await toggleNestedRow(index, this.traits, this.expandedWidgets, this.nestedData);

          // Fetch best items for all core units asynchronously
          const coreUnits = this.traits[index].coreUnits.split(", ");
          const coreUnitsWithItems = await Promise.all(
            coreUnits.map(async (unit) => ({
              unit,
              bestItems: await this.fetchBestItems(unit), // Fetch best items for each unit
            }))
          );

          this.expandedWidgets = result.expandedWidgets;
          this.nestedData = {
            ...this.nestedData,
            [index]: {
              ...result.nestedData[index],
              coreUnits: coreUnitsWithItems,
            },
          };

          // Render charts
          this.$nextTick(() => {
            const chartData = this.nestedData[index]?.chartData;
            if (chartData && Array.isArray(chartData)) {
              ["avgPlacement", "winRate", "top4Rate", "playRate"].forEach((chartType) => {
                this.renderChart(index, chartData, chartType);
              });
            }
          });
        }
      },
      async fetchBestItems(unit) {
        try {
          const response = await fetch('https://localhost:7057/api/RiotApi/best-items-by-placement');
          if (!response.ok) {
              throw new Error(`API call failed: ${response.statusText}`);
          }

          const bestItemsData = await response.json();

          // Find the data for the specific unit
          const unitData = bestItemsData.find(item => item.unit === unit);

          // If unit data exists, format and return it; otherwise, return a fallback message
          if (unitData) {
              return unitData.items.map(item => `${item.itemName}`); // (${item.avgPlacement.toFixed(2)})
          } else {
              return ["No recommended items"];
          }
        } catch (error) {
            console.error("Error fetching best items:", error);
            return ["Error fetching items"];
        }
      },
      renderChart(index, chartData, chartType) {
        const canvasId = `${chartType}-chart-${index}`;
        const ctx = document.getElementById(canvasId)?.getContext("2d");

        if (!ctx) {
          console.error(`Canvas with ID chart-${canvasId} not found.`);
          return;
        }

        const labels = chartData.map((item) => item.date);
        const data =
          chartType === "avgPlacement"
            ? chartData.map((item) => item.avgPlacement)
            : chartType === "winRate"
            ? chartData.map((item) => item.winRate)
            : chartType === "top4Rate"
            ? chartData.map((item) => item.top4Rate)
            : chartData.map((item) => item.playRate);

        const label =
          chartType === "avgPlacement"
            ? "Average Placement"
            : chartType === "winRate"
            ? "Win Rate"
            : chartType === "top4Rate"
            ? "Top 4 Rate"
            : "Play Rate";

         // Clean up any existing chart instance
        if (this.charts[canvasId]) {
          this.charts[canvasId].destroy();
        }
  
        this.charts[canvasId] = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label,
                data,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                labels: {
                  color: "#ffffff",
                },
              },
              tooltip: {
                backgroundColor: "#333333",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Date",
                  color: "#ffffff", 
                },
                ticks: {
                  color: "#ffffff",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.2)",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Avg Placement",
                  color: "#ffffff",
                },
                ticks: {
                  color: "#ffffff",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.2)",
                },
              },
            },
            layout: {
              padding: 10,
            },
          },
        });
      },
      // Background colours
      getPlayRateBackgroundColor(playRate, min, max) {
        const normalized = (playRate - min) / (max - min);
        const red = normalized < 0.5 ? 160 : Math.round(160 * (1 - (normalized - 0.5) * 2));
        const green = normalized > 0.5 ? 160 : Math.round(160 * (normalized * 2));
        return `rgb(${red}, ${green}, 0)`;
      },
      getAvgPlacementBackgroundColor(avgPlacement, min, max) {
        const normalized = (avgPlacement - min) / (max - min);
        const green = normalized < 0.5 ? 160 : Math.round(160 * (1 - (normalized - 0.5) * 2));
        const red = normalized > 0.5 ? 160 : Math.round(160 * (normalized * 2));
        return `rgb(${red}, ${green}, 0)`;
      },
      getWinRateBackgroundColor(winRate, min, max) {
        const normalized = (winRate - min) / (max - min);
        const green = normalized > 0.5 ? 160 : Math.round(160 * (normalized * 2));
        const red = normalized < 0.5 ? 160 : Math.round(160 * (1 - (normalized - 0.5) * 2));
        return `rgb(${red}, ${green}, 0)`;
      },
      getTop4BackgroundColor(top4Rate, min, max) {
        const normalized = (top4Rate - min) / (max - min);
        const green = normalized > 0.5 ? 160 : Math.round(160 * (normalized * 2));
        const red = normalized < 0.5 ? 160 : Math.round(160 * (1 - (normalized - 0.5) * 2));
        return `rgb(${red}, ${green}, 0)`;
      },
      getBorderColor(unit) {
        const level = unitLevelMap[unit] || 1;
        switch (level) {
          case 1:
            return "grey";
          case 2:
            return "green";
          case 3:
            return "blue";
          case 4:
            return "purple";
          case 5:
            return "yellow";
          case 6:
            return "orange";
          default:
            return "grey";
        }
      },
    },
  };
  </script> 
  
  <style scoped>
    h1 {
    font-family: Arial, sans-serif;
    margin-bottom: 20px;
    text-align: center;
    }

    .styled-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    margin: 20px 0;
    }

    .styled-table thead th {
    background-color: #f4f4f4;
    font-weight: bold;
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
    }

    .styled-table tbody td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
    }

    .styled-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
    }

    .styled-table tbody tr:hover {
    background-color: #f1f1f1;
    }

    .stat-header {
    width: 5%;
    }

    .highlight-column {
    font-weight: bold;
    color: white;
    text-align: center;
    }

    .widget-container {
    padding: 15px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    }
    
    .nested-table {
    width: 100%;
    border-collapse: collapse;
    }
    
    .nested-table th,
    .nested-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    }
    
    .nested-table thead th {
    background-color: #f4f4f4;
    font-weight: bold;
    }

    .chart-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 20px;
    }

    .chart-box {
    padding: 20px;
    background-color: #5e5e5e;
    border: 1px solid #444444;
    border-radius: 8px;
    margin-top: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    }

    .chart-box h3 {
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
    }

    canvas {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: 200px;
    }

    .unit-images {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    }

    .unit-icon {
    width: 43px;
    height: 43px;
    object-fit: cover;
    border-radius: 4px;
    }
  </style>
  