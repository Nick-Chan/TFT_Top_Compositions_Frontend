import axios from 'axios';

axios.defaults.baseURL = 'https://localhost:7057/api';

// Fetch trait stats and fill table
export async function fetchTraits() {
    try {
        const response = await axios.get('/RiotApi/average-placements-by-traits');
        return response.data;
    } catch (error) {
        console.error('Error fetching traits:', error);
        throw error;
    }
}

// Fetch common units for a given trait composition
export async function fetchCommonUnits(traitComposition) {
    try {
        const response = await axios.get(`/RiotApi/unit-compositions-by-traits`, {
            params: { traitComposition }
        });

        const data = response.data;
        const totalRows = data.length;
        const unitOccurrences = {};

        const customOrder = [
            // 1*
            "Aatrox", "Ezreal", "Garen", "Gnar", "Kalista", "Kayle", "Kennen",
            "Lucian", "Malphite", "Naafiri", "Rell", "Sivir", "Syndra", "Zac",

            // 2*
            "Dr. Mundo", "Gangplank", "Janna", "Jhin", "Kai'sa", "Katarina",
            "Kobuko", "Lux", "Rakan", "Shen", "Vi", "Xayah", "Xin Zhao",

            // 3*
            "Ahri", "Caitlyn", "Darius", "Jayce", "Kog'Maw", "Rammus",
            "Smolder", "Malzahar", "Neeko", "Senna", "Swain", "Udyr",
            "Viego", "Yasuo", "Ziggs", "Karma",

            // 4*
            "Akali", "Ashe", "Jarvan IV", "Jinx", "K'Sante", "Leona",
            "Poppy", "Samira", "Sett", "Volibear", "Yuumi",

            // 5*
            "Braum", "Gwen", "Lee Sin", "Seraphine", "Twisted Fate",
            "Varus", "Zyra"
        ];

        // Excluded units
        const EXCLUDED_UNITS = new Set(["TFT15_Galio", "Ekko"]);

        const getOrderIndex = (unit) =>
            customOrder.indexOf(unit) >= 0 ? customOrder.indexOf(unit) : Infinity;

        // Calculate unit occurrences across all unit compositions
        data.forEach((unitRow) => {
            const units = unitRow.unitComposition.split(', ');
            units.forEach((unit) => {
              if (EXCLUDED_UNITS.has(unit)) return;
              if (unitOccurrences[unit]) {
                  unitOccurrences[unit]++;
              } else {
                  unitOccurrences[unit] = 1;
              }
            });
        });

        // Filter and join common units (≥ 50% of total rows)
        return Object.entries(unitOccurrences)
            .filter(([unit, count]) => !EXCLUDED_UNITS.has(unit) && (count / totalRows) >= 0.5)
            .map(([unit]) => unit)
            .sort((a, b) => getOrderIndex(a) - getOrderIndex(b))
            .join(', ');
    } catch (error) {
        console.error("Error fetching common units:", error.message);
        throw error;
    }
}

// Fetch flex units for a given trait composition
export async function fetchFlexUnits(traitComposition) {
    try {
        const response = await axios.get(`/RiotApi/unit-compositions-by-traits`, {
            params: { traitComposition }
        });

        const data = response.data;
        const totalRows = data.length;
        const unitOccurrences = {};

        const customOrder = [
            // 1*
            "Aatrox", "Ezreal", "Garen", "Gnar", "Kalista", "Kayle", "Kennen",
            "Lucian", "Malphite", "Naafiri", "Rell", "Sivir", "Syndra", "Zac",

            // 2*
            "Dr. Mundo", "Gangplank", "Janna", "Jhin", "Kai'sa", "Katarina",
            "Kobuko", "Lux", "Rakan", "Shen", "Vi", "Xayah", "Xin Zhao",

            // 3*
            "Ahri", "Caitlyn", "Darius", "Jayce", "Kog'Maw", "Rammus",
            "Smolder", "Malzahar", "Neeko", "Senna", "Swain", "Udyr",
            "Viego", "Yasuo", "Ziggs", "Karma",

            // 4*
            "Akali", "Ashe", "Jarvan IV", "Jinx", "K'Sante", "Leona",
            "Poppy", "Samira", "Sett", "Volibear", "Yuumi",

            // 5*
            "Braum", "Gwen", "Lee Sin", "Seraphine", "Twisted Fate",
            "Varus", "Zyra"
        ];

        // Excluded units
        const EXCLUDED_UNITS = new Set(["TFT15_Galio", "Ekko"]);

        const getOrderIndex = (unit) =>
            customOrder.indexOf(unit) >= 0 ? customOrder.indexOf(unit) : Infinity;

        // Calculate unit occurrences across all unit compositions
        data.forEach((unitRow) => {
            const units = unitRow.unitComposition.split(', ');
            units.forEach((unit) => {
                if (EXCLUDED_UNITS.has(unit)) return;
                if (unitOccurrences[unit]) {
                    unitOccurrences[unit]++;
                } else {
                    unitOccurrences[unit] = 1;
                }
            });
        });

        // Filter and join flex units
        return Object.entries(unitOccurrences)
            .filter(([unit, count]) =>
                !EXCLUDED_UNITS.has(unit) &&
                count / totalRows > 0.10 &&
                count / totalRows < 0.50
            )
            .map(([unit]) => unit)
            .sort((a, b) => getOrderIndex(a) - getOrderIndex(b))
            .slice(0, 3)
    .join(', ');
    } catch (error) {
        console.error("Error fetching common units:", error.message);
        throw error;
    }
}

export async function fetchUnitLevel(trait) {
  try {
    const response = await fetch(`https://localhost:7057/api/RiotApi/unit-stats?trait=${encodeURIComponent(trait)}`);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const unitStatsData = await response.json();

    return unitStatsData.reduce((acc, item) => {
      acc[item.unit] = parseFloat(item.avgLevel.toFixed(4));
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching unit stats:", error);
    return {};
  }
}

export async function toggleNestedRow(index, traits, expandedWidgets, nestedData) {
  const traitComposition = traits[index].teamComposition;

  // Check if the widget is already expanded
  if (expandedWidgets.includes(index)) {
    // Collapse the widget by removing it from the expanded list
    return {
      expandedWidgets: expandedWidgets.filter((i) => i !== index),
      nestedData: {
        ...nestedData,
        [index]: null,
      },
    };
  } else {
    try {
      // Fetch unit compositions for the table
      const response = await axios.get(
        `/RiotApi/unit-compositions-by-traits?traitComposition=${encodeURIComponent(traitComposition)}`
      );

      if (response.status !== 200) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = response.data.map((unitRow) => ({
        unitComposition: unitRow.unitComposition,
        playRate: parseFloat(unitRow.playRate),
      }));

      // Dummy chart data for testing
      const chartData = [
        { date: "2024-01-01", avgPlacement: 2.5, winRate: 0.6, top4Rate: 0.6, playRate: 0.4 },
        { date: "2024-01-02", avgPlacement: 3.1, winRate: 0.7, top4Rate: 0.5, playRate: 0.5 },
        { date: "2024-01-03", avgPlacement: 2.8, winRate: 0.8, top4Rate: 0.4, playRate: 0.3 },
        { date: "2024-01-04", avgPlacement: 2.7, winRate: 0.7, top4Rate: 0.5, playRate: 0.4 },
      ];

      // Add the current index to expandedWidgets and store the fetched data
      return {
        expandedWidgets: [...expandedWidgets, index],
        nestedData: {
          ...nestedData,
          [index]: {
            compositions: data,
            chartData,
          },
        },
      };
    } catch (error) {
      alert("Error loading data: " + error.message);
      return { expandedWidgets, nestedData }; // No changes in case of error
    }
  }
}



