from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"

REQUIRED_FILES = {
    "leads": "leads.csv",
    "bookings": "bookings.csv",
    "opportunities": "opportunities.csv",
    "sales": "sales.csv",
    "payments": "payments.csv",
    "marketing_expenses": "marketing_expenses.csv",
    "sales_activities": "sales_activities.csv",
    "representatives": "representatives.csv",
}


def pct(numerator: float, denominator: float) -> float:
    return round(numerator / denominator, 4) if denominator else 0.0


def load_data() -> dict[str, pd.DataFrame]:
    missing = [
        filename
        for filename in REQUIRED_FILES.values()
        if not (DATA_DIR / filename).exists()
    ]
    if missing:
        raise FileNotFoundError(
            "Missing required data files: " + ", ".join(missing)
        )

    return {
        name: pd.read_csv(DATA_DIR / filename)
        for name, filename in REQUIRED_FILES.items()
    }


def validate_relationships(data: dict[str, pd.DataFrame]) -> list[dict]:
    checks: list[dict] = []

    def add(name: str, passed: bool, details: str) -> None:
        checks.append(
            {
                "check": name,
                "passed": bool(passed),
                "details": details,
            }
        )

    leads = data["leads"]
    bookings = data["bookings"]
    opportunities = data["opportunities"]
    sales = data["sales"]
    payments = data["payments"]
    activities = data["sales_activities"]
    representatives = data["representatives"]

    unique_checks = {
        "leads.lead_id unique": leads["lead_id"].is_unique,
        "bookings.booking_id unique": bookings["booking_id"].is_unique,
        "opportunities.opportunity_id unique": opportunities[
            "opportunity_id"
        ].is_unique,
        "sales.sale_id unique": sales["sale_id"].is_unique,
        "payments.payment_id unique": payments["payment_id"].is_unique,
        "activities.activity_id unique": activities["activity_id"].is_unique,
        "representatives.representative_id unique": representatives[
            "representative_id"
        ].is_unique,
    }

    for name, passed in unique_checks.items():
        add(name, passed, "No duplicate primary keys" if passed else "Duplicates found")

    add(
        "Bookings reference valid leads",
        bookings["lead_id"].isin(leads["lead_id"]).all(),
        "All booking lead_id values exist in leads",
    )
    add(
        "Opportunities reference valid leads",
        opportunities["lead_id"].isin(leads["lead_id"]).all(),
        "All opportunity lead_id values exist in leads",
    )
    add(
        "Sales reference valid leads",
        sales["lead_id"].isin(leads["lead_id"]).all(),
        "All sale lead_id values exist in leads",
    )
    add(
        "Sales reference valid opportunities",
        sales["opportunity_id"].isin(opportunities["opportunity_id"]).all(),
        "All sale opportunity_id values exist in opportunities",
    )
    add(
        "Payments reference valid sales",
        payments["sale_id"].isin(sales["sale_id"]).all(),
        "All payment sale_id values exist in sales",
    )
    add(
        "Activities reference valid leads",
        activities["lead_id"].isin(leads["lead_id"]).all(),
        "All activity lead_id values exist in leads",
    )

    won_opportunity_revenue = opportunities.loc[
        opportunities["status"] == "Won",
        "monetary_value",
    ].sum()
    sales_revenue = sales["contract_value"].sum()

    add(
        "Won opportunity revenue matches sales revenue",
        abs(won_opportunity_revenue - sales_revenue) < 0.01,
        f"Won opportunities: {won_opportunity_revenue:.2f}; "
        f"Sales: {sales_revenue:.2f}",
    )

    lead_sale_ids = set(leads["sale_id"].dropna().astype(str))
    actual_sale_ids = set(sales["sale_id"].astype(str))
    add(
        "Lead sale_id values reference valid sales",
        lead_sale_ids.issubset(actual_sale_ids),
        f"{len(lead_sale_ids)} populated lead sale_id values checked",
    )

    return checks


def calculate_kpis(data: dict[str, pd.DataFrame]) -> dict:
    leads = data["leads"]
    bookings = data["bookings"]
    opportunities = data["opportunities"]
    sales = data["sales"]
    payments = data["payments"]
    expenses = data["marketing_expenses"]

    shows = int((bookings["appointment_status"] == "Showed").sum())

    # Any opportunity with monetary value above zero reached the offer stage.
    # Won offers later become sales; lost offers keep status Lost/Closed Lost.
    offered_opportunities = opportunities[
        opportunities["monetary_value"].fillna(0) > 0
    ]
    offers = len(offered_opportunities)
    closed_sales = len(sales)

    contracted_revenue = float(sales["contract_value"].sum())
    cash_collected = float(payments["amount"].sum())
    marketing_spend = float(expenses["amount"].sum())

    no_shows = int((bookings["appointment_status"] == "No Show").sum())
    average_contract_value = (
        contracted_revenue / closed_sales if closed_sales else 0
    )
    show_to_close_rate = pct(closed_sales, shows)
    no_show_opportunity_cost = (
        no_shows * show_to_close_rate * average_contract_value
    )

    lost_revenue = float(
        opportunities.loc[
            (opportunities["status"] == "Lost")
            & (opportunities["monetary_value"].fillna(0) > 0),
            "monetary_value",
        ].sum()
    )

    return {
        "leads": len(leads),
        "bookings": len(bookings),
        "shows": shows,
        "offers": offers,
        "closed_sales": closed_sales,
        "no_shows": no_shows,
        "booking_rate": pct(len(bookings), len(leads)),
        "show_rate": pct(shows, len(bookings)),
        "offer_rate": pct(offers, shows),
        "close_rate": pct(closed_sales, offers),
        "lead_to_close_rate": pct(closed_sales, len(leads)),
        "contracted_revenue": round(contracted_revenue, 2),
        "cash_collected": round(cash_collected, 2),
        "cash_collection_rate": pct(cash_collected, contracted_revenue),
        "average_contract_value": round(average_contract_value, 2),
        "revenue_per_lead": round(
            contracted_revenue / len(leads),
            2,
        ),
        "marketing_spend": round(marketing_spend, 2),
        "cost_per_lead": round(
            marketing_spend / len(leads),
            2,
        ),
        "cost_per_booking": round(
            marketing_spend / len(bookings),
            2,
        ),
        "customer_acquisition_cost": round(
            marketing_spend / closed_sales,
            2,
        ),
        "return_on_ad_spend": round(
            contracted_revenue / marketing_spend,
            2,
        ),
        "lost_revenue": round(lost_revenue, 2),
        "no_show_opportunity_cost": round(no_show_opportunity_cost, 2),
    }


def realism_flags(kpis: dict) -> list[dict]:
    ranges = {
        "booking_rate": (0.15, 0.45),
        "show_rate": (0.45, 0.80),
        "offer_rate": (0.35, 0.85),
        "close_rate": (0.10, 0.45),
        "lead_to_close_rate": (0.01, 0.12),
        "cash_collection_rate": (0.35, 1.05),
        "return_on_ad_spend": (1.0, 12.0),
    }

    flags = []

    for metric, (minimum, maximum) in ranges.items():
        value = float(kpis[metric])
        status = "reasonable" if minimum <= value <= maximum else "review"
        flags.append(
            {
                "metric": metric,
                "value": value,
                "expected_demo_range": [minimum, maximum],
                "status": status,
            }
        )

    return flags


def channel_summary(data: dict[str, pd.DataFrame]) -> list[dict]:
    leads = data["leads"]
    bookings = data["bookings"]
    sales = data["sales"]
    expenses = data["marketing_expenses"]

    lead_counts = leads.groupby("source").size().rename("leads")
    booking_counts = bookings.groupby("booking_source").size().rename("bookings")

    sale_source = sales.merge(
        leads[["lead_id", "source"]],
        on="lead_id",
        how="left",
    )
    sale_summary = sale_source.groupby("source").agg(
        closed_sales=("sale_id", "count"),
        contracted_revenue=("contract_value", "sum"),
    )

    spend_summary = expenses.groupby("channel").agg(
        marketing_spend=("amount", "sum"),
    )

    summary = (
        lead_counts.to_frame()
        .join(booking_counts, how="left")
        .join(sale_summary, how="left")
        .join(spend_summary, how="left")
        .fillna(0)
        .reset_index()
        .rename(columns={"index": "channel"})
    )

    summary["booking_rate"] = (
        summary["bookings"] / summary["leads"]
    ).round(4)
    summary["lead_to_close_rate"] = (
        summary["closed_sales"] / summary["leads"]
    ).round(4)
    summary["cac"] = (
        summary["marketing_spend"]
        / summary["closed_sales"].replace(0, pd.NA)
    ).round(2)
    summary["roas"] = (
        summary["contracted_revenue"]
        / summary["marketing_spend"].replace(0, pd.NA)
    ).round(2)

    return summary.where(pd.notna(summary), None).to_dict(orient="records")


def main() -> None:
    print("Validating synthetic dataset...")

    data = load_data()
    checks = validate_relationships(data)
    kpis = calculate_kpis(data)
    flags = realism_flags(kpis)
    channels = channel_summary(data)

    report = {
        "validation_passed": all(check["passed"] for check in checks),
        "relationship_checks": checks,
        "kpis": kpis,
        "realism_flags": flags,
        "channel_summary": channels,
    }

    output_path = DATA_DIR / "validation_report.json"
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(report, file, indent=2)

    print("\nValidation status:")
    print("PASS" if report["validation_passed"] else "FAIL")

    print("\nCore KPIs:")
    for key, value in kpis.items():
        print(f"- {key}: {value}")

    review_metrics = [
        item for item in flags if item["status"] == "review"
    ]

    if review_metrics:
        print("\nMetrics to review:")
        for item in review_metrics:
            print(
                f"- {item['metric']}: {item['value']} "
                f"(expected {item['expected_demo_range']})"
            )
    else:
        print("\nAll realism checks are within the expected demo ranges.")

    print(f"\nSaved report: {output_path}")


if __name__ == "__main__":
    main()
