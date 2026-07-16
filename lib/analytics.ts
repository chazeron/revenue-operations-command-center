import filterableData from "@/public/data/filterable.json";

export type FilterState = {
  month: string;
  channel: string;
  closer: string;
};

export type LeadFact = (typeof filterableData.facts)[number];

export const filterData = filterableData;

export function filterFacts(filters: FilterState) {
  return filterableData.facts.filter((fact) => {
    const monthOk = filters.month === "all" || fact.month === filters.month;
    const channelOk =
      filters.channel === "all" || fact.source === filters.channel;
    const closerOk =
      filters.closer === "all" || fact.assigned_closer === filters.closer;

    return monthOk && channelOk && closerOk;
  });
}

export function filterExpenses(filters: FilterState) {
  return filterableData.expenses.filter((expense) => {
    const monthOk =
      filters.month === "all" || expense.month === filters.month;
    const channelOk =
      filters.channel === "all" || expense.channel === filters.channel;

    return monthOk && channelOk;
  });
}

function rate(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : 0;
}

export function calculateMetrics(filters: FilterState) {
  const facts = filterFacts(filters);
  const expenses = filterExpenses(filters);

  const leads = facts.length;
  const bookings = facts.filter((fact) => fact.booked).length;
  const shows = facts.filter((fact) => fact.showed).length;
  const offers = facts.filter((fact) => fact.offered).length;
  const closedSales = facts.filter((fact) => fact.closed_sale).length;
  const noShows = facts.filter((fact) => fact.no_show).length;

  const contractedRevenue = facts.reduce(
    (sum, fact) => sum + Number(fact.sale_value ?? 0),
    0,
  );
  const cashCollected = facts.reduce(
    (sum, fact) => sum + Number(fact.cash_collected ?? 0),
    0,
  );
  const marketingSpend = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );
  const lostRevenue = facts
    .filter(
      (fact) =>
        fact.opportunity_status === "Lost" &&
        Number(fact.monetary_value ?? 0) > 0,
    )
    .reduce((sum, fact) => sum + Number(fact.monetary_value ?? 0), 0);

  const averageContractValue = closedSales
    ? contractedRevenue / closedSales
    : 0;
  const showToCloseRate = rate(closedSales, shows);

  return {
    facts,
    leads,
    bookings,
    shows,
    offers,
    closedSales,
    noShows,
    bookingRate: rate(bookings, leads),
    showRate: rate(shows, bookings),
    offerRate: rate(offers, shows),
    closeRate: rate(closedSales, offers),
    leadToCloseRate: rate(closedSales, leads),
    contractedRevenue,
    cashCollected,
    cashCollectionRate: rate(cashCollected, contractedRevenue),
    averageContractValue,
    revenuePerLead: leads ? contractedRevenue / leads : 0,
    marketingSpend,
    costPerLead: leads ? marketingSpend / leads : 0,
    costPerBooking: bookings ? marketingSpend / bookings : 0,
    cac: closedSales ? marketingSpend / closedSales : 0,
    roas: marketingSpend ? contractedRevenue / marketingSpend : 0,
    lostRevenue,
    noShowOpportunityCost:
      noShows * showToCloseRate * averageContractValue,
  };
}

export function groupByChannel(filters: FilterState) {
  const channels = filterData.options.channels;

  return channels
    .map((channel) => {
      const metrics = calculateMetrics({
        ...filters,
        channel,
      });

      return {
        channel,
        ...metrics,
      };
    })
    .filter((item) => item.leads > 0);
}

export function groupByCloser(filters: FilterState) {
  const closers = filterData.options.closers;

  return closers
    .map((closer) => {
      const metrics = calculateMetrics({
        ...filters,
        closer,
      });

      return {
        closer,
        ...metrics,
      };
    })
    .filter((item) => item.leads > 0);
}
