from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
PUBLIC_DATA_DIR = PROJECT_ROOT / "public" / "data"
PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)


def safe_rate(numerator: float, denominator: float) -> float:
    return round(float(numerator) / float(denominator), 4) if denominator else 0.0


def load_csv(name: str, parse_dates: list[str] | None = None) -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / name, parse_dates=parse_dates or [])


def monthly_summary(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    sales: pd.DataFrame,
    payments: pd.DataFrame,
    expenses: pd.DataFrame,
) -> list[dict]:
    months = pd.period_range("2026-01", "2026-06", freq="M")
    rows: list[dict] = []

    lead_month = leads["created_at"].dt.to_period("M")
    booking_month = bookings["appointment_date"].dt.to_period("M")
    sale_month = sales["close_date"].dt.to_period("M")
    payment_month = payments["payment_date"].dt.to_period("M")
    expense_month = expenses["expense_date"].dt.to_period("M")

    for month in months:
        month_leads = leads[lead_month == month]
        month_bookings = bookings[booking_month == month]
        month_sales = sales[sale_month == month]
        month_payments = payments[payment_month == month]
        month_expenses = expenses[expense_month == month]

        shows = int((month_bookings["appointment_status"] == "Showed").sum())
        no_shows = int((month_bookings["appointment_status"] == "No Show").sum())
        contracted_revenue = float(month_sales["contract_value"].sum())
        cash_collected = float(month_payments["amount"].sum())
        marketing_spend = float(month_expenses["amount"].sum())

        rows.append(
            {
                "month": str(month),
                "label": month.strftime("%b %Y"),
                "leads": len(month_leads),
                "bookings": len(month_bookings),
                "shows": shows,
                "no_shows": no_shows,
                "closed_sales": len(month_sales),
                "contracted_revenue": round(contracted_revenue, 2),
                "cash_collected": round(cash_collected, 2),
                "marketing_spend": round(marketing_spend, 2),
                "booking_rate": safe_rate(len(month_bookings), len(month_leads)),
                "show_rate": safe_rate(shows, len(month_bookings)),
                "lead_to_close_rate": safe_rate(len(month_sales), len(month_leads)),
                "roas": round(contracted_revenue / marketing_spend, 2)
                if marketing_spend
                else 0.0,
            }
        )

    return rows


def channel_summary(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    opportunities: pd.DataFrame,
    sales: pd.DataFrame,
    expenses: pd.DataFrame,
) -> list[dict]:
    channels = sorted(leads["source"].dropna().unique().tolist())
    rows: list[dict] = []

    sales_with_source = sales.merge(
        leads[["lead_id", "source"]],
        on="lead_id",
        how="left",
    )
    opportunities_with_source = opportunities.merge(
        leads[["lead_id", "source"]],
        on="lead_id",
        how="left",
    )

    for channel in channels:
        channel_leads = leads[leads["source"] == channel]
        channel_bookings = bookings[bookings["booking_source"] == channel]
        channel_sales = sales_with_source[
            sales_with_source["source"] == channel
        ]
        channel_opportunities = opportunities_with_source[
            opportunities_with_source["source"] == channel
        ]
        channel_expenses = expenses[expenses["channel"] == channel]

        shows = int((channel_bookings["appointment_status"] == "Showed").sum())
        offers = int(
            (channel_opportunities["monetary_value"].fillna(0) > 0).sum()
        )
        contracted_revenue = float(channel_sales["contract_value"].sum())
        spend = float(channel_expenses["amount"].sum())
        closed_sales = len(channel_sales)

        rows.append(
            {
                "channel": channel,
                "leads": len(channel_leads),
                "bookings": len(channel_bookings),
                "shows": shows,
                "offers": offers,
                "closed_sales": closed_sales,
                "contracted_revenue": round(contracted_revenue, 2),
                "marketing_spend": round(spend, 2),
                "booking_rate": safe_rate(
                    len(channel_bookings),
                    len(channel_leads),
                ),
                "show_rate": safe_rate(shows, len(channel_bookings)),
                "offer_rate": safe_rate(offers, shows),
                "close_rate": safe_rate(closed_sales, offers),
                "lead_to_close_rate": safe_rate(
                    closed_sales,
                    len(channel_leads),
                ),
                "cac": round(spend / closed_sales, 2) if closed_sales else None,
                "roas": round(contracted_revenue / spend, 2) if spend else None,
            }
        )

    return rows


def closer_summary(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    opportunities: pd.DataFrame,
    sales: pd.DataFrame,
) -> list[dict]:
    closers = sorted(leads["assigned_closer"].dropna().unique().tolist())
    rows: list[dict] = []

    opportunities_by_closer = opportunities.merge(
        leads[["lead_id", "assigned_closer"]],
        on="lead_id",
        how="left",
    )

    for closer in closers:
        closer_bookings = bookings[bookings["closer_name"] == closer]
        closer_opportunities = opportunities_by_closer[
            opportunities_by_closer["assigned_closer"] == closer
        ]
        closer_sales = sales[sales["closer_name"] == closer]

        shows = int((closer_bookings["appointment_status"] == "Showed").sum())
        offers = int(
            (closer_opportunities["monetary_value"].fillna(0) > 0).sum()
        )
        contracted_revenue = float(closer_sales["contract_value"].sum())

        rows.append(
            {
                "closer": closer,
                "bookings": len(closer_bookings),
                "shows": shows,
                "offers": offers,
                "closed_sales": len(closer_sales),
                "contracted_revenue": round(contracted_revenue, 2),
                "show_rate": safe_rate(shows, len(closer_bookings)),
                "offer_rate": safe_rate(offers, shows),
                "close_rate": safe_rate(len(closer_sales), offers),
                "average_contract_value": round(
                    contracted_revenue / len(closer_sales),
                    2,
                )
                if len(closer_sales)
                else 0.0,
            }
        )

    return rows


def funnel_summary(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    opportunities: pd.DataFrame,
    sales: pd.DataFrame,
) -> list[dict]:
    shows = int((bookings["appointment_status"] == "Showed").sum())
    offers = int((opportunities["monetary_value"].fillna(0) > 0).sum())

    steps = [
        ("Leads", len(leads)),
        ("Bookings", len(bookings)),
        ("Shows", shows),
        ("Offers", offers),
        ("Closed Sales", len(sales)),
    ]

    rows: list[dict] = []
    previous = None

    for name, value in steps:
        rows.append(
            {
                "stage": name,
                "value": int(value),
                "conversion_from_previous": (
                    1.0 if previous is None else safe_rate(value, previous)
                ),
                "conversion_from_lead": safe_rate(value, len(leads)),
            }
        )
        previous = value

    return rows


def executive_summary(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    opportunities: pd.DataFrame,
    sales: pd.DataFrame,
    payments: pd.DataFrame,
    expenses: pd.DataFrame,
) -> dict:
    shows = int((bookings["appointment_status"] == "Showed").sum())
    offers = int((opportunities["monetary_value"].fillna(0) > 0).sum())
    closed_sales = len(sales)
    no_shows = int((bookings["appointment_status"] == "No Show").sum())

    contracted_revenue = float(sales["contract_value"].sum())
    cash_collected = float(payments["amount"].sum())
    marketing_spend = float(expenses["amount"].sum())
    average_contract_value = (
        contracted_revenue / closed_sales if closed_sales else 0
    )
    show_to_close_rate = safe_rate(closed_sales, shows)

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
        "booking_rate": safe_rate(len(bookings), len(leads)),
        "show_rate": safe_rate(shows, len(bookings)),
        "offer_rate": safe_rate(offers, shows),
        "close_rate": safe_rate(closed_sales, offers),
        "lead_to_close_rate": safe_rate(closed_sales, len(leads)),
        "contracted_revenue": round(contracted_revenue, 2),
        "cash_collected": round(cash_collected, 2),
        "cash_collection_rate": safe_rate(
            cash_collected,
            contracted_revenue,
        ),
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
        )
        if closed_sales
        else 0.0,
        "roas": round(contracted_revenue / marketing_spend, 2)
        if marketing_spend
        else 0.0,
        "lost_revenue": round(lost_revenue, 2),
        "no_show_opportunity_cost": round(
            no_shows * show_to_close_rate * average_contract_value,
            2,
        ),
    }


def main() -> None:
    print("Building dashboard data...")

    leads = load_csv("leads.csv", ["created_at"])
    bookings = load_csv(
        "bookings.csv",
        ["booked_at", "appointment_date"],
    )
    opportunities = load_csv(
        "opportunities.csv",
        ["created_at", "last_stage_change_at"],
    )
    sales = load_csv("sales.csv", ["offer_date", "close_date"])
    payments = load_csv("payments.csv", ["payment_date"])
    expenses = load_csv("marketing_expenses.csv", ["expense_date"])

    dashboard_data = {
        "meta": {
            "project": "Revenue Operations & CRM Command Center",
            "data_type": "synthetic_demo",
            "date_range": {
                "start": "2026-01-01",
                "end": "2026-06-30",
            },
            "disclaimer": (
                "Demo data generated for portfolio purposes. "
                "No real customer or company data is shown."
            ),
        },
        "executive_summary": executive_summary(
            leads,
            bookings,
            opportunities,
            sales,
            payments,
            expenses,
        ),
        "funnel": funnel_summary(
            leads,
            bookings,
            opportunities,
            sales,
        ),
        "monthly": monthly_summary(
            leads,
            bookings,
            sales,
            payments,
            expenses,
        ),
        "channels": channel_summary(
            leads,
            bookings,
            opportunities,
            sales,
            expenses,
        ),
        "closers": closer_summary(
            leads,
            bookings,
            opportunities,
            sales,
        ),
        "appointment_status": (
            bookings["appointment_status"]
            .value_counts()
            .rename_axis("status")
            .reset_index(name="count")
            .to_dict(orient="records")
        ),
        "products": (
            sales.groupby("product_name")
            .agg(
                closed_sales=("sale_id", "count"),
                contracted_revenue=("contract_value", "sum"),
            )
            .reset_index()
            .sort_values("contracted_revenue", ascending=False)
            .to_dict(orient="records")
        ),
        "lost_reasons": (
            opportunities.loc[
                opportunities["status"] == "Lost",
                "lost_reason",
            ]
            .dropna()
            .value_counts()
            .rename_axis("reason")
            .reset_index(name="count")
            .to_dict(orient="records")
        ),
    }

    output_path = PUBLIC_DATA_DIR / "dashboard.json"
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(dashboard_data, file, indent=2)

    print(f"Created {output_path}")
    print(
        "Executive revenue:",
        dashboard_data["executive_summary"]["contracted_revenue"],
    )
    print(
        "Channels:",
        len(dashboard_data["channels"]),
    )
    print(
        "Monthly periods:",
        len(dashboard_data["monthly"]),
    )
    print("Dashboard data build completed successfully.")


if __name__ == "__main__":
    main()
