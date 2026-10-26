import { PEAKER_COST_R_PER_KWH } from "@/lib/eskom"

/** What each dashboard card shows: where the data comes from, how it's computed, why it matters. */
export type CardInfo = { source: string; how: string; why: string }

const BUILD_UP = "Eskom Data Portal · “Station Build Up” (hourly generation by source, MW)."
const DEMAND = "Eskom Data Portal · “System hourly actual and forecasted demand”."

export const INFO = {
  peak: {
    source: `${DEMAND} Series: RSA Contracted Demand.`,
    how: "The highest single hourly value in the last 7 days of actual demand. Times are hour-beginning in SAST, so 19:00 means 19:00–20:00.",
    why: "The grid has to be planned and run for its busiest hour, not its average. Peaks drive load-shedding risk and expensive diesel use.",
  },
  outages: {
    source: "Eskom Data Portal · “Hourly UCLF and OCLF trend” (MW).",
    how: "The latest hour of unplanned capability losses (UCLF) plus other losses outside Eskom's control (OCLF), compared with the same hour 7 days earlier. The tick bar shows it as a share of the highest value in the file (about 15 days).",
    why: "Broken-down capacity can't be dispatched, so it has to be replaced by diesel peakers or by cutting demand. It's the main driver of supply shortfalls.",
  },
  forecast: {
    source: `${DEMAND} Series: RSA Contracted Forecast.`,
    how: "For each upcoming day, the highest forecast hour. The next three days are listed.",
    why: "Shows when the grid will be tightest, so flexible users can plan heavy loads around those hours.",
  },
  renew: {
    source: BUILD_UP,
    how: "Wind + solar PV + CSP + other renewables, divided by all energy supplied over the same days. The bar splits renewables into wind, solar (PV + CSP) and other.",
    why: "Tracks how fast the grid is decarbonising. Rooftop solar behind the meter isn't visible to Eskom's system operator, so the true share is somewhat higher.",
  },
  supply: {
    source: BUILD_UP,
    how: "Hourly output stacked from zero: coal on the bottom; then nuclear, hydro, pumped-storage generation, imports and diesel/gas peakers; then wind, solar and other renewables on top. The big number is total supply in the latest hour; the % compares it with the first hour shown.",
    why: "Shows how the mix shifts through each day: solar fills the middle of the day, and peakers appear at the evening peak.",
  },
  demand: {
    source: `${DEMAND} Series: RSA Contracted Demand and Forecast.`,
    how: "Actual hourly demand up to the latest published hour, then Eskom's own forecast (lime) for the days ahead. The pills mark the week's peak, the latest hour and the forecast peak.",
    why: "Comparing what happened with what's coming shows whether the next few days will be tighter or easier than this week.",
  },
  mix: {
    source: BUILD_UP,
    how: "Each group's total energy over the period (MWh, summed hour by hour) divided by all energy supplied. The gauge ticks are coloured in the same proportions.",
    why: "Energy share, rather than installed capacity, shows what actually powered the country.",
  },
  day: {
    source: `${DEMAND} Solar from ${BUILD_UP}`,
    how: "For each clock hour, the average of that hour's actual demand across the last 7 days (every 19:00 value averaged, and so on). The solar window is 10:00–15:00 and the evening peak 17:00–21:00. The dashed line is the same profile after the load-shift slider moves demand from the peak into the solar window.",
    why: "The daily shape reveals the evening ramp as solar fades: the hardest and most expensive hours to supply.",
  },
  optimise: {
    source: `${BUILD_UP} Peaker output: Eskom OCGT + Eskom gas + dispatchable IPP OCGT.`,
    how: `For every evening-peak hour (17:00–21:00) in the data, shifted load can replace peaker output up to what actually ran: min(peaker MW, shifted MW). That is summed, scaled to a 7-day week and costed at R${PEAKER_COST_R_PER_KWH}/kWh (an assumption). Peak cut = shifted MW ÷ average demand in the peak hour. Recommendations are rule-based checks on the same data.`,
    why: "Moving flexible load (water heating, pumping, batch processes) is the cheapest “new capacity”: it avoids diesel without building anything. Simplification: it assumes midday has spare supply and energy moves 1:1.",
  },
  peakers: {
    source: `${BUILD_UP} Eskom OCGT + Eskom gas + dispatchable IPP OCGT.`,
    how: "Each day's hourly peaker output summed into energy (GWh). “Hours running” counts hours above 50 MW. The latest day is highlighted.",
    why: "Open-cycle gas turbines run on diesel: the most expensive and most polluting power on the grid. Fewer peaker hours means cheaper, cleaner supply.",
  },
} satisfies Record<string, CardInfo>
