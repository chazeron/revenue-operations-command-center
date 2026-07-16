from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
PUBLIC_DATA_DIR = PROJECT_ROOT / "public" / "data"
PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)


def main() -> None:
    leads = pd.read_csv(DATA_DIR / "leads.csv", parse_dates=["created_at"])
    bookings = pd.read_csv(
        DATA_DIR / "bookings.csv",
        parse_dates=["appointment_date"],
    )
    opportunities = pd.read_csv(DATA_DIR / "opportunities.csv")
    sales = pd.read_csv(DATA_DIR / "sales.csv")
    payments = pd.read_csv(
        DATA_DIR / "payments.csv",
        parse_dates=["payment_date"],
    )
    expenses = pd.read_csv(
        DATA_DIR / "marketing_expenses.csv",
        parse_dates=["expense_date"],
    )

    booking_cols = bookings[
        [
            "lead_id",
            "appointment_status",
            "appointment_date",
        ]
    ].copy()
    booking_cols["appointment_month"] = (
        booking_cols["appointment_date"].dt.to_period("M").astype(str)
    )

    opportunity_cols = opportunities[
        [
            "lead_id",
            "status",
            "stage_name",
            "monetary_value",
            "lost_reason",
        ]
    ].copy()
    opportunity_cols = opportunity_cols.rename(
        columns={
            "status": "opportunity_status",
            "stage_name": "opportunity_stage",
        }
    )
    opportunity_cols["offered"] = (
        opportunity_cols["monetary_value"].fillna(0) > 0
    )

    sales_cols = sales[
        [
            "lead_id",
            "sale_id",
            "contract_value",
            "product_name",
        ]
    ].copy()
    sales_cols = sales_cols.rename(
        columns={"contract_value": "sale_value"}
    )

    payment_summary = (
        payments.groupby("lead_id", as_index=False)
        .agg(cash_collected=("amount", "sum"))
    )

    facts = (
        leads[
            [
                "lead_id",
                "created_at",
                "source",
                "campaign",
                "assigned_closer",
                "assigned_setter",
                "lead_score",
                "funnel_type",
            ]
        ]
        .merge(booking_cols, on="lead_id", how="left")
        .merge(opportunity_cols, on="lead_id", how="left")
        .merge(sales_cols, on="lead_id", how="left")
        .merge(payment_summary, on="lead_id", how="left")
    )

    facts["month"] = facts["created_at"].dt.to_period("M").astype(str)
    facts["booked"] = facts["appointment_status"].notna()
    facts["showed"] = facts["appointment_status"].eq("Showed")
    facts["no_show"] = facts["appointment_status"].eq("No Show")
    facts["closed_sale"] = facts["sale_id"].notna()
    facts["sale_value"] = facts["sale_value"].fillna(0.0)
    facts["cash_collected"] = facts["cash_collected"].fillna(0.0)
    facts["monetary_value"] = facts["monetary_value"].fillna(0.0)
    facts["offered"] = facts["offered"].fillna(False)

    output = {
        "meta": {
            "data_type": "synthetic_demo",
            "disclaimer": (
                "Demo data generated for portfolio purposes. "
                "No real customer or company data is shown."
            ),
        },
        "options": {
            "months": sorted(facts["month"].dropna().unique().tolist()),
            "channels": sorted(facts["source"].dropna().unique().tolist()),
            "closers": sorted(
                facts["assigned_closer"].dropna().unique().tolist()
            ),
        },
        "facts": (
            facts[
                [
                    "lead_id",
                    "month",
                    "source",
                    "campaign",
                    "assigned_closer",
                    "assigned_setter",
                    "lead_score",
                    "funnel_type",
                    "booked",
                    "showed",
                    "no_show",
                    "appointment_status",
                    "offered",
                    "opportunity_status",
                    "opportunity_stage",
                    "monetary_value",
                    "lost_reason",
                    "closed_sale",
                    "sale_value",
                    "cash_collected",
                    "product_name",
                ]
            ]
            .astype(object)
            .where(pd.notna(
                facts[
                    [
                        "lead_id",
                        "month",
                        "source",
                        "campaign",
                        "assigned_closer",
                        "assigned_setter",
                        "lead_score",
                        "funnel_type",
                        "booked",
                        "showed",
                        "no_show",
                        "appointment_status",
                        "offered",
                        "opportunity_status",
                        "opportunity_stage",
                        "monetary_value",
                        "lost_reason",
                        "closed_sale",
                        "sale_value",
                        "cash_collected",
                        "product_name",
                    ]
                ]
            ), None)
            .to_dict(orient="records")
        ),
        "expenses": [
            {
                "month": row.expense_date.to_period("M").strftime("%Y-%m"),
                "channel": row.channel,
                "campaign": row.campaign,
                "amount": round(float(row.amount), 2),
            }
            for row in expenses.itertuples()
        ],
    }

    output_path = PUBLIC_DATA_DIR / "filterable.json"
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(output, file, indent=2, allow_nan=False)

    print(f"Created {output_path}")
    print(f"Lead facts: {len(output['facts']):,}")
    print(f"Expense rows: {len(output['expenses']):,}")


if __name__ == "__main__":
    main()
