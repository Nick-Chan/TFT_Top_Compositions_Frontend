<template>
  <div>
    <h1>TFT Masters+ Compositions Meta</h1>
    <div class="region-filters">
      <button
        class="region-btn"
        v-for="region in regions"
        :key="region"
        @click="filterByRegion(region)"
        :style="{ borderBottom: selectedRegion === region ? '4px solid yellow' : 'none' }"
      >
        {{ region }}
      </button>
    </div>
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
            <td class="trait-cell">
              <div class="trait-content">
                  <img
                      class="trait-image"
                      :src="getTraitImage(trait.teamComposition)"
                      :alt="trait.teamComposition"
                  />
                  <span class="trait-text">{{ trait.teamComposition }}</span>
              </div>
            </td>
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
                <div class="unit-wrapper" v-for="unit in trait.coreUnits" :key="unit.name">
                  <span v-if="unit.avgLevel > 2.50" class="unit-stars">★★★</span>
                  <img
                    :src="unitImageMap[unit.name] || '/images/units/default.avif'"
                    :alt="unit.name"
                    :style="{ borderBottom: '4px solid ' + getBorderColor(unit.name) }"
                    class="unit-icon"
                    :data-tippy-content="getTooltipContent(unit.name)"
                  />
                </div>
              </div>
            </td>
            <td>
              <div class="unit-images">
                <img
                  v-for="unit in trait.flexUnits.split(', ')"
                  :key="unit"
                  :src="unitImageMap[unit] || '/images/units/default.avif'"
                  :alt="unit"
                  :style="{ borderBottom: '4px solid ' + getBorderColor(unit) }"
                  class="unit-icon"
                  :data-tippy-content="getTooltipContent(unit)"
                />
              </div>
            </td>
          </tr>
          <!-- Expanded Widget Row -->
          <tr v-if="expandedWidgets.includes(index)" class="widget-row">
            <td colspan="8" class="widget-container">
              <div class="expanded-widget-two-columns">
                <!-- Left Column -->
                <div class="widget-section">
                  <h3 class="centered-title">Common Compositions</h3>
                  <table class="nested-table">
                    <thead>
                      <tr>
                        <th>Top Variations</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="unit in nestedData[index]?.compositions || []"
                        :key="unit.unitComposition"
                      >
                        <td>
                          <div class="unit-images">
                            <img
                              v-for="unit in unit.unitComposition.split(', ')"
                              :key="unit"
                              :src="unitImageMap[unit] || '/images/units/default.avif'"
                              :alt="unit"
                              :style="{ borderBottom: '4px solid ' + getBorderColor(unit) }"
                              class="unit-icon"
                              :data-tippy-content="getTooltipContent(unit)"
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- Right Column -->
                <div class="widget-section">
                  <h3 class="centered-title">Best Items</h3>
                  <table class="nested-table">
                    <thead>
                      <tr>
                        <th class="stat-header-items">Unit</th>
                        <th title = "Average Items Held" class="stat-header-items">Items</th>
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
                              :style="{ borderBottom: '4px solid ' + getBorderColor(unit) }"
                              class="unit-icon"
                              :data-tippy-content="getTooltipContent(unit)"
                            />
                          </div>
                        </td>
                        <td
                          class="highlight-column"
                          :style="{ backgroundColor: getAvgItemsBackgroundColor(unit.avgItems) }"
                        >
                          {{ unit.avgItems }}
                        </td>
                        <td>
                          <div class="unit-images">
                            <div
                              v-for="item in unit.bestItems"
                              :key="item.itemName"
                              class="item-cell"
                              :style="{ backgroundColor: getItemPlacementBackgroundColor(item.avgPlacement) }"
                            >
                              <img
                                :src="itemImageMap[item.itemName] || '/images/items/default.avif'"
                                :alt="item.itemName"
                                class="unit-icon"
                                :data-tippy-content="getTooltipContent(item.itemName)"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- Chart Grid -->
                <div class="chart-grid">
                  <h3 class="centered-title chart-title">Performance History</h3>
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
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

  
<script>
  import { fetchTraits, fetchCommonUnits, fetchFlexUnits, fetchUnitLevel, toggleNestedRow } from "../api";
  import { Chart } from "chart.js/auto";
  import unitImageMap from '../utils/unitImageMap';
  import unitLevelMap from '../utils/unitLevelMap';
  import itemImageMap from '../utils/itemImageMap';
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  
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
        regions: ["ALL", "AMERICAS", "EUROPE", "ASIA", "SEA"],
        selectedRegion: "ALL",
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
        data.map(async (trait) => {
          const avgLevels = await fetchUnitLevel(trait.teamComposition);
          const coreUnits = (await fetchCommonUnits(trait.teamComposition))
            .split(', ')
            .map((unit) => ({
              name: unit,
              avgLevel: avgLevels[unit] || 0, // Default avgLevel to 0 if not found
            }));

          return {
            ...trait,
            winRate: trait.occurrences > 0 ? trait.wins / trait.occurrences : 0,
            top4Rate: trait.occurrences > 0 ? trait.top4 / trait.occurrences : 0,
            coreUnits,
            flexUnits: await fetchFlexUnits(trait.teamComposition),
          };
        })
      );
    },
    updated() {
      this.initTippy();
    },
    mounted() {
      this.initTippy();
    },
    methods: {
      filterByRegion(region) {
        this.selectedRegion = region;
        console.log(`Filtering by: ${region}`);
        // Add your filtering logic here
      },
      initTippy() {
        tippy(".unit-icon", {
          allowHTML: true,
          interactive: true,
          delay: [0, 50],
          hideOnClick: false,
          duration: [200, 100],
        });
      },
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
          // Expand widget and fetch nested data
          const result = await toggleNestedRow(index, this.traits, this.expandedWidgets, this.nestedData);

          // Use the updated coreUnits structure
          const coreUnits = this.traits[index].coreUnits;

          const coreUnitsWithItems = await Promise.all(
            coreUnits.map(async (unitObj) => {
              const bestItems = await this.fetchBestItems(unitObj.name);
              return {
                unit: unitObj.name,
                bestItems: bestItems.map((item) => ({
                  itemName: item.itemName,
                  avgPlacement: item.avgPlacement,
                })),
              };
            })
          );

          // Fetch unit stats for the trait
          const unitStats = await this.fetchUnitStats(this.traits[index].teamComposition);

          // Combine stats into core units
          const combinedUnits = coreUnitsWithItems
            .map((unitData) => {
              const unitStat = unitStats.find((stat) => stat.unit === unitData.unit) || {
                avgItems: "N/A",
                avgLevel: 0,
                placement: "N/A",
              };
              return {
                ...unitData,
                avgItems: unitStat.avgItems,
                placement: unitStat.avgPlacement,
              };
            })
            .sort((a, b) => {
              if (b.avgItems === "N/A") return -1;
              if (a.avgItems === "N/A") return 1;
              return b.avgItems - a.avgItems;
            });

          // Update expanded widgets and nested data
          this.expandedWidgets = result.expandedWidgets;
          this.nestedData = {
            ...this.nestedData,
            [index]: {
              ...result.nestedData[index],
              coreUnits: combinedUnits,
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
            return unitData.items.slice(0, 8).map(item => ({
                itemName: item.itemName,
                avgPlacement: item.avgPlacement,
            }));
          } else {
              return [];
          }
        } catch (error) {
            console.error("Error fetching best items:", error);
            return [];
        }
      },
      async fetchUnitStats(trait) {
        try {
          const response = await fetch(`https://localhost:7057/api/RiotApi/unit-stats?trait=${encodeURIComponent(trait)}`);
          if (!response.ok) {
              throw new Error(`API call failed: ${response.statusText}`);
          }

          const unitStatsData = await response.json();

          return unitStatsData.map(item => ({
            unit: item.unit,
            avgItems: item.avgItems.toFixed(2),
            placement: item.placement
        }));
        } catch (error) {
            console.error("Error fetching unit stats:", error);
            return ["Error fetching unit stats"];
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
      getAvgItemsBackgroundColor(avgItems) {
          const minItems = 0;
          const maxItems = 3;
          
          const normalized = (avgItems - minItems) / (maxItems - minItems);
          const green = normalized > 0.5 ? 160 : Math.round(160 * (normalized * 2)); 
          const red = normalized < 0.5 ? 160 : Math.round(160 * (1 - (normalized - 0.5) * 2)); 
          const blue = 0;
          return `rgb(${red}, ${green}, ${blue})`;
      },
      getItemPlacementBackgroundColor(avgPlacement) {
          const minPlacement = 1;
          const maxPlacement = 8;
          
          const normalized = (avgPlacement - minPlacement) / (maxPlacement - minPlacement);
          const green = normalized < 0.5 ? 160 : Math.round(160 * (1 - (normalized - 0.5) * 2)); 
          const red = normalized > 0.5 ? 160 : Math.round(160 * (normalized * 2)); 
          const blue = 0;
          return `rgb(${red}, ${green}, ${blue})`;
      },
      getTraitImage(teamComposition) {
        const formattedName = teamComposition
            .toLowerCase()
            .replace(/[\s\W_]+/g, "");
        return `/images/traits/${formattedName}.svg`;
      },
      getTooltipContent(unitName) {
        return `
          <div>
            <strong>${unitName}</strong>
          </div>
        `;
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

    .nested-table .stat-header-items {
    text-align: center !important;
    vertical-align: middle;
    white-space: nowrap;
    }

    .highlight-column {
    font-weight: bold;
    color: white;
    text-align: center !important;
    vertical-align: middle;
    white-space: nowrap;
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

    .expanded-widget-two-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    }

    .widget-section {
    border: none;
    padding: 10px;
    background-color: #f9f9f9;
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

    .stat-header-items {
    white-space:nowrap;
    }

    .centered-title {
    text-align: center;
    margin-bottom: 10px;
    font-weight: bold;
    }

    .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    grid-column: span 2; 
    padding: 20px;
    }

    .chart-title {
    grid-column: 1 / -1;
    margin-bottom: 20px;
    text-align: center;
    font-weight: bold;
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

    .unit-wrapper {
    position: relative;
    display: inline-block;
    }

    .unit-stars {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: gold;
    text-shadow: 1px 1px 2px #000;
    font-family: Arial, sans-serif;
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

    .trait-cell {
    vertical-align: middle;
    padding: 10px;
    }

    .trait-content {
    display: flex;
    align-items: center;
    gap: 10px;
    }

    .trait-image {
    width: 20px;
    height: 20px;
    border: 2px solid rgb(194, 166, 10);
    border-radius: 4px;
    background-color: rgb(194, 166, 10);
    object-fit: contain;
    padding: 4px;
    }

    .trait-text {
    font-size: 1rem;
    font-weight: bold;
    color: rgb(0, 0, 0);
    }

    .tippy-box {
    background-color: #f9f9f9;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    min-width: 500px;
    }

    .tippy-content {
    font-family: Arial, sans-serif;
    font-size: 14px;
    }

    .region-filters {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px auto;
    gap: 5px;
    max-width: fit-content;
    }

    .region-btn {
    padding: 10px 20px;
    margin: 5px auto;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
    color: white;
    transition: background-color 0.3s;
    background-color: #484d45;
    display: block;
    }

    .region-btn:hover { filter: brightness(1.2); }

    .region-btn[selected] {
    border-bottom: 4px solid yellow;
    }

  </style>
  